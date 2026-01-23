import { useEffect, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Ticket } from '../types/database'
import { TicketCard } from './TicketCard'
import { StatsCards } from './StatsCards'
import { NewTicketForm } from './NewTicketForm'

type FilterType = 'all' | 'processed' | 'pending'

export function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showForm, setShowForm] = useState(false)

  // Fetch initial tickets
  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setTickets(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
        },
        (payload: RealtimePostgresChangesPayload<Ticket>) => {
          console.log('New ticket:', payload)
          setTickets((prev) => [payload.new as Ticket, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
        },
        (payload: RealtimePostgresChangesPayload<Ticket>) => {
          console.log('Updated ticket:', payload)
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === (payload.new as Ticket).id ? (payload.new as Ticket) : ticket
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tickets',
        },
        (payload: RealtimePostgresChangesPayload<Ticket>) => {
          console.log('Deleted ticket:', payload)
          setTickets((prev) =>
            prev.filter((ticket) => ticket.id !== (payload.old as Ticket).id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'processed') return ticket.processed
    if (filter === 'pending') return !ticket.processed
    return true
  })

  const stats = {
    total: tickets.length,
    processed: tickets.filter((t) => t.processed).length,
    pending: tickets.filter((t) => !t.processed).length,
    negative: tickets.filter((t) => t.sentiment?.toLowerCase() === 'negativo').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error de conexión</h2>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-indigo-600 text-white p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </span>
                SoporteYa
              </h1>
              <p className="mt-1 text-sm text-gray-500">Dashboard de tickets de soporte</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-2 bg-green-400 rounded-full animate-pulse"></span>
                Realtime activo
              </span>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Ticket
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <div className="mt-8 mb-6 flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Filtrar:</span>
          {(['all', 'pending', 'processed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Procesados'}
              <span className="ml-2 text-xs opacity-75">
                ({f === 'all' ? stats.total : f === 'pending' ? stats.pending : stats.processed})
              </span>
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay tickets</h3>
            <p className="text-gray-500 text-sm">
              {filter === 'all'
                ? 'Aún no se han creado tickets de soporte.'
                : filter === 'pending'
                ? 'No hay tickets pendientes de procesar.'
                : 'No hay tickets procesados todavía.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showForm && <NewTicketForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

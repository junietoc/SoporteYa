import { useEffect, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Ticket } from '../types/database'
import { TicketRow } from './TicketCard'
import { NewTicketForm } from './NewTicketForm'
import rudderLogo from '../assets/rudder.png'

export function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const totalTickets = tickets.length

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-900 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-neutral-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-neutral-900 font-medium mb-1">Error de conexión</p>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={rudderLogo} alt="Rudder" className="w-8 h-8" />
              <span className="text-lg font-semibold text-neutral-900">SoporteYa</span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              + Nuevo ticket
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Minimal Stats */}
        <div className="text-sm text-neutral-500 mb-8">
          {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-neutral-500">No hay tickets todavía</p>
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-200">
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showForm && <NewTicketForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

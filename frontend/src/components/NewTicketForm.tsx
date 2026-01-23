import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface NewTicketFormProps {
  onClose: () => void
}

export function NewTicketForm({ onClose }: NewTicketFormProps) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!description.trim()) {
      setError('Por favor ingresa una descripción')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from('tickets').insert({
        description: description.trim(),
      })

      if (error) throw error
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-5 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Nuevo ticket</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm text-neutral-600 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 focus:outline-none resize-none text-sm text-neutral-900 placeholder-neutral-400"
              placeholder="Describe tu problema o consulta..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import type { Ticket } from '../types/database'

interface TicketCardProps {
  ticket: Ticket
}

const sentimentConfig: Record<string, { color: string; emoji: string }> = {
  positivo: { color: 'bg-green-100 text-green-800 border-green-200', emoji: '😊' },
  negativo: { color: 'bg-red-100 text-red-800 border-red-200', emoji: '😠' },
  neutro: { color: 'bg-gray-100 text-gray-800 border-gray-200', emoji: '😐' },
}

const categoryColors: Record<string, string> = {
  'problema técnico': 'bg-purple-100 text-purple-800',
  'consulta': 'bg-blue-100 text-blue-800',
  'queja': 'bg-orange-100 text-orange-800',
  'sugerencia': 'bg-teal-100 text-teal-800',
  'otro': 'bg-slate-100 text-slate-800',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TicketCard({ ticket }: TicketCardProps) {
  const sentimentStyle = ticket.sentiment 
    ? sentimentConfig[ticket.sentiment.toLowerCase()] || sentimentConfig.neutro
    : null
  
  const categoryStyle = ticket.category 
    ? categoryColors[ticket.category.toLowerCase()] || categoryColors.otro
    : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {ticket.processed ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Procesado
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <span className="w-2 h-2 mr-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
              Pendiente
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {ticket.description}
      </p>

      {/* Tags */}
      {ticket.processed && (
        <div className="flex flex-wrap gap-2">
          {ticket.category && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${categoryStyle}`}>
              {ticket.category}
            </span>
          )}
          {sentimentStyle && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${sentimentStyle.color}`}>
              <span className="mr-1">{sentimentStyle.emoji}</span>
              {ticket.sentiment}
            </span>
          )}
        </div>
      )}

      {/* Ticket ID */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-mono">
          ID: {ticket.id.slice(0, 8)}...
        </span>
      </div>
    </div>
  )
}

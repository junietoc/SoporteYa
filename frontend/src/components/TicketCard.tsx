import type { Ticket } from '../types/database'

interface TicketRowProps {
  ticket: Ticket
}

const sentimentLabels: Record<string, string> = {
  positivo: 'Positivo',
  negativo: 'Negativo',
  neutro: 'Neutro',
  neutral: 'Neutral',
}

const categoryLabels: Record<string, string> = {
  soporte_tecnico: 'Soporte técnico',
  facturacion: 'Facturación',
  comercial: 'Comercial',
  consulta_general: 'Consulta general',
  otro: 'Otro',
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

export function TicketRow({ ticket }: TicketRowProps) {
  const sentiment = ticket.sentiment?.toLowerCase()
  const sentimentLabel = sentiment ? sentimentLabels[sentiment] || ticket.sentiment : null
  const category = ticket.category?.toLowerCase()
  const categoryLabel = category ? categoryLabels[category] || ticket.category : null

  return (
    <div className="px-4 py-4 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <span className="text-xs text-neutral-400">
              {formatDate(ticket.created_at)}
            </span>
          </div>
          
          {/* Description */}
          <p className="text-sm text-neutral-900 leading-relaxed line-clamp-2">
            {ticket.description}
          </p>

          {/* Tags */}
          {(categoryLabel || sentimentLabel) && (
            <div className="flex items-center gap-2 mt-2">
              {categoryLabel && (
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  {categoryLabel}
                </span>
              )}
              {sentimentLabel && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  sentiment === 'negativo' 
                    ? 'text-red-700 bg-red-50' 
                    : sentiment === 'positivo'
                    ? 'text-green-700 bg-green-50'
                    : 'text-neutral-500 bg-neutral-100'
                }`}>
                  {sentimentLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

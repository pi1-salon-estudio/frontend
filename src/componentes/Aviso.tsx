import type { ReactNode } from 'react'

type AvisoProps = {
  tipo: 'error' | 'informacion' | 'exito'
  titulo: string
  children?: ReactNode
}

const BORDE = { error: 'border-aviso', informacion: 'border-pino', exito: 'border-exito' } as const
const TITULO = { error: 'text-aviso', informacion: 'text-pino', exito: 'text-exito' } as const

// Tarjeta de aviso del prototipo. El color acompaña al texto, nunca lo reemplaza.
export function Aviso({ tipo, titulo, children }: AvisoProps) {
  return (
    <div className={`mt-6 flex items-start gap-3 rounded-md border bg-blanco p-4 ${BORDE[tipo]}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`shrink-0 ${TITULO[tipo]}`}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        {tipo === 'exito' ? (
          <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
          </>
        )}
      </svg>
      <div>
        <p className={`text-sm leading-5 font-semibold ${TITULO[tipo]}`}>{titulo}</p>
        {children && <p className="mt-0.5 text-xs leading-4 text-piedra">{children}</p>}
      </div>
    </div>
  )
}

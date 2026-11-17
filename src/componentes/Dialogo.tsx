import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DialogoProps = {
  abierto: boolean
  tituloId: string
  descritoId?: string
  onCerrar: () => void
  children: ReactNode
}

export function Dialogo({ abierto, tituloId, descritoId, onCerrar, children }: DialogoProps) {
  const dialogo = useRef<HTMLDivElement>(null)
  const anterior = useRef<HTMLElement | null>(null)
  const cerrar = useRef(onCerrar)

  useEffect(() => {
    cerrar.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    const root = document.getElementById('root')
    anterior.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    root?.setAttribute('inert', '')
    const nodo = dialogo.current
    nodo?.focus()

    function tecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        cerrar.current()
        return
      }
      if (evento.key !== 'Tab' || !nodo) return
      const focos = [...nodo.querySelectorAll<HTMLElement>('button, [href], input, select, textarea')].filter(
        (elemento) => !elemento.hasAttribute('disabled'),
      )
      if (focos.length === 0) {
        evento.preventDefault()
        nodo.focus()
        return
      }
      const primero = focos[0]
      const ultimo = focos[focos.length - 1]
      const activo = document.activeElement
      if (evento.shiftKey && (activo === primero || activo === nodo)) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && activo === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('keydown', tecla)
      root?.removeAttribute('inert')
      anterior.current?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-tinta/45" />
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descritoId}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-lg border border-linea bg-blanco p-6 outline-none"
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

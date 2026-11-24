import { useLayoutEffect, useRef, useState, type UIEvent } from 'react'
import { btnSecundario } from '../../estilos.ts'
import { formatoHora } from '../../sala/formato-hora.ts'
import type { Mensaje } from '../../tiempo-real/contrato.ts'

type ListaMensajesProps = {
  mensajes: Mensaje[]
  uid: string
  estado: 'cargando' | 'lista' | 'error'
  onReintentar?: () => void
  hayMas?: boolean
  cargandoAnteriores?: boolean
  errorAnteriores?: string
  onCargarAnteriores?: () => void
}

const MARGEN_FINAL = 48

// La lista no es región viva (decisión 8): si lo fuera, NVDA leería todo el historial
// cada vez que carga. Los mensajes nuevos se anuncian en una región aparte de la sala.
export function ListaMensajes({
  mensajes,
  uid,
  estado,
  onReintentar,
  hayMas = false,
  cargandoAnteriores = false,
  errorAnteriores = '',
  onCargarAnteriores,
}: ListaMensajesProps) {
  const caja = useRef<HTMLDivElement>(null)
  const [alFinal, setAlFinal] = useState(true)
  const [vistos, setVistos] = useState(0)
  const ultimo = mensajes.at(-1)
  const primero = mensajes.at(0)
  // Altura antes de cargar mensajes anteriores: sirve para que la lectura no salte.
  const alturaPrevia = useRef<number | null>(null)
  const nuevos = alFinal ? 0 : Math.max(0, mensajes.length - vistos)

  function alDesplazar(evento: UIEvent<HTMLDivElement>) {
    const el = evento.currentTarget
    const fin = el.scrollHeight - el.scrollTop - el.clientHeight < MARGEN_FINAL
    if (fin !== alFinal || fin) {
      setAlFinal(fin)
      setVistos(mensajes.length)
    }
  }

  function anteriores() {
    if (caja.current) alturaPrevia.current = caja.current.scrollHeight
    onCargarAnteriores?.()
  }

  function bajar() {
    const el = caja.current
    if (el) el.scrollTo({ top: el.scrollHeight })
  }

  // US-10: baja solo si la persona ya estaba al final o si el último mensaje es suyo.
  // Si está leyendo arriba no se mueve y aparece «Mensajes nuevos».
  useLayoutEffect(() => {
    const el = caja.current
    if (!el || !ultimo) return
    if (alFinal || ultimo.autorUid === uid) el.scrollTop = el.scrollHeight
    // Solo importa cuando cambia el último mensaje, no cuando cambia alFinal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ultimo?.id])

  // US-11: al cargar los anteriores arriba, se conserva el punto de lectura.
  useLayoutEffect(() => {
    const el = caja.current
    if (!el || alturaPrevia.current === null) return
    el.scrollTop += el.scrollHeight - alturaPrevia.current
    alturaPrevia.current = null
    // Si ya no quedan más, el botón desaparece: el foco pasa a la lista para no perderse.
    if (!hayMas) el.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primero?.id])

  return (
    <div className="relative">
      <div
        ref={caja}
        onScroll={alDesplazar}
        // Una región con scroll tiene que poder recibir el foco para leerla con el teclado.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label="Mensajes"
        className="h-[420px] overflow-y-auto px-4 py-4 md:h-[440px]"
      >
        {estado === 'cargando' && (
          <p className="flex h-full items-center justify-center text-[15px] text-piedra">Cargando mensajes…</p>
        )}
        {estado === 'error' && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-[15px] text-aviso">No pudimos cargar los mensajes de la sala.</p>
            <button type="button" onClick={onReintentar} className={`${btnSecundario} mt-3`}>
              Reintentar
            </button>
          </div>
        )}
        {estado === 'lista' && mensajes.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-pino">
              <path d="M4 5h16v11H9l-5 4V5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
            </svg>
            <p className="mt-3 text-lg leading-[26px] font-semibold">Todavía no hay mensajes</p>
            <p className="mt-1 text-[15px] leading-[22px] text-piedra">Escribe el primero para arrancar la conversación.</p>
          </div>
        )}
        {estado === 'lista' && mensajes.length > 0 && (
          <>
            {hayMas && (
              <div className="mb-3 flex flex-col items-center">
                <button type="button" onClick={anteriores} disabled={cargandoAnteriores} className={btnSecundario}>
                  {cargandoAnteriores ? 'Cargando mensajes anteriores…' : 'Cargar mensajes anteriores'}
                </button>
                <p aria-live="polite" className="mt-2 text-sm text-aviso">
                  {errorAnteriores}
                </p>
              </div>
            )}
            <ol className="flex flex-col gap-1.5">
              {mensajes.map((m) => {
                const mio = m.autorUid === uid
                return (
                  <li key={m.id} className={`rounded-lg px-3.5 py-2.5 ${mio ? 'bg-activo' : ''}`}>
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold">{mio ? 'Tú' : m.nombreUsuario}</span>
                      <time dateTime={m.creadoEn} className="text-[13px] text-piedra">
                        {formatoHora(m.creadoEn)}
                      </time>
                    </p>
                    <p className="text-[15px] leading-[22px] break-words whitespace-pre-wrap">{m.texto}</p>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </div>
      {nuevos > 0 && (
        <button
          type="button"
          onClick={bajar}
          className="absolute bottom-4 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center rounded-lg border border-pino bg-papel px-5 text-[15px] font-semibold text-tinta shadow-md hover:bg-activo"
        >
          Mensajes nuevos ({nuevos}) <span aria-hidden="true">&nbsp;↓</span>
        </button>
      )}
    </div>
  )
}

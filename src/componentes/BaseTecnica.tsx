import { useEffect, useRef, useState } from 'react'
import {
  consultarBaseTecnica,
  ErrorConsulta,
  formatearActualizacion,
} from '../api/base-tecnica.ts'

const ESPERA_AVISO_MS = 10_000
const LIMITE_CONSULTA_MS = 90_000

type Estado =
  | { tipo: 'cargando'; avisoLento: boolean }
  | { tipo: 'exito'; mensaje: string; actualizadoEn: string }
  | { tipo: 'vacio'; mensaje: string }
  | { tipo: 'error'; mensaje: string }

export function BaseTecnica() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando', avisoLento: false })
  const [intento, setIntento] = useState(0)
  const reintentarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const controlador = new AbortController()
    let vigente = true
    const limite = window.setTimeout(() => controlador.abort(), LIMITE_CONSULTA_MS)
    const aviso = window.setTimeout(() => {
      if (!vigente) return
      setEstado((actual) =>
        actual.tipo === 'cargando' ? { tipo: 'cargando', avisoLento: true } : actual,
      )
    }, ESPERA_AVISO_MS)

    consultarBaseTecnica(controlador.signal)
      .then((dato) => {
        if (!vigente) return
        setEstado({
          tipo: 'exito',
          mensaje: dato.mensaje,
          actualizadoEn: dato.actualizadoEn,
        })
      })
      .catch((error: unknown) => {
        if (!vigente) return
        if (error instanceof DOMException && error.name === 'AbortError') {
          setEstado({
            tipo: 'error',
            mensaje: 'La consulta tardó demasiado. Inténtalo de nuevo.',
          })
          return
        }
        if (error instanceof ErrorConsulta && error.codigo === 'DATO_NO_ENCONTRADO') {
          setEstado({ tipo: 'vacio', mensaje: error.message })
          return
        }
        const mensaje =
          error instanceof ErrorConsulta
            ? error.message
            : 'No pudimos consultar los datos. Revisa tu conexión e inténtalo de nuevo.'
        setEstado({ tipo: 'error', mensaje })
      })

    return () => {
      vigente = false
      controlador.abort()
      window.clearTimeout(limite)
      window.clearTimeout(aviso)
    }
  }, [intento])

  useEffect(() => {
    if (estado.tipo !== 'error' && estado.tipo !== 'vacio') return
    const activo = document.activeElement
    const boton = reintentarRef.current
    if (activo === document.body || activo === boton) {
      boton?.focus()
    }
  }, [estado])

  function reintentar() {
    setEstado({ tipo: 'cargando', avisoLento: false })
    setIntento((valor) => valor + 1)
  }

  const fecha =
    estado.tipo === 'exito' ? formatearActualizacion(estado.actualizadoEn) : null
  const muestraReintento = estado.tipo === 'error' || estado.tipo === 'vacio'

  return (
    <section aria-labelledby="titulo-base" className="mt-10">
      <h2 id="titulo-base" className="text-2xl font-semibold">
        Base técnica
      </h2>
      <p className="mt-2 max-w-prose text-piedra">
        Este bloque pide un dato al servidor publicado y lo muestra aquí. Si el dato cambia,
        se ve al recargar la página.
      </p>
      <div
        aria-live="polite"
        aria-busy={estado.tipo === 'cargando'}
        className="mt-4 max-w-prose rounded-lg border border-linea bg-white p-4"
      >
        {estado.tipo === 'cargando' && (
          <>
            <p>Consultando la base técnica.</p>
            {estado.avisoLento && (
              <p className="mt-2">
                El servidor puede estar despertando. La primera consulta a veces tarda cerca de un
                minuto.
              </p>
            )}
          </>
        )}
        {estado.tipo === 'exito' && (
          <>
            <p className="text-exito">{estado.mensaje}</p>
            {fecha && <p className="mt-2 text-piedra">Actualizado: {fecha}</p>}
          </>
        )}
        {muestraReintento && (
          <p id="mensaje-base" className={estado.tipo === 'error' ? 'text-aviso' : undefined}>
            {estado.mensaje}
          </p>
        )}
      </div>
      {muestraReintento && (
        <button
          ref={reintentarRef}
          type="button"
          onClick={reintentar}
          aria-describedby="mensaje-base"
          className="mt-4 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover"
        >
          Reintentar
        </button>
      )}
    </section>
  )
}

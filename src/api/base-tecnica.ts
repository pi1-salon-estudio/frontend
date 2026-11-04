export type DatoBaseTecnica = {
  mensaje: string
  actualizadoEn: string
}

export class ErrorConsulta extends Error {
  readonly codigo: string | undefined

  constructor(mensaje: string, codigo?: string) {
    super(mensaje)
    this.name = 'ErrorConsulta'
    this.codigo = codigo
  }
}

const MENSAJE_RED =
  'No pudimos consultar los datos. Revisa tu conexión e inténtalo de nuevo.'

export async function consultarBaseTecnica(signal: AbortSignal): Promise<DatoBaseTecnica> {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    throw new ErrorConsulta('Falta la dirección de la API. Revisa la variable VITE_API_URL.')
  }

  const url = `${base.replace(/\/$/, '')}/api/v1/base-tecnica`
  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ErrorConsulta(MENSAJE_RED)
  }

  const cuerpo: unknown = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const fallo = leerFallo(cuerpo)
    throw new ErrorConsulta(fallo?.mensaje ?? MENSAJE_RED, fallo?.codigo)
  }

  if (!esDato(cuerpo)) {
    throw new ErrorConsulta('La respuesta de la API no tiene la forma esperada.')
  }

  return cuerpo
}

export function formatearActualizacion(iso: string): string | null {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return null
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(fecha)
}

function leerFallo(cuerpo: unknown): { mensaje: string; codigo?: string } | null {
  if (typeof cuerpo !== 'object' || cuerpo === null || !('error' in cuerpo)) return null
  const error = cuerpo.error
  if (typeof error !== 'object' || error === null) return null
  const mensaje = 'mensaje' in error && typeof error.mensaje === 'string' ? error.mensaje : ''
  const codigo = 'codigo' in error && typeof error.codigo === 'string' ? error.codigo : undefined
  if (!mensaje) return null
  return { mensaje, codigo }
}

function esDato(cuerpo: unknown): cuerpo is DatoBaseTecnica {
  if (typeof cuerpo !== 'object' || cuerpo === null) return false
  return (
    'mensaje' in cuerpo &&
    typeof cuerpo.mensaje === 'string' &&
    cuerpo.mensaje.length > 0 &&
    'actualizadoEn' in cuerpo &&
    typeof cuerpo.actualizadoEn === 'string'
  )
}

export class ErrorApi extends Error {
  readonly codigo: string | undefined
  readonly campos: Record<string, string>

  constructor(mensaje: string, codigo?: string, campos?: Record<string, string>) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.codigo = codigo
    this.campos = campos ?? {}
  }
}

export type Perfil = {
  uid: string
  nombres: string
  apellidos: string
  nombreUsuario: string
  avatar: string
  correo: string
  proveedor: 'correo' | 'google'
  creadoEn: string
}

export type EstadoSesion = {
  uid: string
  correo: string
  proveedor: 'correo' | 'google'
  perfilCompleto: boolean
  perfil: Perfil | null
}

export type RegistroCorreo = {
  nombres: string
  apellidos: string
  nombreUsuario: string
  avatar: string
  correo: string
  contrasena: string
}

const MENSAJE_RED = 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'

export async function registrarConCorreo(datos: RegistroCorreo): Promise<void> {
  await pedir('/api/v1/usuarios', { method: 'POST', cuerpo: datos })
}

export async function completarConGoogle(token: string, nombreUsuario: string): Promise<void> {
  await pedir('/api/v1/usuarios/google', {
    method: 'POST',
    token,
    cuerpo: { nombreUsuario },
  })
}

export async function obtenerSesion(token: string): Promise<EstadoSesion> {
  const cuerpo = await pedir('/api/v1/sesion', { token })
  if (!esEstado(cuerpo)) {
    throw new ErrorApi('La respuesta de la sesión no tiene la forma esperada.')
  }
  return cuerpo
}

async function pedir(
  ruta: string,
  opciones: { method?: 'GET' | 'POST'; token?: string; cuerpo?: unknown } = {},
): Promise<unknown> {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    throw new ErrorApi('Falta la dirección de la API. Revisa la variable VITE_API_URL.')
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opciones.cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  if (opciones.token) headers.Authorization = `Bearer ${opciones.token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`${base.replace(/\/$/, '')}${ruta}`, {
      method: opciones.method ?? 'GET',
      headers,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi(MENSAJE_RED)
  }

  if (respuesta.status === 204) return null
  const cuerpo: unknown = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const fallo = leerFallo(cuerpo)
    throw new ErrorApi(fallo?.mensaje ?? MENSAJE_RED, fallo?.codigo, fallo?.campos)
  }
  return cuerpo
}

function leerFallo(
  cuerpo: unknown,
): { mensaje: string; codigo?: string; campos?: Record<string, string> } | null {
  if (typeof cuerpo !== 'object' || cuerpo === null || !('error' in cuerpo)) return null
  const error = cuerpo.error
  if (typeof error !== 'object' || error === null) return null
  const mensaje = 'mensaje' in error && typeof error.mensaje === 'string' ? error.mensaje : ''
  if (!mensaje) return null
  const codigo = 'codigo' in error && typeof error.codigo === 'string' ? error.codigo : undefined
  const campos = leerCampos('campos' in error ? error.campos : undefined)
  return { mensaje, codigo, campos }
}

function leerCampos(valor: unknown): Record<string, string> | undefined {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return undefined
  const campos: Record<string, string> = {}
  for (const [clave, texto] of Object.entries(valor)) {
    if (typeof texto === 'string' && texto) campos[clave] = texto
  }
  return Object.keys(campos).length > 0 ? campos : undefined
}

function esEstado(cuerpo: unknown): cuerpo is EstadoSesion {
  if (typeof cuerpo !== 'object' || cuerpo === null) return false
  return (
    'perfilCompleto' in cuerpo &&
    typeof cuerpo.perfilCompleto === 'boolean' &&
    'correo' in cuerpo &&
    typeof cuerpo.correo === 'string' &&
    'proveedor' in cuerpo &&
    (cuerpo.proveedor === 'correo' || cuerpo.proveedor === 'google')
  )
}

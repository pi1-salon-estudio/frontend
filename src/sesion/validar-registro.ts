const NOMBRE_USUARIO = /^[A-Za-z][A-Za-z0-9_]{2,19}$/
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type DatosRegistro = {
  nombres: string
  apellidos: string
  nombreUsuario: string
  avatar: string
  correo: string
  contrasena: string
}

const ORDEN = ['nombres', 'apellidos', 'nombreUsuario', 'avatar', 'correo', 'contrasena'] as const

export function validarRegistro(datos: DatosRegistro): Record<string, string> {
  const campos: Record<string, string> = {}
  const nombres = datos.nombres.trim()
  const apellidos = datos.apellidos.trim()
  const nombreUsuario = datos.nombreUsuario.trim()
  const avatar = datos.avatar.trim()
  const correo = datos.correo.trim().toLowerCase()
  const contrasena = datos.contrasena

  if (!nombres) campos.nombres = 'Escribe tus nombres.'
  else if (nombres.length > 80) campos.nombres = 'Los nombres no pueden pasar de 80 caracteres.'

  if (!apellidos) campos.apellidos = 'Escribe tus apellidos.'
  else if (apellidos.length > 80) campos.apellidos = 'Los apellidos no pueden pasar de 80 caracteres.'

  if (!nombreUsuario) campos.nombreUsuario = 'Elige un nombre de usuario.'
  else if (!NOMBRE_USUARIO.test(nombreUsuario)) {
    campos.nombreUsuario =
      'Usa de 3 a 20 caracteres: empieza con una letra y sigue con letras, números o guion bajo.'
  }

  if (!avatar) campos.avatar = 'Elige un avatar.'
  else if (avatar.length > 2000) campos.avatar = 'El avatar es demasiado largo.'

  if (!correo || !CORREO.test(correo) || correo.length > 320) campos.correo = 'Escribe un correo válido.'

  if (contrasena.length < 8) campos.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
  else if (contrasena.length > 64) campos.contrasena = 'La contraseña no puede pasar de 64 caracteres.'

  return campos
}

export function validarCambioPerfil(datos: {
  nombres: string
  apellidos: string
  avatar: string
}): Record<string, string> {
  const campos: Record<string, string> = {}
  const nombres = datos.nombres.trim()
  const apellidos = datos.apellidos.trim()
  const avatar = datos.avatar.trim()

  if (!nombres) campos.nombres = 'Escribe tus nombres.'
  else if (nombres.length > 80) campos.nombres = 'Los nombres no pueden pasar de 80 caracteres.'

  if (!apellidos) campos.apellidos = 'Escribe tus apellidos.'
  else if (apellidos.length > 80) campos.apellidos = 'Los apellidos no pueden pasar de 80 caracteres.'

  if (!avatar) campos.avatar = 'Elige un avatar.'
  else if (avatar.length > 2000) campos.avatar = 'El avatar es demasiado largo.'

  return campos
}

export function validarNombreUsuario(nombreUsuario: string): string | null {
  const nombre = nombreUsuario.trim()
  if (!nombre) return 'Elige un nombre de usuario.'
  if (!NOMBRE_USUARIO.test(nombre)) {
    return 'Usa de 3 a 20 caracteres: empieza con una letra y sigue con letras, números o guion bajo.'
  }
  return null
}

export function primerCampo(campos: Record<string, string>): (typeof ORDEN)[number] | null {
  return ORDEN.find((clave) => campos[clave]) ?? null
}

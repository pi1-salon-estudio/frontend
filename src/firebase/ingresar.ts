import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'
import { firebaseConfigurado, obtenerAuth } from './cliente.ts'

const CREDENCIAL_INVALIDA = new Set([
  'auth/invalid-credential',
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-email',
])

export class ErrorIngreso extends Error {
  readonly codigo: string

  constructor(mensaje: string, codigo: string) {
    super(mensaje)
    this.name = 'ErrorIngreso'
    this.codigo = codigo
  }
}

export async function ingresarConGoogle(): Promise<void> {
  const proveedor = new GoogleAuthProvider()
  try {
    await signInWithPopup(obtenerAuth(), proveedor)
  } catch (error) {
    throw new ErrorIngreso(mensajeDeIngreso(error), codigoDe(error))
  }
}

export async function cerrarAuth(): Promise<void> {
  if (!firebaseConfigurado()) return
  await signOut(obtenerAuth())
}

export async function tokenActual(): Promise<string> {
  const usuario = firebaseConfigurado() ? obtenerAuth().currentUser : null
  if (!usuario) throw new ErrorIngreso('Inicia sesión para continuar.', 'auth/no-sesion')
  return usuario.getIdToken()
}

export async function ingresarConCorreo(correo: string, contrasena: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(obtenerAuth(), correo, contrasena)
  } catch (error) {
    const codigo = codigoDe(error)
    if (
      codigo === 'auth/network-request-failed' ||
      codigo === 'auth/too-many-requests' ||
      codigo === 'auth/operation-not-allowed'
    ) {
      throw new ErrorIngreso(mensajeDeIngreso(error), codigo)
    }
    throw new ErrorIngreso('Correo o contraseña incorrectos', codigo)
  }
}

export function mensajeDeIngreso(error: unknown): string {
  const codigo = codigoDe(error)
  if (CREDENCIAL_INVALIDA.has(codigo)) return 'Correo o contraseña incorrectos'
  if (codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request') {
    return 'No terminaste el ingreso con Google. Puedes intentarlo otra vez o entrar con tu correo.'
  }
  if (codigo === 'auth/popup-blocked') {
    return 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo de nuevo.'
  }
  if (codigo === 'auth/too-many-requests') {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  }
  if (codigo === 'auth/network-request-failed') {
    return 'No pudimos conectar con el servicio de ingreso. Revisa tu conexión e inténtalo de nuevo.'
  }
  if (codigo === 'auth/operation-not-allowed') {
    return 'El ingreso con correo no está habilitado. Hay que activarlo en Firebase.'
  }
  return 'No pudimos iniciar la sesión. Inténtalo de nuevo.'
}

function codigoDe(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) return String(error.code)
  return ''
}

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

export class ErrorConfiguracion extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ErrorConfiguracion'
  }
}

let aplicacion: FirebaseApp | null = null
let auth: Auth | null = null

export function obtenerAuth(): Auth {
  if (auth) return auth

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  if (!apiKey || !authDomain || !projectId) {
    throw new ErrorConfiguracion(
      'Falta la configuración de Firebase. Revisa las variables VITE_FIREBASE_ en el entorno.',
    )
  }

  aplicacion = initializeApp({ apiKey, authDomain, projectId })
  auth = getAuth(aplicacion)
  return auth
}

export function firebaseConfigurado(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
  )
}

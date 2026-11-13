import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { obtenerSesion } from '../api/usuarios.ts'
import { firebaseConfigurado, obtenerAuth } from '../firebase/cliente.ts'
import { desmarcarLlegadaGoogle, hayLlegadaGoogle, mensajeDeIngreso } from '../firebase/ingresar.ts'
import { ContextoSesionReact, type EstadoVista } from './contexto.ts'

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoVista>(() =>
    firebaseConfigurado() ? { tipo: 'cargando' } : { tipo: 'sin-sesion' },
  )
  const [avisoGoogle, setAvisoGoogle] = useState<string | null>(null)
  const [llegoDeGoogle, setLlegoDeGoogle] = useState(false)
  const limpiarAvisoGoogle = useCallback(() => setAvisoGoogle(null), [])
  const usuarioRef = useRef<User | null>(null)
  const cargarRef = useRef<(usuario: User | null) => Promise<void>>(async () => {})

  useEffect(() => {
    let vigente = true
    let marca = 0

    async function cargar(usuario: User | null) {
      const actual = ++marca
      usuarioRef.current = usuario
      if (!usuario) {
        if (vigente) setEstado({ tipo: 'sin-sesion' })
        return
      }

      if (vigente) setEstado({ tipo: 'cargando' })
      try {
        const token = await usuario.getIdToken()
        const sesion = await obtenerSesion(token)
        if (!vigente || actual !== marca) return
        setEstado({
          tipo: 'lista',
          perfilCompleto: sesion.perfilCompleto,
          perfil: sesion.perfilCompleto ? sesion.perfil : null,
          correo: sesion.correo,
        })
      } catch {
        if (!vigente || actual !== marca) return
        setEstado({
          tipo: 'error',
          mensaje: 'No pudimos leer tu sesión. Revisa tu conexión e inténtalo de nuevo.',
        })
      }
    }

    cargarRef.current = cargar

    if (!firebaseConfigurado()) {
      return () => {
        vigente = false
      }
    }

    void getRedirectResult(obtenerAuth()).then(
      (resultado) => {
        if (vigente && resultado) setLlegoDeGoogle(true)
      },
      (error: unknown) => {
        if (vigente) setAvisoGoogle(mensajeDeIngreso(error))
      },
    )

    const cancelar = onAuthStateChanged(obtenerAuth(), (usuario) => {
      if (usuario && hayLlegadaGoogle()) {
        desmarcarLlegadaGoogle()
        setLlegoDeGoogle(true)
      }
      void cargar(usuario)
    })

    return () => {
      vigente = false
      cancelar()
    }
  }, [])

  function reintentar() {
    return cargarRef.current(usuarioRef.current)
  }

  return (
    <ContextoSesionReact value={{ estado, reintentar, avisoGoogle, limpiarAvisoGoogle, llegoDeGoogle }}>
      {children}
    </ContextoSesionReact>
  )
}

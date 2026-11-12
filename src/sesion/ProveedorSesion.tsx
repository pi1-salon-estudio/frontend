import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { obtenerSesion } from '../api/usuarios.ts'
import { firebaseConfigurado, obtenerAuth } from '../firebase/cliente.ts'
import { ContextoSesionReact, type EstadoVista } from './contexto.ts'

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoVista>(() =>
    firebaseConfigurado() ? { tipo: 'cargando' } : { tipo: 'sin-sesion' },
  )
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

    const cancelar = onAuthStateChanged(obtenerAuth(), (usuario) => {
      void cargar(usuario)
    })

    return () => {
      vigente = false
      cancelar()
    }
  }, [])

  function reintentar() {
    void cargarRef.current(usuarioRef.current)
  }

  return <ContextoSesionReact value={{ estado, reintentar }}>{children}</ContextoSesionReact>
}

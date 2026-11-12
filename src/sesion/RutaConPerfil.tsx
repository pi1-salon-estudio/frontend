import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSesion } from './use-sesion.ts'

export function RutaConPerfil({ children }: { children: ReactNode }) {
  const { estado } = useSesion()

  if (estado.tipo === 'cargando') {
    return <p aria-busy="true">Revisando tu sesión.</p>
  }

  if (estado.tipo === 'lista' && !estado.perfilCompleto) {
    return <Navigate to="/registro/usuario" replace />
  }

  return children
}

import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hayCierreVoluntario } from './cierre-voluntario.ts'
import { useSesion } from './use-sesion.ts'

export function RutaConPerfil({ children }: { children: ReactNode }) {
  const { estado, reintentar } = useSesion()
  const location = useLocation()

  if (estado.tipo === 'cargando') {
    return <p aria-busy="true">Revisando tu sesión.</p>
  }

  if (estado.tipo === 'error') {
    return (
      <>
        <p id="mensaje-ruta" className="text-aviso">
          {estado.mensaje}
        </p>
        <button
          type="button"
          onClick={() => void reintentar()}
          aria-describedby="mensaje-ruta"
          className="mt-4 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover"
        >
          Reintentar
        </button>
      </>
    )
  }

  if (estado.tipo === 'sin-sesion') {
    return (
      <Navigate
        to="/ingreso"
        replace
        state={hayCierreVoluntario() ? { sesionCerrada: true } : { desde: location.pathname }}
      />
    )
  }

  if (!estado.perfilCompleto) {
    return <Navigate to="/registro/usuario" replace />
  }

  return children
}

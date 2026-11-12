import { Link, useLocation } from 'react-router-dom'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

export function Panel() {
  useTitulo('Panel')
  const { estado, reintentar } = useSesion()
  const location = useLocation()
  const cuentaCreada = location.state?.cuentaCreada === true

  return (
    <>
      <h1 className="text-3xl font-semibold">Panel</h1>
      <div aria-live="polite" aria-busy={estado.tipo === 'cargando'} className="mt-4 max-w-prose">
        {estado.tipo === 'cargando' && <p>Revisando tu sesión.</p>}
        {estado.tipo === 'error' && (
          <>
            <p id="mensaje-panel" className="text-aviso">
              {estado.mensaje}
            </p>
            <button
              type="button"
              onClick={reintentar}
              aria-describedby="mensaje-panel"
              className="mt-4 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover"
            >
              Reintentar
            </button>
          </>
        )}
        {estado.tipo === 'sin-sesion' && (
          <>
            <p>Entra a tu cuenta para ver tus salas.</p>
            <p className="mt-4">
              <Link to="/ingreso" className="text-pino underline">
                Ir a ingreso
              </Link>
            </p>
          </>
        )}
        {estado.tipo === 'lista' && estado.perfil && (
          <>
            {cuentaCreada && <p className="text-exito">Tu cuenta quedó creada.</p>}
            <p className={cuentaCreada ? 'mt-3' : undefined}>
              Hola, {estado.perfil.nombres}. Tu nombre de usuario es {estado.perfil.nombreUsuario}.
            </p>
            <p className="mt-3">Todavía no tienes salas.</p>
            <p className="mt-3 text-piedra">Crear una sala llega en el siguiente sprint.</p>
          </>
        )}
        {estado.tipo === 'lista' && !estado.perfil && (
          <p>Tu sesión todavía no tiene un nombre de usuario.</p>
        )}
      </div>
    </>
  )
}

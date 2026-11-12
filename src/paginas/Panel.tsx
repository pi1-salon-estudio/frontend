import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../api/usuarios.ts'
import { btnPrimario, btnSecundario, textoSecundario, tituloPagina } from '../estilos.ts'
import { cerrarAuth, tokenActual } from '../firebase/ingresar.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

export function Panel() {
  useTitulo('Panel')
  const { estado, reintentar } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()
  const [cerrando, setCerrando] = useState(false)
  const cuentaCreada = location.state?.cuentaCreada === true
  const perfil = estado.tipo === 'lista' ? estado.perfil : null

  async function salir() {
    if (cerrando) return
    setCerrando(true)
    try {
      const token = await tokenActual()
      await cerrarSesion(token)
    } catch {
      // La sesión local se cierra igual. El servidor puede tardar unos segundos en revocar el token.
    }
    await cerrarAuth()
    navigate('/ingreso', { replace: true })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={tituloPagina}>Panel</h1>
        {perfil && (
          <button
            type="button"
            onClick={() => void salir()}
            disabled={cerrando}
            className={btnSecundario}
          >
            {cerrando ? 'Cerrando la sesión.' : 'Cerrar sesión'}
          </button>
        )}
      </div>
      <div aria-live="polite" aria-busy={estado.tipo === 'cargando'} className="mt-4">
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
              className={`${btnPrimario} mt-4`}
            >
              Reintentar
            </button>
          </>
        )}
        {estado.tipo === 'sin-sesion' && (
          <>
            <p>Entra a tu cuenta para ver tus salas.</p>
            <p className="mt-4">
              <Link to="/ingreso" className="font-semibold text-pino underline">
                Ir a ingreso
              </Link>
            </p>
          </>
        )}
        {perfil && (
          <>
            {cuentaCreada && <p className="text-exito">Tu cuenta quedó creada.</p>}
            <p className={cuentaCreada ? 'mt-3 text-piedra' : textoSecundario}>
              Hola, {perfil.nombres}. Tu nombre de usuario es {perfil.nombreUsuario}.
            </p>
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Tus salas</h2>
              <div className="mt-4 rounded-lg border border-linea px-8 py-16">
                <p className="text-xl">Todavía no tienes salas.</p>
                <button type="button" disabled className={`${btnSecundario} mt-6 cursor-not-allowed opacity-60`}>
                  Crear una sala
                </button>
              </div>
            </section>
          </>
        )}
        {estado.tipo === 'lista' && !estado.perfil && (
          <p className="mt-3">Tu sesión todavía no tiene un nombre de usuario.</p>
        )}
      </div>
    </>
  )
}

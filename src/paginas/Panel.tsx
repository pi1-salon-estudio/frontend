import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../api/usuarios.ts'
import { btnPrimario, btnSecundario, tarjeta, textoSecundario, tituloPagina } from '../estilos.ts'
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
    navigate('/ingreso', { replace: true, state: { sesionCerrada: true } })
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
            {cerrando ? 'Cerrando sesión…' : 'Cerrar sesión'}
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
            <section className="mt-8" aria-labelledby="titulo-salas">
              <h2 id="titulo-salas" className="text-xl leading-7 font-semibold">
                Tus salas
              </h2>
              {/* Estado vacío del prototipo. Crear salas es US-06 (S2): no se muestra un botón que no hace nada. */}
              <div className={`${tarjeta} mt-4 flex flex-col items-center text-center`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-pino">
                  <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                <p className="mt-3 text-lg leading-[26px] font-semibold">Todavía no tienes salas</p>
                <p className="mt-2 text-[15px] leading-[22px] text-piedra">
                  Aquí aparecerán las salas que crees y a las que te unas. Pronto podrás crearlas desde esta página.
                </p>
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

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Aviso } from '../componentes/Aviso.tsx'
import { BotonGoogle, SeparadorO } from '../componentes/BotonGoogle.tsx'
import { Campo } from '../componentes/Campo.tsx'
import { btnPrimario, tarjeta, textoSecundario, tituloPagina } from '../estilos.ts'
import { ingresarConCorreo, ingresarConGoogle } from '../firebase/ingresar.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

const RUTAS_PRIVADAS = new Set(['/panel', '/perfil', '/sala'])

type Fase = 'vacio' | 'cargando' | 'error'

function destinoPedido(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('desde' in state)) return '/panel'
  const desde = state.desde
  return typeof desde === 'string' && RUTAS_PRIVADAS.has(desde) ? desde : '/panel'
}

export function Ingreso() {
  useTitulo('Ingreso')
  const navigate = useNavigate()
  const location = useLocation()
  const { estado } = useSesion()
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const destino = destinoPedido(location.state)

  useEffect(() => {
    if (estado.tipo !== 'lista') return
    navigate(estado.perfilCompleto ? destino : '/registro/usuario', { replace: true })
  }, [destino, estado, navigate])

  async function conCorreo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (fase === 'cargando') return
    setMensaje('')
    setFase('cargando')
    try {
      await ingresarConCorreo(correo.trim().toLowerCase(), contrasena)
      setFase('vacio')
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'Correo o contraseña incorrectos')
      setContrasena('')
      setFase('error')
    }
  }

  async function conGoogle() {
    if (fase === 'cargando') return
    setMensaje('')
    setFase('cargando')
    try {
      await ingresarConGoogle()
      setFase('vacio')
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'No pudimos entrar con Google. Inténtalo de nuevo.')
      setFase('error')
    }
  }

  const ocupado = fase === 'cargando' || estado.tipo === 'cargando'
  const sesionCerrada = esMarca(location.state, 'sesionCerrada')
  const vieneDePrivada = destinoExplicito(location.state)

  return (
    <>
      <h1 className={tituloPagina}>Ingreso</h1>
      <p className={textoSecundario}>Entra con tu correo o con Google.</p>
      <div aria-live="polite">
        {fase === 'error' && (
          <Aviso tipo={esErrorDeGoogle(mensaje) ? 'informacion' : 'error'} titulo={mensaje} />
        )}
        {estado.tipo === 'error' && <Aviso tipo="error" titulo={estado.mensaje} />}
        {fase !== 'error' && vieneDePrivada && (
          <Aviso tipo="informacion" titulo="Inicia sesión para continuar">
            Al entrar te llevamos a la página que querías ver.
          </Aviso>
        )}
        {fase !== 'error' && sesionCerrada && (
          <Aviso tipo="exito" titulo="Cerraste sesión">
            Para volver, escribe tu correo y contraseña o usa Google.
          </Aviso>
        )}
        {ocupado && <p className="sr-only">Abriendo tu sesión.</p>}
      </div>
      <form className={`${tarjeta} mt-6`} aria-busy={ocupado} noValidate onSubmit={conCorreo}>
        <Campo
          id="correo"
          etiqueta="Correo"
          type="email"
          autoComplete="email"
          valor={correo}
          deshabilitado={ocupado}
          onChange={setCorreo}
        />
        <Campo
          id="contrasena"
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          valor={contrasena}
          deshabilitado={ocupado}
          onChange={setContrasena}
        />
        <button type="submit" disabled={ocupado} className={`${btnPrimario} mt-6 w-full`}>
          {fase === 'cargando' ? 'Entrando.' : 'Entrar'}
        </button>
        <SeparadorO />
        <BotonGoogle onClick={() => void conGoogle()} deshabilitado={ocupado} />
        <p className="mt-5 text-center text-sm text-piedra">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-pino underline">
            Crear cuenta
          </Link>
        </p>
      </form>
    </>
  )
}

function esMarca(state: unknown, clave: string): boolean {
  return typeof state === 'object' && state !== null && clave in state && Boolean((state as Record<string, unknown>)[clave])
}

function destinoExplicito(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'desde' in state
}

// La cancelación de Google no es un error del usuario: se muestra como información.
function esErrorDeGoogle(mensaje: string): boolean {
  return mensaje.includes('Google')
}

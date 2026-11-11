import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Campo } from '../componentes/Campo.tsx'
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

  return (
    <>
      <h1 className="text-3xl font-semibold">Ingreso</h1>
      <p className="mt-3 max-w-prose">Entra con tu correo o con Google.</p>
      <form className="mt-6 max-w-prose" aria-busy={ocupado} noValidate onSubmit={conCorreo}>
        <div aria-live="polite">
          {ocupado && <p>Abriendo tu sesión.</p>}
          {fase === 'error' && <p className="text-aviso">{mensaje}</p>}
          {estado.tipo === 'error' && <p className="text-aviso">{estado.mensaje}</p>}
        </div>
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
        <button
          type="submit"
          disabled={ocupado}
          className="mt-6 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover disabled:opacity-70"
        >
          {fase === 'cargando' ? 'Entrando.' : 'Entrar'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => void conGoogle()}
        disabled={ocupado}
        className="mt-3 rounded-md border border-linea bg-white px-4 py-2 font-medium text-tinta hover:underline disabled:opacity-70"
      >
        Continuar con Google
      </button>
      <p className="mt-4 text-piedra">
        Si todavía no tienes cuenta, créala en{' '}
        <Link to="/registro" className="text-pino underline">
          Registro
        </Link>
        .
      </p>
    </>
  )
}

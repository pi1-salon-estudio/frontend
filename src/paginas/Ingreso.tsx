import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Aviso } from '../componentes/Aviso.tsx'
import { BotonGoogle, SeparadorO } from '../componentes/BotonGoogle.tsx'
import { Campo } from '../componentes/Campo.tsx'
import { btnPrimario, tarjeta, textoSecundario, tituloPagina } from '../estilos.ts'
import { ingresarConCorreo, ingresarConGoogle } from '../firebase/ingresar.ts'
import { desmarcarCierreVoluntario } from '../sesion/cierre-voluntario.ts'
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
  const { estado, avisoGoogle, limpiarAvisoGoogle } = useSesion()
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<{ correo?: string; contrasena?: string }>({})
  const [foco, setFoco] = useState<{ id: string; marca: number } | null>(null)
  const destino = destinoPedido(location.state)

  useEffect(() => {
    if (estado.tipo !== 'lista') return
    // El cierre deja la sesión un instante: no devolver al panel ni pisar el aviso.
    if (esMarca(location.state, 'sesionCerrada')) return
    navigate(estado.perfilCompleto ? destino : '/registro/usuario', { replace: true })
  }, [destino, estado, location.state, navigate])

  useEffect(() => {
    if (!esMarca(location.state, 'sesionCerrada')) return
    desmarcarCierreVoluntario()
  }, [location.state])

  // El foco se mueve después de que el formulario vuelve a estar habilitado.
  useEffect(() => {
    if (!foco) return
    document.getElementById(foco.id)?.focus()
  }, [foco])

  async function conCorreo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (fase === 'cargando') return
    setMensaje('')
    limpiarAvisoGoogle()
    // Se valida antes de llamar a Firebase: con campos vacíos no se dice «incorrectos».
    const nuevos: { correo?: string; contrasena?: string } = {}
    if (!correo.trim()) nuevos.correo = 'Escribe tu correo.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) nuevos.correo = 'Escribe un correo válido, por ejemplo nombre@correo.com.'
    if (!contrasena) nuevos.contrasena = 'Escribe tu contraseña.'
    setErrores(nuevos)
    if (nuevos.correo || nuevos.contrasena) {
      setFase('vacio')
      setFoco({ id: nuevos.correo ? 'correo' : 'contrasena', marca: Date.now() })
      return
    }
    setFase('cargando')
    try {
      await ingresarConCorreo(correo.trim().toLowerCase(), contrasena)
      setFase('vacio')
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'Correo o contraseña incorrectos')
      setFase('error')
      setFoco({ id: 'contrasena', marca: Date.now() })
    }
  }

  async function conGoogle() {
    if (fase === 'cargando') return
    setMensaje('')
    limpiarAvisoGoogle()
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
  const mensajeVisible = avisoGoogle ?? mensaje
  const errorVisible = Boolean(avisoGoogle) || fase === 'error'

  return (
    <>
      <h1 className={tituloPagina}>Ingreso</h1>
      <p className={textoSecundario}>Entra con tu correo o con Google.</p>
      <div aria-live="polite">
        {errorVisible && (
          <Aviso tipo={esErrorDeGoogle(mensajeVisible) ? 'informacion' : 'error'} titulo={mensajeVisible} />
        )}
        {estado.tipo === 'error' && <Aviso tipo="error" titulo={estado.mensaje} />}
        {fase !== 'error' && !avisoGoogle && sesionCerrada && (
          <Aviso tipo="exito" titulo="Cerraste sesión">
            Para volver, escribe tu correo y contraseña o usa Google.
          </Aviso>
        )}
        {fase !== 'error' && !avisoGoogle && !sesionCerrada && vieneDePrivada && (
          <Aviso tipo="informacion" titulo="Inicia sesión para continuar">
            Al entrar te llevamos a la página que querías ver.
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
          error={errores.correo}
          deshabilitado={ocupado}
          onChange={setCorreo}
        />
        <Campo
          id="contrasena"
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          valor={contrasena}
          error={errores.contrasena}
          deshabilitado={ocupado}
          onChange={setContrasena}
        />
        <button type="submit" disabled={ocupado} className={`${btnPrimario} mt-6 w-full`}>
          {fase === 'cargando' ? 'Ingresando…' : 'Ingresar'}
        </button>
        <SeparadorO />
        <BotonGoogle onClick={() => void conGoogle()} deshabilitado={ocupado} />
        <p className="mt-5 text-center text-sm text-piedra">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-tinta underline">
            Regístrate
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

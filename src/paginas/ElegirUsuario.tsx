import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { completarConGoogle, ErrorApi } from '../api/usuarios.ts'
import { Campo } from '../componentes/Campo.tsx'
import { cerrarAuth, tokenActual } from '../firebase/ingresar.ts'
import { validarNombreUsuario } from '../sesion/validar-registro.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

type Fase = 'vacio' | 'cargando' | 'error' | 'exito'

export function ElegirUsuario() {
  useTitulo('Nombre de usuario')
  const navigate = useNavigate()
  const { estado, reintentar } = useSesion()
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')

  async function cancelar() {
    await cerrarAuth()
    navigate('/ingreso', { replace: true })
  }

  useEffect(() => {
    if (fase === 'cargando' || fase === 'exito') return
    function alTeclado(evento: globalThis.KeyboardEvent) {
      if (evento.key !== 'Escape') return
      evento.preventDefault()
      void cerrarAuth().then(() => navigate('/ingreso', { replace: true }))
    }
    document.addEventListener('keydown', alTeclado)
    return () => document.removeEventListener('keydown', alTeclado)
  }, [fase, navigate])

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (fase === 'cargando' || fase === 'exito') return
    const encontrado = validarNombreUsuario(nombre)
    if (encontrado) {
      setError(encontrado)
      setMensaje('Revisa el nombre de usuario.')
      setFase('error')
      document.getElementById('nombreUsuario')?.focus()
      return
    }

    setError('')
    setMensaje('')
    setFase('cargando')
    try {
      const token = await tokenActual()
      await completarConGoogle(token, nombre.trim())
      await reintentar()
    } catch (fallo) {
      if (fallo instanceof ErrorApi && fallo.campos.nombreUsuario) setError(fallo.campos.nombreUsuario)
      setMensaje(
        fallo instanceof Error
          ? fallo.message
          : 'No pudimos guardar el nombre de usuario. Inténtalo de nuevo.',
      )
      setFase('error')
      document.getElementById('nombreUsuario')?.focus()
      return
    }

    setMensaje('Nombre de usuario listo. Entrando al panel.')
    setFase('exito')
    navigate('/panel', { state: { cuentaCreada: true } })
  }

  if (estado.tipo === 'cargando') {
    return (
      <>
        <h1 className="text-3xl font-semibold">Nombre de usuario</h1>
        <p className="mt-3" aria-busy="true">
          Revisando tu sesión.
        </p>
      </>
    )
  }

  if (estado.tipo === 'sin-sesion') {
    return (
      <>
        <h1 className="text-3xl font-semibold">Nombre de usuario</h1>
        <p className="mt-3 max-w-prose">Entra con Google para elegir tu nombre de usuario.</p>
        <p className="mt-4">
          <Link to="/ingreso" className="text-pino underline">
            Ir a ingreso
          </Link>
        </p>
      </>
    )
  }

  if (estado.tipo === 'error') {
    return (
      <>
        <h1 className="text-3xl font-semibold">Nombre de usuario</h1>
        <p id="mensaje-usuario" className="mt-3 text-aviso">
          {estado.mensaje}
        </p>
        <button
          type="button"
          onClick={() => void reintentar()}
          aria-describedby="mensaje-usuario"
          className="mt-4 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover"
        >
          Reintentar
        </button>
      </>
    )
  }

  if (estado.perfilCompleto) {
    return (
      <>
        <h1 className="text-3xl font-semibold">Nombre de usuario</h1>
        <p className="mt-3">Tu cuenta ya tiene nombre de usuario.</p>
        <p className="mt-4">
          <Link to="/panel" className="text-pino underline">
            Ir al panel
          </Link>
        </p>
      </>
    )
  }

  const ocupado = fase === 'cargando' || fase === 'exito'

  return (
    <>
      <h1 className="text-3xl font-semibold">Nombre de usuario</h1>
      <p className="mt-3 max-w-prose">
        Google ya nos dio tu nombre y tu correo. Elige cómo te verán en el salón. Este paso no se puede saltar.
      </p>
      {fase === 'exito' ? (
        <p className="mt-6 text-exito" role="status">
          {mensaje}
        </p>
      ) : (
        <form className="mt-6 max-w-prose" aria-busy={fase === 'cargando'} noValidate onSubmit={enviar}>
          <div aria-live="polite">
            {mensaje && <p className={fase === 'error' ? 'text-aviso' : undefined}>{mensaje}</p>}
          </div>
          <Campo
            id="nombreUsuario"
            etiqueta="Nombre de usuario"
            autoComplete="username"
            ayuda="De 3 a 20 caracteres. Empieza con una letra y sigue con letras, números o guion bajo."
            valor={nombre}
            error={error}
            deshabilitado={ocupado}
            onChange={(valor) => {
              setNombre(valor)
              setError('')
            }}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={ocupado}
              className="rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover disabled:opacity-70"
            >
              {fase === 'cargando' ? 'Guardando el nombre.' : 'Continuar'}
            </button>
            <button
              type="button"
              onClick={() => void cancelar()}
              disabled={ocupado}
              className="rounded-md border border-linea bg-white px-4 py-2 font-medium text-tinta hover:underline disabled:opacity-70"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </>
  )
}

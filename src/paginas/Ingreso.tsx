import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ingresarConGoogle } from '../firebase/ingresar.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

type Fase = 'vacio' | 'cargando' | 'error'

export function Ingreso() {
  useTitulo('Ingreso')
  const navigate = useNavigate()
  const { estado } = useSesion()
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (estado.tipo !== 'lista') return
    navigate(estado.perfilCompleto ? '/panel' : '/registro/usuario', { replace: true })
  }, [estado, navigate])

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

  return (
    <>
      <h1 className="text-3xl font-semibold">Ingreso</h1>
      <p className="mt-3 max-w-prose">Entra con tu cuenta de Google. Después eliges un nombre de usuario.</p>
      <div className="mt-6 max-w-prose" aria-live="polite" aria-busy={fase === 'cargando' || estado.tipo === 'cargando'}>
        {(fase === 'cargando' || estado.tipo === 'cargando') && <p>Abriendo tu sesión.</p>}
        {fase === 'error' && <p className="text-aviso">{mensaje}</p>}
        {estado.tipo === 'error' && <p className="text-aviso">{estado.mensaje}</p>}
      </div>
      <button
        type="button"
        onClick={() => void conGoogle()}
        disabled={fase === 'cargando' || estado.tipo === 'cargando'}
        className="mt-6 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover disabled:opacity-70"
      >
        Continuar con Google
      </button>
      <p className="mt-4 text-piedra">
        Si todavía no tienes cuenta de correo, créala en{' '}
        <Link to="/registro" className="text-pino underline">
          Registro
        </Link>
        .
      </p>
    </>
  )
}

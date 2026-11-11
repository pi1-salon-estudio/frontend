import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorApi, registrarConCorreo } from '../api/usuarios.ts'
import { Campo } from '../componentes/Campo.tsx'
import { ElegirAvatar } from '../componentes/ElegirAvatar.tsx'
import { ErrorConfiguracion } from '../firebase/cliente.ts'
import { ingresarConCorreo } from '../firebase/ingresar.ts'
import { primerCampo, validarRegistro, type DatosRegistro } from '../sesion/validar-registro.ts'
import { useTitulo } from '../use-titulo.ts'

const VACIO: DatosRegistro = {
  nombres: '',
  apellidos: '',
  nombreUsuario: '',
  avatar: '',
  correo: '',
  contrasena: '',
}

type Fase = 'vacio' | 'cargando' | 'error' | 'exito'

export function Registro() {
  useTitulo('Registro')
  const navigate = useNavigate()
  const [datos, setDatos] = useState<DatosRegistro>(VACIO)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')
  const [ofrecerIngreso, setOfrecerIngreso] = useState(false)
  const [foco, setFoco] = useState<{ id: string; marca: number } | null>(null)

  useEffect(() => {
    if (!foco) return
    document.getElementById(foco.id)?.focus()
  }, [foco])

  useEffect(() => {
    if (fase !== 'exito') return
    const id = window.setTimeout(() => {
      navigate('/panel', { state: { cuentaCreada: true } })
    }, 700)
    return () => window.clearTimeout(id)
  }, [fase, navigate])

  function enfocar(campos: Record<string, string>) {
    const clave = primerCampo(campos)
    if (!clave) return
    setFoco({ id: clave === 'avatar' ? 'avatar-pino' : clave, marca: Date.now() })
  }

  function cambiar(campo: keyof DatosRegistro, valor: string) {
    setDatos((actual) => ({ ...actual, [campo]: valor }))
    setErrores((actual) => {
      if (!actual[campo]) return actual
      const siguiente = { ...actual }
      delete siguiente[campo]
      return siguiente
    })
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (fase === 'cargando' || fase === 'exito') return

    const encontrados = validarRegistro(datos)
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      setMensaje('Revisa los campos marcados.')
      setOfrecerIngreso(false)
      setFase('error')
      enfocar(encontrados)
      return
    }

    setErrores({})
    setMensaje('')
    setOfrecerIngreso(false)
    setFase('cargando')

    const enviados = {
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      nombreUsuario: datos.nombreUsuario.trim(),
      avatar: datos.avatar.trim(),
      correo: datos.correo.trim().toLowerCase(),
      contrasena: datos.contrasena,
    }

    try {
      await registrarConCorreo(enviados)
    } catch (error) {
      if (error instanceof ErrorApi && Object.keys(error.campos).length > 0) setErrores(error.campos)
      setOfrecerIngreso(error instanceof ErrorApi && error.codigo === 'CORREO_YA_REGISTRADO')
      setMensaje(
        error instanceof ErrorApi
          ? error.message
          : 'No pudimos crear la cuenta. Revisa tu conexión e inténtalo de nuevo.',
      )
      setFase('error')
      if (error instanceof ErrorApi) enfocar(error.campos)
      return
    }

    try {
      await ingresarConCorreo(enviados.correo, enviados.contrasena)
    } catch (error) {
      const texto =
        error instanceof ErrorConfiguracion
          ? error.message
          : 'La cuenta quedó creada, pero no pudimos abrir la sesión. Entra desde Ingreso.'
      setMensaje(texto)
      setOfrecerIngreso(true)
      setFase('error')
      return
    }

    setDatos((actual) => ({ ...actual, contrasena: '' }))
    setMensaje('Cuenta creada. Entrando al panel.')
    setFase('exito')
  }

  const ocupado = fase === 'cargando' || fase === 'exito'

  return (
    <>
      <h1 className="text-3xl font-semibold">Registro</h1>
      <p className="mt-3 max-w-prose">Crea tu cuenta con correo y contraseña.</p>
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
            id="nombres"
            etiqueta="Nombres"
            autoComplete="given-name"
            valor={datos.nombres}
            error={errores.nombres}
            deshabilitado={ocupado}
            onChange={(valor) => cambiar('nombres', valor)}
          />
          <Campo
            id="apellidos"
            etiqueta="Apellidos"
            autoComplete="family-name"
            valor={datos.apellidos}
            error={errores.apellidos}
            deshabilitado={ocupado}
            onChange={(valor) => cambiar('apellidos', valor)}
          />
          <Campo
            id="nombreUsuario"
            etiqueta="Nombre de usuario"
            autoComplete="username"
            ayuda="De 3 a 20 caracteres. Empieza con una letra y sigue con letras, números o guion bajo."
            valor={datos.nombreUsuario}
            error={errores.nombreUsuario}
            deshabilitado={ocupado}
            onChange={(valor) => cambiar('nombreUsuario', valor)}
          />
          <ElegirAvatar
            valor={datos.avatar}
            error={errores.avatar}
            deshabilitado={ocupado}
            onChange={(valor) => cambiar('avatar', valor)}
          />
          <Campo
            id="correo"
            etiqueta="Correo"
            type="email"
            autoComplete="email"
            valor={datos.correo}
            error={errores.correo}
            deshabilitado={ocupado}
            onChange={(valor) => cambiar('correo', valor)}
          />
          <Campo
            id="contrasena"
            etiqueta="Contraseña"
            type="password"
            autoComplete="new-password"
            ayuda="La contraseña debe tener al menos 8 caracteres."
            valor={datos.contrasena}
            error={errores.contrasena}
            deshabilitado={ocupado}
            onChange={(valor) => cambiar('contrasena', valor)}
          />
          {ofrecerIngreso && (
            <p className="mt-4">
              <Link to="/ingreso" className="text-pino underline">
                Ir a ingreso
              </Link>
            </p>
          )}
          <button
            type="submit"
            disabled={ocupado}
            className="mt-6 rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover disabled:opacity-70"
          >
            {fase === 'cargando' ? 'Creando tu cuenta.' : 'Crear cuenta'}
          </button>
          <p className="mt-4 text-piedra">
            Si ya tienes cuenta, entra en{' '}
            <Link to="/ingreso" className="text-pino underline">
              Ingreso
            </Link>
            .
          </p>
        </form>
      )}
    </>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { ErrorApi, guardarPerfil } from '../api/usuarios.ts'
import { AVATARES } from '../componentes/avatares.ts'
import { Campo } from '../componentes/Campo.tsx'
import { ElegirAvatar } from '../componentes/ElegirAvatar.tsx'
import { btnPrimario, tituloPagina } from '../estilos.ts'
import { tokenActual } from '../firebase/ingresar.ts'
import { primerCampo, validarCambioPerfil } from '../sesion/validar-registro.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

type Fase = 'vacio' | 'cargando' | 'error' | 'exito'

export function Perfil() {
  useTitulo('Perfil')
  const { estado, reintentar } = useSesion()
  const perfil = estado.tipo === 'lista' ? estado.perfil : null
  const [nombres, setNombres] = useState(perfil?.nombres ?? '')
  const [apellidos, setApellidos] = useState(perfil?.apellidos ?? '')
  const [avatar, setAvatar] = useState(perfil?.avatar ?? '')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')
  const [foco, setFoco] = useState<{ id: string; marca: number } | null>(null)
  const figura = AVATARES.find((item) => item.id === avatar) ?? AVATARES[0]

  useEffect(() => {
    if (!foco) return
    document.getElementById(foco.id)?.focus()
  }, [foco])

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!perfil || fase === 'cargando') return
    const encontrados = validarCambioPerfil({ nombres, apellidos, avatar })
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      setMensaje('Revisa los campos marcados.')
      setFase('error')
      const clave = primerCampo(encontrados)
      if (clave) setFoco({ id: clave === 'avatar' ? 'avatar-pino' : clave, marca: Date.now() })
      return
    }

    setErrores({})
    setMensaje('')
    setFase('cargando')
    try {
      const token = await tokenActual()
      await guardarPerfil(token, {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        avatar: avatar.trim(),
      })
      await reintentar()
    } catch (error) {
      if (error instanceof ErrorApi && Object.keys(error.campos).length > 0) setErrores(error.campos)
      setMensaje(
        error instanceof Error ? error.message : 'No pudimos guardar el perfil. Inténtalo de nuevo.',
      )
      setFase('error')
      return
    }

    setMensaje('Perfil guardado.')
    setFase('exito')
  }

  if (!perfil) {
    return (
      <>
        <h1 className={tituloPagina}>Perfil</h1>
        <p className="mt-3">Revisando tu sesión.</p>
      </>
    )
  }

  const ocupado = fase === 'cargando'

  return (
    <>
      <h1 className={tituloPagina}>Perfil</h1>
      <article className="mt-7 flex items-center gap-4 rounded-lg border border-linea px-6 py-5">
        <span aria-hidden="true" className={`size-12 rounded-full ${figura.clase}`} />
        <div>
          <p className="text-lg font-semibold">
            {nombres || perfil.nombres} {apellidos || perfil.apellidos}
          </p>
          <p className="text-sm text-piedra">{perfil.nombreUsuario}</p>
        </div>
      </article>
      <form className="mt-2 max-w-[520px]" noValidate onSubmit={(evento) => void enviar(evento)}>
        <div aria-live="polite">
          {mensaje && <p className={fase === 'error' ? 'mt-4 text-aviso' : 'mt-4 text-exito'}>{mensaje}</p>}
        </div>
        <Campo
          id="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          valor={nombres}
          error={errores.nombres}
          deshabilitado={ocupado}
          onChange={(valor) => {
            setNombres(valor)
            setErrores((actual) => {
              if (!actual.nombres) return actual
              const siguiente = { ...actual }
              delete siguiente.nombres
              return siguiente
            })
          }}
        />
        <Campo
          id="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          valor={apellidos}
          error={errores.apellidos}
          deshabilitado={ocupado}
          onChange={(valor) => {
            setApellidos(valor)
            setErrores((actual) => {
              if (!actual.apellidos) return actual
              const siguiente = { ...actual }
              delete siguiente.apellidos
              return siguiente
            })
          }}
        />
        <ElegirAvatar
          valor={avatar}
          error={errores.avatar}
          deshabilitado={ocupado}
          onChange={(valor) => {
            setAvatar(valor)
            setErrores((actual) => {
              if (!actual.avatar) return actual
              const siguiente = { ...actual }
              delete siguiente.avatar
              return siguiente
            })
          }}
        />
        <dl className="mt-6 flex gap-3 text-[15px]">
          <dt className="font-semibold">Correo</dt>
          <dd className="text-piedra">{perfil.correo}</dd>
        </dl>
        <button type="submit" disabled={ocupado} className={`${btnPrimario} mt-6`}>
          {ocupado ? 'Guardando.' : 'Guardar'}
        </button>
      </form>
    </>
  )
}

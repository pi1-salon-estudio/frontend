import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ErrorApi, guardarPerfil } from '../api/usuarios.ts'
import { AVATARES } from '../componentes/avatares.ts'
import { Campo } from '../componentes/Campo.tsx'
import { ElegirAvatar } from '../componentes/ElegirAvatar.tsx'
import { btnPrimario, btnSecundario, tituloPagina } from '../estilos.ts'
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
  const [nombreUsuario, setNombreUsuario] = useState(perfil?.nombreUsuario ?? '')
  const [avatar, setAvatar] = useState(perfil?.avatar ?? '')
  const [correo, setCorreo] = useState(perfil?.correo ?? '')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [fase, setFase] = useState<Fase>('vacio')
  const [mensaje, setMensaje] = useState('')
  const [foco, setFoco] = useState<{ id: string; marca: number } | null>(null)
  const aviso = useRef<number | null>(null)
  const figura = AVATARES.find((item) => item.id === avatar) ?? AVATARES[0]
  const correoEditable = perfil?.proveedor !== 'google'

  useEffect(() => {
    if (!foco) return
    document.getElementById(foco.id)?.focus()
  }, [foco])

  function limpiarAviso() {
    if (aviso.current) window.clearTimeout(aviso.current)
    aviso.current = null
  }

  function anunciar(texto: string) {
    limpiarAviso()
    setMensaje('')
    aviso.current = window.setTimeout(() => setMensaje(texto), 40)
  }

  function quitarError(clave: string) {
    setErrores((actual) => {
      if (!actual[clave]) return actual
      const siguiente = { ...actual }
      delete siguiente[clave]
      return siguiente
    })
    if (fase === 'exito') {
      limpiarAviso()
      setFase('vacio')
      setMensaje('')
    }
  }

  function enfocar(campos: Record<string, string>) {
    const clave = primerCampo(campos)
    if (!clave) return
    setFoco({ id: clave === 'avatar' ? 'avatar-pino' : clave, marca: Date.now() })
  }

  function cancelar() {
    if (!perfil || fase === 'cargando') return
    setNombres(perfil.nombres)
    setApellidos(perfil.apellidos)
    setNombreUsuario(perfil.nombreUsuario)
    setAvatar(perfil.avatar)
    setCorreo(perfil.correo)
    limpiarAviso()
    setErrores({})
    setMensaje('')
    setFase('vacio')
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!perfil || fase === 'cargando') return
    const correoEditableAhora = perfil.proveedor !== 'google'
    const encontrados = validarCambioPerfil({
      nombres,
      apellidos,
      avatar,
      nombreUsuario,
      correo,
      correoEditable: correoEditableAhora,
    })
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      setMensaje('Revisa los campos marcados.')
      setFase('error')
      enfocar(encontrados)
      return
    }

    const correoEnviado = correoEditableAhora ? correo.trim().toLowerCase() : perfil.correo
    const correoCambio = correoEditableAhora && correoEnviado !== perfil.correo.trim().toLowerCase()
    setErrores({})
    setMensaje('')
    setFase('cargando')
    try {
      const token = await tokenActual()
      const guardado = await guardarPerfil(token, {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        nombreUsuario: nombreUsuario.trim(),
        avatar: avatar.trim(),
        correo: correoEnviado,
      })
      if (correoCambio) await tokenActual(true)
      await reintentar()
      setNombres(guardado.nombres)
      setApellidos(guardado.apellidos)
      setNombreUsuario(guardado.nombreUsuario)
      setAvatar(guardado.avatar)
      setCorreo(guardado.correo)
    } catch (error) {
      const campos = error instanceof ErrorApi ? { ...error.campos } : {}
      if (error instanceof ErrorApi && error.codigo === 'CORREO_NO_EDITABLE' && !campos.correo) {
        campos.correo = error.message
      }
      if (Object.keys(campos).length > 0) setErrores(campos)
      setMensaje(error instanceof Error ? error.message : 'No pudimos guardar el perfil. Inténtalo de nuevo.')
      setFase('error')
      enfocar(campos)
      return
    }

    setFase('exito')
    anunciar('Perfil guardado.')
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
          <p className="text-sm text-piedra">{nombreUsuario || perfil.nombreUsuario}</p>
        </div>
      </article>
      <form className="mt-2 max-w-[520px]" noValidate aria-busy={ocupado} onSubmit={(evento) => void enviar(evento)}>
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
            quitarError('nombres')
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
            quitarError('apellidos')
          }}
        />
        <Campo
          id="nombreUsuario"
          etiqueta="Nombre de usuario"
          autoComplete="username"
          ayuda="De 3 a 20 caracteres. Empieza con una letra."
          valor={nombreUsuario}
          error={errores.nombreUsuario}
          deshabilitado={ocupado}
          onChange={(valor) => {
            setNombreUsuario(valor)
            quitarError('nombreUsuario')
          }}
        />
        <ElegirAvatar
          valor={avatar}
          error={errores.avatar}
          deshabilitado={ocupado}
          onChange={(valor) => {
            setAvatar(valor)
            quitarError('avatar')
          }}
        />
        <Campo
          id="correo"
          etiqueta="Correo"
          type="email"
          autoComplete="email"
          ayuda={correoEditable ? undefined : 'Tu correo lo administra Google.'}
          valor={correoEditable ? correo : perfil.correo}
          error={errores.correo}
          deshabilitado={ocupado}
          soloLectura={!correoEditable}
          onChange={(valor) => {
            setCorreo(valor)
            quitarError('correo')
          }}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={ocupado} className={btnPrimario}>
            {ocupado ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" disabled={ocupado} onClick={cancelar} className={btnSecundario}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  )
}

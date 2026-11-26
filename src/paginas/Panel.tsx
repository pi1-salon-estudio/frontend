import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { crearSala, listarSalas, obtenerSala, type Sala } from '../api/salas.ts'
import { ErrorApi, cerrarSesion } from '../api/usuarios.ts'
import { Aviso } from '../componentes/Aviso.tsx'
import { Campo } from '../componentes/Campo.tsx'
import { CopiarId } from '../componentes/CopiarId.tsx'
import { btnPrimario, btnSecundario, tarjeta, textoSecundario, tituloPagina } from '../estilos.ts'
import { cerrarAuth, tokenActual } from '../firebase/ingresar.ts'
import { desmarcarCierreVoluntario, marcarCierreVoluntario } from '../sesion/cierre-voluntario.ts'
import { validarIdSala, validarNombreSala } from '../sesion/validar-sala.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

export function Panel() {
  useTitulo('Panel')
  const { estado, reintentar } = useSesion()
  const location = useLocation()
  const navigate = useNavigate()
  const [cerrando, setCerrando] = useState(false)
  const [salas, setSalas] = useState<Sala[] | null>(null)
  const [mensajeSalas, setMensajeSalas] = useState('')
  const [cargadoPara, setCargadoPara] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [errorNombre, setErrorNombre] = useState('')
  const [creando, setCreando] = useState(false)
  const [carga, setCarga] = useState(0)
  const [idSala, setIdSala] = useState('')
  const [errorId, setErrorId] = useState('')
  const [buscando, setBuscando] = useState(false)
  // Cada error de «Unirse» sube este número para mover el foco al campo, aunque el
  // mensaje se repita. Así NVDA lee de nuevo la etiqueta y el error.
  const [focoId, setFocoId] = useState(0)
  const cuentaCreada = location.state?.cuentaCreada === true
  // US-07: el anfitrión llega aquí después de eliminar una sala; el invitado, cuando el anfitrión la elimina.
  const salaEliminada = typeof location.state?.salaEliminada === 'string' ? location.state.salaEliminada : ''
  const salaCerrada = typeof location.state?.salaCerrada === 'string' ? location.state.salaCerrada : ''
  const perfil = estado.tipo === 'lista' ? estado.perfil : null
  const uid = perfil?.uid ?? null
  const faseSalas = mensajeSalas ? 'error' : cargadoPara === uid && salas ? 'lista' : 'cargando'

  useEffect(() => {
    if (!uid) return
    let vigente = true
    const pedido = uid
    void (async () => {
      try {
        const token = await tokenActual()
        const lista = await listarSalas(token)
        if (!vigente) return
        setMensajeSalas('')
        setSalas(lista)
        setCargadoPara(pedido)
      } catch (error) {
        if (!vigente) return
        setMensajeSalas(error instanceof Error ? error.message : 'No pudimos cargar tus salas.')
      }
    })()
    return () => {
      vigente = false
    }
  }, [uid, carga])

  // El foco se mueve después de que el campo vuelve a estar habilitado: un campo
  // deshabilitado no puede recibirlo.
  useEffect(() => {
    if (focoId === 0) return
    document.getElementById('idSala')?.focus()
  }, [focoId])

  async function unirse(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (buscando) return
    const limpio = idSala.trim()
    setIdSala(limpio)
    const error = validarIdSala(limpio)
    if (error) {
      setErrorId(error)
      setFocoId((actual) => actual + 1)
      return
    }
    setErrorId('')
    setBuscando(true)
    try {
      const token = await tokenActual()
      const sala = await obtenerSala(token, limpio)
      navigate(`/salas/${sala.id}`)
    } catch (fallo) {
      const noExiste = fallo instanceof ErrorApi && fallo.codigo === 'SALA_NO_ENCONTRADA'
      setErrorId(
        noExiste
          ? 'No encontramos una sala con ese ID. Revisa que esté completo o pídelo de nuevo.'
          : fallo instanceof Error
            ? fallo.message
            : 'No pudimos buscar la sala. Inténtalo de nuevo.',
      )
      setBuscando(false)
      setFocoId((actual) => actual + 1)
    }
  }

  async function salir() {
    if (cerrando) return
    setCerrando(true)
    marcarCierreVoluntario()
    try {
      const token = await tokenActual()
      await cerrarSesion(token)
    } catch {
      // La sesión local se cierra igual. El servidor puede tardar unos segundos en revocar el token.
    }
    try {
      await cerrarAuth()
    } catch {
      desmarcarCierreVoluntario()
      setCerrando(false)
      return
    }
    navigate('/ingreso', { replace: true, state: { sesionCerrada: true } })
  }

  async function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (creando) return
    const error = validarNombreSala(nombre)
    if (error) {
      setErrorNombre(error)
      return
    }
    setCreando(true)
    setErrorNombre('')
    try {
      const token = await tokenActual()
      const sala = await crearSala(token, nombre.trim())
      navigate(`/salas/${sala.id}`)
    } catch (error) {
      const campo = error instanceof ErrorApi ? error.campos.nombre : undefined
      setErrorNombre(campo || (error instanceof Error ? error.message : 'No pudimos crear la sala.'))
      setCreando(false)
    }
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
            {salaEliminada && (
              <Aviso tipo="exito" titulo={`Eliminaste la sala «${salaEliminada}».`}>
                También se borraron sus mensajes.
              </Aviso>
            )}
            {salaCerrada && (
              <Aviso tipo="informacion" titulo={`El anfitrión eliminó la sala «${salaCerrada}».`}>
                Ya no puedes entrar a esa sala.
              </Aviso>
            )}
            <p className={cuentaCreada ? 'mt-3 text-piedra' : textoSecundario}>
              Hola, {perfil.nombres}. Tu nombre de usuario es {perfil.nombreUsuario}.
            </p>
            <section className="mt-8" aria-labelledby="titulo-unirse">
              <h2 id="titulo-unirse" className="text-xl leading-7 font-semibold">
                Unirse a una sala
              </h2>
              <p className="mt-1 text-[15px] leading-[22px] text-piedra">
                Entra a la sala de tu grupo con el ID que te compartieron.
              </p>
              <form className="max-w-[520px]" noValidate onSubmit={(evento) => void unirse(evento)}>
                <Campo
                  id="idSala"
                  etiqueta="ID de la sala"
                  ayuda="Puedes pegarlo. Los espacios al inicio y al final no cuentan."
                  valor={idSala}
                  error={errorId}
                  deshabilitado={buscando}
                  onChange={(valor) => {
                    setIdSala(valor)
                    setErrorId('')
                  }}
                />
                <button type="submit" disabled={buscando} className={`${btnSecundario} mt-4`}>
                  {buscando ? 'Buscando…' : 'Unirme'}
                </button>
              </form>
            </section>
            <section className="mt-10" aria-labelledby="titulo-salas">
              <h2 id="titulo-salas" className="text-xl leading-7 font-semibold">
                Tus salas
              </h2>
              <form className="mt-4 max-w-[520px]" noValidate onSubmit={(evento) => void crear(evento)}>
                <Campo
                  id="nombre"
                  etiqueta="Nombre de la sala"
                  ayuda="De 1 a 60 caracteres."
                  valor={nombre}
                  error={errorNombre}
                  deshabilitado={creando}
                  onChange={(valor) => {
                    setNombre(valor)
                    setErrorNombre('')
                  }}
                />
                <button type="submit" disabled={creando} className={`${btnPrimario} mt-4`}>
                  {creando ? 'Creando…' : 'Crear sala'}
                </button>
              </form>
              <div aria-live="polite" aria-busy={faseSalas === 'cargando'} className="mt-4">
                {faseSalas === 'cargando' && <p>Cargando tus salas.</p>}
                {faseSalas === 'error' && (
                  <>
                    <p id="mensaje-salas" className="text-aviso">
                      {mensajeSalas}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMensajeSalas('')
                        setCargadoPara(null)
                        setCarga((actual) => actual + 1)
                      }}
                      aria-describedby="mensaje-salas"
                      className={`${btnSecundario} mt-4`}
                    >
                      Reintentar
                    </button>
                  </>
                )}
                {faseSalas === 'lista' && salas?.length === 0 && (
                  <div className={`${tarjeta} flex flex-col items-center text-center`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-pino">
                      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
                      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    <p className="mt-3 text-lg leading-[26px] font-semibold">Todavía no tienes salas</p>
                    <p className="mt-2 text-[15px] leading-[22px] text-piedra">
                      Cuando crees una, aparecerá aquí con su nombre y su ID.
                    </p>
                  </div>
                )}
                {faseSalas === 'lista' && salas && salas.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-4">
                    {salas.map((sala) => (
                      <li key={sala.id} className={tarjeta}>
                        <Link to={`/salas/${sala.id}`} className="text-lg font-semibold text-tinta underline">
                          {sala.nombre}
                        </Link>
                        <CopiarId valor={sala.id} />
                      </li>
                    ))}
                  </ul>
                )}
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

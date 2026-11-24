import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorApi } from '../api/usuarios.ts'
import { obtenerSala, type Sala } from '../api/salas.ts'
import { Aviso } from '../componentes/Aviso.tsx'
import { CopiarId } from '../componentes/CopiarId.tsx'
import { EditarSala } from '../componentes/sala/EditarSala.tsx'
import { EliminarSala } from '../componentes/sala/EliminarSala.tsx'
import { EscribirMensaje } from '../componentes/sala/EscribirMensaje.tsx'
import { ListaMensajes } from '../componentes/sala/ListaMensajes.tsx'
import { Participantes } from '../componentes/sala/Participantes.tsx'
import { btnPeligro, btnPrimario, btnSecundario, tituloPagina } from '../estilos.ts'
import { tokenActual } from '../firebase/ingresar.ts'
import { useHistorial } from '../sala/use-historial.ts'
import { useSalaEnVivo, type EstadoConexion } from '../sala/use-sala-en-vivo.ts'
import { useSesion } from '../sesion/use-sesion.ts'
import { useTitulo } from '../use-titulo.ts'

export function Sala() {
  const { id = '' } = useParams()
  const { estado } = useSesion()
  const uid = estado.tipo === 'lista' ? (estado.perfil?.uid ?? '') : ''
  const [sala, setSala] = useState<Sala | null>(null)
  const [mensaje, setMensaje] = useState('')
  const fase = mensaje ? 'error' : sala?.id === id ? 'lista' : 'cargando'
  useTitulo(fase === 'lista' && sala ? sala.nombre : 'Sala')

  useEffect(() => {
    let vigente = true
    void (async () => {
      try {
        const token = await tokenActual()
        const encontrada = await obtenerSala(token, id)
        if (!vigente) return
        setMensaje('')
        setSala(encontrada)
      } catch (error) {
        if (!vigente) return
        setSala(null)
        setMensaje(error instanceof ErrorApi ? error.message : 'No pudimos abrir la sala. Inténtalo de nuevo.')
      }
    })()
    return () => {
      vigente = false
    }
  }, [id])

  if (fase === 'lista' && sala && uid) return <SalaAbierta key={sala.id} sala={sala} uid={uid} onCambio={setSala} />

  // Solo estos estados van en región viva. El chat no: ver decisión 8.
  return (
    <div aria-live="polite" aria-busy={fase === 'cargando'}>
      <h1 className={tituloPagina}>Sala</h1>
      {fase === 'error' ? (
        <>
          <p className="mt-3 text-aviso">{mensaje}</p>
          <p className="mt-4">
            <Link to="/panel" className={`${btnPrimario} mt-4`}>
              Volver al panel
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-3">Abriendo la sala.</p>
      )}
    </div>
  )
}

type SalaAbiertaProps = {
  sala: Sala
  uid: string
  onCambio: (sala: Sala) => void
}

function SalaAbierta({ sala, uid, onCambio }: SalaAbiertaProps) {
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState<'editar' | 'eliminar' | null>(null)
  const [estadoNombre, setEstadoNombre] = useState('')

  // US-07 «Eliminación con participantes conectados»: el invitado vuelve al panel con un aviso.
  // El anfitrión no: él ya va al panel desde el diálogo de eliminar.
  const onEliminada = useCallback(() => {
    if (sala.esAnfitrion) return
    navigate('/panel', { replace: true, state: { salaCerrada: sala.nombre } })
  }, [sala, navigate])

  const vivo = useSalaEnVivo({ salaId: sala.id, uid, onEliminada })
  const historial = useHistorial({
    salaId: sala.id,
    agregar: vivo.agregar,
    reconexiones: vivo.reconexiones,
    masAntiguo: vivo.mensajes[0]?.id ?? null,
  })

  if (vivo.conexion === 'no-existe') {
    return (
      <div aria-live="polite">
        <h1 className={tituloPagina}>Sala</h1>
        <p className="mt-3 text-aviso">Esta sala ya no existe. Puede que la hayan eliminado.</p>
        <p className="mt-4">
          <Link to="/panel" className={btnPrimario}>
            Volver al panel
          </Link>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={tituloPagina}>{sala.nombre}</h1>
        {/* Decisión 4: siempre a la vista. Al salir, el socket avisa al servidor y deja la lista de participantes. */}
        <button type="button" onClick={() => navigate('/panel')} className={btnSecundario}>
          Salir de la sala
        </button>
      </div>
      <p className="mt-3 text-base text-piedra">
        {sala.esAnfitrion ? 'Eres el anfitrión de esta sala.' : 'Entraste a esta sala.'}
      </p>
      <div aria-live="polite">
        {estadoNombre && <p className="mt-1 text-[15px] font-semibold text-exito">{estadoNombre}</p>}
      </div>
      <CopiarId valor={sala.id} enLinea />
      {sala.esAnfitrion && (
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="button" onClick={() => setDialogo('editar')} className={btnSecundario}>
            Editar nombre
          </button>
          <button type="button" onClick={() => setDialogo('eliminar')} className={btnPeligro}>
            Eliminar sala
          </button>
        </div>
      )}
      <div aria-live="polite">
        <AvisoConexion conexion={vivo.conexion} reintentar={vivo.reintentar} />
      </div>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <section
          aria-labelledby="titulo-chat"
          className="order-2 min-w-0 flex-1 overflow-hidden rounded-lg border border-linea bg-papel md:order-1"
        >
          <h2 id="titulo-chat" className="border-b border-linea px-6 py-4 text-lg leading-[26px] font-semibold">
            Chat
          </h2>
          <ListaMensajes
            mensajes={vivo.mensajes}
            uid={uid}
            estado={historial.fase}
            onReintentar={historial.reintentar}
            hayMas={historial.hayMas}
            cargandoAnteriores={historial.cargandoAnteriores}
            errorAnteriores={historial.errorAnteriores}
            onCargarAnteriores={() => void historial.cargarAnteriores()}
          />
          <EscribirMensaje deshabilitado={vivo.conexion !== 'conectada'} enviar={vivo.enviar} />
        </section>
        <div className="order-1 md:order-2">
          <Participantes participantes={vivo.participantes} uid={uid} />
        </div>
      </div>
      {/* Decisión 8: anuncios de mensajes de otros y de entradas y salidas, sin mover el foco. */}
      <p aria-live="polite" className="sr-only">
        {vivo.anuncio}
      </p>
      {sala.esAnfitrion && (
        <>
          <EditarSala
            key={`editar-${sala.nombre}`}
            sala={sala}
            abierto={dialogo === 'editar'}
            onCerrar={() => setDialogo(null)}
            onGuardada={(nueva) => {
              onCambio(nueva)
              setEstadoNombre('Nombre guardado.')
              setDialogo(null)
            }}
          />
          <EliminarSala
            sala={sala}
            abierto={dialogo === 'eliminar'}
            onCerrar={() => setDialogo(null)}
            eliminarEnVivo={vivo.eliminarEnVivo}
          />
        </>
      )}
    </>
  )
}

function AvisoConexion({ conexion, reintentar }: { conexion: EstadoConexion; reintentar: () => void }) {
  if (conexion === 'conectada' || conexion === 'no-existe') return null
  if (conexion === 'conectando') return <Aviso tipo="informacion" titulo="Conectando con la sala…" />
  if (conexion === 'reconectando') {
    return (
      <Aviso tipo="informacion" titulo="Se perdió la conexión. Reconectando…">
        Puedes seguir leyendo. Los mensajes nuevos llegan cuando vuelva la conexión.
      </Aviso>
    )
  }
  const rechazada = conexion === 'rechazada'
  return (
    <>
      <Aviso tipo="error" titulo={rechazada ? 'No pudimos validar tu sesión en la sala.' : 'Sin conexión con la sala.'}>
        {rechazada
          ? 'Vuelve a intentarlo. Si sigue igual, cierra sesión e ingresa de nuevo.'
          : 'Revisa tu internet y vuelve a intentarlo.'}
      </Aviso>
      <button type="button" onClick={reintentar} className={`${btnSecundario} mt-3`}>
        Reintentar
      </button>
    </>
  )
}

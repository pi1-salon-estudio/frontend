import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorApi } from '../api/usuarios.ts'
import { obtenerSala, type Sala } from '../api/salas.ts'
import { CopiarId } from '../componentes/CopiarId.tsx'
import { EditarSala } from '../componentes/sala/EditarSala.tsx'
import { EliminarSala } from '../componentes/sala/EliminarSala.tsx'
import { btnPeligro, btnPrimario, btnSecundario, tituloPagina } from '../estilos.ts'
import { tokenActual } from '../firebase/ingresar.ts'
import { useTitulo } from '../use-titulo.ts'

export function Sala() {
  const { id = '' } = useParams()
  const [sala, setSala] = useState<Sala | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [dialogo, setDialogo] = useState<'editar' | 'eliminar' | null>(null)
  const [guardado, setGuardado] = useState('')
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

  return (
    <>
      <div aria-live="polite" aria-busy={fase === 'cargando'}>
        {fase === 'cargando' && (
          <>
            <h1 className={tituloPagina}>Sala</h1>
            <p className="mt-3">Abriendo la sala.</p>
          </>
        )}
        {fase === 'error' && (
          <>
            <h1 className={tituloPagina}>Sala</h1>
            <p className="mt-3 text-aviso">{mensaje}</p>
            <p className="mt-4">
              <Link to="/panel" className={`${btnPrimario} mt-4`}>
                Volver al panel
              </Link>
            </p>
          </>
        )}
        {sala && (
          <>
            <h1 className={tituloPagina}>{sala.nombre}</h1>
            <p className="mt-3 text-base text-piedra">
              {sala.esAnfitrion ? 'Eres el anfitrión de esta sala.' : 'Entraste a esta sala.'}
            </p>
            {guardado && <p className="mt-1 text-[15px] font-semibold text-exito">{guardado}</p>}
            <CopiarId valor={sala.id} />
            <p className="mt-4 text-[15px] text-piedra">Comparte el ID con tu grupo.</p>
            {sala.esAnfitrion && (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => setDialogo('editar')} className={btnSecundario}>
                  Editar nombre
                </button>
                <button type="button" onClick={() => setDialogo('eliminar')} className={btnPeligro}>
                  Eliminar sala
                </button>
              </div>
            )}
            <p className="mt-6">
              <Link to="/panel" className="font-semibold text-pino underline">
                Volver al panel
              </Link>
            </p>
          </>
        )}
      </div>
      {sala?.esAnfitrion && (
        <>
          <EditarSala
            key={`editar-${sala.nombre}`}
            sala={sala}
            abierto={dialogo === 'editar'}
            onCerrar={() => setDialogo(null)}
            onGuardada={(nueva) => {
              setSala(nueva)
              setGuardado('Nombre guardado.')
              setDialogo(null)
            }}
          />
          <EliminarSala sala={sala} abierto={dialogo === 'eliminar'} onCerrar={() => setDialogo(null)} />
        </>
      )}
    </>
  )
}

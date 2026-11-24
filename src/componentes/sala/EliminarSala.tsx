import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eliminarSala, type Sala } from '../../api/salas.ts'
import { btnPeligroLleno, btnSecundario } from '../../estilos.ts'
import { tokenActual } from '../../firebase/ingresar.ts'
import { Dialogo } from '../Dialogo.tsx'

type EliminarSalaProps = {
  sala: Sala
  abierto: boolean
  onCerrar: () => void
}

// Mismo patrón que «Eliminar cuenta» en Perfil: lo que funciona igual se ve igual.
export function EliminarSala({ sala, abierto, onCerrar }: EliminarSalaProps) {
  const navigate = useNavigate()
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  function cerrar() {
    if (eliminando) return
    setError('')
    onCerrar()
  }

  async function eliminar() {
    if (eliminando) return
    setEliminando(true)
    setError('')
    try {
      const token = await tokenActual()
      await eliminarSala(token, sala.id)
    } catch (fallo) {
      setEliminando(false)
      setError(fallo instanceof Error ? fallo.message : 'No pudimos eliminar la sala. Inténtalo de nuevo.')
      return
    }
    navigate('/panel', { replace: true, state: { salaEliminada: sala.nombre } })
  }

  return (
    <Dialogo abierto={abierto} tituloId="titulo-eliminar-sala" descritoId="texto-eliminar-sala" onCerrar={cerrar}>
      <h2 id="titulo-eliminar-sala" className="text-xl leading-7 font-semibold">
        ¿Eliminar la sala «{sala.nombre}»?
      </h2>
      <p id="texto-eliminar-sala" className="mt-3 text-[15px] leading-6 text-piedra">
        Se borrarán la sala y todos sus mensajes. Las personas conectadas volverán a su panel. Esta acción no se puede
        deshacer.
      </p>
      <div aria-live="polite">{error && <p className="mt-3 text-sm text-aviso">{error}</p>}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={eliminando} onClick={cerrar} className={btnSecundario}>
          Cancelar
        </button>
        <button type="button" disabled={eliminando} onClick={() => void eliminar()} className={btnPeligroLleno}>
          {eliminando ? 'Eliminando…' : error ? 'Reintentar' : 'Eliminar sala'}
        </button>
      </div>
    </Dialogo>
  )
}

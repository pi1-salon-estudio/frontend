import { useState, type FormEvent } from 'react'
import { editarSala, type Sala } from '../../api/salas.ts'
import { ErrorApi } from '../../api/usuarios.ts'
import { btnPrimario, btnSecundario } from '../../estilos.ts'
import { tokenActual } from '../../firebase/ingresar.ts'
import { validarNombreSala } from '../../sesion/validar-sala.ts'
import { Campo } from '../Campo.tsx'
import { Dialogo } from '../Dialogo.tsx'

type EditarSalaProps = {
  sala: Sala
  abierto: boolean
  onCerrar: () => void
  onGuardada: (sala: Sala) => void
}

// US-07: diálogo dentro de la sala, solo para el anfitrión. No hay ruta /editar:
// la protección real es el 403 de la API.
export function EditarSala({ sala, abierto, onCerrar, onGuardada }: EditarSalaProps) {
  const [nombre, setNombre] = useState(sala.nombre)
  const [errorNombre, setErrorNombre] = useState('')
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cerrar() {
    if (guardando) return
    setNombre(sala.nombre)
    setErrorNombre('')
    setErrorGeneral('')
    onCerrar()
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando) return
    const error = validarNombreSala(nombre)
    if (error) {
      setErrorNombre(error)
      document.getElementById('nombreSalaEditar')?.focus()
      return
    }
    setErrorNombre('')
    setErrorGeneral('')
    setGuardando(true)
    try {
      const token = await tokenActual()
      const guardada = await editarSala(token, sala.id, nombre.trim())
      setGuardando(false)
      onGuardada(guardada)
    } catch (fallo) {
      setGuardando(false)
      const campo = fallo instanceof ErrorApi ? fallo.campos.nombre : undefined
      if (campo) {
        setErrorNombre(campo)
        window.setTimeout(() => document.getElementById('nombreSalaEditar')?.focus(), 0)
        return
      }
      setErrorGeneral(fallo instanceof Error ? fallo.message : 'No pudimos guardar el nombre. Inténtalo de nuevo.')
    }
  }

  return (
    <Dialogo abierto={abierto} tituloId="titulo-editar-sala" onCerrar={cerrar}>
      <h2 id="titulo-editar-sala" className="text-xl leading-7 font-semibold">
        Editar nombre de la sala
      </h2>
      <form noValidate onSubmit={(evento) => void guardar(evento)}>
        <Campo
          id="nombreSalaEditar"
          etiqueta="Nombre de la sala"
          ayuda="De 1 a 60 caracteres."
          valor={nombre}
          error={errorNombre}
          deshabilitado={guardando}
          onChange={(valor) => {
            setNombre(valor)
            setErrorNombre('')
          }}
        />
        <div aria-live="polite">{errorGeneral && <p className="mt-3 text-sm text-aviso">{errorGeneral}</p>}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" disabled={guardando} onClick={cerrar} className={btnSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className={btnPrimario}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}

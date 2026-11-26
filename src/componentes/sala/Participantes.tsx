import { useState } from 'react'
import { btnSecundario } from '../../estilos.ts'
import type { Participante } from '../../tiempo-real/contrato.ts'
import { AVATARES } from '../avatares.ts'

type ParticipantesProps = {
  participantes: Participante[]
  uid: string
}

function claseAvatar(id: string): string {
  return AVATARES.find((a) => a.id === id)?.clase ?? AVATARES[0].clase
}

// Decisión 5: en computador es una columna; en celular, un botón que despliega la lista.
export function Participantes({ participantes, uid }: ParticipantesProps) {
  const [abierto, setAbierto] = useState(false)
  const total = participantes.length

  return (
    <section aria-labelledby="titulo-participantes" className="md:w-60 md:shrink-0">
      <h2 id="titulo-participantes" className="sr-only text-lg leading-[26px] font-semibold md:not-sr-only">
        Participantes ({total})
      </h2>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="lista-participantes"
        onClick={() => setAbierto((actual) => !actual)}
        className={`${btnSecundario} w-full md:hidden`}
      >
        {abierto ? 'Ocultar' : 'Mostrar'} participantes ({total})
      </button>
      <ul
        id="lista-participantes"
        className={`${abierto ? 'flex' : 'hidden'} mt-2 flex-col gap-2 rounded-lg border border-linea px-4 py-3 md:mt-2 md:flex md:border-0 md:p-0`}
      >
        {participantes.map((p) => {
          const notas = [p.uid === uid ? 'Tú' : '', p.esAnfitrion ? 'Anfitrión' : ''].filter(Boolean).join(' · ')
          return (
            <li key={p.uid} className="flex items-center gap-2.5 py-1">
              <span aria-hidden="true" className={`size-7 shrink-0 rounded-full ${claseAvatar(p.avatar)}`} />
              <span className="min-w-0">
                <span className="block text-[15px] leading-5">{p.nombreUsuario}</span>
                {notas && <span className="block text-[13px] leading-[18px] text-piedra">{notas}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

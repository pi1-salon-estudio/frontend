import { useEffect, useState, type FormEvent } from 'react'
import type { ResultadoEnvio } from '../../sala/use-sala-en-vivo.ts'
import { btnPrimario } from '../../estilos.ts'
import { LARGO_MAXIMO_MENSAJE } from '../../tiempo-real/contrato.ts'
import { Campo } from '../Campo.tsx'

type EscribirMensajeProps = {
  deshabilitado: boolean
  enviar: (texto: string) => Promise<ResultadoEnvio>
}

const AVISO_LARGO = LARGO_MAXIMO_MENSAJE - 50

// Decisión 7: campo de una línea dentro de un formulario, así Enter envía de forma nativa.
export function EscribirMensaje({ deshabilitado, enviar }: EscribirMensajeProps) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [foco, setFoco] = useState(0)

  useEffect(() => {
    if (foco === 0) return
    document.getElementById('mensaje')?.focus()
  }, [foco])

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const limpio = texto.trim()
    // US-10 «Mensaje vacío»: no se envía nada.
    if (!limpio || enviando || deshabilitado) return
    setEnviando(true)
    setError('')
    const resultado = await enviar(limpio)
    setEnviando(false)
    if (resultado.ok) setTexto('')
    else setError(resultado.mensaje)
    setFoco((n) => n + 1)
  }

  return (
    <form noValidate onSubmit={(evento) => void alEnviar(evento)} className="border-t border-linea px-4 pb-4 md:px-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Campo
            id="mensaje"
            etiqueta="Escribe un mensaje"
            valor={texto}
            error={error}
            deshabilitado={deshabilitado}
            autoComplete="off"
            maxLength={LARGO_MAXIMO_MENSAJE}
            onChange={(valor) => {
              setTexto(valor)
              setError('')
            }}
          />
        </div>
        <button type="submit" disabled={deshabilitado || enviando} className={`${btnPrimario} mt-[46px]`}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
      {texto.length >= AVISO_LARGO && (
        <p className="mt-1.5 text-xs leading-4 text-piedra">
          {texto.length} de {LARGO_MAXIMO_MENSAJE} caracteres.
        </p>
      )}
    </form>
  )
}

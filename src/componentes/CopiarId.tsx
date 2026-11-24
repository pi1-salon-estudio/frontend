import { useState } from 'react'
import { btnSecundario } from '../estilos.ts'

type CopiarIdProps = {
  valor: string
  enLinea?: boolean
}

export function CopiarId({ valor, enLinea = false }: CopiarIdProps) {
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState(false)

  function anunciar(texto: string, fallo: boolean) {
    setAviso('')
    window.setTimeout(() => {
      setError(fallo)
      setAviso(texto)
    }, 40)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor)
      anunciar('ID copiado.', false)
    } catch {
      anunciar('No pudimos copiar el ID. Selecciónalo y cópialo.', true)
    }
  }

  return (
    <div className="mt-3">
      <div className={enLinea ? 'flex flex-wrap items-center gap-3' : ''}>
        <p className="break-all text-[15px]">
          <span className="font-semibold">ID </span>
          {valor}
        </p>
        <button type="button" onClick={() => void copiar()} className={`${btnSecundario} ${enLinea ? '' : 'mt-3'}`}>
          Copiar ID
        </button>
      </div>
      <p aria-live="polite" className={error ? 'mt-2 text-sm text-aviso' : 'mt-2 text-sm text-exito'}>
        {aviso}
      </p>
    </div>
  )
}

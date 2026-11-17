import { useState } from 'react'
import { btnSecundario } from '../estilos.ts'

type CopiarIdProps = {
  valor: string
}

export function CopiarId({ valor }: CopiarIdProps) {
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
      <p className="break-all text-[15px]">
        <span className="font-semibold">ID </span>
        {valor}
      </p>
      <button type="button" onClick={() => void copiar()} className={`${btnSecundario} mt-3`}>
        Copiar ID
      </button>
      <p aria-live="polite" className={error ? 'mt-2 text-sm text-aviso' : 'mt-2 text-sm text-exito'}>
        {aviso}
      </p>
    </div>
  )
}

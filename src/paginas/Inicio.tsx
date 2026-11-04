import { BaseTecnica } from '../componentes/BaseTecnica.tsx'
import { useTitulo } from '../use-titulo.ts'

export function Inicio() {
  useTitulo('Inicio')

  return (
    <>
      <h1 className="text-3xl font-semibold">Salón de estudio</h1>
      <p className="mt-3 max-w-prose text-lg">
        Un lugar para estudiar en un grupo pequeño, con el trabajo a la vista y sin una ventana
        que tape lo que estás haciendo.
      </p>
      <BaseTecnica />
    </>
  )
}

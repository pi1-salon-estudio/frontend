import { useTitulo } from '../use-titulo.ts'

type PaginaSimpleProps = {
  titulo: string
  parrafos: readonly string[]
}

export function PaginaSimple({ titulo, parrafos }: PaginaSimpleProps) {
  useTitulo(titulo)

  return (
    <>
      <h1 className="text-3xl font-semibold">{titulo}</h1>
      {parrafos.map((parrafo) => (
        <p key={parrafo} className="mt-3 max-w-prose">
          {parrafo}
        </p>
      ))}
    </>
  )
}

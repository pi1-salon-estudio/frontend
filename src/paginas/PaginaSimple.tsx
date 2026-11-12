import { textoSecundario, tituloPagina } from '../estilos.ts'
import { useTitulo } from '../use-titulo.ts'

type PaginaSimpleProps = {
  titulo: string
  parrafos: readonly string[]
}

export function PaginaSimple({ titulo, parrafos }: PaginaSimpleProps) {
  useTitulo(titulo)

  return (
    <>
      <h1 className={tituloPagina}>{titulo}</h1>
      {parrafos.map((parrafo) => (
        <p key={parrafo} className={textoSecundario}>
          {parrafo}
        </p>
      ))}
    </>
  )
}

import { Link } from 'react-router-dom'
import { textoSecundario, tituloPagina } from '../estilos.ts'
import { useTitulo } from '../use-titulo.ts'

export function NoEncontrada() {
  useTitulo('Página no encontrada')

  return (
    <>
      <h1 className={tituloPagina}>No encontramos esta página</h1>
      <p className={textoSecundario}>La dirección no corresponde a ninguna página del salón.</p>
      <Link to="/" className="mt-5 inline-block text-base font-semibold text-pino underline">
        Volver al inicio
      </Link>
    </>
  )
}

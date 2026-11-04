import { Link } from 'react-router-dom'
import { useTitulo } from '../use-titulo.ts'

export function NoEncontrada() {
  useTitulo('Página no encontrada')

  return (
    <>
      <h1 className="text-3xl font-semibold">No encontramos esta página</h1>
      <p className="mt-3 max-w-prose">La dirección no corresponde a ninguna pantalla del salón.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-pino px-4 py-2 font-medium text-white hover:bg-pino-hover"
      >
        Volver al inicio
      </Link>
    </>
  )
}

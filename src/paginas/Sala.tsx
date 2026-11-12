import { tituloPagina } from '../estilos.ts'
import { useTitulo } from '../use-titulo.ts'

export function Sala() {
  useTitulo('Sala')

  return (
    <>
      <h1 className={tituloPagina}>Cálculo II</h1>
      <p className="mt-3 text-base text-piedra">Ana Rojas, Luis Pérez y Marta Díaz</p>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-linea px-4 py-3.5">
        <p className="font-semibold">Cálculo II</p>
        <p className="text-piedra">El trabajo está a la vista</p>
      </div>
      <article className="mt-4 rounded-lg border border-linea px-8 py-7">
        <p className="text-xs font-bold tracking-[0.08em] text-pino">ENUNCIADO</p>
        <h2 className="mt-2 text-2xl font-bold">Taller de derivadas</h2>
        <p className="mt-3 text-base leading-relaxed">
          Halla la derivada de cada función y simplifica el resultado.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[17px] leading-relaxed">
          <li>f(x) = 3x⁴ − 5x² + 2</li>
          <li>g(x) = (2x + 1)(x − 4)</li>
          <li>h(x) = (x² + 1) / (x − 3)</li>
        </ol>
      </article>
    </>
  )
}

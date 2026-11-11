import { Link } from 'react-router-dom'
import { BaseTecnica } from '../componentes/BaseTecnica.tsx'
import { btnPrimario, btnSecundario, tituloPagina } from '../estilos.ts'
import { useTitulo } from '../use-titulo.ts'

const TARJETAS = [
  {
    numero: '01',
    titulo: 'Tu grupo',
    texto: 'Una sala propia para reunirse y avanzar juntos.',
  },
  {
    numero: '02',
    titulo: 'El trabajo a la vista',
    texto: 'Documentos, tareas y acuerdos en el mismo lugar.',
  },
  {
    numero: '03',
    titulo: 'Una sola pantalla',
    texto: 'Tu grupo y su trabajo, sin ventanas que se atraviesen.',
  },
] as const

export function Inicio() {
  useTitulo('Inicio')

  return (
    <>
      <h1 className={tituloPagina}>Salón de estudio</h1>
      <p className="mt-4 max-w-[640px] text-lg leading-snug">
        Un lugar para estudiar en un grupo pequeño, con el trabajo a la vista.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/registro" className={btnPrimario}>
          Crear cuenta
        </Link>
        <Link to="/ingreso" className={btnSecundario}>
          Entrar
        </Link>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        {TARJETAS.map((tarjeta) => (
          <article key={tarjeta.numero} className="flex gap-5 rounded-lg border border-linea px-6 py-5">
            <span className="pt-1 text-sm font-semibold text-pino">{tarjeta.numero}</span>
            <div>
              <h2 className="text-lg font-semibold">{tarjeta.titulo}</h2>
              <p className="mt-1 text-piedra">{tarjeta.texto}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-10 text-sm text-piedra">Proyecto Integrador I · Universidad del Valle</p>
      <BaseTecnica />
    </>
  )
}

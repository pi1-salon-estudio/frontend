import { tituloPagina } from '../estilos.ts'
import { useTitulo } from '../use-titulo.ts'

const BLOQUES = [
  {
    titulo: 'Teclado',
    texto: 'Tab avanza, Mayús+Tab retrocede y Entrar activa el enlace o el botón que tiene el foco.',
  },
  {
    titulo: 'Saltar al contenido',
    texto: 'El enlace está al inicio de cada página.',
  },
  {
    titulo: 'Tu cuenta',
    texto:
      'Puedes crear la cuenta en Registro y entrar en Ingreso, con correo o con Google. Panel, Perfil y Sala piden una sesión. Si entras con Google por primera vez, eliges un nombre de usuario antes de continuar.',
  },
] as const

export function Ayuda() {
  useTitulo('Ayuda')

  return (
    <>
      <h1 className={tituloPagina}>Ayuda</h1>
      <div className="mt-8 flex flex-col gap-4">
        {BLOQUES.map((bloque) => (
          <article key={bloque.titulo} className="rounded-lg border border-linea px-6 py-5">
            <h2 className="text-lg font-semibold">{bloque.titulo}</h2>
            <p className="mt-2 leading-relaxed text-piedra">{bloque.texto}</p>
          </article>
        ))}
      </div>
    </>
  )
}

import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ENLACES_PRIVADOS, ENLACES_PUBLICOS } from '../navegacion.ts'
import { useSesion } from '../sesion/use-sesion.ts'

type MarcoProps = {
  children: ReactNode
}

// Encabezado, contenido y pie de la guía del S0: una sola columna, sin barras fijas.
export function Marco({ children }: MarcoProps) {
  const { pathname } = useLocation()
  const { estado } = useSesion()
  const primera = useRef(true)
  const conSesion = estado.tipo === 'lista' && estado.perfilCompleto
  const enlaces = conSesion ? ENLACES_PRIVADOS : ENLACES_PUBLICOS

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    document.getElementById('contenido')?.focus()
  }, [pathname])

  return (
    <>
      <a
        href="#contenido"
        className="absolute top-2 left-2 -translate-y-[150%] rounded-md bg-pino px-3 py-2 text-white focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-linea">
        <div className="mx-auto flex max-w-[592px] flex-col gap-3 px-4 pt-8 pb-4">
          <p className="text-sm font-semibold text-pino">Salón de estudio</p>
          <nav aria-label="Principal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {enlaces.map((enlace) => (
                <li key={enlace.to}>
                  <NavLink
                    to={enlace.to}
                    end={enlace.end}
                    className={({ isActive }) =>
                      isActive
                        ? 'inline-block py-0.5 text-sm font-semibold text-tinta underline underline-offset-4'
                        : 'inline-block py-0.5 text-sm text-piedra hover:text-tinta hover:underline'
                    }
                  >
                    {enlace.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-[592px] flex-1 px-4 pt-8 pb-12">
        {children}
      </main>
      <footer>
        <p className="mx-auto max-w-[592px] px-4 py-8 text-center text-xs text-piedra">
          Proyecto Integrador I · Universidad del Valle
        </p>
      </footer>
    </>
  )
}

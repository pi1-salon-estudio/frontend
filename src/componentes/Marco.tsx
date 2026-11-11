import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ENLACES } from '../navegacion.ts'

type MarcoProps = {
  children: ReactNode
}

export function Marco({ children }: MarcoProps) {
  const { pathname } = useLocation()
  const primera = useRef(true)

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
      <header className="border-b border-linea bg-papel">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5">
          <p className="text-sm font-semibold tracking-wide text-tinta">Salón de estudio</p>
          <nav aria-label="Principal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {ENLACES.map((enlace) => (
                <li key={enlace.to}>
                  <NavLink
                    to={enlace.to}
                    end={enlace.end}
                    className={({ isActive }) =>
                      isActive ? 'font-semibold text-pino' : 'text-tinta hover:text-pino'
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
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-linea">
        <p className="mx-auto max-w-3xl px-4 py-4 text-sm text-piedra">
          Proyecto Integrador I · Universidad del Valle
        </p>
      </footer>
    </>
  )
}

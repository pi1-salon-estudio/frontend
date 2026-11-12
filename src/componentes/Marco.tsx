import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ENLACES } from '../navegacion.ts'
import { useSesion } from '../sesion/use-sesion.ts'

type MarcoProps = {
  children: ReactNode
}

export function Marco({ children }: MarcoProps) {
  const { pathname } = useLocation()
  const { estado } = useSesion()
  const primera = useRef(true)
  const perfil = estado.tipo === 'lista' ? estado.perfil : null

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    document.getElementById('contenido')?.focus()
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-papel md:flex-row">
      <a
        href="#contenido"
        className="absolute top-2 left-2 z-10 -translate-y-[150%] rounded-lg bg-pino px-3 py-2 text-white focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <aside className="flex w-full shrink-0 flex-col border-b border-linea px-6 py-6 md:sticky md:top-0 md:h-dvh md:w-60 md:border-r md:border-b-0 md:px-6 md:pt-9 md:pb-7">
        <p className="text-[22px] leading-tight font-bold tracking-tight">Salón de estudio</p>
        <p className="mt-2 text-[13px] text-piedra">Tu grupo. Tu sala.</p>
        <nav className="mt-7" aria-label="Principal">
          <ul className="flex flex-col gap-1">
            {ENLACES.map((enlace) => (
              <li key={enlace.to}>
                <NavLink
                  to={enlace.to}
                  end={enlace.end}
                  className={({ isActive }) =>
                    isActive
                      ? 'flex h-[38px] items-center justify-between rounded-lg border border-pino bg-activo px-3.5 text-[15px] font-semibold text-pino'
                      : 'flex h-[38px] items-center justify-between rounded-lg border border-transparent px-3.5 text-[15px] text-tinta hover:text-pino'
                  }
                >
                  {({ isActive }) => (
                    <>
                      {enlace.etiqueta}
                      {isActive ? (
                        <span aria-hidden="true" className="text-xs font-semibold">
                          Actual
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {perfil && (
          <div className="mt-8 md:mt-auto">
            <p className="text-sm font-semibold">
              {perfil.nombres} {perfil.apellidos}
            </p>
            <p className="text-[13px] text-piedra">{perfil.nombreUsuario}</p>
          </div>
        )}
      </aside>
      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 px-6 py-8 md:px-16 md:py-11">
        <div className="w-full max-w-[720px]">
          <p className="text-xs font-semibold tracking-[0.08em] text-piedra">UNIVERSIDAD DEL VALLE</p>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  )
}

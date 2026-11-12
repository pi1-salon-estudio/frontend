export type EnlaceNav = {
  to: string
  etiqueta: string
  end?: boolean
}

// Sin sesión solo se ofrecen las páginas que se pueden usar sin cuenta.
export const ENLACES_PUBLICOS: readonly EnlaceNav[] = [
  { to: '/', etiqueta: 'Inicio', end: true },
  { to: '/ingreso', etiqueta: 'Ingreso' },
  { to: '/registro', etiqueta: 'Registro' },
  { to: '/ayuda', etiqueta: 'Ayuda' },
]

// Con sesión desaparecen Ingreso y Registro, que ya no sirven, y aparecen las privadas.
export const ENLACES_PRIVADOS: readonly EnlaceNav[] = [
  { to: '/', etiqueta: 'Inicio', end: true },
  { to: '/panel', etiqueta: 'Panel' },
  { to: '/perfil', etiqueta: 'Perfil' },
  { to: '/sala', etiqueta: 'Sala' },
  { to: '/ayuda', etiqueta: 'Ayuda' },
]

export type EnlaceNav = {
  to: string
  etiqueta: string
  end?: boolean
}

export const ENLACES: readonly EnlaceNav[] = [
  { to: '/', etiqueta: 'Inicio', end: true },
  { to: '/ingreso', etiqueta: 'Ingreso' },
  { to: '/registro', etiqueta: 'Registro' },
  { to: '/panel', etiqueta: 'Panel' },
  { to: '/perfil', etiqueta: 'Perfil' },
  { to: '/sala', etiqueta: 'Sala' },
  { to: '/ayuda', etiqueta: 'Ayuda' },
]

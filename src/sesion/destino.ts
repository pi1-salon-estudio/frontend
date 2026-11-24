// A dónde volver después de iniciar sesión. Solo se aceptan rutas privadas conocidas
// y salas, para que un estado de navegación manipulado no lleve a cualquier parte.
const RUTAS_PRIVADAS = new Set(['/panel', '/perfil'])

export function destinoPedido(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('desde' in state)) return '/panel'
  const desde = state.desde
  if (typeof desde !== 'string') return '/panel'
  if (RUTAS_PRIVADAS.has(desde) || desde.startsWith('/salas/')) return desde
  return '/panel'
}

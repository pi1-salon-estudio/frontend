// El guard de las rutas privadas también manda a Ingreso cuando la sesión cae.
// Sin esta marca, ese salto pisa el aviso y deja el de una ruta privada.

let motivo: 'sesion' | 'cuenta' | 'correo' | null = null
let correoNuevo = ''

export function marcarCierreVoluntario(): void {
  motivo = 'sesion'
}

export function marcarCuentaEliminada(): void {
  motivo = 'cuenta'
}

// Firebase cierra la sesión cuando cambia el correo: hay que volver a entrar con el nuevo.
export function marcarCorreoCambiado(correo: string): void {
  motivo = 'correo'
  correoNuevo = correo
}

export function desmarcarCierreVoluntario(): void {
  motivo = null
  correoNuevo = ''
}

export function estadoDeCierre(desde: string): Record<string, unknown> {
  if (motivo === 'cuenta') return { cuentaEliminada: true }
  if (motivo === 'correo') return { correoCambiado: correoNuevo }
  if (motivo === 'sesion') return { sesionCerrada: true }
  return { desde }
}

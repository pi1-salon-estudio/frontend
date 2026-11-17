// El guard de las rutas privadas también manda a Ingreso cuando la sesión cae.
// Sin esta marca, ese salto pisa el aviso y deja el de una ruta privada.

let motivo: 'sesion' | 'cuenta' | null = null

export function marcarCierreVoluntario(): void {
  motivo = 'sesion'
}

export function marcarCuentaEliminada(): void {
  motivo = 'cuenta'
}

export function desmarcarCierreVoluntario(): void {
  motivo = null
}

export function hayCierreVoluntario(): boolean {
  return motivo !== null
}

export function esCierreDeCuenta(): boolean {
  return motivo === 'cuenta'
}

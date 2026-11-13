// El guard de las rutas privadas también manda a Ingreso cuando la sesión cae.
// Sin esta marca, ese salto pisa «Cerraste sesión» y deja el aviso de una ruta privada.

let cierreVoluntario = false

export function marcarCierreVoluntario(): void {
  cierreVoluntario = true
}

export function desmarcarCierreVoluntario(): void {
  cierreVoluntario = false
}

export function hayCierreVoluntario(): boolean {
  return cierreVoluntario
}

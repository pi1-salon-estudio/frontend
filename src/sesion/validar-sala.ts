export function validarNombreSala(nombre: string): string | null {
  const limpio = nombre.trim()
  if (!limpio || limpio.length > 60) return 'Escribe un nombre de 1 a 60 caracteres.'
  return null
}

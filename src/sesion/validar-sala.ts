export function validarNombreSala(nombre: string): string | null {
  const limpio = nombre.trim()
  if (!limpio || limpio.length > 60) return 'Escribe un nombre de 1 a 60 caracteres.'
  return null
}

// US-08: el ID se recorta antes de validar. El formato no se revisa aquí: si el ID
// no existe, lo dice la API con 404 y el mensaje queda junto al campo.
export function validarIdSala(id: string): string | null {
  if (!id.trim()) return 'Escribe o pega el ID de la sala.'
  return null
}

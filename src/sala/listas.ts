import type { Mensaje, Participante } from '../tiempo-real/contrato.ts'

function ordenar(lista: Mensaje[]): Mensaje[] {
  return [...lista].sort((a, b) => a.creadoEn.localeCompare(b.creadoEn))
}

// Decisión 8: quién entró o salió se deduce comparando la lista nueva con la anterior.
// No se anuncia a la propia persona.
export function cambiosDeParticipantes(antes: Participante[], ahora: Participante[], uid: string): string[] {
  const avisos: string[] = []
  for (const p of ahora) {
    if (p.uid !== uid && !antes.some((a) => a.uid === p.uid)) avisos.push(`${p.nombreUsuario} entró a la sala.`)
  }
  for (const p of antes) {
    if (p.uid !== uid && !ahora.some((a) => a.uid === p.uid)) avisos.push(`${p.nombreUsuario} salió de la sala.`)
  }
  return avisos
}

// Une mensajes sin repetir: el propio llega por el ack y nunca por mensaje:nuevo,
// pero tras una reconexión el historial puede traer uno que ya estaba en pantalla.
export function unirMensajes(actuales: Mensaje[], nuevos: Mensaje[]): Mensaje[] {
  const vistos = new Set(actuales.map((m) => m.id))
  const agregar = nuevos.filter((m) => !vistos.has(m.id))
  return agregar.length === 0 ? actuales : ordenar([...actuales, ...agregar])
}

import { ErrorApi, pedir } from './usuarios.ts'

export type Sala = {
  id: string
  nombre: string
  creadaEn: string
  esAnfitrion: boolean
}

export async function listarSalas(token: string): Promise<Sala[]> {
  const cuerpo = await pedir('/api/v1/salas', { token })
  if (!esLista(cuerpo)) throw new ErrorApi('La respuesta de las salas no tiene la forma esperada.')
  return cuerpo.salas
}

export async function crearSala(token: string, nombre: string): Promise<Sala> {
  const cuerpo = await pedir('/api/v1/salas', { method: 'POST', token, cuerpo: { nombre } })
  const sala = leerSala(cuerpo)
  if (!sala) throw new ErrorApi('La respuesta de la sala no tiene la forma esperada.')
  return sala
}

export async function obtenerSala(token: string, id: string): Promise<Sala> {
  const cuerpo = await pedir(`/api/v1/salas/${encodeURIComponent(id)}`, { token })
  const sala = leerSala(cuerpo)
  if (!sala) throw new ErrorApi('La respuesta de la sala no tiene la forma esperada.')
  return sala
}

function leerSala(cuerpo: unknown): Sala | null {
  if (esSala(cuerpo)) return cuerpo
  if (typeof cuerpo === 'object' && cuerpo !== null && 'sala' in cuerpo && esSala(cuerpo.sala)) return cuerpo.sala
  return null
}

function esSala(cuerpo: unknown): cuerpo is Sala {
  if (typeof cuerpo !== 'object' || cuerpo === null) return false
  return (
    'id' in cuerpo &&
    typeof cuerpo.id === 'string' &&
    'nombre' in cuerpo &&
    typeof cuerpo.nombre === 'string' &&
    'creadaEn' in cuerpo &&
    typeof cuerpo.creadaEn === 'string' &&
    'esAnfitrion' in cuerpo &&
    typeof cuerpo.esAnfitrion === 'boolean'
  )
}

function esLista(cuerpo: unknown): cuerpo is { salas: Sala[] } {
  if (typeof cuerpo !== 'object' || cuerpo === null || !('salas' in cuerpo)) return false
  return Array.isArray(cuerpo.salas) && cuerpo.salas.every(esSala)
}

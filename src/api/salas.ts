import { esObjeto, leerMensajes, type Mensaje } from '../tiempo-real/contrato.ts'
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

// US-07. La API responde 403 si quien llama no es el anfitrión y 404 si la sala ya no existe.
export async function editarSala(token: string, id: string, nombre: string): Promise<Sala> {
  const cuerpo = await pedir(`/api/v1/salas/${encodeURIComponent(id)}`, { method: 'PATCH', token, cuerpo: { nombre } })
  const sala = leerSala(cuerpo)
  if (!sala) throw new ErrorApi('La respuesta de la sala no tiene la forma esperada.')
  return sala
}

export async function eliminarSala(token: string, id: string): Promise<void> {
  await pedir(`/api/v1/salas/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

export type PaginaMensajes = {
  mensajes: Mensaje[]
  hayAnteriores: boolean
}

export const MENSAJES_POR_PAGINA = 50

// US-11: el historial llega por partes, del más antiguo al más reciente dentro de cada página.
// Sin «antes» trae los últimos; con «antes» (el ID del mensaje más antiguo que ya se muestra)
// trae los anteriores a ese.
export async function listarMensajes(token: string, salaId: string, antes?: string | null): Promise<PaginaMensajes> {
  const params = new URLSearchParams({ limite: String(MENSAJES_POR_PAGINA) })
  if (antes) params.set('antes', antes)
  const cuerpo = await pedir(`/api/v1/salas/${encodeURIComponent(salaId)}/mensajes?${params}`, { token })
  if (!esObjeto(cuerpo) || !Array.isArray(cuerpo.mensajes)) {
    throw new ErrorApi('La respuesta del historial no tiene la forma esperada.')
  }
  return { mensajes: leerMensajes(cuerpo.mensajes), hayAnteriores: cuerpo.hayAnteriores === true }
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

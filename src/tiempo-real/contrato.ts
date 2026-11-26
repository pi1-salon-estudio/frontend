// Contrato del tiempo real que consume el frontend (US-07, US-10 y US-11), tal como lo
// documenta backend-realtime/docs/eventos.md. Si allá cambia un nombre o un dato,
// se ajusta aquí y en ningún otro archivo.

export const EVENTOS = {
  entrar: 'sala:entrar', // cliente → servidor { salaId }, ack { ok, salaId, participantes } | { ok: false, codigo, mensaje }
  salir: 'sala:salir', // cliente → servidor { salaId }
  participantes: 'sala:participantes', // servidor → sala { salaId, participantes }
  eliminar: 'sala:eliminar', // cliente → servidor { salaId }, solo el anfitrión
  eliminada: 'sala:eliminada', // servidor → sala { salaId }, antes de borrarla
  enviar: 'chat:enviar', // cliente → servidor { salaId, texto }, ack { ok, mensaje } | { ok: false, codigo, mensaje }
  mensaje: 'chat:mensaje', // servidor → los demás de la sala, el Mensaje directo
} as const

// Decisión de diseño 10: el mismo número valida la interfaz y el servidor.
export const LARGO_MAXIMO_MENSAJE = 500

export type Mensaje = {
  id: string
  salaId: string
  autorUid: string
  nombreUsuario: string
  texto: string
  creadoEn: string
}

export type Participante = {
  uid: string
  nombreUsuario: string
  avatar: string
  esAnfitrion: boolean
}

export type Respuesta =
  | { ok: true; datos: Record<string, unknown> }
  | { ok: false; codigo: string; mensaje: string }

export function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

export function deLaSala(datos: unknown, salaId: string): datos is Record<string, unknown> {
  return esObjeto(datos) && datos.salaId === salaId
}

export function leerMensaje(valor: unknown): Mensaje | null {
  if (!esObjeto(valor)) return null
  const { id, salaId, autorUid, nombreUsuario, texto, creadoEn } = valor
  if (typeof id !== 'string' || typeof texto !== 'string' || typeof creadoEn !== 'string') return null
  return {
    id,
    salaId: typeof salaId === 'string' ? salaId : '',
    autorUid: typeof autorUid === 'string' ? autorUid : '',
    nombreUsuario: typeof nombreUsuario === 'string' && nombreUsuario ? nombreUsuario : 'Sin nombre de usuario',
    texto,
    creadoEn,
  }
}

export function leerMensajes(valor: unknown): Mensaje[] {
  if (!Array.isArray(valor)) return []
  return valor.map(leerMensaje).filter((mensaje): mensaje is Mensaje => mensaje !== null)
}

export function leerParticipante(valor: unknown): Participante | null {
  if (!esObjeto(valor)) return null
  const { uid, nombreUsuario, avatar, esAnfitrion } = valor
  if (typeof uid !== 'string' || typeof nombreUsuario !== 'string') return null
  return { uid, nombreUsuario, avatar: typeof avatar === 'string' ? avatar : 'pino', esAnfitrion: esAnfitrion === true }
}

export function leerParticipantes(valor: unknown): Participante[] {
  if (!Array.isArray(valor)) return []
  const lista = valor.map(leerParticipante).filter((p): p is Participante => p !== null)
  // Una persona con dos pestañas cuenta una vez, aunque el servidor la mande repetida.
  return lista.filter((p, i) => lista.findIndex((otro) => otro.uid === p.uid) === i)
}

export function leerRespuesta(valor: unknown): Respuesta {
  if (!esObjeto(valor)) return { ok: false, codigo: 'RESPUESTA_INVALIDA', mensaje: '' }
  if (valor.ok === true) return { ok: true, datos: valor }
  return {
    ok: false,
    codigo: typeof valor.codigo === 'string' ? valor.codigo : 'ERROR',
    mensaje: typeof valor.mensaje === 'string' ? valor.mensaje : '',
  }
}

// El servidor ya manda el mensaje en lenguaje del estudiante. Solo se pone uno propio
// cuando no hay respuesta o no llega texto.
export function mensajeDeEnvio(mensaje?: string): string {
  return mensaje || 'No se envió tu mensaje. Revisa tu conexión y vuelve a intentarlo.'
}

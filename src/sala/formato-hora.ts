const hora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })
const dia = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' })
const clave = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })

// Decisión 11: hora fija, y la fecha solo si el mensaje no es de hoy.
export function formatoHora(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const hoy = clave.format(new Date())
  const ayer = clave.format(new Date(Date.now() - 86_400_000))
  const delMensaje = clave.format(fecha)
  if (delMensaje === hoy) return hora.format(fecha)
  if (delMensaje === ayer) return `Ayer, ${hora.format(fecha)}`
  return `${dia.format(fecha)}, ${hora.format(fecha)}`
}

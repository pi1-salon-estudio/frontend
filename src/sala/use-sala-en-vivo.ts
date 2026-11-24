import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { tokenActual } from '../firebase/ingresar.ts'
import {
  EVENTOS,
  deLaSala,
  leerMensaje,
  leerParticipantes,
  leerRespuesta,
  mensajeDeEnvio,
  type Mensaje,
  type Participante,
} from '../tiempo-real/contrato.ts'
import { URL_TIEMPO_REAL, crearSocket } from '../tiempo-real/socket.ts'
import { cambiosDeParticipantes, unirMensajes } from './listas.ts'

export type EstadoConexion = 'conectando' | 'conectada' | 'reconectando' | 'sin-conexion' | 'rechazada' | 'no-existe'
export type ResultadoEnvio = { ok: true } | { ok: false; mensaje: string }
export type ResultadoAccion = ResultadoEnvio

type Opciones = {
  salaId: string
  uid: string
  onEliminada: () => void
}

const ESPERA_MS = 8000

// Un socket por sala abierta. Las rooms de Socket.IO viven en el servidor: el cliente
// pide unirse y el servidor decide (US-10 «Aislamiento de salas»).
export function useSalaEnVivo({ salaId, uid, onEliminada }: Opciones) {
  const [conexion, setConexion] = useState<EstadoConexion>('conectando')
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [anuncio, setAnuncio] = useState('')
  const [reconexiones, setReconexiones] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const avisos = useRef({ onEliminada })

  useEffect(() => {
    avisos.current = { onEliminada }
  }, [onEliminada])

  const agregar = useCallback((lista: Mensaje[]) => {
    setMensajes((actuales) => unirMensajes(actuales, lista))
  }, [])

  useEffect(() => {
    if (!URL_TIEMPO_REAL) return
    const socket = crearSocket(URL_TIEMPO_REAL)
    socketRef.current = socket
    let tokenRenovado = false
    // Última lista recibida, para saber quién entró o salió. Arranca vacía: al entrar no se
    // anuncia a quienes ya estaban, solo los cambios que vengan después.
    let anteriores: Participante[] | null = null

    function recibirParticipantes(lista: Participante[]) {
      if (anteriores) {
        const cambios = cambiosDeParticipantes(anteriores, lista, uid)
        if (cambios.length > 0) setAnuncio(cambios.join(' '))
      }
      anteriores = lista
      setParticipantes(lista)
    }

    function entrar() {
      socket.timeout(ESPERA_MS).emit(EVENTOS.entrar, { salaId }, (error: Error | null, respuesta: unknown) => {
        if (error) {
          setConexion('sin-conexion')
          return
        }
        const r = leerRespuesta(respuesta)
        if (!r.ok) {
          setConexion(r.codigo === 'SALA_NO_ENCONTRADA' ? 'no-existe' : 'sin-conexion')
          return
        }
        recibirParticipantes(leerParticipantes(r.datos.participantes))
        setConexion('conectada')
        // Cada reconexión sube este número para que el historial traiga lo que llegó mientras tanto.
        setReconexiones((n) => n + 1)
      })
    }

    socket.on('connect', () => {
      tokenRenovado = false
      entrar()
    })
    socket.on('connect_error', (error) => {
      if (error.message === 'NO_AUTORIZADO') {
        // El token pudo vencer con la pestaña abierta: se renueva una vez y se intenta de nuevo.
        if (!tokenRenovado) {
          tokenRenovado = true
          tokenActual(true)
            .then(() => socket.connect())
            .catch(() => setConexion('rechazada'))
          return
        }
        setConexion('rechazada')
        return
      }
      setConexion(socket.active ? 'reconectando' : 'sin-conexion')
    })
    socket.on('disconnect', (motivo) => {
      if (motivo === 'io client disconnect') return
      setConexion(socket.active ? 'reconectando' : 'sin-conexion')
    })
    socket.io.on('reconnect_failed', () => setConexion('sin-conexion'))

    socket.on(EVENTOS.participantes, (datos: unknown) => {
      if (deLaSala(datos, salaId)) recibirParticipantes(leerParticipantes(datos.participantes))
    })
    // chat:mensaje llega a los demás, nunca a quien lo envió (ese lo recibe en el ack).
    socket.on(EVENTOS.mensaje, (datos: unknown) => {
      const m = leerMensaje(datos)
      if (!m || m.salaId !== salaId) return
      setMensajes((actuales) => unirMensajes(actuales, [m]))
      // Decisión 8: solo se anuncian los mensajes de otros, sin mover el foco.
      if (m.autorUid !== uid) setAnuncio(`Nuevo mensaje de ${m.nombreUsuario}: ${m.texto}`)
    })
    socket.on(EVENTOS.eliminada, (datos: unknown) => {
      if (deLaSala(datos, salaId)) avisos.current.onEliminada()
    })

    socket.connect()
    return () => {
      if (socket.connected) socket.emit(EVENTOS.salir, { salaId })
      socket.removeAllListeners()
      socket.io.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [salaId, uid])

  const enviar = useCallback(
    (texto: string) =>
      new Promise<ResultadoEnvio>((resolver) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          resolver({ ok: false, mensaje: mensajeDeEnvio() })
          return
        }
        socket.timeout(ESPERA_MS).emit(EVENTOS.enviar, { salaId, texto }, (error: Error | null, respuesta: unknown) => {
          if (error) {
            resolver({ ok: false, mensaje: mensajeDeEnvio() })
            return
          }
          const r = leerRespuesta(respuesta)
          if (!r.ok) {
            resolver({ ok: false, mensaje: mensajeDeEnvio(r.mensaje) })
            return
          }
          const m = leerMensaje(r.datos.mensaje)
          if (m) agregar([m])
          resolver({ ok: true })
        })
      }),
    [salaId, agregar],
  )

  // US-07: el anfitrión elimina por el tiempo real para que el servidor avise a los conectados
  // con sala:eliminada antes de borrar. Si no hay conexión, se devuelve null y el diálogo usa la API.
  const eliminarEnVivo = useCallback(
    () =>
      new Promise<ResultadoAccion | null>((resolver) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          resolver(null)
          return
        }
        socket.timeout(ESPERA_MS).emit(EVENTOS.eliminar, { salaId }, (error: Error | null, respuesta: unknown) => {
          if (error) {
            resolver({ ok: false, mensaje: 'No pudimos eliminar la sala. Revisa tu conexión y vuelve a intentarlo.' })
            return
          }
          const r = leerRespuesta(respuesta)
          resolver(r.ok ? { ok: true } : { ok: false, mensaje: r.mensaje || 'No pudimos eliminar la sala.' })
        })
      }),
    [salaId],
  )

  const reintentar = useCallback(() => {
    const socket = socketRef.current
    if (!socket) return
    setConexion('conectando')
    socket.connect()
  }, [])

  return {
    conexion: URL_TIEMPO_REAL ? conexion : ('sin-conexion' as const),
    participantes,
    mensajes,
    agregar,
    anuncio,
    reconexiones,
    enviar,
    eliminarEnVivo,
    reintentar,
  }
}

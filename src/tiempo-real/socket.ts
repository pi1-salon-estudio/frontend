import { io, type Socket } from 'socket.io-client'
import { tokenActual } from '../firebase/ingresar.ts'

export const URL_TIEMPO_REAL = import.meta.env.VITE_REALTIME_URL as string | undefined

// auth va como función para que cada reconexión pida un ID token vigente (dura una hora).
// Con un objeto fijo, una reconexión después de una hora llegaría con un token vencido.
// Se reintenta 8 veces; después la sala muestra «Sin conexión» con el botón Reintentar.
export function crearSocket(url: string): Socket {
  return io(url, {
    autoConnect: false,
    reconnectionAttempts: 8,
    auth: (cb) => {
      tokenActual()
        .then((token) => cb({ token }))
        .catch(() => cb({}))
    },
  })
}

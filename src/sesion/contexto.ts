import { createContext } from 'react'
import type { Perfil } from '../api/usuarios.ts'

export type EstadoVista =
  | { tipo: 'cargando' }
  | { tipo: 'sin-sesion' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'lista'; perfilCompleto: boolean; perfil: Perfil | null; correo: string }

export type ContextoSesion = {
  estado: EstadoVista
  reintentar: () => void
}

export const ContextoSesionReact = createContext<ContextoSesion | null>(null)

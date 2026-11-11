import { useContext } from 'react'
import { ContextoSesionReact } from './contexto.ts'

export function useSesion() {
  const contexto = useContext(ContextoSesionReact)
  if (!contexto) throw new Error('useSesion debe usarse dentro de ProveedorSesion.')
  return contexto
}

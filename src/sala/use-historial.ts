import { useCallback, useEffect, useRef, useState } from 'react'
import { listarMensajes } from '../api/salas.ts'
import { tokenActual } from '../firebase/ingresar.ts'
import type { Mensaje } from '../tiempo-real/contrato.ts'

type Opciones = {
  salaId: string
  agregar: (mensajes: Mensaje[]) => void
  // Sube cada vez que el socket entra a la sala. Al reconectar se vuelve a pedir la última
  // página para traer lo que llegó mientras no había conexión; los repetidos se descartan.
  reconexiones: number
  // ID del mensaje más antiguo en pantalla: es el cursor para pedir los anteriores.
  masAntiguo: string | null
}

export function useHistorial({ salaId, agregar, reconexiones, masAntiguo }: Opciones) {
  const [fase, setFase] = useState<'cargando' | 'lista' | 'error'>('cargando')
  const [hayMas, setHayMas] = useState(false)
  const [cargandoAnteriores, setCargandoAnteriores] = useState(false)
  const [errorAnteriores, setErrorAnteriores] = useState('')
  const [intento, setIntento] = useState(0)
  // Solo la primera carga decide si hay anteriores. Una recarga por reconexión trae la
  // última página y no debe volver a mostrar el botón si ya se cargó todo hacia atrás.
  const primeraCarga = useRef(true)

  useEffect(() => {
    let vigente = true
    void (async () => {
      try {
        const token = await tokenActual()
        const pagina = await listarMensajes(token, salaId)
        if (!vigente) return
        agregar(pagina.mensajes)
        setFase('lista')
        if (primeraCarga.current) {
          primeraCarga.current = false
          setHayMas(pagina.hayAnteriores)
        }
      } catch {
        if (!vigente) return
        setFase((actual) => (actual === 'lista' ? 'lista' : 'error'))
      }
    })()
    return () => {
      vigente = false
    }
  }, [salaId, agregar, reconexiones, intento])

  const reintentar = useCallback(() => {
    setFase('cargando')
    setIntento((n) => n + 1)
  }, [])

  const cargarAnteriores = useCallback(async () => {
    if (cargandoAnteriores || !masAntiguo) return
    setCargandoAnteriores(true)
    setErrorAnteriores('')
    try {
      const token = await tokenActual()
      const pagina = await listarMensajes(token, salaId, masAntiguo)
      agregar(pagina.mensajes)
      setHayMas(pagina.hayAnteriores)
    } catch (fallo) {
      setErrorAnteriores(fallo instanceof Error ? fallo.message : 'No pudimos cargar los mensajes anteriores.')
    } finally {
      setCargandoAnteriores(false)
    }
  }, [agregar, cargandoAnteriores, masAntiguo, salaId])

  return { fase, hayMas, cargandoAnteriores, errorAnteriores, cargarAnteriores, reintentar }
}

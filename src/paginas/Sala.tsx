import { PaginaSimple } from './PaginaSimple.tsx'

// La sala llega en el S3 (US-08 y US-09). Aquí no se muestran grupos ni personas de ejemplo.
export function Sala() {
  return (
    <PaginaSimple
      titulo="Sala"
      parrafos={[
        'Aquí vas a estudiar con tu grupo, con el trabajo a la vista.',
        'La sala llega en un sprint posterior.',
      ]}
    />
  )
}

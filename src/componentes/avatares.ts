// Cada figura tiene un color propio para que se distingan entre sí.
// Los id se conservan para no romper perfiles ya guardados.
export const AVATARES = [
  { id: 'pino', nombre: 'Azul', clase: 'bg-[#1d4ed8]' },
  { id: 'exito', nombre: 'Cielo', clase: 'bg-[#3b82f6]' },
  { id: 'tinta', nombre: 'Negro', clase: 'bg-[#0a0a0a]' },
  { id: 'piedra', nombre: 'Gris', clase: 'bg-[#737373]' },
  { id: 'papel', nombre: 'Blanco', clase: 'border border-tinta bg-white' },
] as const

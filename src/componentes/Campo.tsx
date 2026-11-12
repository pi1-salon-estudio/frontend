type CampoProps = {
  id: string
  etiqueta: string
  valor: string
  onChange: (valor: string) => void
  error?: string
  ayuda?: string
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  deshabilitado?: boolean
}

export function Campo({
  id,
  etiqueta,
  valor,
  onChange,
  error,
  ayuda,
  type = 'text',
  autoComplete,
  deshabilitado = false,
}: CampoProps) {
  const ayudaId = ayuda ? `${id}-ayuda` : undefined
  const errorId = error ? `${id}-error` : undefined
  const descrito = [ayudaId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-sm font-semibold">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={ayudaId} className="mt-1 text-sm text-piedra">
          {ayuda}
        </p>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={valor}
        disabled={deshabilitado}
        autoComplete={autoComplete}
        spellCheck={type === 'text' && id !== 'nombreUsuario'}
        aria-invalid={error ? true : undefined}
        aria-describedby={descrito}
        onChange={(evento) => onChange(evento.target.value)}
        className={`mt-1.5 h-11 w-full rounded-lg border bg-papel px-3 text-base text-tinta ${error ? 'border-2 border-aviso' : 'border-linea'}`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-aviso">
          {error}
        </p>
      )}
    </div>
  )
}

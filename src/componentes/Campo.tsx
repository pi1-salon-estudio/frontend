import { useState } from 'react'

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
  const [visible, setVisible] = useState(false)
  const esContrasena = type === 'password'
  const ayudaId = ayuda ? `${id}-ayuda` : undefined
  const errorId = error ? `${id}-error` : undefined
  const descrito = [ayudaId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="mt-5">
      <label htmlFor={id} className="block text-sm font-semibold text-tinta">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={ayudaId} className="mt-1 text-xs leading-4 text-piedra">
          {ayuda}
        </p>
      )}
      <div className="relative mt-1.5">
        <input
          id={id}
          name={id}
          type={esContrasena && visible ? 'text' : type}
          value={valor}
          disabled={deshabilitado}
          autoComplete={autoComplete}
          spellCheck={type === 'text' && id !== 'nombreUsuario'}
          aria-invalid={error ? true : undefined}
          aria-describedby={descrito}
          onChange={(evento) => onChange(evento.target.value)}
          className={`h-11 w-full rounded-md bg-blanco px-3.5 text-[15px] text-tinta disabled:bg-papel disabled:text-piedra ${esContrasena ? 'pr-24' : ''} ${error ? 'border-2 border-aviso' : 'border border-linea'}`}
        />
        {esContrasena && (
          // WCAG 3.3.8: se puede pegar y ver lo escrito. El botón no envía el formulario.
          <button
            type="button"
            aria-controls={id}
            aria-pressed={visible}
            disabled={deshabilitado}
            onClick={() => setVisible((actual) => !actual)}
            className="absolute inset-y-0 right-0 min-w-[72px] px-3.5 text-sm font-semibold text-pino hover:underline disabled:opacity-60"
          >
            {visible ? 'Ocultar' : 'Mostrar'}
            <span className="sr-only"> contraseña</span>
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs leading-4 text-aviso">
          {error}
        </p>
      )}
    </div>
  )
}

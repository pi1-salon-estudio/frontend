import { AVATARES } from './avatares.ts'

type ElegirAvatarProps = {
  valor: string
  onChange: (valor: string) => void
  error?: string
  deshabilitado?: boolean
}

export function ElegirAvatar({ valor, onChange, error, deshabilitado = false }: ElegirAvatarProps) {
  const errorId = error ? 'avatar-error' : undefined

  return (
    <fieldset className="mt-6" aria-describedby={errorId ?? 'avatar-ayuda'}>
      <legend className="text-sm font-semibold">Elige una figura</legend>
      <p id="avatar-ayuda" className="sr-only">
        Elige una figura. No se sube una foto.
      </p>
      <div className="mt-3 flex flex-wrap gap-5">
        {AVATARES.map((avatar) => {
          const elegido = valor === avatar.id
          return (
            <label key={avatar.id} className="flex cursor-pointer flex-col items-center gap-1.5 text-xs text-piedra">
              <input
                id={`avatar-${avatar.id}`}
                type="radio"
                name="avatar"
                value={avatar.id}
                aria-label={avatar.nombre}
                checked={elegido}
                disabled={deshabilitado}
                onChange={() => onChange(avatar.id)}
                className="peer sr-only"
              />
              <span
                className={`grid size-14 place-items-center rounded-full border-2 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-pino ${elegido ? 'border-pino' : 'border-transparent'}`}
              >
                <span aria-hidden="true" className={`size-9 rounded-full ${avatar.clase}`} />
              </span>
              {avatar.nombre}
            </label>
          )
        })}
      </div>
      {error && (
        <p id="avatar-error" className="mt-2 text-sm text-aviso">
          {error}
        </p>
      )}
    </fieldset>
  )
}

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
    <fieldset className="mt-4" aria-describedby={errorId ?? 'avatar-ayuda'}>
      <legend className="font-medium">Avatar</legend>
      <p id="avatar-ayuda" className="mt-1 text-sm text-piedra">
        Elige una figura. No se sube una foto.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {AVATARES.map((avatar) => (
          <label
            key={avatar.id}
            className="flex items-center gap-2 rounded-md border border-linea bg-white px-3 py-2"
          >
            <input
              id={`avatar-${avatar.id}`}
              type="radio"
              name="avatar"
              value={avatar.id}
              checked={valor === avatar.id}
              disabled={deshabilitado}
              onChange={() => onChange(avatar.id)}
            />
            <span aria-hidden="true" className={`inline-block size-6 rounded-full ${avatar.clase}`} />
            {avatar.nombre}
          </label>
        ))}
      </div>
      {error && (
        <p id="avatar-error" className="mt-1 text-sm text-aviso">
          {error}
        </p>
      )}
    </fieldset>
  )
}

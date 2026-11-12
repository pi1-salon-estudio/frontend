type BotonGoogleProps = {
  onClick: () => void
  deshabilitado?: boolean
}

// Norma de marca de Google, tema claro: fondo #FFFFFF, borde #747775 de 1 px,
// texto #1F1F1F a 14/20, la G a color sin modificar, 12 px antes del logo y 10 px después.
// https://developers.google.com/identity/branding-guidelines
export function BotonGoogle({ onClick, deshabilitado = false }: BotonGoogleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-md border border-google-borde bg-blanco px-3 text-sm leading-5 font-medium text-google-texto hover:bg-papel disabled:opacity-60"
      style={{ fontFamily: 'Roboto, "Segoe UI", sans-serif' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.68-5.17 3.68-9.09z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.26 21.3 7.37 24 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.28C.46 8.24 0 10.06 0 12s.46 3.76 1.28 5.38l3.99-3.09z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.28 6.62l3.99 3.08c.95-2.85 3.6-4.95 6.73-4.95z" />
      </svg>
      Continuar con Google
    </button>
  )
}

// Línea con la palabra «o» entre el formulario y el botón de Google.
export function SeparadorO() {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-linea" />
      <span className="text-xs text-piedra">o</span>
      <span className="h-px flex-1 bg-linea" />
    </div>
  )
}

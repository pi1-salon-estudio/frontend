# frontend

Interfaz web del Salón de Estudio Colaborativo (Mini-proyecto 2 de Proyecto Integrador I, Universidad del Valle).

El frontend no consulta Firestore. Todos los datos los pide a [`backend-api`](https://github.com/pi1-salon-estudio/backend-api).

## Enlaces

| Qué | URL |
|---|---|
| Aplicación en producción | https://pi1-salon-estudio.vercel.app |
| API que consume | https://pi1-salon-estudio-api.onrender.com |
| Documentación de la API | https://pi1-salon-estudio-api.onrender.com/docs |

## Tecnologías

React 19, TypeScript, Vite 8, Tailwind CSS 4 y ESLint con `eslint-plugin-jsx-a11y`.

## Variables de entorno

| Variable | Para qué sirve | En local | En Vercel |
|---|---|---|---|
| `VITE_API_URL` | URL base de la API, sin `/` al final | `http://localhost:3000` o la URL de Render | `https://pi1-salon-estudio-api.onrender.com` (Production y Preview) |

Todo lo que empieza por `VITE_` queda escrito dentro del JavaScript que descarga el navegador, así que cualquiera lo puede leer. Aquí nunca van llaves, contraseñas ni tokens. Si algo tiene que ser secreto, vive en el backend.

Vite lee estas variables al compilar, no al abrir la página. Si cambias una en Vercel, hay que volver a desplegar para que se note.

## Ejecutar en local

Requisitos: Node.js 24 y npm.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

La aplicación queda en http://localhost:5173.

Si no vas a correr la API en tu equipo, cambia `VITE_API_URL` en tu `.env` por `https://pi1-salon-estudio-api.onrender.com`. Así trabajas contra la API publicada y no necesitas la llave de Firebase.

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run lint` | Revisa el código, incluidas reglas de accesibilidad en JSX |
| `npm run build` | Revisa tipos y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve `dist/` para revisar el build antes de publicarlo |

`npm run lint` detecta algunos problemas de accesibilidad, como imágenes sin texto alternativo o campos sin etiqueta. No reemplaza las pruebas con teclado, lector de pantalla y Lighthouse.

## Ejecutar con Docker

```powershell
docker build --build-arg VITE_API_URL=http://localhost:3000 -t pi1-frontend .
docker run --rm -p 8080:80 pi1-frontend
```

La aplicación queda en http://localhost:8080. La URL de la API entra como `--build-arg` porque Vite la escribe en el JavaScript durante el build. Para apuntar a otra API hay que construir la imagen otra vez.

La imagen tiene dos etapas: Node compila la aplicación y nginx sirve solo los archivos de `dist/`. `nginx.conf` responde con `index.html` en cualquier ruta, para que una dirección como `/salas/abc123` funcione al recargar.

Para levantar todos los servicios juntos usa el `docker-compose.yml` del repositorio [`infra`](https://github.com/pi1-salon-estudio/infra).

## Despliegue

Vercel despliega desde GitHub y no usa el Dockerfile:

- Cada merge a `main` publica en producción.
- Cada PR genera un despliegue de prueba (Preview) con su propia URL.
- `vercel.json` hace lo mismo que `nginx.conf`: manda cualquier ruta a `index.html`.
- La versión de Node la fija `engines` en `package.json`.

## Cómo contribuir

- `main` está protegida: los cambios entran por PR.
- Una rama por historia o tarea, por ejemplo `feature/TS-00-base-tecnica-frontend`.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat:`, `fix:`, `docs:`, `build:`, `chore:`).
- Antes de abrir el PR, `npm run lint` y `npm run build` tienen que pasar sin errores.

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
| `VITE_FIREBASE_API_KEY` | Configuración pública de Firebase Authentication | La de la consola de Firebase | La misma, en Production y Preview |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación del proyecto | La de la consola de Firebase | La misma, en Production y Preview |
| `VITE_FIREBASE_PROJECT_ID` | Identificador del proyecto de Firebase | La de la consola de Firebase | La misma, en Production y Preview |

Todo lo que empieza por `VITE_` queda escrito dentro del JavaScript que descarga el navegador, así que cualquiera lo puede leer. Aquí nunca van llaves, contraseñas ni tokens. Si algo tiene que ser secreto, vive en el backend.

Vite lee estas variables al compilar, no al abrir la página. Si cambias una en Vercel, hay que volver a desplegar para que se note.

## Qué muestra esta versión

El inicio pide `GET /api/v1/base-tecnica` a la URL de `VITE_API_URL` y muestra el dato que la API trae de Firestore. La pantalla tiene tres resultados: consultando, éxito (mensaje y fecha en hora de Bogotá) y error con el botón «Reintentar». Si la API responde que no hay dato, se muestra ese mensaje y el mismo botón.

La primera consulta a Render puede tardar cerca de un minuto porque el servicio gratuito se duerme. A los 10 segundos la pantalla avisa que el servidor puede estar despertando. Si pasan 90 segundos sin respuesta, queda el error y se puede reintentar.

También están las rutas del mapa: inicio, ingreso, registro, panel, perfil, sala, ayuda y la página de no encontrado. Registro crea la cuenta con correo. Ingreso acepta correo o Google. Si Google todavía no tiene nombre de usuario, abre `/registro/usuario`. Panel, perfil y sala, sin sesión, vuelven a ingreso y regresan a la ruta pedida después de entrar. Cerrar sesión vuelve a ingreso. Para probarlo hacen falta las variables de Firebase y los proveedores de correo y de Google activos en la consola.

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

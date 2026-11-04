# Estrategia de accesibilidad, Sprint 0

Para una persona ciega, esta versión tiene que poder recorrerse completa con teclado y con un lector de pantalla, y cada cambio de la base técnica tiene que anunciarse sin depender del color.

## Qué se cumple en la aplicación publicada

El idioma de la página es español (`lang="es"`). Cada ruta tiene un título propio, terminado en «Salón de estudio».

La página está marcada en cuatro regiones: encabezado, navegación «Principal», contenido principal y pie. El primer control es el enlace «Saltar al contenido», que lleva al `main`.

El orden del teclado es el del documento: saltar, menú, contenido, pie. El foco se ve con un borde de 3 px. No hay una barra fija que pueda taparlo.

La base técnica vive en una región `aria-live="polite"` que no se desmonta entre estados. Consultando y éxito se anuncian por esa región, sin mover el foco. En error, y cuando no hay dato, el foco pasa al botón «Reintentar» solo si la persona no se movió a otro control durante la espera. El botón apunta al texto del error con `aria-describedby`. No se usa `role="alert"` además del foco, para no anunciar el mismo mensaje dos veces.

## Criterios que cubre esta versión

- 1.3.1 Información y relaciones: encabezado, navegación, contenido y pie.
- 1.4.3 Contraste: los pares están medidos en la guía visual. El texto corrido queda por encima de 4,5:1.
- 2.1.1 Teclado: menú, enlace de salto y botón se usan sin ratón.
- 2.4.1 Evitar bloques: enlace «Saltar al contenido».
- 2.4.2 Título de la página: un título por ruta.
- 2.4.3 Orden del foco: el orden visual y el del teclado coinciden.
- 2.4.7 Foco visible: borde propio, sin depender del estilo por defecto del navegador.
- 4.1.3 Mensajes de estado: la región en vivo anuncia consulta y éxito. El error se anuncia al enfocar «Reintentar».

2.4.11, foco no oculto, no aplica mientras no haya una barra fija. 3.3.8, sobre autenticación accesible, es del sprint de identidad, no de esta pantalla.

## Cómo se comprueba

1. Recorrer inicio, una ruta del menú y una dirección inexistente solo con Tab, Mayús+Tab y Entrar. El foco tiene que verse siempre.
2. En la URL publicada, Lighthouse, pestaña Accesibilidad, sobre el inicio ya cargado. La meta es 90 o más. Lighthouse recarga la página y puede fotografiar el estado «Consultando»; la captura que se entrega tiene que ser la del estado ya resuelto, o hay que decir cuál es.
3. A partir del sprint de las tareas T1 a T4, el mismo recorrido se hace con NVDA.

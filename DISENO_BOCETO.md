> Nota de v3: la composición actual conserva los ajustes del ZIP de Cami del 19 de octubre. Este documento recoge la base anterior; los cambios actuales y sus límites están en [CAMBIOS_V3.md](CAMBIOS_V3.md).

# Interpretación del boceto · versión local 2

La adaptación se aplica al sitio real desde 600 px útiles. El móvil y el teléfono de `/demo` conservan su composición y movimiento anteriores. No se ha publicado en GitHub ni Vercel.

## Composición

1. **Hero panorámico.** En PC, su área tiene proporción 16:9. En tablet se conserva una altura mínima para que el texto siga siendo legible. La nueva foto amplía la escena original hacia la izquierda y mantiene la barra, el bartender y la marca hacia la derecha. El móvil sigue usando la foto vertical anterior.
2. **Coctelera al costado.** Aparece vertical, con la tapa hacia arriba, junto al extremo inferior derecho del hero.
3. **Horizontal detrás de la pregunta.** Baja y gira hasta colocarse detrás de «¿Cuántos invitados tendrás?», ahora a la derecha. El texto tiene una superficie clara para mantener su lectura.
4. **Segundo giro.** Continúa por el lado izquierdo de las secciones de servicios y barras, girando en la misma dirección hasta invertir completamente la tapa.
5. **Vertido.** El líquido aparece únicamente después de la inversión, sale del extremo de la coctelera y cae detrás del contenido. Primero crece el chorro; después, al llegar abajo, se extiende el líquido.
6. **Bandeja izquierda, tarjeta derecha.** Conservan flechas, arrastre, favoritos, eliminación y estado compartido con la reserva.

La coctelera es un solo objeto durante toda la escena. El recorrido se calcula a partir de las posiciones reales del hero, pregunta, barras, tarjeta y bandeja. Cambia con el ancho, altura, carga de fuentes y disposición del contenido. Usa las fracciones reales del ancho para coincidir con los cortes CSS incluso con zoom.

El scroll controla el recorrido en ambos sentidos: al subir se retrae el vertido y la coctelera vuelve por el mismo camino. Con movimiento reducido queda una decoración horizontal fija y desaparece el líquido. Las capas decorativas no reciben clics ni gestos. Los textos, tarjetas y controles se dibujan por encima.

## Revisar cada fase

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000/revision` y elige 1440 × 900. Los botones de «Coctelera» saltan a las posiciones calculadas de cada fase. Prueba después 1280, 1024, 900, 768 y 600 px. El indicador muestra el ancho útil; una barra de desplazamiento puede reducirlo respecto al ancho de la ventana.

Verifica especialmente que la tapa quede hacia abajo antes de salir el líquido, que la pregunta siga legible, que el líquido quede detrás de ambas composiciones y que la bandeja admita añadir y quitar favoritos. Repite al subir el scroll, girar la tablet y cambiar el tamaño con favoritos ya elegidos.

## Archivos principales

- `components/sections/CocktailJourney.tsx`: unifica la escena y mide los elementos reales.
- `lib/shakerJourney.ts`: trayectoria, rotación, punto de salida y progreso del líquido.
- `app/journey.css`: capas y nueva composición amplia, aisladas del móvil.
- `tests/shakerJourney.test.mjs`: seis pruebas lógicas del recorrido y vertido.
- `public/images/peposhots/hero/peposhots-bar-panorama-v2.webp`: foto panorámica nueva, 1672 × 941 px; conserva el archivo vertical original.

## Validación y límite

Se han verificado tipos, referencias de imágenes, geometría y compilación. **Falta revisar el resultado visual y los gestos en un navegador real.** Las pruebas numéricas no verifican el acabado del líquido, la legibilidad final ni posibles solapamientos. El entorno de trabajo no ofreció el mecanismo de control de navegador requerido, por lo que no se inició una vista previa ni se simularon pruebas en teléfonos reales.

No se enviaron consultas, reservas ni reseñas. No se modificaron los datos de precios ni las rutas de correo.

Durante el empaquetado se detectó que `public/images/peposhots/signature/coconut-grove-canopy.webp` estaba truncado: contenía 78.848 bytes, aunque su cabecera declaraba 1.035.552. Se recuperó la imagen válida del ZIP original y se decodificaron correctamente las 57 imágenes del proyecto. El comprobador de assets valida ahora también las cabeceras, tamaños y bloques WebP para detectar este tipo de daño. Las 56 imágenes originales quedan idénticas al ZIP de partida; la panorámica es una imagen adicional.

## Foto: herramienta y prompt

Se utilizó la herramienta integrada ImageGen. El resultado se convirtió a WebP sin recortar, conservando la imagen generada de origen. El archivo integrado en el proyecto es `public/images/peposhots/hero/peposhots-bar-panorama-v2.webp`.

Prompt utilizado:

> Use case: precise-object-edit. Asset type: photographic website hero background, 16:9 landscape, 2048 by 1152 composition. Input image 1 is the edit target: PepoShots' existing vertical bar photograph with bartender shaking a shaker and a white PepoShots logo. Expand/outpaint it horizontally into a wide panoramic photograph for the desktop version of the SAME website. Preserve the original photograph's bartender, hands, shaker, warm amber bottle shelves, glassware, and exact existing white PepoShots logo intact. Position the recognizable original scene in the RIGHT HALF of the panoramic frame, with its white logo around the right-center; extend the bar scene naturally to the left, with dark forest-green and near-black shadows, subdued bottles and glassware, creating quiet readable negative space across the LEFT 45% where real HTML headline text will be placed. Match the original photographic style, warm lighting, depth, grain, perspective and realism. Keep the original main scene at a comfortable scale with no vertical cropping of the logo or hands. Do not add new text, buttons, borders, frames, headings, people, logos or watermarks. This is an expanded photograph, NOT a web-page mockup. Keep composition 16:9 and cinematic.

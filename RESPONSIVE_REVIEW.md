> Nota de v3: la composición actual conserva los ajustes del ZIP de Cami del 19 de octubre. Este documento recoge la base anterior; los cambios actuales y sus límites están en [CAMBIOS_V3.md](CAMBIOS_V3.md).

# Adaptación de PepoShots · 18 de octubre de 2026

## Decisión de diseño

Se usa el ancho útil en **píxeles CSS**, no las pulgadas ni la resolución física del panel. Una misma marca puede tener varios tamaños, y el zoom, la orientación, las barras del navegador o la pantalla dividida pueden cambiar el espacio disponible.

| Ancho útil | Composición |
| --- | --- |
| Menos de 600 px | Estructura móvil original, tarjetas deslizables, arte y CTA inferior |
| 600–1023 px | Tablet: navegación superior, tarjetas en rejilla y cóctel junto a la bandeja |
| Desde 1024 px | PC: navegación ampliada, cabeceras y archivo de eventos en paralelo |
| Desde 900 px, ajuste interno | Mapa junto a los detalles; formulario junto al texto de contacto |
| Desde 1280 px, ajuste interno | Los cinco tamaños de servicio se comparan en una fila |

Los puntos de corte son decisiones de este diseño, no una clasificación universal de aparatos. Un teléfono horizontal puede usar la distribución de tablet. Una tablet en pantalla dividida puede usar móvil.

`app/globals.css` conserva exactamente los bytes del archivo original (SHA-256: `78aeb6a4a7a82ddc830c0c79ce52080d1304848d3878042b22a968daea9393df`). Las nuevas reglas están en `app/responsive.css` y `app/journey.css` y se activan mediante consultas del contenedor `pepo`. `/demo` conserva un contenedor de teléfono, por lo que no cambia a escritorio por el tamaño de la ventana que lo rodea.

## Referencias de pantallas y marcas

Para la audiencia local se consultó Statcounter, tráfico móvil de EE. UU. de septiembre de 2026: Apple y Samsung son las dos marcas principales de esa medición; también se consideraron Xiaomi, Motorola y Google. Es una medición de navegación de esa fuente, no un inventario de los teléfonos de los clientes de PepoShots.

| Familia de referencia | Anchos incluidos en el panel |
| --- | --- |
| iPhone | 375, 390, 393, 402, 430, 440 px |
| Samsung Galaxy | 360 px (S24), 480 px (A55) |
| Android pequeños, anchos y plegables cerrados | 320, 344, 360, 412 px; cubre tamaños de Google, Motorola y otras marcas sin detectar fabricante |
| Tablets | 600, 640, 768, 820, 834, 1024 px |
| Laptop y escritorio | 1280, 1366, 1440, 1920, 2560 px |
| Bordes de cambio | 599/600/601, 899/900/901, 1023/1024/1025 y 1279/1280/1281 px |

Las dimensiones son referencias de composición. Algunas alturas corresponden a la pantalla lógica completa y otras a perfiles de navegador; las barras de Safari/Chrome pueden reducir la altura visible. Cambia también el alto y gira la vista. Ninguna lista de presets demuestra compatibilidad con todos los teléfonos de una marca.

Fuentes consultadas:

- [MDN: diseño adaptable](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [MDN: consultas de medios y ancho de ventana](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries)
- [Android Developers: clases de tamaño y espacio disponible](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes) — orientación general; sus dp de apps nativas no se usan como una equivalencia automática de píxeles CSS.
- [Chrome DevTools: catálogo de dispositivos emulados](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/emulation/EmulatedDevices.ts)
- [Microsoft Playwright: perfiles de dispositivos](https://github.com/microsoft/playwright/blob/main/packages/isomorphic/deviceDescriptorsSource.json) — referencias, sin ejecución de Playwright en esta tarea.
- [Statcounter: marcas de móviles, EE. UU.](https://gs.statcounter.com/vendor-market-share/mobile/united-states-of-america)

## Cambios de distribución

- Hero con fotografía a la derecha y texto/acciones a la izquierda.
- Navegación superior persistente en pantallas amplias, con acceso a la consulta.
- Servicios comparables en dos, tres o cinco columnas, según espacio.
- Deck animado de barras junto a su ficha; mantiene arrastre y flechas.
- Cóctel y bandeja en paralelo. El arrastre admite ambas direcciones en pantallas amplias; el gesto móvil conserva su comportamiento. Se añade un botón explícito para guardar el cóctel.
- Tres composiciones de logística en columnas, sin trasladar al PC las grandes separaciones verticales del móvil.
- Archivo de eventos con flechas adicionales; reseñas de muestra conservan su etiqueta.
- Mapa, zonas y cóctel signature con medidas limitadas al espacio de su columna.
- Reserva con dos columnas de campos y scroll de página en pantallas amplias. Un solo formulario conserva el estado al redimensionar. El arte de bandeja y coctelera sigue presente.
- Desplazamiento y foco del formulario tienen en cuenta la altura del encabezado persistente.
- Las imágenes solicitan tamaños acordes con su presentación amplia.
- Se conserva la preferencia de movimiento reducido del proyecto original.

## Validación ejecutada

Se instalaron las dependencias sin modificar sus versiones ni el lockfile. Se validaron TypeScript, 57 referencias de imágenes WebP y la compilación de producción.

La verificación encontró un error de confianza TLS y un fallo de resolución de una URL de Google Fonts en Turbopack. Los scripts `dev` y `build` usan ahora la opción oficial `--webpack` de la misma versión instalada de Next. La compilación final se completó con ese empaquetador y los certificados del sistema (`NODE_USE_SYSTEM_CA=1` en este entorno), sin cambiar las tipografías ni las versiones de dependencias. La descarga de fuentes durante la compilación sigue requiriendo conexión, como en el proyecto original.

Las pruebas `tests/responsive.test.mjs` comprueban:

1. Identidad exacta de la hoja móvil original.
2. Aislamiento de todas las nuevas reglas de composición por debajo de 600 px.
3. Acuerdo entre cortes CSS y lógica de gestos/revisión, incluidos anchos fraccionarios.
4. Presencia de los perfiles y bordes previstos en el panel.
5. Desplazamiento correcto bajo el encabezado, manteniendo los dos offsets móviles originales.
6. Con `PEPO_CHECK_BUILT_HTML=1`, destinos de navegación únicos y un solo formulario en el HTML de producción.

La actualización del boceto añade seis pruebas en `tests/shakerJourney.test.mjs`: orientación de la tapa, comienzo del líquido después de la inversión, unión exacta del chorro al extremo de la coctelera, geometría en 32 combinaciones de ancho/alto, reversibilidad del scroll, movimiento reducido y fallo seguro ante medidas no válidas. Se ejecutan con `npm run test:journey`. El detalle de diseño está en `DISENO_BOCETO.md`.

**Estas pruebas no renderizan páginas ni demuestran ausencia de solapamientos visuales.** No se inició un servidor de vista previa ni se ejecutaron navegadores en el entorno de trabajo, porque no estaba disponible su mecanismo de control requerido. No se enviaron reservas, correos ni reseñas.

## Revisión visual pendiente antes de publicar

En `npm run dev`, abre `/revision` y comprueba:

- Lectura y recortes del hero en 600, 768, 1024 y 1440 px.
- Las cinco tarjetas de servicio; precio, texto y selección legibles.
- Recorrido de la coctelera al hacer scroll y animación/selección del deck.
- Navegación de los nueve cócteles, toque, arrastre lateral y vertical, favoritos y eliminación.
- Cambio de tamaño con invitados, barra y varios favoritos seleccionados; deben mantenerse al llegar al formulario.
- Mapa, zonas, zona personalizada y cada propuesta signature.
- Los cuatro pasos de reserva, validación, botón Atrás y edición desde el resumen. El envío real se comprueba después con la configuración autorizada del negocio.
- En móvil real: teclado, orientación, controles táctiles, franjas seguras y CTA inferior.
- En `/demo`: frame, scroll interno y composición móvil.
- En Safari y Chrome: zoom, tamaños de texto y movimiento reducido.

`/revision` se limita al modo de desarrollo y responde 404 en producción. La web principal no contiene este panel.

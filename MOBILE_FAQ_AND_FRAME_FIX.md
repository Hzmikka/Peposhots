# Corrección móvil: FAQ, botones, utensilios y marco exterior

- El panel de botones y utensilios ahora se desplaza como una sola sección.
- La distancia se calcula usando el crecimiento real del bloque de preguntas frecuentes, no una aproximación por respuestas.
- Se añadió escucha directa a cada evento `toggle` además del `ResizeObserver`.
- Al cerrar todas las preguntas, la posición original se conserva.
- En móvil se retiraron el padding, borde y sombra exteriores del marco para que no aparezcan franjas negras laterales.
- El póster mantiene el 100% del ancho disponible en móvil.
- No se modificaron estilos de escritorio ni contenido visible.

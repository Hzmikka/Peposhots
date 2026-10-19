# PepoShots · cambios técnicos y Español/English

Versión local, 19 de octubre de 2026. Preparada a partir del ZIP de Cami `01-Peposhots-Boceto-v2.zip`.

## Qué se conserva

Las tres hojas originales `app/globals.css`, `app/responsive.css` y `app/journey.css` son idénticas a las del ZIP recibido. También lo son `CocktailJourney.tsx`, `shakerJourney.ts` y las 57 imágenes.

Se conservan tus alturas de hero, tamaños y posiciones de la coctelera, composición de barras, tarjetas, bandeja, mapa y transiciones. Se conserva el sentido de deslizamiento de PC, el doble toque para mostrar la cruz y su tamaño visual de 28 px. No se ha forzado el hero de vuelta a 16:9 ni se ha recuperado el charco de líquido que eliminaste.

Los estilos añadidos están en `app/enhancements.css` y atienden los controles nuevos: selector de idioma, selección completa en diálogo, acciones del formulario, privacidad y foco. El encabezado adapta su espacio al botón nuevo; en tablet compacta conserva la marca, idioma y consulta de fecha. El pie incorpora privacidad debajo del logo.

## Cambios hechos

1. **Español/English arriba.** Traduce navegación, secciones, paquetes, ingredientes, descripciones, formularios, errores, confirmación, privacidad y página 404. Recuerda el idioma, actualiza el idioma del documento y mantiene las selecciones y el formulario al cambiar. Los nombres de cócteles, zonas y nombres propios de barras se conservan.
2. **Precios coherentes.** La referencia se identifica como base de bartenders. Al elegir mesero, servicio combinado o servicio todavía por definir, aparece una indicación de cotización, sin reutilizar esa cifra como total. No se han inventado tarifas ni cambiado los importes existentes.
3. **Favoritos completos sin ampliar la composición.** La bandeja sigue mostrando cuatro copas. El `+N` abre una ventana con todos los cócteles elegidos y permite quitar cualquiera. El formulario conserva tres etiquetas y convierte su `+N` en la misma acción. No se recuperó la lista grande que habías eliminado.
4. **Activación accesible de la copa.** Se mantiene el gesto de tocar/arrastrar y se admite la activación sintetizada por tecnologías de asistencia. Su estado accesible distingue entre añadir y ya seleccionado.
5. **Formulario.** Incluye comentarios en la revisión; permite cambiar o quitar la preferencia de barra; asocia errores con campos y vuelve al paso que necesite corrección. Cliente y servidor comparten validación, limpieza y calendario de Miami.
6. **Recuperación del borrador.** Los datos se conservan temporalmente en la pestaña, con caducidad de 12 horas, y se borran al enviar correctamente. Un almacenamiento bloqueado o dañado no impide utilizar la web.
7. **Selección coherente.** Las elecciones explícitas de invitados y zona se reflejan también en el formulario. El mapa restaura la zona guardada y la barra elegida vuelve a mostrarse al recuperar preferencias.
8. **WhatsApp con contexto.** Prepara un mensaje editable con los detalles del evento ya escritos y las selecciones disponibles. No envía el mensaje automáticamente ni incluye los campos de teléfono o email del formulario.
9. **Confirmación.** Añade «Guardar resumen» para descargar los datos esenciales de la consulta. Se sigue aclarando que una solicitud no confirma una reserva.
10. **Fotos y reseñas.** Compartir foto ya no exige escribir una reseña ni dar una calificación. El tamaño se comprueba al elegir el archivo. Las contribuciones se reciben por correo y requieren revisión antes de publicarse.
11. **Prueba visual real.** Se eliminaron los textos, nombres y estrellas de reseñas ficticias. La galería utiliza descripciones de sus fotos, manteniendo el tamaño de las tarjetas. No se han creado testimonios nuevos.
12. **Teclado.** Los controles de la galería permanecen montados, las flechas mueven también el foco y las pestañas del diálogo tienen relaciones y navegación de teclado. Elegir invitados con teclado conserva la continuidad hacia barras.
13. **Errores útiles.** Los errores públicos no muestran instrucciones sobre contraseñas, Gmail o Vercel. El diagnóstico sigue en el servidor. Los mensajes responden en el idioma elegido.
14. **Privacidad y páginas secundarias.** Privacidad tiene regreso al inicio, destino válido para «Saltar al contenido», selector de idioma y su URL canónica propia. Se añade una página 404 bilingüe.
15. **Imágenes.** Las fotos de la galería y la imagen signature no se fuerzan a cargar antes de necesitarlas. Se ajusta el tamaño declarado de la imagen signature a su presentación actual. No se sustituyen ni recomprimen tus archivos.

## Simplificaciones propuestas, sin aplicar

No se han cambiado automáticamente porque tus ajustes producen la composición que quieres.

### 1. Nombrar los desplazamientos conservando exactamente sus valores

Por ejemplo, convertir los valores de `top` y `left` de la tarjeta en variables del bloque:

```css
/* Solo propuesta: mismos valores y mismas propiedades. */
.cocktail-journey {
  --tarjeta-arriba: -280px;
  --tarjeta-izquierda: -110px;
}
.cocktail-journey .cocktail-showcase {
  top: var(--tarjeta-arriba);
  left: var(--tarjeta-izquierda);
}
```

Así podrías afinar cada composición desde un lugar sin sustituir tu diseño por otro.

### 2. Separar unos pocos ajustes para tablet horizontal y laptop

El mismo grupo de desplazamientos se activa desde 1024 px. Si en la comprobación visual aparece un choque, se pueden conservar sus posiciones de escritorio y añadir solo una corrección entre 1024 y 1279 px. No hace falta reorganizar toda la web.

### 3. Reservar el espacio real de los elementos más desplazados

Si una modificación de texto crea huecos o solapamientos, se puede ajustar la fila que contiene tarjeta y bandeja manteniendo sus tamaños y posiciones finales. Primero habría que observar el caso concreto en navegador; no se ha hecho una reconstrucción preventiva de tus secciones.

### Decisiones de negocio pendientes

- Sustituir las descripciones de la galería por reseñas reales si las tienes y están autorizadas.
- Fijar un plazo real de respuesta antes de anunciar «respondemos en X horas».
- Publicar tarifas de meseros, alquileres y transporte cuando estén definidas.
- Decidir si quieres admitir fechas flexibles o reducir los campos obligatorios. Se mantiene el recorrido de cuatro pasos que ya tenías.

## Verificación y límites

- Compilación de producción y TypeScript correctos.
- 23 pruebas automatizadas: validación, localización, borradores, contexto, precios, contribuciones, conservación de estilos y animación.
- Comprobación de las 57 imágenes y de los destinos internos del HTML.
- Renderizado del código en español e inglés para revisar textos y valores estables de opciones. Esto no sustituye una prueba en navegador.
- Los ensayos HTTP usan un sustituto del correo: **no se enviaron correos ni reseñas reales**.
- No se publicaron cambios en GitHub, Vercel ni en el dominio activo.

La guía de [Sites](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) indica: “If `$control-browser` is unavailable, skip browser QA”. Ese recurso no está disponible en esta sesión. Queda pendiente comprobar visualmente el selector y el contenido inglés, la navegación táctil, el teclado móvil y los solapamientos en distintos tamaños. También queda pendiente verificar la entrega real de correo en el entorno configurado.

El selector cambia el idioma del recorrido actual. No añade rutas separadas para SEO en inglés ni traducción automática de contenido enviado por clientes.

# PepoShots · revisión final para publicación

19 de octubre de 2026. Fuente: `Peposhots-Local-ES-EN-v3 (2).zip` de Cami. Los textos, autores y puntuaciones de reseñas quedan fuera de esta revisión editorial; sus archivos se conservan idénticos.

## Cambios de esta entrega

- Se incorpora al repositorio la versión PC/tablet y ES/EN del ZIP, conservando el diseño móvil, las imágenes y los ajustes de Cami.
- El formulario avanza al siguiente paso cuando se pulsa Enter; solo envía desde «Revisar».
- Un bloqueo inmediato impide envíos duplicados. Atrás y Editar se desactivan mientras llega la respuesta.
- La confirmación exige HTTP correcto y `ok: true`. Un cuerpo inválido o un fallo de red conserva el borrador y permite reintentar.
- El botón de envío y «Enviando…» usan las traducciones existentes al cambiar a inglés.
- La URL pública por defecto es `https://peposhots.com` en producción; `NEXT_PUBLIC_SITE_URL` permite configurar otro dominio. Desarrollo conserva localhost.
- Next se actualiza a 16.4.2 y Nodemailer a 10.1.7, con su lockfile y tipos compatibles.
- Se excluyen de la subida las dependencias, cachés, archivos generados de TypeScript y credenciales.

## Conservación y validación

Las cuatro hojas de estilo, `CocktailJourney.tsx`, `shakerJourney.ts`, las 57 imágenes y los archivos de reseñas se compararon por SHA-256 con el ZIP recibido. No se modificaron precios, proporciones ni trayectoria de la coctelera.

Comprobaciones: compilación de producción, TypeScript, referencias e integridad de recursos, 29 pruebas automatizadas más la inspección del HTML compilado y auditoría de dependencias de producción. La auditoría final devuelve cero avisos conocidos. No constituye una auditoría de seguridad completa.

Las seis pruebas nuevas ejercitan estado y controladores reales de React: avance de pasos, doble envío, traducción del botón, respuesta inválida, fallo y reintento, y retorno al campo que rechaza el servidor. No abren un navegador ni envían correo. El renderizador de pruebas emite un aviso de obsolescencia y solo es una dependencia de desarrollo.

Se retiró de una prueba de traducción la exigencia editorial obsoleta de que las reseñas estuvieran vacías. Se conservan sus comprobaciones técnicas de traducción. PostCSS se resuelve desde Next sin depender de la carpeta donde npm lo instale.

## Publicación y límites

Repositorio: `Hzmikka/Peposhots`, rama `main`. Proyecto existente en Vercel: `peposhots`. Dominio: `https://peposhots.com`. La integración de GitHub inicia el despliegue del nuevo commit.

Se conserva el contrato de correo de producción: `EMAIL_FROM`, `EMAIL_TO` y `GMAIL_APP_PASSWORD`. Los valores y la contraseña permanecen en la configuración de Vercel. La entrega real de correo no se prueba con mensajes a terceros.

La comprobación visual y táctil en dispositivos reales queda pendiente. La guía de [Sites](skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md) indica: “If `$control-browser` is unavailable, skip browser QA”. Ese recurso no está disponible en esta sesión; no se inició un servidor de vista previa ni se improvisó un navegador alternativo. Los ensayos de geometría no sustituyen esa revisión visual.

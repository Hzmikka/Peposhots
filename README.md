# PepoShots — Delivery Ready

Sitio mobile-first de PepoShots para explorar tipos de evento, barras, cócteles, trabajo real, cobertura y solicitar disponibilidad/cotización.

## URLs

- `/` — sitio real para clientes. No muestra el marco de teléfono ni la Dynamic Island del portfolio.
- `/demo` — conserva el mockup móvil original (332×700, canvas de 420 px, escala y Dynamic Island) para portfolio. Esta ruta lleva `noindex`.
- `/privacy` — aviso de privacidad.

La web real y el demo usan exactamente los mismos componentes y contenido; solo cambia el shell exterior y el origen del scroll.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- CSS global del proyecto
- Nodemailer + Gmail SMTP para booking y reseñas

## Desarrollo local

```bash
npm ci
npm run dev
```

Comprobaciones:

```bash
npm run check:assets
npm run typecheck
npm run lint
npm run build
```

`check:assets` valida que los assets locales referenciados existan, sean WebP y que no queden imágenes huérfanas en `public/images`.

## Email real — Vercel

El código está preparado para usar:

- remitente Gmail: `camilahdezb007@gmail.com`
- inbox del negocio: `peposchots5@gmail.com`

La App Password NO está incluida en el ZIP.

En Vercel → Project → Settings → Environment Variables añade como mínimo:

```env
GMAIL_APP_PASSWORD=<tu-app-password-de-16-caracteres>
```

Opcionalmente puedes declarar también estos valores (ya son los defaults del proyecto):

```env
EMAIL_FROM=camilahdezb007@gmail.com
EMAIL_TO=peposchots5@gmail.com
```

Para canonical/SEO puedes fijar:

```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio-final.com
```

Si no se define en Vercel, el proyecto intenta usar `VERCEL_PROJECT_PRODUCTION_URL` automáticamente.

Nunca uses aquí la contraseña normal de Google, códigos de respaldo, passkeys o llaves de seguridad. Solo la App Password.

### Booking

`POST /api/booking` valida el formulario en servidor y envía el email a `EMAIL_TO`. El `Reply-To` usa el email que escribió el potencial cliente, de modo que al pulsar Responder se le responde directamente.

### Reseñas

No depende de Google Business Profile. La sección Real Events abre un formulario propio para reseña + foto opcional. `POST /api/review` lo envía a `EMAIL_TO` para moderación. Las fotos se limitan a 3 MB desde cliente y servidor.

Las tres reseñas identificadas como Google son extractos reales sobre el trabajo de Jovel; las demás cards muestran únicamente fotografía real del evento y no inventan testimonios.

## Mobile real vs. demo

La versión pública `/` usa el scroll real del navegador y ocupa el ancho del dispositivo hasta un máximo de 400 px, equivalente al canvas interno aprobado del demo; en pantallas mayores queda centrada. El CTA “Consultar fecha / Llamar” permanece fijo abajo durante el scroll y se estaciona en su dock final antes del logo.

La ruta `/demo` conserva el frame original para portfolio y sigue usando su scroll interno. Las animaciones del shaker, los saltos a Bar Setups, el booking y el CTA detectan automáticamente cuál de los dos scroll roots está activo.

## Antes de entregar

Después del primer deploy en Vercel:

1. Configura `GMAIL_APP_PASSWORD`.
2. Envía un booking real de prueba desde la URL de Vercel y confirma que llega a `peposchots5@gmail.com`.
3. Pulsa Responder y confirma que Gmail responde al email introducido en el formulario.
4. Envía una reseña de prueba con y sin foto.
5. Prueba `/` en Safari de iPhone y Chrome de Android.
6. Prueba `/demo` por separado para confirmar que el portfolio mantiene el frame.
7. Cuando exista dominio definitivo, configura `NEXT_PUBLIC_SITE_URL` y vuelve a desplegar.

Consulta `DELIVERY_CHECKLIST.md` y `FINAL_QA_REPORT.md` para la pasada final de QA.


## Email delivery
See `EMAIL_SETUP_VERCEL.md` for the exact Vercel environment variables and end-to-end test.

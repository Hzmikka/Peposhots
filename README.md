# PepoSHOTS Event Bartender

Sitio web oficial de PepoSHOTS para servicios de bartender y waiter en Miami.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación usa Next.js y abre localmente en el puerto configurado por el script `dev`.

## Variables privadas

Crea un archivo `.env.local` únicamente en tu computadora o configura estas variables en Vercel:

```text
RESEND_API_KEY=
BOOKING_EMAIL=
```

`.env.local` está excluido de Git y no debe subirse al repositorio.

## Publicación

El repositorio está preparado para desplegarse en Vercel. Los cambios enviados a la rama `main` generan una nueva publicación cuando la integración con GitHub está activa.

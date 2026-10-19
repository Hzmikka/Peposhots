# Abrir PepoShots · revisión final Español/English

1. Descomprime el ZIP en una carpeta nueva. Conserva tu versión anterior por separado.
2. Abre una terminal dentro de la carpeta que contiene `package.json`. Necesitas una versión de Node compatible con el requisito `>=20.9.0` del proyecto.
3. Ejecuta:

```bash
npm ci
npm run dev
```

4. Abre http://localhost:3000. El botón **ES / EN** está en el encabezado. El cambio de idioma conserva tu selección y los datos que estés escribiendo.
5. Abre http://localhost:3000/revision para comparar anchos de móvil, tablet y PC. Este panel es solo de desarrollo y no se expone en producción.

Para comprobar el paquete:

```bash
npm test
npm run check:assets
npm run build
npm run typecheck
```

La revisión final incluye 29 pruebas automatizadas y una adicional del HTML compilado. Después de compilar, se activa con `PEPO_CHECK_BUILT_HTML=1 npm test`. En PowerShell usa primero `$env:PEPO_CHECK_BUILT_HTML = '1'` y después `npm test`. Las pruebas de correo no envían mensajes reales.

Para recibir consultas reales se necesitan las variables de correo del negocio: `EMAIL_FROM`, `EMAIL_TO` y `GMAIL_APP_PASSWORD`. Conserva los valores de tu configuración anterior; no se han incluido credenciales en el ZIP. El documento `EMAIL_SETUP_VERCEL.md` explica la configuración. El fallo de correo en una copia sin configurar no significa que el formulario haya enviado el mensaje.

En desarrollo se usa localhost; en producción, `https://peposhots.com`. Puedes configurar otro dominio público con `NEXT_PUBLIC_SITE_URL`.

El ZIP contiene código, imágenes y documentos. Las dependencias y los archivos generados se vuelven a crear con los comandos anteriores.

**Correcciones y verificación de esta entrega:** consulta [REVISION_FINAL.md](REVISION_FINAL.md). [CAMBIOS_V3.md](CAMBIOS_V3.md) conserva el historial anterior.

La publicación se realiza desde `main` de `Hzmikka/Peposhots` mediante la integración de Vercel. El estado final del despliegue se confirma en Vercel; ejecutar un redeploy sin actualizar GitHub no incorpora cambios locales.

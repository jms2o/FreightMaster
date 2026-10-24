# Freight Master

Prototipo web de logística para Node.js 24, Next.js y MySQL, preparado para el alojamiento Node.js de Hostinger. Incluye portada con video real, servicios interactivos, cotizaciones persistentes, administración de choferes e itinerarios y un chat guiado con ID/PIN.

## Desplegar

Sigue **[HOSTINGER.md](HOSTINGER.md)**. Se incluye **[.env.example](.env.example)** con los nombres de las variables; los datos reales se introducen en hPanel y nunca en GitHub. Puedes usar el dominio provisional del alojamiento.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Completar .env.local con tu propia configuración.
pnpm dev
```

Para producción: `pnpm run build` y `pnpm start`. La portada puede compilar sin secretos; las funciones con base de datos requieren configurar MySQL y el acceso administrativo.

## Accesos

La administración está en `/control`. Su inicio de sesión usa `ADMIN_USERNAME` y `ADMIN_PASSWORD` del servidor, con sesiones opacas, expiración, revocación por cambio de clave y límite de intentos. No depende de una cuenta de ChatGPT. Los choferes entran por el mismo chat de la portada y solo consultan las paradas que se les asignen.

El chat público orienta sobre servicios y cotizaciones. La ubicación y las condiciones de seguridad se configuran desde el panel; si faltan, el chat lo indica. No hay IA conectada, seguimiento GPS, envío de correos o WhatsApp. El dictado compatible transforma voz en texto para revisar antes del envío; no almacena notas de audio.

## Video y marca

Fuente: Jonathan David, Pexels, https://www.pexels.com/video/white-truck-driving-at-sunset-on-highway-33870727/ (licencia: https://www.pexels.com/license/). La escena de stock está marcada como ilustrativa. El logo se integra mediante seguimiento de perspectiva; el icono del asistente es un SVG propio de la interfaz en vino, marfil y arena.

Los dos videos completos se almacenan en partes en `assets/video-parts/`. El arranque de desarrollo y la compilación reconstruyen automáticamente sus MP4 y verifican SHA-256. `pnpm media:restore` también lo hace. No requiere descargas.

## Verificación

`pnpm typecheck`, `pnpm test` y `pnpm run build`. Las pruebas de aislamiento y revocación usan SQLite en memoria y las mismas consultas de lectura; no sustituyen una prueba del servidor MySQL de producción. `/api/health` permite verificar la conexión real cuando se configura Hostinger. No se migran datos de la instancia de ChatGPT Sites.

La IA queda para otra etapa. Las autorizaciones de servidor se mantienen fuera de las respuestas del chat.

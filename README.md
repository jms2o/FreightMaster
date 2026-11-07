# Freight Master

Prototipo web de logística para Node.js 24, Next.js y MySQL, preparado para el alojamiento Node.js de Hostinger. Incluye portada con imagen fija optimizada, servicios interactivos, cotizaciones persistentes, administración de choferes e itinerarios y un chat guiado con ID/PIN.

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

La administración está en `/control`. El acceso principal usa `ADMIN_USERNAME` y `ADMIN_PASSWORD` del servidor. Dentro de Usuarios administradores puedes crear cuentas personales adicionales guardadas en MySQL, con contraseñas protegidas mediante scrypt y sal aleatoria. Todas las cuentas administrativas tienen acceso completo al panel y pueden crear otras cuentas. El inicio de sesión conserva sesiones opacas, expiración de una hora, revocación por cambio de clave y límite de intentos por usuario y global. No depende de una cuenta de ChatGPT. Los choferes entran por el mismo chat de la portada y solo consultan las paradas que se les asignen.

El chat público orienta sobre servicios y cotizaciones. La ubicación y las condiciones de seguridad se configuran desde el panel; si faltan, el chat lo indica. No hay IA conectada, seguimiento GPS, envío de correos o WhatsApp. El dictado compatible transforma voz en texto para revisar antes del envío; no almacena notas de audio.

## Portada y marca

Fuente: Jonathan David, Pexels, https://www.pexels.com/video/white-truck-driving-at-sunset-on-highway-33870727/ (licencia: https://www.pexels.com/license/). La imagen fija procede de la escena de stock y está marcada como ilustrativa. El icono del asistente es un SVG propio de la interfaz en vino, marfil y arena.

El inicio usa `public/media/home-hero.webp` (59,138 bytes) y la variante móvil `home-hero-mobile.webp` (56,128 bytes), con carga prioritaria. No incluye reproductor, skeleton multimedia, listeners para avanzar video ni una sección de varias pantallas. El contenido y los enlaces funcionan aunque la imagen falle.

Los videos anteriores permanecen archivados en `assets/video-parts/` y solo se reconstruyen manualmente con `pnpm media:restore`. El desarrollo y la compilación ya no ejecutan ese proceso, y la portada no solicita archivos MP4.

## Verificación

`pnpm typecheck`, `pnpm test` y `pnpm run build`. Las pruebas de aislamiento, creación de administradores e inicio/cierre de sesión usan SQLite en memoria y ejecutan las rutas y consultas del módulo; no sustituyen una prueba del servidor MySQL de producción. `/api/health` permite verificar la conexión real cuando se configura Hostinger. No se migran datos de la instancia de ChatGPT Sites.

La IA queda para otra etapa. Las autorizaciones de servidor se mantienen fuera de las respuestas del chat.


## Idiomas

La interfaz está disponible en español e inglés. El selector Idioma / Language aparece en el menú principal, la página de postulación, el inicio de sesión y el panel. La preferencia se guarda en la cookie funcional `fm_language` durante un año y se usa desde el renderizado del servidor, incluidos el atributo `lang` y los metadatos públicos. El cambio en la página actual usa estado compartido, sin recargar ni reiniciar formularios.

Se traducen navegación, servicios, reclutamiento, formularios, estados, accesibilidad, mensajes de error, administración y respuestas guiadas del chat. El dictado usa `es-MX` o `en-US` según la selección. Los nombres de personas, direcciones, referencias, archivos, instrucciones y otros datos ingresados se conservan en su idioma original.

En Información del asistente público se pueden guardar versiones en español e inglés de ubicación y seguridad. El chat muestra la versión correspondiente; si falta la inglesa, conserva el texto original y lo identifica. Estas versiones usan las claves `address_en` y `security_en` de la tabla de configuración existente. No hay un servicio externo de traducción ni variables nuevas. `pnpm test` incluye renderizado de las pantallas en ambos idiomas, selector y persistencia de la preferencia, respuestas del chat y conservación de datos operativos.


## Navegación administrativa

El panel usa páginas independientes bajo una estructura común con menú lateral y menú modal en móvil. `/control` muestra accesos directos; `/control/choferes` gestiona choferes; `/control/itinerarios` organiza paradas; `/control/postulaciones` revisa solicitudes y documentos; `/control/cotizaciones` muestra solicitudes de cotización; `/control/usuarios` crea administradores; `/control/configuracion` configura el asistente público. Cada módulo conserva los dos idiomas y carga solo la información que necesita.

La estructura protegida está en `app/control/(panel)/layout.tsx`. El inicio de sesión permanece fuera de ese grupo, en `/control/login`. Las páginas exigen sesión y las API siguen validando cada lectura y cambio. Los parámetros opcionales `section` de `/api/control` y `/api/itinerary` limitan los datos por módulo; las consultas anteriores sin ese parámetro mantienen su respuesta. No hay tablas ni variables nuevas.

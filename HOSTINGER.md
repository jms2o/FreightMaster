# Publicar Freight Master en Hostinger

Esta rama usa Next.js en Node.js 24 y MySQL. Conserva el video real, la experiencia con scroll, el icono del chat, las cotizaciones, los itinerarios y el acceso ID/PIN. La IA no está conectada.

## 1. Crear la aplicación

En hPanel: Sitios web → Añadir sitio web → Aplicación web Node.js → conectar GitHub → `jms2o/FreightMaster` → rama `main`. Selecciona Next.js, Node.js 24 y el dominio provisional gratuito de tu alojamiento. No es necesario comprar un dominio para esta prueba.

Ajustes del proyecto:

- Instalación: `pnpm install --frozen-lockfile` (se incluye `pnpm-lock.yaml`).
- Compilación: `pnpm run build`.
- Arranque: `pnpm start`.
- Raíz del proyecto: `/`.
- El puerto lo asigna Hostinger mediante `PORT`.

Si hPanel solicita un directorio de salida de Next.js, conserva la detección del framework (`.next`); no selecciones un despliegue solo de archivos estáticos.

## 2. Crear una base MySQL nueva

En el panel de ese sitio: Bases de datos → Administración. Crea una base y un usuario exclusivos de esta prueba. Usa los nombres completos con el prefijo que muestra Hostinger. Conserva la contraseña en tu gestor o en el panel; no la pegues en GitHub.

El servidor crea las tablas faltantes la primera vez que se consulta la base. Usa únicamente `CREATE TABLE IF NOT EXISTS`; no borra tablas ni importa datos de otros proyectos. No reutilices la base de TramitexFederal ni la de otro sitio.

## 3. Variables del servidor

Añádelas en la sección de variables de entorno de la aplicación y reinicia o despliega de nuevo. `.env.example` es una plantilla sin secretos.

| Nombre | Valor |
| --- | --- |
| `APP_URL` | URL HTTPS completa del dominio provisional, por ejemplo `https://TU-DOMINIO-PROVISIONAL`; sin barra final |
| `DB_HOST` | `127.0.0.1` para MySQL del mismo alojamiento Hostinger |
| `DB_PORT` | `3306` |
| `DB_NAME` | Nombre completo de la base nueva |
| `DB_USER` | Usuario completo de la base nueva |
| `DB_PASSWORD` | Contraseña que elegiste para esa base |
| `ADMIN_USERNAME` | Tu usuario administrativo; por defecto `admin` |
| `ADMIN_PASSWORD` | Tu contraseña única de 16 a 128 caracteres |

No uses el prefijo `NEXT_PUBLIC_` para estas variables. No hay credenciales de OpenAI ni se necesita una suscripción de API para esta versión.

El usuario y la contraseña administrativos se configuran en el servidor; no hay registro público de administradores. Las sesiones usan tokens aleatorios, se guardan mediante hash y expiran en una hora. Cambiar `ADMIN_USERNAME` o `ADMIN_PASSWORD` invalida las sesiones existentes. Los IDs de chofer se crean dentro del panel y sus PIN se almacenan con PBKDF2 y sal, nunca recuperables en texto.

## 4. Verificar el arranque

1. Abre `/`: deben aparecer la portada, el video y los servicios.
2. Abre `/api/health`: debe responder `ok: true`. Un 503 indica que falta configuración o que no se pudo conectar MySQL; no devuelve contraseñas.
3. Abre `/control`: debe llevarte a `/control/login`. Entra con las variables administrativas.
4. Crea dos choferes y asigna una parada distinta a cada uno. Comprueba que solo vean su propio itinerario.
5. Envía una cotización de prueba y confirma que aparece en el panel.
6. Desactiva un chofer y confirma que pierde el acceso a sus tareas.

Si la portada abre pero las escrituras devuelven 403, revisa que `APP_URL` coincida exactamente con el dominio HTTPS de la página. Si hay un error de MySQL, verifica los nombres completos, la clave y el host `127.0.0.1`.

## Archivos de video

Los videos están en partes pequeñas dentro de `assets/video-parts/` para evitar el límite de transferencia. `pnpm dev` y `pnpm run build` reconstruyen los MP4 automáticamente y comprueban SHA-256. También puedes ejecutar `pnpm media:restore`. No hay descargas externas ni diferencias en la película final.

## Límites de esta migración

No copia datos, sesiones ni contraseñas desde ChatGPT Sites. La aplicación publicada en ChatGPT Sites conserva su propia base y su funcionamiento. Esta copia elimina la confianza en las cabeceras de identidad de Sites y usa autenticación propia. El chat mantiene respuestas guiadas; no hay rastreo en vivo ni modelo generativo.

La comprobación con la base real de Hostinger y el dominio provisional se realiza después de introducir los datos de tu alojamiento en hPanel. Una compilación local no certifica la conexión de producción.

Referencias oficiales: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/ y https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/

## Instalación en pnpm 11

El repositorio fija pnpm 11.24.0 y contiene `pnpm-workspace.yaml` con una política explícita `allowBuilds`. La cadena de ESLint y Drizzle ya no forma parte de las dependencias de esta aplicación: no es necesaria para compilar Next.js ni para las consultas MySQL. Esto elimina las dependencias esbuild/unrs-resolver que bloqueaban el primer despliegue con `ERR_PNPM_IGNORED_BUILDS`. Se mantiene la autorización concreta de `sharp` para las versiones que ejecutan instalación nativa.

No se necesita ejecutar una aprobación interactiva en hPanel ni habilitar scripts para todos los paquetes. Conserva pnpm y vuelve a desplegar la versión nueva de `main`; reintentar una compilación fijada al commit anterior no incorpora esta corrección. Los avisos de actualización de pnpm y paquetes obsoletos no son el error que detuvo la instalación.

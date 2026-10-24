# Freight Master

## Ejecutar este respaldo de GitHub

Usa Node.js 24 y pnpm. Ejecuta `pnpm install` y luego `pnpm dev`; para compilar, `pnpm build`. Las funciones de base de datos y autenticación requieren el entorno de Cloudflare/Sites descrito más abajo.

Los dos videos están completos en `assets/video-parts/` porque la transferencia directa de archivos grandes se interrumpía. `dev` y `build` los reconstruyen automáticamente en `public/media/` y verifican SHA-256 antes de usarlos. También puedes ejecutar `pnpm media:restore`. No requieren descargas ni servicios adicionales. Los MP4 reconstruidos se ignoran en Git.

Este repositorio contiene código, migraciones y recursos; no contiene la base de datos hospedada, sesiones, IDs/PIN ni cotizaciones. La portada publicada conserva su alojamiento actual; copiar este código no configura otro despliegue automáticamente.

Sitio privado con portada de video real vinculada al scroll, explorador interactivo de servicios, cotizaciones persistentes y un mismo asistente con acceso de visitantes y choferes.

## Hostinger y variables de entorno

Esta copia usa Vinext y Cloudflare Workers. La base se obtiene mediante el binding `DB` de D1 y la administración depende de la identidad de ChatGPT Sites (`getChatGPTUser`). No hay claves de OpenAI, correo o base de datos para copiar a un `.env`; la IA no está conectada. El archivo `.openai/hosting.json` contiene la identidad/configuración de Sites, no contraseñas.

Para una vista independiente en Hostinger hay que adaptar el servidor al entorno elegido, reemplazar la conexión D1 y la autenticación administrativa, o preparar una demostración estática que señale qué funciones están deshabilitadas. Este respaldo todavía no incluye esa adaptación. Ninguna variable `.env` por sí sola reproduce los bindings de Cloudflare ni el inicio de sesión de ChatGPT. Los secretos de una adaptación futura deben configurarse en el panel del alojamiento y no en Git.

## Accesos

El sitio se despliega con acceso privado del propietario. Antes de cambiar la audiencia, el propietario debe abrir `/control`: esa primera visita autenticada asigna su cuenta como administradora. Las visitas siguientes y todas las APIs administrativas validan ese ID en servidor. No publicar el sitio para otras personas antes de completar esta inicialización.

En Administración se crean IDs y PIN de 6 a 12 dígitos, se activan/desactivan accesos y se consultan las cotizaciones. Los PIN usan PBKDF2 con sal; las sesiones de chofer duran una hora y se revocan en cada consulta al desactivar el ID. El PIN no se muestra ni se envía al navegador después del alta. Las credenciales se entregan al chofer por el canal privado que el equipo elija.

## Alcance del asistente

Es un asistente de respuestas guiadas; no está conectado a un modelo de IA ni a un sistema externo de cargas. Consulta solo las paradas y requisitos registrados en el panel para el chofer autenticado. No consulta posiciones en vivo ni envía incidencias al coordinador. Las solicitudes de cotización sí se guardan en D1 y se muestran en el panel. No se envían correos ni WhatsApp.

## Desarrollo y validación

Usar los scripts del starter para instalar y compilar. Las migraciones generadas están en `drizzle/`. No hay datos ni credenciales de prueba en las migraciones. Las bases local y hospedada son independientes.

Verificado: TypeScript, compilación Vinext, controles de escena, diseño de 390px, respuesta del asistente público y persistencia de una cotización en el entorno de prueba. La cuenta administrativa y el ciclo completo de IDs/PIN requieren la verificación autenticada del propietario en el sitio privado.

## Actualización de recorrido e itinerarios

La portada ahora usa video real de Jonathan David, Pexels: https://www.pexels.com/video/white-truck-driving-at-sunset-on-highway-33870727/ (licencia consultada: https://www.pexels.com/license/). Se extrajo un fragmento corto, se siguió el plano del remolque con homografía/flujo óptico y se compuso el logo respetando la iluminación. Hay recortes distintos para escritorio y móvil, fotogramas de portada y control de avance por scroll. Es una escena de stock ilustrativa, no una afirmación sobre la flota real de Freight Master.

Administración permite registrar/corregir/desactivar paradas por chofer, fecha y orden, con maniobra, dirección, hora, referencia, instrucciones y requisitos. El chat guiado consulta datos actuales del chofer autenticado, para hoy o mañana, en la zona de Tijuana/Mexicali. Los datos públicos de ubicación y seguridad se configuran por separado. No se inventan condiciones cuando faltan.

El dictado usa la función de reconocimiento de voz del navegador compatible, con revisión de texto antes del envío. No se almacenan notas de audio. No hay modelo generativo conectado: GPT-6 Luna se propuso como candidato a evaluar; requiere conexión y credenciales de API antes de implementarlo.

Seguridad: sesiones HttpOnly/Secure, verificación de chofer activo en cada consulta, parámetros SQL enlazados, selección de itinerario por identidad de sesión, APIs administrativas separadas, consultas de chofer solo de lectura, límite de cuerpo JSON y respuestas privadas sin caché. El texto del usuario no determina el ID consultado. `node --experimental-strip-types scripts/test-access.mjs` comprueba aislamiento, expiración y revocación con SQLite real. No es una auditoría completa ni una prueba de resistencia de un LLM que aún no está conectado. Antes de conectar IA, mantener autorización fuera del modelo, limitar funciones al contexto autenticado y evaluar inyección directa/indirecta siguiendo https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html.

La última compilación y las pruebas de acceso se completaron. La revisión visual final de esta actualización no se pudo completar porque el navegador de pruebas dejó de responder. El propietario debe revisar escritorio/móvil y el panel autenticado antes de cambiar la audiencia o usarlo en operación real.

## Renovación visual

Servicios permite elegir entre contenedores, mercancías y atención a empresas; cambia la información y el acceso a cotización o conversación. Se añadió una secuencia de preparación de solicitud, tarjetas de acceso con profundidad, una composición de cotización más marcada y reacciones de botones. IntersectionObserver revela secciones una sola vez y el desplazamiento mueve la banda tipográfica; no se añade reproducción continua. Las animaciones respetan prefers-reduced-motion y el contenido permanece disponible si JavaScript o IntersectionObserver no están disponibles. No se agregaron dependencias ni se modificaron las APIs o permisos.

Validación de esta renovación: TypeScript y compilación de producción; la revisión visual en navegador sigue pendiente por la indisponibilidad del navegador de pruebas.

## Identidad del asistente

`public/fm-assistant.svg` es un icono vectorial propio de esta interfaz: globo de conversación en vino, cabina de tráiler en marfil y acentos arena. Se utiliza en el lanzador fijo y la cabecera del chat. El botón conserva texto visible «Pregunta aquí / Clientes y choferes», nombre accesible y tamaño táctil de al menos 64px; respeta el área segura inferior en móvil. No se cambia el logo corporativo ni se añade IA.

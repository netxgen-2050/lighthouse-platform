# Proposal

## Why

Otra medida del plan de dogfooding es **"cero votos perdidos o duplicados (el libro de votos lo permite comprobar)"** (`NS_platform/Documentation/Desarrollo/2026-10-15 - Estrategia - dogfooding del Fogón.md`). El libro existe (`consulta_envios`, de solo agregar), pero hoy nadie del equipo lo puede ver: la persona solo ve su último reparto. Si alguien cambia su reparto tres veces, no tiene forma de confirmar que se guardó cada vez ni cuál es el que cuenta. Este cambio le da a cada persona un **comprobante** al guardar y el **historial de sus propios envíos** en cada consulta, para que pueda verificar su voto con sus propios ojos. Además, si algo se pierde, se puede reportar con datos concretos.

## What Changes

- **Comprobante al guardar**: después de "Guardar mi reparto", la pantalla dice "Tu reparto quedó guardado el <fecha> a las <hora> (hora de Argentina) · comprobante <código>". La hora es la que puso la base. El código son los primeros 8 caracteres del id del envío. Si el guardado falla, no hay comprobante y se ve el error de siempre.
- **Mis envíos en esta consulta**: una sección desplegable con cada envío propio, del más nuevo al más viejo: fecha y hora, código, votos por opción y créditos usados. El que cuenta se marca "Este es el que cuenta" (con texto). Los envíos con todo en 0 se muestran como "Sin votos".
- **Después del cierre**: la sección sigue visible y dice "Contó tu envío del <fecha y hora>". Si la persona no tenía envíos, o si el último estaba todo en 0 (vale el último, como en el resultado del grupo), dice "No repartiste en esta consulta".
- **Solo lo propio**: la API devuelve en la vista de la consulta los envíos de la persona que pregunta y de nadie más, en voto abierto y en voto secreto, también para el super admin.
- La fuente del navegador de `fogon-cuadratico` guarda también el historial de envíos propios, para que las pantallas se comporten igual.

**Decisiones por defecto** (Gus las puede cambiar): se muestran todos los envíos, sin límite (en el dogfooding son pocos); el código es corto y sirve para encontrar un envío en un reporte, no como prueba criptográfica.

**Fuera de alcance:**
- Descargar los votos propios desde "Mis datos" (pendiente: es decisión de Gus).
- Ver los envíos de otras personas, o el historial completo del libro para el super admin.
- Recibos firmados, hashes encadenados o verificación pública del libro.
- Borrar o anular un envío (el libro es de solo agregar).
- Tablas, columnas o migraciones nuevas.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: suma el comprobante al guardar un reparto y el historial de los envíos propios en cada consulta.

## Impact

Depende de `fogon-cuadratico` y de `fogon-cuadratico-en-la-base` (libro `consulta_envios` y `consulta_envio_votos`, `vista`, `guardarReparto`). Archivos: `lib/fogon/consultas/servidor.ts` (`misEnvios(consultaId, personaId)`; `guardarReparto` devuelve id y `registrado_at`), los tipos `VistaConsulta` (`misEnvios`) y el resultado de `guardarReparto`, la fuente del navegador, `app/fogon/consultas/[id]/` (comprobante y sección), `e2e/fogon-mis-envios.spec.ts` y `e2e/accesibilidad.spec.ts`. Sin rutas, tablas ni dependencias nuevas. **Toca datos personales (los votos de cada persona) y la respuesta de la API: necesita la revisión del arquitecto antes de aprobarse.**

# Proposal

## Why

Desde el login con Privy (PR #57) la plataforma identifica a cada persona, y con **Neon** (spec `base-neon`) sus datos van a vivir en un servidor. Eso activa obligaciones de protección de datos que el POC tiene que mostrar desde ya: consentimiento informado, información clara de qué se guarda y dónde, y los derechos de la persona. Contexto (decisión de Gus, 14-oct-2026): el responsable es **NetXGen, entidad registrada en Honduras**; las personas pueden estar en **Argentina** (Ley 25.326) o en **Europa** (RGPD); los datos se alojan en **Estados Unidos** (Vercel, Neon, Privy), lo que es una **transferencia internacional**. Los textos son **borrador** hasta que los revise Gabriel (pendiente R14).

## What Changes

- **Consentimiento al entrar por primera vez** (y cuando cambie la versión de la política): una pantalla, antes de usar la app con sesión, con el resumen en palabras simples y dos casillas obligatorias: "Leí y acepto la política de privacidad" y "Acepto los términos de uso del prototipo". Sin aceptar, la persona puede salir pero no usar la app con sesión (las páginas públicas de Descubrir siguen abiertas).
- **Registro del consentimiento**: versión de la política, fecha y hora, y qué se aceptó. Hasta `base-neon` se guarda en el navegador de la persona; con `base-neon` se guarda en la base (interfaz `registrarConsentimiento` ya preparada para ese cambio).
- **Consentimiento específico para datos sensibles**: al iniciar el KYC del Pasaporte, una casilla adicional para el tratamiento de datos de identidad, residencia fiscal y origen de fondos, con el aviso de que en la versión real los verifica un tercero (fiduciario o proveedor de KYC).
- **Página `/privacidad`** (pública, borrador, ⚖ `datos` y `transferencia` en el catálogo con `borrador: true`):
  - quién es el responsable (NetXGen, Honduras) y cómo contactarlo (email de contacto de ejemplo, a definir);
  - qué datos se tratan, por pantalla (email y billetera vía Privy; perfil, comunidades, pactos, Semillas, votos, compromisos, contactos, KYC, origen de la visita, reportes);
  - para qué, con qué base (consentimiento) y por cuánto tiempo;
  - **quiénes los procesan** (encargados): Privy (login y billetera), Vercel (hosting), Neon (base de datos, cuando exista), GitHub (reportes), y dónde (Estados Unidos);
  - los derechos: acceso, rectificación, supresión y retiro del consentimiento (Ley 25.326, arts. 14 a 16; RGPD para personas en Europa) y cómo ejercerlos.
- **Página `/mis-datos`** (con sesión; enlace desde Configuración y desde el menú del avatar):
  - **Descargar mis datos** (un archivo JSON con todo lo de esa persona);
  - **Retirar mi consentimiento**: cierra la sesión y borra los datos de esa persona en el navegador (con `base-neon`, también en la base);
  - **Pedir que borren mi cuenta**: en el POC envía un pedido al equipo por el mismo camino que Reportar (tipo "pregunta", etiqueta `privacidad`).
- Enlace **"Privacidad"** en el pie de todas las páginas.
- **Catálogo legal con borradores:** `lib/legal/terminos.ts` acepta `borrador: true` y el ⚖ muestra "Borrador: texto a revisar".

**Fuera de alcance:** política de privacidad definitiva y su revisión legal, registro ante autoridades (AAIP en Argentina), cláusulas con los encargados (DPA), cookies de analítica (no hay).

## Capabilities

### New Capabilities
- `privacidad-consentimiento`: consentimiento al entrar, consentimiento para datos sensibles, política de privacidad y derechos de la persona.

### Modified Capabilities

## Impact

`app/privacidad/`, `app/mis-datos/`, `components/sesion/` (pantalla de consentimiento dentro de la puerta), `lib/privacidad/` (versión de la política, registro del consentimiento, exportación), `lib/legal/terminos.ts` (borradores), el diálogo de KYC del Pasaporte, el pie, Configuración y el menú del avatar, e2e.

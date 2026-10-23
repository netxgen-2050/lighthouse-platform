# Proposal

## Why

En la revisión del 23-oct-2026 con Bertrand (consultor web3, no hispanohablante) quedaron pantallas en español con la plataforma en inglés. La auditoría de ese día (sobre `origin/dev` en `129a317`, después del PR #100) muestra tres causas:

1. **Producción (`main`, `8b3cb70`) todavía no tiene nada del idioma:** `idioma-base`, `idioma-portada-sumarte` e `idioma-tribus-territorio` están solo en `dev` (PR #100, 23-oct). Se arregla con la próxima entrega `dev` → `main`, no con código.
2. **Cinco zonas ya especificadas siguen sin implementar** (no hay que reescribirlas, solo priorizarlas): `idioma-fogon-mercado`, `idioma-pasaporte-semillas-pactos`, `idioma-perfil-recorrido`, `idioma-legal` e `idioma-hifa-avisos`.
3. **Pantallas que nacieron después de esas specs (15-oct) y no están en ninguna:**
   - **Consultas del Fogón:** `/fogon/consultas` y `/fogon/consultas/[id]` (`app/fogon/consultas/lista-consultas.tsx`, `app/fogon/consultas/[id]/consulta-cliente.tsx`, `resultado-grupo.tsx`, `components/fogon/error-lectura.tsx`, `components/donut.tsx` y los textos de `lib/fogon/consultas/`). `idioma-fogon-mercado` solo cubre `/fogon`.
   - **Cambios a un pacto** (de `pactos-proponer-cambio`, mergeado el 16-oct): retirar un pacto enviado, proponer un cambio, versión vigente, historial y los avisos "Quien administra … aceptó / no aceptó el cambio" (`app/pactos/pactos-cliente.tsx`). `idioma-pasaporte-semillas-pactos` no los nombra.
   
   Sin esto, el test de cobertura de `idioma-hifa-avisos` ("Toda la plataforma traducida salvo lo interno") falla o obliga a sumar excepciones.

Además, cada pantalla nueva que no nace bilingüe vuelve a abrir el hueco. Hay que fijarlo como regla.

## What Changes

- **Consultas del Fogón en inglés:** lista de consultas, consulta (votar, padrón, voto abierto o secreto, cierre), resultado por grupo, gráfico de dona (nombre accesible y leyenda), errores de lectura y estados. Los títulos y descripciones de las consultas de ejemplo pasan a `Bilingue` con `original: "es"` ("Translated from Spanish"); lo que escribe la persona no se traduce. `/fogon/consultas` y `/fogon/consultas/[id]` se suman a `RUTAS_TRADUCIDAS`.
- **Cambios a un pacto en inglés:** retirar, proponer cambio, borrador del cambio, versión vigente, historial, avisos de aceptación o rechazo (también los anuncios para lector de pantalla) y los eventos de la bandeja que generan (con tipo y datos, la regla de `idioma-perfil-recorrido`).
- **Regla para lo que venga:** toda pantalla o texto nuevo de la interfaz nace en los diccionarios, con español e inglés; una ruta nueva navegable entra a `RUTAS_TRADUCIDAS` en el mismo cambio que la crea, o queda explícitamente como interna. Los cambios en curso que van a sumar pantallas (por ejemplo, el rediseño holocrático del Fogón, el directorio "Nos conocemos" y `sumarte-periodo-coherente`) la cumplen.
- **Orden sugerido para las noches** (sin reescribir esas specs): `idioma-fogon-mercado` → este cambio (consultas) → `idioma-pasaporte-semillas-pactos` → este cambio (pactos) → `idioma-perfil-recorrido` → `idioma-legal` → `idioma-hifa-avisos` (cierra con el test de cobertura).

**Fuera de alcance:** `/netx` y `/panel/bitacora` (internas, siguen la excepción de `idioma-hifa-avisos`, incluido `components/sesion/panel-personas.tsx`); revisión por hablante nativo; traducción automática de lo que escribe la persona; la entrega `dev` → `main` (la decide Gus).

## Capabilities

### New Capabilities
- `idioma-cobertura`: las pantallas que quedaron fuera de las zonas de idioma (consultas del Fogón y cambios a un pacto) en inglés, y la regla de que toda pantalla nueva nace bilingüe.

### Modified Capabilities

## Impact

`lib/idioma/textos/` (diccionario nuevo `fogon-consultas.ts` o dentro del de Fogón si `idioma-fogon-mercado` ya lo creó; textos de pactos dentro del de `idioma-pasaporte-semillas-pactos`), `lib/idioma/rutas.ts` y su test, `app/fogon/consultas/**`, `components/fogon/error-lectura.tsx`, `components/donut.tsx`, `lib/fogon/consultas/ejemplo.ts`, `app/pactos/pactos-cliente.tsx`, `lib/pactos/*`, `lib/idioma/revision-nativa.ts`. Depende de `idioma-base` (ya en `dev`). Sin dependencias nuevas.

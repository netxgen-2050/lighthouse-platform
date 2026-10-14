# ADR-001 · La base es Postgres híbrida (tablas + JSON) con libros de solo agregar para lo que tiene valor

- **Estado:** Propuesta (Gus eligió esta opción el 2026-10-14; pasa a Aceptada en su merge)
- **Fecha:** 2026-10-14
- **Cambio OpenSpec relacionado:** `base-neon` (primero), luego `aprobaciones-admin` y `datos-en-la-nube`

## Contexto
El POC guarda todo en el navegador. Para que las personas compartan datos (adhesiones, pactos, votos, Semillas) pasamos a Postgres en Neon, contratado desde Vercel. Antes de la primera tabla hay que decidir cómo se organiza la base, porque cambiar la forma después, con datos reales adentro, cuesta varias noches de migración.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Relacional clásica (una tabla con columnas por cosa) | La base garantiza todas las reglas; reportes fáciles; patrón de netxgen-platform | Cada campo nuevo del perfil es una migración; rígida para contenido variable |
| B · Híbrida: tablas para lo que se relaciona o se aprueba, `jsonb` para el contenido que cambia de forma | Iteramos rápido el POC; lo importante sigue garantizado por la base; mudar desde el navegador es casi directo | Lo que está en JSON se valida en la app, no en la base; riesgo de "todo en JSON" sin disciplina |
| C · Event sourcing (todo es un evento; el estado se calcula) | Historia completa y auditable | Mucho más complejo de construir y consultar; sobredimensionado para el POC |
| D · No decidir todavía (seguir en el navegador) | Cero trabajo hoy | Bloquea aprobaciones entre personas, el panel de roles y el resto del MVP |

## Decisión
**B, con libros de solo agregar donde hay valor o peso legal** (la parte buena de C, sin hacer todo event sourcing):
- **Libros** (filas que nunca se editan ni se borran): `semillas_movimientos` (congeladas al emitir), `votos`, `bitacora` (qué textos legales se le mostraron a cada persona), `cambios_de_rol`, `eventos` y `checkins`.
- **Garantías en la base, no en un `if`:** únicos (email, un voto por persona y decisión, una membresía por persona y comunidad), claves foráneas, estados como enum y aprobaciones dentro de transacciones.
- **`jsonb` solo para contenido sin valor ni permisos:** perfiles, preferencias, texto de manifiestos. Nada sensible en `jsonb`.
- **Datos sensibles aparte:** `kyc_resultados` (solo el resultado, nunca documentos) y `evaluaciones`, con acceso solo desde rutas del servidor que verifican el rol.

## Consecuencias
- Ganamos velocidad en el POC sin perder garantías donde importan (aprobaciones, votos, Semillas).
- Aceptamos validar el JSON en la app con funciones puras y tests, y revisar en cada PR que lo importante no termine en `jsonb` (checklist de la skill `base-de-datos`).
- "Borrar mi cuenta" en un libro es **anonimizar**, no borrar filas: hay que diseñarlo antes de prometerlo.
- Revisar esta decisión si un campo de `jsonb` empieza a usarse para filtrar, contar o dar permisos (pasa a columna), o antes de anclar Semillas en blockchain.

## En palabras simples
La base tiene tres cajones. Las **planillas** (tablas) guardan lo que hay que aprobar y contar, y la base no deja romper sus reglas: nadie vota dos veces. Las **fichas** (JSON) guardan lo que cambia seguido, como el perfil, sin tocar la base cada vez. Los **libros de actas** guardan las Semillas y los votos: solo se agregan renglones, nunca se tachan, así cualquiera puede ver qué pasó.

## Fuentes
- `NS_platform/Documentation/backend/02 - Modelo de datos (propuestas).md` (las tres propuestas y el esquema borrador).
- `NS_platform/Documentation/backend/05 - Tipos de bases de datos (guía).md`.
- `NS_platform/Documentation/backend/01 - Inventario de datos del POC.md`.
- netxgen-platform `CLAUDE.md`: "las garantías fuertes van en la base, no en un `if`".
- `NS_Tokenomics`: Semillas congeladas al emitir.

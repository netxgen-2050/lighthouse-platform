# Design

## Context

- El Fogón de decisiones (`fogon-decisiones`) vive en el navegador (`lib/fogon/`, clave `lh-fogon`). `fogon-limpieza` le saca la asamblea y deja `EJEMPLOS_COMUN`.
- Las 12 tribus están en `lib/tribus/datos.ts` (4 vacantes, el resto activas o en formación). Fundación Avelan Kerum ya trae `areas`.
- La membresía aceptada de una persona ya existe en el navegador (`lib/membresia/`). La tribu que lidera, en Sumarte (`liderar-varias-tribus`).
- Las consultas cuadráticas tienen su propio modelo y van a la base con `fogon-cuadratico-en-la-base`, que se enmienda aparte (23-oct-2026) con el ámbito.
- Se está preparando un ADR de attestations (EAS u otro); este cambio no depende de él, pero guarda los registros con su forma para que la migración sea copiar filas.

## Goals / Non-Goals

**Goals:**
- Que la estructura se entienda de un vistazo y también sin ver (lista anidada).
- Un modelo de datos de gobernanza chico y puro (`lib/gobernanza/`), testeable, que después pueda ir a la base sin cambiar las pantallas.
- Registros de validación con forma de attestation desde el día uno.

**Non-Goals:**
- Elegir representantes, quórums reales o reglas del consejo.
- Base de datos, firmas, blockchain.

## Decisions

1. **Modelo en `lib/gobernanza/`:**
   - `Nodo = { tipo: "comun" | "tribu" | "circulo" | "consejo"; id; nombre; padreId? }`. El común es la raíz, las tribus cuelgan del común, los círculos de su tribu; el consejo es un nodo aparte con `lugares: { tribuId, representante: string | null }[]` (null = "Sin representante elegido", nunca un nombre inventado).
   - Círculos de ejemplo en `lib/gobernanza/datos.ts`, marcados como ejemplo; los de Avelan Kerum salen de sus `areas`.
   - Alternativa descartada: meter los círculos dentro de `Tribu` (mezcla datos del directorio con gobernanza y obliga a tocar el mock-up).
2. **Registro con forma de attestation** (`lib/gobernanza/registros.ts`):
   `Registro = { id; esquema: "valida-tribu" | "valida-persona" | "lleva-al-consejo" | "revoca"; afirma: string; sobre: string; apuntaA: string | null; cuando: string; datos: Record<string, string> }`.
   Se guardan en una lista de solo agregar en el navegador (clave nueva en `lib/demo/claves.ts`). "Revocado" se calcula: un registro está revocado si existe un `revoca` que apunta a él. Así el registro es copiable 1 a 1 a una tabla de la base o a una attestation real (schema, attester, recipient, refUID, revocation).
   Alternativa descartada: un booleano `revocado` editable (rompe la regla de libros de solo agregar de ADR-001 y no se puede auditar).
3. **Ámbitos del Fogón:** `Ambito = "circulo" | "tribu" | "comun" | "consejo" | "fideicomiso"`. Las decisiones del común son `EJEMPLOS_COMUN` con `ambito: "comun"` y requisito `ninguno`. La decisión de consejo de ejemplo lleva `origen: { tribuId, aprobadaEn }`.
4. **"Llevar al consejo"** crea un registro `lleva-al-consejo` y una copia de la decisión con ámbito `consejo` y `origen`; solo lo ve quien lidera la tribu de origen (dato de Sumarte). Votar en el consejo es simulado y abierto a quien mira (prototipo); el texto aclara "En la versión real votan los representantes".
5. **Gráfico en SVG propio** (círculos concéntricos: común al centro, tribus en anillo, círculos como satélites; consejo como una banda aparte con sus lugares). Cada nodo tiene texto visible; el estado de la tribu se dice con palabra e ícono, no solo color. Debajo, la lista anidada `<ul>` con la misma información; en menos de 640 px se muestra solo la lista. Alternativa descartada: librería de grafos (dependencia nueva para un dibujo estático).

## Risks / Trade-offs

- [Se lee como gobernanza ya decidida] → aviso "Estructura de ejemplo: el reglamento lo define el diseño legal" con ⚖ `borrador: true`.
- [12 tribus con círculos no entran en un celular] → solo lista en pantallas chicas.
- [El consejo por tribu choca con el diseño legal B (asambleas de series, Voz de la Tierra)] → el consejo se presenta como coordinación de comunidades, no como órgano del fideicomiso; el ámbito Fideicomiso sigue aparte.

## Migration Plan

Sin base: solo código y datos de ejemplo. Al ir a la base (`datos-en-la-nube`), `Registro` pasa a una tabla de solo agregar con las mismas columnas.

## Open Questions

- Nombres finales de los círculos por tribu: se pueden cambiar en `lib/gobernanza/datos.ts` sin tocar specs.

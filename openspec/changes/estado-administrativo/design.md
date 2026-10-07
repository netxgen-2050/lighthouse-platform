# Design

## Context

`territorio-macrolote` deja en `/territorios/[id]` un mapa con las fincas de Soluna (propiedades `numero`, `superficie_m2`, `estado`) y una ficha lateral con "Consultar por este lote". La regla C1 (Desarrollo/03) pide un componente obligatorio en toda vista con lotes y un flag `aprobacion_municipal` por proyecto. No hay base de datos: el dato es estático.

## Decisions

- **Dato:** `lib/legal/estado-administrativo.ts` exporta `ESTADOS_ADMINISTRATIVOS` (objeto por id de proyecto, hoy solo `soluna`) con tipo `EstadoAdministrativo = { proyecto; titular; estado; norma; expediente?: string; aprobacionMunicipal: boolean; actualizado: string }`. `expediente` opcional: si falta, el componente escribe "sin dato".
- **Acciones:** `accionesDeLote(id): Array<"consultar" | "comprar" | "reservar">`. Con `aprobacionMunicipal: false` devuelve `["consultar"]`. Con `true` también devuelve `["consultar"]` en este cambio (habilitar la compra es otro cambio); el test lo deja escrito.
- **Componente:** `components/estado-administrativo.tsx`, servidor (sin estado), props `{ proyecto: "soluna"; compacto?: boolean }`. `<section aria-label="Estado administrativo">` (completo) o `<p role="note" aria-label="Estado administrativo">` (compacto). Ícono decorativo `aria-hidden` + texto. Colores `bg-warn-bg` / `text-warn-ink` / `border-faint`, como `AvisoEjemplo`.
- **Lista de vistas:** `VISTAS_CON_LOTES = ["/territorios/lighthouse"] as const`. El e2e la importa y, por cada ruta, espera `getByRole("region", { name: "Estado administrativo" })`.
- **Borrador:** si falta, `terminos.ts` pasa a un tipo `Termino = { titulo: string; texto: string; borrador?: true }` con `satisfies Record<string, Termino>`, y `TerminoLegal` agrega una línea "Borrador: texto a revisar" al final de la explicación. Es el mismo diseño que `privacidad-consentimiento`; si ese cambio entra primero, se reutiliza lo suyo.
- **Texto del ⚖ `loteo` (borrador):** "Los lotes de Chacras de Soluna son de BioPueblo. Su loteo está en trámite según la Ordenanza 173/2026 de Mainqué: hasta que el municipio lo apruebe no se pueden reservar, señar ni comprar. Lo que ves acá es informativo. NetX actúa como agencia y publica el número de expediente cuando exista."

## Risks / Trade-offs

- [Choque entre "Consultar por este lote" y la Ordenanza 173, que prohíbe ofrecer y publicitar lotes no aprobados] → el cambio no lo resuelve: muestra el estado y deja el botón como lo decidió Gus en `territorio-macrolote`. Queda como pregunta para Gabriel.
- [El registro de vistas depende de que alguien sume la ruta] → se agrega una línea al checklist de PR en el reporte: "¿Tu vista muestra lotes? Sumala a `VISTAS_CON_LOTES`".
- [El texto del ⚖ `biopueblo` del mock-up dice que los lotes "no se ofrecen en esta plataforma", lo que ya no es cierto desde la decisión de agencia] → no se copia; se usa `loteo` (borrador).

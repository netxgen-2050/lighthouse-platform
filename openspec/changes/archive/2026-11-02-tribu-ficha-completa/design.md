# Design

## Context

`app/tribus/[id]/page.tsx` es un componente de servidor con `generateStaticParams` para las 12 tribus. Los datos (`lib/tribus/datos.ts`) dejaron afuera `cap`, `hum`, `avales` y `fit` del mock-up (decisión de `tribus-directorio`, anterior a la fase de prototipo interno). `/sumarte` ya tiene un `Medidor` local con el formato "USD 46.000 de USD 75.000 · 61%" y la barra `aria-hidden`.

## Decisiones

1. **Campos nuevos obligatorios** en `Tribu`: `plata: { comprometida: number; meta: number }`, `roles: { cubiertos: number; necesarios: number }`, `avales: number`. Se copian de las 12 tribus del mock-up; el test de datos compara contra los valores del mock-up (por ejemplo `valle` = 310.000 / 480.000, 9 / 14, 5). En los vacantes, `comprometida` y `cubiertos` son 0 porque **así está en el ejemplo** (no hay tribu todavía), no por falta de dato.
2. **`components/medidor.tsx`** (sin estado, sirve en servidor y cliente) con la misma firma que el `Medidor` de Sumarte; `app/sumarte/sumarte-cliente.tsx` lo importa en lugar del local. El formateo de miles se sigue tomando de `miles` en `lib/sumarte/datos.ts`. Así los dos lugares dicen los números igual.
3. **Acciones simuladas en un componente cliente chico** (`app/tribus/[id]/acciones.tsx`) que recibe si `/pactos` existe (calculado en el servidor con `destinosDisponibles()`) y maneja el texto de la región `aria-live`. El resto de la ficha sigue en el servidor.
4. **Textos:** los de `V.tribu` del mock-up v6. El mensaje de la sala es el del toast del mock-up ("Abriríamos la sala de la tribu en Telegram. Podés salir cuando quieras.") y el de "Proponer mi tribu" el suyo ("Abriríamos el formulario para proponer una tribu (simulado)."). No hay textos legales nuevos fuera del mock-up, así que no hace falta `borrador: true`.
5. **Tests viejos:** el test e2e "sin plata ni avales en pantalla (listado y las 12 tribus)" se reduce al listado `/tribus`. Los requisitos equivalentes en las specs de `tribus-directorio` ("sin monto en USD ni avales") y `accesibilidad-auditoria` ("no amount in USD and no endorsements on any of the 12 tribe pages") quedan **reemplazados** para las fichas por este cambio. Como todavía no hay specs archivadas en `openspec/specs/`, este cambio no usa deltas `MODIFIED`/`REMOVED`; al archivar, hay que quitar esos dos requisitos de las specs vigentes.

## Riesgos

- Conflicto con cualquier cambio en curso que toque `app/tribus/[id]/page.tsx` o `e2e/tribus.spec.ts`: hoy no hay ninguno en la integración de esta noche.
- Si `pactos-tribu` todavía no está en `main`, el botón "Proponer mi pacto" no aparece; cuando entre, aparece solo (lo decide `lib/navegacion.ts`).

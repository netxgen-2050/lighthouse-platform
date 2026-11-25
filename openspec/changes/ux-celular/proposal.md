# Proposal

## Why

La auditoría UX del 25-nov-2026 (hallazgos H3 y H12) mostró que en el celular la app no se siente una app: el menú es una hamburguesa con la palabra "Menú" arriba, dos botones flotantes (reportar un error, con anillo punteado, y la HIFA) tapan el texto de Inicio a 390 px, y el selector ES/EN pesa lo mismo que "Sumarte". Las apps de referencia de la dirección elegida (Airbnb, Family, Rainbow) llevan los destinos abajo, al alcance del pulgar.

Segundo cambio de la serie `ux-*` (dirección B + C, Gus, 25-nov-2026). Va apilado sobre `ux-base`.

## What Changes

- **Barra inferior en el celular** (menos de 768 px): cinco pestañas con ícono y etiqueta (Inicio, Explorar, Participa, Invertir, Mi tierra) y una sexta, **Más**, que abre una hoja con Bien común, Sumarte, los destinos de la persona y Admin (si es super admin). Reemplaza al botón "Menú" de la barra superior.
- **Barra superior del celular más limpia:** marca "Lighthouse" a la izquierda; a la derecha "Sumarte" (o el avatar con sesión). El selector de idioma sale de la barra superior en el celular y en compu y pasa al menú del avatar, a la hoja Más y a Configuración.
- **Un solo botón flotante:** "Reportar un error" deja de flotar a mitad de pantalla. En compu pasa a un botón chico en la barra superior; en el celular, a la hoja Más. Queda flotante solo la HIFA, por encima de la barra inferior y sin tapar contenido.
- **Hojas** (`components/ui/hoja.tsx`): panel que sube desde abajo, con asa, foco atrapado, Escape y deslizar hacia abajo para cerrar. Lo usa Más y lo reutilizan `ux-explorar` y `ux-sumarte`.

## Fuera de alcance

- El rail de compu (ya lo cambia `ux-base`).
- El contenido de la HIFA y del formulario de reporte: solo cambia dónde se abren.
- El login (PR #217).

## Capabilities

### New Capabilities
- `ux-celular`: barra inferior, hoja Más, un solo botón flotante y selector de idioma fuera de la barra superior.

## Impact

- **Cambia:** `components/barra-superior.tsx`, `components/menu-celular.tsx` (se reemplaza), `components/menu-persona.tsx`, `components/selector-idioma.tsx` (nueva variante en lista), `components/boton-reportar.tsx` (disparador), `components/hifa/hifa.tsx` (posición), `app/layout.tsx`, `lib/navegacion.ts` (qué destinos van en la barra y cuáles en Más).
- **Nuevo:** `components/barra-inferior.tsx`, `components/ui/hoja.tsx` y tests.
- **Tests:** `components/menu-celular.test.tsx` (se reemplaza), `lib/navegacion.test.ts`, `e2e/marco.spec.ts`, `e2e/idioma.spec.ts`, `e2e/hifa.spec.ts`, `e2e/reportes.spec.ts`, `e2e/accesibilidad.spec.ts`.
- **Sin** tablas, datos personales ni dependencias nuevas.

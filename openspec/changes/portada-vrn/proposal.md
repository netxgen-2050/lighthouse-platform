# Proposal

## Why

Quien llega de cero a la portada hoy lee "Encontrá tu tribu" y ve una tarjeta del Congreso cancelado. La fase 1 (ADR-028) pide otra cosa: que entienda qué promete Lighthouse VRN y por qué, y que llegue a los lotes.

## What Changes

- **Nueva narrativa en `/`, en español e inglés:**
  - **La promesa a 2030:** regeneración desde el agua en el corazón de Vaca Muerta, trabajo en industrias regenerativas, y comunidad.
  - **Argentina** como lugar seguro y abierto, con su ⚖ sobre los límites a extranjeros en tierra rural.
  - **Los cinco capitales de la regeneración.**
  - **Llamado principal:** "Ver los lotes", a `/lotes`.
- **Cifras con fuente:** toda cifra sale de un módulo donde la fuente es obligatoria. Sin fuente, la cifra no entra.
- **"Por dónde empezar":** sale la tarjeta del Congreso y entra la de los lotes; las tarjetas pasan a Lotes, Territorio y Tribus.
- **`?camino=`:** acepta `lotes`, `territorio` y `tribus`. Un enlace viejo con `congreso` o `perfil` deja de marcar tarjeta, sin fallar.

## Fuera de alcance

- **Lighthouse SMA:** nada. Tampoco otros nodos del corredor (San Martín de los Andes, Atlántico Sur).
- **El deck de inversores** (USD 111M, TIR, recupero) y la nota de las "300 razones" (`NS_permacultura` 17).
- **Retirar `/congreso`** (D16): solo deja de tener tarjeta en la portada.
- **Inventar o buscar cifras de Argentina o de Vaca Muerta:** no hay ninguna con fuente en la documentación. La página funciona sin ellas, y las que traiga Gus se suman con una línea de datos.
- **Mostrar precio:** la portada lleva a los lotes, sin repetir el precio.
- **Abrir la plataforma afuera** (R14): sigue siendo el prototipo, con su aviso.

## Capabilities

### New Capabilities
- `portada-narrativa`: la promesa de Lighthouse VRN a 2030, Argentina, los cinco capitales y las cifras con fuente.

### Modified Capabilities
- `portada-caminos`: cambian los tres caminos y su descripción; sale el héroe del mock-up.
- `portada-origen`: cambian los valores de `camino`.

## Impact

- **Código nuevo:** `lib/portada-vrn.ts`.
- **Código que cambia:** `app/page.tsx`, `lib/portada.ts`, `lib/origen/origen.ts` (`CAMINOS_VALIDOS`), `lib/idioma/textos/portada.ts`, `lib/legal/terminos.ts` (`en` de `ribera`).
- **Tests:** `lib/portada.test.ts`, `lib/origen` (si lo cubren), `e2e/portada.spec.ts`, `e2e/idioma-portada-sumarte.spec.ts`, `e2e/descubrir-publico.spec.ts`, `e2e/accesibilidad.spec.ts`.
- **Sin** tablas, migraciones, permisos ni dependencias nuevas. Un `lh-origen` viejo con `camino: "congreso"` se sigue leyendo: el camino se ignora y el origen vale.
- **Depende de** `lote-ficha-y-compra` (`/lotes`). No hace falta para la reunión del lunes 9-nov: va después de la noche 4.
- **Se pisa con** `idioma-portada-sumarte` (5/6), en los mismos archivos: conviene cerrar aquel primero.
- **Revisión de arquitectura:** no toca base, pagos ni permisos. Tiene texto con peso legal sobre extranjeros y tierra, que va en ⚖ en borrador.

# Proposal

## Why

Quien invierte pregunta "¿qué financio, cómo me devuelven y qué riesgo hay?". Hoy la respuesta está repartida entre `/netx/financiamiento` (largo, del diseño B, con la sección del Token Inversor que suma `token-inversor-y-coherencia`), la calculadora "Los números del barrio" de `/bien-comun` y la sección Invertir de Sumarte. El lienzo "Lighthouse · direcciones visuales" (23-nov-2026) traduce el **pool** de DeFi a un **barrio en financiamiento** y el **explorador de transacciones** a un **libro del barrio**, con la dirección **C · Terminal solar**: indicadores, una curva de devolución y una tabla de movimientos con números en monoespaciada. Y fija una regla: **nunca un rendimiento anual**, solo plazo y forma de devolución.

Es el **quinto de los cinco cambios** del pedido `rediseno-defi-tierra`. Depende de `rediseno-sistema-visual`, `rediseno-menu-cinco`, `bien-comun-numeros-barrio` y `token-inversor-y-coherencia`.

## What Changes

- **Destino nuevo `/invertir`**, bilingüe, **solo con sesión** hasta la revisión R14 (mismo criterio que "Los números del barrio"); sin sesión, un aviso para entrar y ningún número.
- **Barrios en financiamiento:** hoy uno, Barrio Norte. Por barrio:
  - **Indicadores:** meta de la obra (la infraestructura que traería el Token Inversor), cuánto se juntó ("sin dato": no hay plata real), mes en que se terminaría de devolver si el inversor cobra con las cuotas (o "no en 6 años") y la parte de cada pago que va al común.
  - **Curva de devolución:** cuánto se le devolvió al inversor, acumulado mes a mes, frente a lo que trajo, calculada con `lib/bien-comun/barrio.ts`. Gráfico accesible con una tabla equivalente.
  - **Libro del barrio:** los movimientos del fideicomiso del caso de ejemplo, por trimestre (cuotas que entran, lo que se devuelve al inversor, lo que va al común), con "mes N" en lugar de fechas inventadas.
  - **Cómo funciona, en tres líneas:** qué financia, cómo cobra (a medida que entran las cuotas), por qué no hay fecha fija; con los ⚖ `tokeninversor` y `fideicomisobarrio`.
- **Sellos:** "Propuesta v0.1 · en discusión", "Prototipo interno · datos de ejemplo", "venta simulada · aprobación municipal pendiente" y "No es una oferta" (con ⚖ `nooferta`, borrador).
- **Enlaces** a `/bien-comun` (la propuesta y la calculadora) y, para quien tiene permiso, a `/netx/financiamiento`.
- **"Invertir" aparece en el menú** (la lista única pasa `/invertir` a `existe: true`).
- **Test de "sin rendimiento"** sobre los archivos de Invertir.

## Fuera de alcance

- Invertir de verdad: ningún botón de invertir, reservar un ticket, firmar o pagar. Ningún cobro, oferta pública ni KYC.
- Mostrar un rendimiento anual, TIR, ganancia o recupero.
- Mover o borrar la sección Invertir de Sumarte o `/netx/financiamiento` (siguen como están).
- Fideicomisos de otros barrios, Lighthouse SMA o el deck de inversores.
- Editar `NS_Tokenomics` o `sim/barrio_stack_sim.py`.

## Capabilities

### New Capabilities
- `invertir`: el destino Invertir con los barrios en financiamiento, la curva de devolución y el libro del barrio.

### Modified Capabilities
- Ninguna spec vigente cambia de requisito.

## Impact

- **Nuevo:** `app/invertir/page.tsx` y sus componentes (incluida la curva en SVG), `lib/invertir/barrios.ts` (arma indicadores, curva y libro desde `lib/bien-comun/barrio.ts`) y su test, `lib/invertir/sin-rendimiento.test.ts`, `lib/idioma/textos/invertir.ts`, `e2e/invertir.spec.ts`.
- **Cambia:** `lib/navegacion.ts` (`/invertir` existe), `lib/lotes/sin-numeros-escritos.test.ts` (vigila `app/invertir/` y `lib/invertir/`).
- **Sin** tablas, migraciones, permisos nuevos (solo pide sesión, como la calculadora), integraciones, datos personales ni dependencias nuevas.

## Decisiones de Gus (23-nov-2026)

- **Prima objetivo:** se muestra, como en `/netx/financiamiento`: "objetivo · ejemplo · en discusión, no es una promesa", leída del módulo y solo con sesión.
- **Curva completa:** las dos líneas hasta el final, como caso de ejemplo y solo con sesión. El mes en que se termina de devolver se muestra; la regla de no mostrar el recupero vale para la portada y las páginas públicas.
- **"No es una oferta"** lleva ⚖, como término legal en borrador.
- **`/invertir` es pública:** sin sesión muestra el aviso para entrar y ningún número, como la calculadora de `/bien-comun`.

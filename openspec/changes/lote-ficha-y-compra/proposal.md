# Proposal

## Why

Con `loteo-norte-7a` los lotes se ven en el mapa, pero la fase 1 (ADR-028) necesita mostrar qué se compra y cómo: la ficha de cada lote y el recorrido completo, de punta a punta, sin que nadie pague nada. Es lo central para la reunión del lunes 9-nov.

## What Changes

- **Un solo módulo con versión, `lib/lotes/modelo.ts`** (`VERSION_MODELO_LOTES`), como `lib/series`. Valores, todos de ejemplo: `precioReferencia` USD 500.000 por familia como mínimo, igual para todos los lotes (el precio, además, [NC, Franz]); `aporteUnico` 5 % del precio; `expensaAnual` USD 3.000; `presupuestoComunAnual` USD 240.000. Infraestructura, casa y parte del dueño: "sin dato". **Ningún número de estos se escribe en una pantalla**, y un test lo vigila.
- **`/lotes`:** la lista de lotes, con estado administrativo. El destino "Lotes" del rail pasa a `existe: true`.
- **`/lotes/[id]`, la ficha:** superficie; precio de referencia marcado de ejemplo; estado (disponible, reservado, vendido); derechos y deberes; costos, aporte y expensas; estado administrativo.
- **Opción "con casa":** casa de referencia de 170 m² (borrador de Martín), precio "sin dato".
- **Flujo simulado:** reservar → pago simulado → boleto de ejemplo con ⚖ en borrador, claramente simulado, guardado en el navegador como los demás flujos. Se puede deshacer.
- **"Hablar con alguien":** usa `lib/contactos`, con un motivo nuevo para no decir que atiende BioPueblo.
- **Mapa:** el panel del lote enlaza a su ficha y refleja lo que la persona reservó.
- **⚖ nuevos en borrador, es/en:** `precioreferencia`, `aporteunico`, `expensas`, `derechosdeberes` y `boletoejemplo`.

## Fuera de alcance

- **Pasarela, cobro y KYC real:** sin ninguno de los tres. **Tampoco se usa el diálogo KYC simulado:** el flujo no necesita identidad, y sumarlo pediría el consentimiento de datos sensibles para un recorrido que no guarda ningún dato de identidad.
- **Nombre, documento o domicilio en el boleto:** no se piden ni se guardan. El comprador figura como "Persona de ejemplo".
- **Seña y cuotas:** no hay valor; no se inventa.
- **Si el aporte va dentro del precio o se suma:** no hay dato. Se muestran por separado, sin total (ver preguntas).
- **Quién vende:** en la ficha y en el boleto, "sin dato".
- **La página del híbrido y las lecciones:** son `modelo-hibrido-procomun`. El módulo ya las calcula.
- **Tablas o guardar reservas en la base:** todo vive en el navegador.
- **Lighthouse SMA y deck de inversores.**
- **Propiedad, títulos o escritura reales:** los derechos y deberes son un borrador.

## Capabilities

### New Capabilities
- `modelo-lotes`: los valores de ejemplo de los lotes en un solo módulo con versión, y sus cálculos.
- `lotes-ficha`: la lista `/lotes` y la ficha de cada lote, con "con casa" y "hablar con alguien".
- `lotes-compra-simulada`: reservar, pago simulado y boleto de ejemplo, guardados en el navegador.

### Modified Capabilities
- `estado-administrativo`: "Registro de vistas con lotes" suma `/lotes` y la ficha.
- `descubrir-publico`: "Descubrir sin sesión" suma `/lotes` y `/lotes/[id]`.
- `contactos-bandeja`: suma el motivo de consulta por un lote de Lighthouse VRN.

## Impact

- **Código nuevo:** `lib/lotes/modelo.ts`, `lib/lotes/compra.ts`, `lib/idioma/textos/lotes.ts`, `app/lotes/page.tsx`, `app/lotes/[id]/page.tsx`, `app/lotes/[id]/compra-cliente.tsx`.
- **Código que cambia:** `lib/navegacion.ts`, `lib/sesion/rutas-publicas.ts`, `lib/legal/vistas-con-lotes.ts`, `lib/legal/terminos.ts`, `lib/demo/claves.ts` (clave `lotes`, que también entra en la descarga de `/mis-datos` y en "Borrar todo"), `lib/contactos/tipos.ts`, `lib/idioma/textos/sumarte.ts`, y el panel del lote en `app/territorios/[id]/`.
- **Tests:** `lib/lotes/*.test.ts`, `lib/navegacion.test.ts`, `lib/sesion/rutas-publicas.test.ts`, `lib/demo/claves.test.ts`, `e2e/lotes.spec.ts`, `e2e/estado-administrativo.spec.ts`, `e2e/accesibilidad.spec.ts`.
- **Sin** tablas, migraciones, pedidos de red nuevos ni dependencias. **Sin** dato personal nuevo: ver design §5, que el arquitecto tiene que confirmar frente a ADR-017.
- **Depende de** `venta-lotes-regla` y `loteo-norte-7a`.
- **Revisión de arquitectura:** obligatoria, porque toca pagos simulados y permisos. La corre el script de Gus en un paso aparte.

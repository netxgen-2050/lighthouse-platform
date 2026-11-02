# Proposal

## Why

El Pasaporte es la única pantalla del mock-up v6 (`V.pasaporte`) que todavía no tiene un cambio OpenSpec, y es la que muestra **por qué Lucía y Lucas tienen caminos distintos para poner plata**: Lucía (residencia fiscal en Noruega) no puede entrar al fideicomiso y tiene la alerta de tierra ribereña; Lucas (Neuquén) entra por invitación como inversor no calificado y sus horas de obra necesitan seguro. Es la demo comprometida para la It.2 ("Lucía y Lucas ven caminos distintos en el pasaporte") y, en esta fase de prototipo interno, deja claro ante el equipo que la plataforma va a captar inversión **y** que filtra a quién se le ofrece. Se adelanta en modo simulado (sin KYC real) porque solo necesita las personas de ejemplo.

## What Changes

- Página `/pasaporte` copiada de `V.pasaporte` del mock-up v6, para la persona elegida en el selector global (`personas-demo`):
  - **"Lo que declaraste":** identidad ("documento verificado" con marca de ejemplo), nacionalidad, residencia fiscal ⚖, origen de fondos, tipo de inversor ⚖ y presencia; con la nota "Estos datos los custodia el fiduciario…".
  - **"Tus caminos":** membresía y pase de estadías (abiertos), tribus, salas y pactos de tiempo (abiertos), **sumarte al proyecto** (abierto por invitación con los lugares de no calificados que quedan, o "por ahora, no" con el motivo fiscal), **tu chacra a futuro** (sin restricción o la alerta de tierra ribereña) y **horas de obra** o **aporte remoto** según la modalidad.
- Cada camino muestra su estado **en texto** ("Abierto", "Por ahora, no", "Con condiciones") además del ícono ✓ / ! / ~ del mock-up.
- Los lugares para no calificados salen de `EMISION` de `lib/sumarte/datos.ts` (15 − 11 = 4), no de un número nuevo.
- La pantalla cambia al instante al cambiar de persona en el selector.
- Destino nuevo en el rail: "Pasaporte" → `/pasaporte` en `lib/navegacion.ts`, entre "Perfil" y "Compromisos" (en el mock-up va después de Tribus), con ícono de `lucide-react` y `existe: true`.
- ⚖ nuevos en el catálogo, copiados textualmente del objeto `LEGAL` del mock-up: `pasaporte`, `calificado`, `pase`, `chacra`, `ribera`, `remoto`. Se reusan `hacienda`, `membresia`, `sumarte`, `circulo` y `obra`. No hay textos legales nuevos fuera del mock-up.

**Fuera de alcance:**
- KYC real: formularios, carga de documentos, proveedor de verificación, validación contra el fiduciario, guardado de datos personales.
- Que el usuario edite lo declarado: los datos son los de la persona de ejemplo.
- Cambiar `/sumarte` para que "Pedir invitación" respete la elegibilidad (hoy muestra "disponible" para todos): va en otro cambio (ver preguntas abiertas).
- La vía separada para aportantes del exterior que el mock-up menciona como "en estudio".
- Avales / red de confianza en el pasaporte (nota 18 §1 punto 8): It.2.

## Capabilities

### New Capabilities
- `pasaporte`: la pantalla `/pasaporte` según `V.pasaporte` del mock-up v6, con los caminos de cada persona de ejemplo.

### Modified Capabilities

## Impact

`app/pasaporte/`, `lib/pasaporte/` (armado de los caminos, puro y con tests), `lib/navegacion.ts`, `lib/legal/terminos.ts` (y sus tests), `e2e/pasaporte.spec.ts`, `e2e/accesibilidad.spec.ts`. Lee `lib/personas/` y `EMISION` de `lib/sumarte/datos.ts`. **Depende de** `personas-demo` (frenar si no está en `main`). Sin dependencias npm nuevas.


> **Actualización 7-oct (Gus):** sin `personas-demo`. La persona carga sus propios datos en un formulario simulado ("Tus datos") y los caminos se calculan a partir de ellos. Así la pantalla queda lista para usuarios reales cuando llegue el login con Privy. Donde este documento mencione `lib/personas/` o el selector global, vale el formulario.

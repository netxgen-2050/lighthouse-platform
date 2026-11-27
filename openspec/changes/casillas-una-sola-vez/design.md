# Diseño · casillas-una-sola-vez

## 1. "Entrar" abre el login directo

En `components/sesion/proveedor-sesion.tsx`:

- `entrar({ modo })` con modo `entrar` (o sin modo) **no** muestra las casillas: abre el login.
  - **Con Neon Auth:** abre el diálogo "Entrar" con el formulario propio adentro (`setPaso({ modo: "entrar" })` y `setFormularioAbierto(true)` en el mismo paso).
  - **Sin Neon Auth (modo de prueba):** hace lo mismo que hoy hace `abrirLogin` después de aceptar: lleva a Sumarte, a "Entrar como…", o enfoca el panel si ya está en `/sumarte`. Se saca a una función privada (por ejemplo `abrirLoginSinPaso`) para que `abrirLogin` (camino `alta`) y "Entrar" no dupliquen el código.
  - **Con Privy:** abre `login()` de Privy directo. Privy está retirado, pero el camino sigue en el código mientras convivan.
- `entrarComo(email)` del panel de prueba entra directo con ese email, sin pasar por el paso.
- `entrar({ modo: "alta" })` queda como hoy: casillas, aceptación previa en la pestaña y después el login.
- `abrirLogin` con `intentarLogin` (que exige una aceptación previa vigente) se usa solo en el camino `alta`.

`lib/privacidad/una-sola-puerta.test.ts` sigue vigilando que el login de Privy, el cliente de Neon Auth y `FormularioLogin` solo vivan en el proveedor, el formulario y el puente. Lo que cambia es el comentario: la puerta única ya no exige casillas para "Entrar".

## 2. Después del login

No hace falta código nuevo: `useConsentimiento` ya lee el estado del servidor, y `Puerta` muestra `PantallaConsentimiento` cuando hay sesión sin consentimiento vigente.

- **Consentimiento vigente de la versión actual:** entra. No se registra otra aceptación.
- **Nunca aceptó o lo retiró:** `PantallaConsentimiento` con el texto de la primera vez y las dos casillas, más novedades si nunca decidió. El canal sale de `canalAlEntrar(registro)`, como hoy.
- **Versión vieja:** la misma pantalla con "Cambió la política…" y "Qué cambió".
- Sin aceptación previa en la pestaña, `tomarAceptacionPrevia` devuelve `null` y no se registra nada: está bien.

Hay que actualizar el comentario de `PantallaConsentimiento`: deja de ser solo una red de seguridad y pasa a ser el camino normal de la primera vez que alguien entra por "Entrar".

## 3. Textos

- `paso-alta.tsx`, encima del formulario:
  - en modo `alta` sigue "Aceptaste la política y los términos. Ahora elegí cómo entrar.";
  - en modo `entrar`: "Elegí cómo entrar. Si es tu primera vez, después te pedimos aceptar la política y los términos."
- `paso-alta.tsx`, rama de casillas en modo entrar: se borra "Te lo pedimos cada vez que entrás porque, hasta que entres, no sabemos quién sos." Si esa rama queda inalcanzable, se borra entera, con su "Qué cambió" y el enlace a Sumarte. El modo `alta` no cambia.
- `lib/privacidad/politica.ts`:
  - `BASE_LEGAL`: "Tu consentimiento, que das al crear tu cuenta o la primera vez que entrás, y podés retirar cuando quieras. …" (el resto igual).
  - A la versión `2026-11-25-borrador` se le suma en `cambios`: "Las casillas se marcan una sola vez: si ya aceptaste esta versión, entrás directo." **No** se sube la versión.
  - El texto histórico de `2026-11-23-borrador` no se toca: es lo que se informó en esa versión.
- Textos en inglés, si los hay en `lib/idioma/textos/` para estos mensajes: el mismo cambio.

## 4. ADR-005

En `docs/decisiones/ADR-005-consentimiento-antes-de-la-identidad.md`, una sección con fecha:

> **27-nov-2026 · Gus:** las casillas se marcan una sola vez. "Entrar" abre el login directo. Si la cuenta no tiene consentimiento vigente, ve la pantalla de consentimiento después del login. "Crear tu cuenta" sigue con las casillas antes. Costo aceptado: el email de quien entra sin haber aceptado nunca llega al proveedor del login antes de las casillas; la plataforma no guarda nada suyo hasta que acepta. [verificar] con abogado antes de abrir fuera del equipo (R29). Reemplaza el "costo aceptado" de marcar casillas en cada login. El #88 (`entrar-por-email`) queda estacionado.

El estado de la ADR no se cambia.

## 5. Pruebas

- **Unitarias:** ajustar las de `components/sesion` que esperan el paso con casillas al llamar `entrar()` en modo entrar. Sumar dos:
  - `entrar()` sin modo abre el formulario sin casillas;
  - `entrar({ modo: "alta" })` sigue mostrando las casillas.
- **E2E:**
  - Una ayuda nueva en `e2e/ayudas.ts`, `aceptarPantalla(page, opciones)`, que marca las dos casillas (y novedades si se pide) en la pantalla de consentimiento y aprieta su botón. `aceptarPaso` queda para "Crear tu cuenta".
  - Los e2e que entraban por "Entrar" o "Entrar como…" y marcaban en el paso pasan a: entrar directo y, si la persona no tenía consentimiento, aceptar en la pantalla. Siguen probando lo mismo: constancia, canal, novedades, re-consentimiento.
  - Escenarios que cambian:
    - "Quien ya tiene cuenta también marca": ahora entra sin ver casillas y su constancia no cambia.
    - "Entrar como… en modo de prueba": entra directo y ve la pantalla si no tenía consentimiento.
    - "Privy no recibe el email antes de las casillas": queda solo para "Crear tu cuenta".
    - "el paso Entrar muestra la versión vigente y Qué cambió": pasa a la pantalla de consentimiento después de entrar.
  - Lo de "Crear tu cuenta" no cambia.
  - Axe en los dos temas sobre el diálogo "Entrar" con el formulario.

## 6. Convivencia con otros trabajos

- El carril 14 (`sumarte-planes-v2`) toca la página de Sumarte y sus e2e. **No tocar** `app/sumarte/*` ni `lib/sumarte/*`.
- En `e2e/sumarte-acceso.spec.ts`, cambiar solo lo que entra por "Entrar" o "Entrar como…". Lo de "Crear tu cuenta" queda igual. Si un choque es inevitable, anotarlo en el PR.

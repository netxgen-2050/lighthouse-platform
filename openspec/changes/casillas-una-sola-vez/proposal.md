# Las casillas de la política, una sola vez

## Por qué

Hoy cada "Entrar" abre primero las casillas de la política y los términos, y recién después el login. Quien ya aceptó vuelve a marcarlas cada vez que entra. Gus lo pidió el 27-nov-2026: **las casillas se marcan solo la primera vez**.

Este cambio es la salida simple. El #88 (`consentimiento-sin-casillas-repetidas`, `entrar-por-email`) proponía averiguar por el email si la persona ya tenía cuenta, antes del login. Quedó estacionado: es grande, está muy atrás de `dev` y tiene preguntas abiertas.

## Qué cambia

- **"Entrar"** (la barra, cualquier `entrar()` en modo entrar y el panel "Entrar como…" del modo de prueba) abre el login directo, sin casillas.
- **Después del login:**
  - si la cuenta tiene el consentimiento vigente de la versión actual, entra sin ver casillas;
  - si nunca aceptó, lo retiró o la política cambió de versión, ve la pantalla de consentimiento que ya existe, con "Qué cambió" cuando corresponde, una sola vez.
- **"Crear tu cuenta"** (Sumarte) sigue igual: las casillas van antes del login, con el camino `alta` y la casilla de novedades.
- Los textos que dicen "cada vez que entrás" pasan a decir que se acepta una vez. La versión de la política no sube: `2026-11-25-borrador` todavía no llegó a producción.
- ADR-005 suma la decisión de Gus.

## Qué no cambia

- Nada se guarda a nombre de la persona en la base de la plataforma sin consentimiento vigente: sigue anónima hasta aceptar.
- "Crear tu cuenta" y su paso de casillas, la aceptación previa con vencimiento de 5 minutos para ese camino, la constancia, el re-consentimiento con "Qué cambió", los consentimientos separados y las novedades opcionales.

## Costo aceptado (Gus, 27-nov)

Quien aprieta "Entrar" sin haber aceptado nunca deja su email en el proveedor del login (Neon Auth) antes de marcar las casillas. La plataforma no guarda nada suyo hasta que acepta. **[verificar]** con abogado antes de abrir fuera del equipo: va con R29, junto con borrar las cuentas del login que nunca aceptaron.

## Impacto

- Código: `components/sesion/proveedor-sesion.tsx`, `components/sesion/paso-alta.tsx`, `components/sesion/pantalla-consentimiento.tsx` (solo comentario y textos), `lib/privacidad/politica.ts`, `lib/privacidad/una-sola-puerta.test.ts`.
- E2E: los que entran por "Entrar" o "Entrar como…" y marcaban las casillas en el paso (`consentimiento-alta`, `login`, `login-neon-auth`, `descubrir-publico`, `privacidad`, y lo que haga falta en `sumarte-acceso`).
- Docs: `docs/decisiones/ADR-005-consentimiento-antes-de-la-identidad.md`.

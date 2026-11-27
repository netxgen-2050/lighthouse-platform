# Design

## Context

- `components/sesion/formulario-login.tsx` (de `login-neon-auth`) tiene dos pasos: email → código. En el paso del email, Google está al final, dentro del mismo `<form>`, con `BOTON_SECUNDARIO` y el texto "Entrar con Google".
- El 25-nov-2026 el login con Neon Auth quedó prendido en Preview y Gus lo probó entero en el link de dev (código, código equivocado, Google y cookie `HttpOnly`).
- Pautas de marca de Google para el botón: developers.google.com/identity/branding-guidelines. **El implementador las abre y confirma los valores de abajo antes de escribir el componente**; si alguno no coincide, manda la guía y lo anota en el PR.

## Decisions

### 1. Orden de la pantalla (paso del email)

```
[ G  Continuar con Google ]      ← botón propio, fuera del form
──────────── o ────────────      ← separador; la "o" es texto real, no imagen
Tu email
[ ____________________ ]
[ Mandame el código ]
```

- El separador es decorativo para quien ve y legible para el lector de pantalla: la "o" va en un `<p>` o `<span>` con texto, y las líneas son bordes (CSS). No se usa `<hr>` con texto adentro.
- El foco inicial **sigue en el campo de email** (lo pide la spec de `login-neon-auth`: "aparece el formulario con el cursor en tu email"). Google queda antes en el orden de tabulación, así que Shift+Tab desde el email llega a Google.
- El paso del código no cambia.

### 2. El botón (`components/sesion/boton-google.tsx`)

Valores de las pautas de Google, variante rectangular:

| | Tema claro | Tema oscuro |
|---|---|---|
| Fondo | `#FFFFFF` | `#131314` |
| Borde | 1 px `#747775` | 1 px `#8E918F` |
| Texto | `#1F1F1F` | `#E3E3E3` |

- Alto 40 px, radio 4 px, relleno izquierdo 12 px, logo de 20 × 20 px, 10 px entre logo y texto, relleno derecho 12 px. Ancho: el del contenedor en celular (`w-full`), y en pantallas grandes el mismo ancho que el campo de email, para que se lean como una columna.
- Tipografía: **Roboto Medium (500), 14 px, interlineado 20 px**, como piden las pautas. Se carga con `next/font/google` (`Roboto`, `weight: ["500"]`, `subsets: ["latin"]`, variable `--font-roboto`) y se usa solo en este botón. Si el implementador ve que agregar la fuente rompe algo del build o del presupuesto de carga, usa la pila del sistema `Roboto, Arial, sans-serif` y lo anota.
- **Logo:** el SVG oficial de la "G" de cuatro colores (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`), en línea dentro del componente, con `aria-hidden="true"` y `focusable="false"`. No se recolorea, no se recorta ni se pone sobre otro fondo que el blanco del botón: en el tema oscuro, las pautas lo dejan sobre `#131314` sin cambiar los colores del logo.
- Texto visible y nombre accesible: **"Continuar con Google"**. Es la traducción de "Continue with Google", uno de los textos que permiten las pautas.
- Estados: `hover` y `focus-visible` con el anillo de foco del tema (el mismo de los otros botones); `aria-disabled` mientras `ocupado`, igual que hoy; sin animaciones.
- **Tokens, no colores sueltos:** `--color-google-fondo`, `--color-google-borde`, `--color-google-texto` en `:root` y en `:root[data-tema="oscuro"]` de `app/globals.css`, y las clases de Tailwind que ya se arman desde los tokens. El test de "sin colores sueltos" que exista se respeta: los hex de Google viven solo en `globals.css` y en el SVG del logo (que es una marca, no un color del tema; se anota como excepción en el test si hace falta).

### 3. Contraste y accesibilidad

- Texto `#1F1F1F` sobre `#FFFFFF` y `#E3E3E3` sobre `#131314`: los dos pasan AA de sobra.
- El borde (`#747775` sobre el fondo de la página, que en el tema claro es `#f6f3ea`) tiene que llegar a 3:1 como límite de un control (WCAG 1.4.11). El implementador lo mide; si no llega, oscurece el borde solo lo necesario y lo anota (las pautas permiten el estilo, la accesibilidad manda).
- axe sin violaciones serias en el diálogo de login, en los dos temas.

### 4. Lo que no cambia

- `conGoogle()`: misma llamada, misma `callbackURL` a la página actual, mismos errores.
- El paso del consentimiento, "Cancelar", los mensajes y el paso del código.
- Con Privy o el modo de prueba, este formulario no se muestra.

## Risks / Trade-offs

- [Roboto suma una fuente más] → un solo peso, solo latín, con `display: swap`. Es lo que piden las pautas y es poco peso.
- [Las pautas cambian] → la fuente de verdad es la página de Google al implementar; el PR anota la fecha en que se leyó.
- [El e2e busca el texto viejo] → se actualiza en el mismo cambio; el guion también.

## Fuentes

- Pautas de marca de Google para "Sign in with Google": developers.google.com/identity/branding-guidelines (a confirmar por el implementador al leerla).
- Prueba de Gus del login con Neon Auth en el link de dev, 25-nov-2026 (chat).
- `openspec/changes/login-neon-auth/` (design §3 y spec del formulario).

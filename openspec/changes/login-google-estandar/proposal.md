# Proposal

## Why

El 25-nov-2026 Gus probó el login con Neon Auth en el link de dev, con código por email y con Google, y anduvo de punta a punta. Pidió que el botón de Google tenga **la experiencia estándar** que la gente reconoce de otros sitios. Hoy está debajo del email, con un texto de introducción ("O entrá con tu cuenta de Google.") y con nuestro estilo de botón secundario, sin el logo. Eso es lo que menos se parece a lo habitual y lo que más cuesta encontrar en la pantalla.

Google publica pautas de marca para su botón (logo "G" de colores sin modificar, colores, tipografía, tamaños y textos permitidos). Seguirlas también es condición de su política de marca para quien usa "Sign in with Google".

## What Changes

- **Google arriba:** en el paso del email, el primer control es el botón de Google. Debajo va un separador con la palabra "o" y, después, el campo de email con "Mandame el código". Es el orden habitual: la opción de un clic primero.
- **Botón según las pautas de Google:** logo "G" oficial de cuatro colores (SVG sin modificar), texto **"Continuar con Google"**, fondo blanco con borde gris en el tema claro y fondo casi negro con borde gris en el oscuro, tipografía Roboto Medium, 40 px de alto. Los colores van como tokens del tema (`--color-google-*`), no sueltos.
- **Se saca** el texto "O entrá con tu cuenta de Google." y el estilo de botón secundario para Google.
- **El botón de Google sale del formulario del email:** hoy está dentro del `<form>` del código, así que Enter en el campo de email nunca lo dispara, pero lectores de pantalla lo anuncian como parte de "Entrar con un código por email". Pasa a ser un control propio, con su propio nombre accesible.
- **Nada cambia en la lógica:** misma llamada `signIn.social({ provider: "google", callbackURL })`, mismos mensajes de error, mismo paso de consentimiento antes, mismo "Cancelar".
- Se actualizan el e2e (`e2e/login-neon-auth.spec.ts`, que busca "Entrar con Google") y el guion (`docs/guiones/login-neon-auth.md`, paso 7.7).

## Impact

- Archivos: `components/sesion/formulario-login.tsx`, un componente nuevo `components/sesion/boton-google.tsx`, `app/globals.css` (tokens), `app/layout.tsx` (Roboto 500, solo si se carga con `next/font`), `e2e/login-neon-auth.spec.ts`, `docs/guiones/login-neon-auth.md`.
- Sin cambios de base de datos, rutas, variables ni proveedores. Con `NEXT_PUBLIC_LH_LOGIN` distinto de `neon-auth` (Privy o modo de prueba) nada cambia.
- Reglas de producto: no toca textos legales ni el consentimiento. "Continuar con Google" es un texto de la lista que permite Google, traducido.
- Fuera de alcance: el idioma inglés del formulario (hoy todo el formulario está en español; si se traduce, es otro cambio), el email del código con nuestra marca (sigue siendo el de Neon) y las credenciales propias de Google Cloud para Production.

# Proposal

## Why

Primera zona de la plataforma bilingüe (ver `idioma-base` y ADR-004). La portada y Sumarte son lo primero que ve un inversor o un miembro del exterior: el enlace que se le manda es `…/?lang=en` o `…/sumarte?lang=en`. Sumarte además deja claro que la plataforma va a servir para captar plata de inversores y usuarios (planes, Pase Fundador, invitación a invertir), así que tiene que leerse bien en inglés. Entra en una noche.

## What Changes

- **Portada (`/`) en inglés:** título, bajada, los tres caminos (`lib/portada.ts`, con la cantidad de barrios por idioma: "1 neighborhood", "12 neighborhoods", sin número si no hay datos), el aviso de origen de la visita y los enlaces.
- **Sumarte (`/sumarte`) en inglés:** encabezado, aviso de qué plan habilita lo que se quería abrir (`lib/permisos/niveles.ts`: `avisoDeNivel`, `avisoDeRuta`), facturación mensual/anual, las cuatro tarjetas de planes (Explorer, Member, Founder Pass, Tribe Plan, con los nombres del glosario), los niveles del pase, los medidores, la comparativa (`FILAS` pasa a `Bilingue`), "Para inversores", los textos "(simulado)" / "(simulated)", los errores y el panel "Entrar como…" (`components/sesion/entrar-como.tsx`) y `entrar-para.tsx`.
- **Montos** con el formato del idioma ("USD 1,500" en inglés), también en ARS con su nota de tipo de cambio.
- **Formulario de pedido de contacto** (`components/pedido-contacto.tsx`, usado en "Pedir invitación" y "Pedir una charla") y `components/medidor.tsx`.
- **Estado de tribu** (`TEXTO_ESTADO`: Active, Forming, Looking for a tribe), que Sumarte usa al elegir la tribu a liderar; lo reutiliza `idioma-tribus-territorio`.
- Lo que todavía no está traducido y aparece en estas páginas **cae marcado**: los ⚖ (muestran el español con "Only available in Spanish" hasta `idioma-legal`), el diálogo de verificación de identidad (en español con `lang="es"` hasta `idioma-pasaporte-semillas-pactos`) y el paso "Crear tu cuenta" (hasta `idioma-legal`).
- `/` y `/sumarte` se suman a `RUTAS_TRADUCIDAS`: el e2e de `idioma-base` empieza a revisar su contenido en inglés.

### Fuera de alcance

- Los ⚖ y los textos con peso legal de Sumarte ("No es una inversión: no da tierra…", R16): van como borrador en `idioma-legal`.
- Cambiar precios, planes o lógica de Sumarte; montos en otras monedas.
- Traducir las páginas a las que llevan los enlaces (tribus, territorio, perfil): cada una tiene su cambio.
- Revisión de la traducción por alguien nativo: más adelante (decisión de Gus, 15-oct-2026). Los diccionarios y datos de esta zona quedan `pendiente` en `lib/idioma/revision-nativa.ts`.

## Capabilities

### New Capabilities
- `idioma-portada-sumarte`: la portada y Sumarte en inglés con la misma conducta que en español.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/portada.ts` y `lib/idioma/textos/sumarte.ts` (nuevos, registrados en `DICCIONARIOS`), `app/page.tsx`, `lib/portada.ts`, `app/sumarte/page.tsx`, `app/sumarte/sumarte-cliente.tsx`, `lib/sumarte/datos.ts` (`FILAS` como `Bilingue`), `lib/permisos/niveles.ts` (avisos por idioma), `lib/tribus/tipos.ts` (`TEXTO_ESTADO` por idioma), `components/medidor.tsx`, `components/pedido-contacto.tsx`, `components/sesion/entrar-como.tsx`, `components/sesion/entrar-para.tsx`, `lib/idioma/rutas.ts`.
- Tests: diccionarios nuevos en el test de `idioma-base`; `e2e/idioma-portada-sumarte.spec.ts`; en español, `e2e/portada.spec.ts`, `e2e/sumarte.spec.ts` y `e2e/sumarte-acceso.spec.ts` siguen iguales.
- Sin datos personales nuevos, sin permisos, sin base, sin plata nueva (los montos siguen siendo de ejemplo).
- Depende de `idioma-base`.

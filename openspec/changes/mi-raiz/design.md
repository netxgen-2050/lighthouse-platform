# Design

## Context

Cada dato que muestra Mi Raíz ya existe y ya tiene su función de lectura:
- Plan y Pase: `leer()` de `lib/sumarte/estado.ts` sobre `CLAVES.sumarte`; precios y créditos por nivel en `PASSES` (`lib/sumarte/datos.ts`).
- Presencia: `leerPresencia()` de `lib/congreso/presencia.ts` (cambio `congreso-checkin-genesis`).
- Semillas: `pactoAceptado()` y `semillasTiempo(…, FACTOR_EVALUACION)` (`lib/semillas/`), las mismas que usa `/semillas`.
- Voz: `personaReal()` y `filasDePuertas()` de `lib/canales/` (estado, motivos, "Se abre con" y refuerzo "a decidir").
Ver proposal.md para el porqué.

## Goals / Non-Goals

**Goals:**
- Cero lógica de negocio nueva: Mi Raíz compone lecturas existentes, así no puede contradecir a `/sumarte`, `/congreso`, `/semillas` ni `/canales`.
- Una función pura que arma todo el modelo de la página, testeable sin navegador.

**Non-Goals:**
- Guardar estado, calcular saldos de créditos o vencimientos.

## Decisions

1. **`lib/mi-raiz/resumen.ts` con `resumirRaiz(leer: (clave) => string | null): ResumenRaiz`**, mismo patrón que `resumirDemo` en `lib/demo/resumen.ts` (inyecta la lectura de `localStorage`). Devuelve `{ plan, pase, creditos: { totalUsd } | null, presencia: { ticket, dias }, semillas: number | null, voz: FilaPuerta[] }`. *Alternativa:* que el componente lea cada clave por su cuenta. Se descarta: duplicaría lecturas y no se podría testear con Vitest.
2. **Voz = filtrar `filasDePuertas(personaReal(...))`** por `voz-tribu`, `voz-fondo-comun` y `voto-asamblea-residentes`. Las tribus aceptadas no existen fuera del simulador de `/canales`, así que "Voz en tu tribu" va a figurar cerrada con su pista: es lo correcto con los datos actuales.
3. **Créditos:** solo el total del nivel (`PASSES[n].creditos`) con "en 3 años". Disponible y vencimientos son literales "sin dato": no hay regla aprobada de cómo se liberan (la nota 18 solo dice "30% del precio, en 3 años, vencen").
4. **Página:** `app/mi-raiz/page.tsx` de servidor (título, ⚖ `miraiz`, aviso de prototipo, aviso de "no es una cuenta de plata") y `mi-raiz-cliente.tsx` que llama a `resumirRaiz` tras hidratar. Mientras no leyó, muestra "Cargando tus datos…" (como `/semillas`) para no mostrar "Explorador" por un instante a quien tiene Pase.
5. **Navegación:** ítem `{ href: "/mi-raiz", etiqueta: "Mi Raíz", icono: TreeDeciduous, existe: true }` en `DESTINOS`, entre Sumarte y Mi recorrido (el test de `lib/navegacion.test.ts` vigila que la página exista). Si el ícono no existe en la versión instalada de `lucide-react`, usar otro ícono ya importado del paquete; no agregar dependencias.
6. **Texto legal nuevo** (`borrador: true`): `miraiz` · "Mi Raíz": "Junta en un solo lugar lo que tenés en la red: tu Pase, tus créditos, tu presencia, tus Semillas y tu voz. No es una cuenta de dinero ni guarda tokens: nada de lo que ves acá se vende, se transfiere ni da rendimiento. Los créditos solo se usan dentro de la red, con el Guardián como único emisor."

## Risks / Trade-offs

- [`congreso-checkin-genesis` no está en `main`] → la tarea 0.1 frena; no se reimplementa la lectura de presencia acá.
- [Si `sumarte-pago-simulado` entra antes o después] → Mi Raíz solo lee `plan` y `pase`, que ese cambio mantiene en el mismo lugar; no hay dependencia.
- [El nombre "Mi Raíz" puede cambiar en la reunión del 12-oct] → el nombre vive en el título, el rail y el ⚖; cambiarlo es tocar tres textos.

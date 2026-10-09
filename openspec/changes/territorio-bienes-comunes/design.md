# Design

## Context

`app/territorios/[id]/page.tsx` es un componente de servidor que hoy pinta `territorio.bienesComunes` (una lista de `string` en `lib/territorios/datos.ts`) como viñetas. `components/medidor.tsx` ya pinta "USD X de USD Y · N%" con la barra decorativa (`aria-hidden`) y sirve en servidor. `components/termino-legal.tsx` pinta el ⚖ desde `lib/legal/terminos.ts`. El mock-up v6 tiene los datos en `V.territorio`:

| Bien | Plata comprometida | Plata necesaria | Horas comprometidas | Horas necesarias |
|---|---|---|---|---|
| Agua: toma, cisterna y riego | 96000 | 142000 | 1800 | 3200 |
| Energía: parque solar comunitario | 61000 | 210000 | 900 | 2400 |
| Núcleo común: bioquincho y cocina | 118000 | 130000 | 3100 | 3600 |
| Vivero y banco de semillas | 22000 | 48000 | 640 | 1500 |

## Goals / Non-Goals

**Goals:** pasar del nombre suelto a un bien con plata y horas; mostrar "sin dato" cuando falte un número; sumar el ⚖ `guardianes` del mock-up.

**Non-Goals:** cualquier botón de pago o registro propio del bien; el espejo real; tocar el mapa.

## Decisions

1. **Modelo.** En `lib/territorios/tipos.ts`, `bienesComunes` pasa a `BienComun[]` con `{ id: string; nombre: string; plata?: { comprometida?: number; necesaria?: number }; horas?: { comprometidas?: number; necesarias?: number } }`. Los cuatro bienes del Lighthouse llevan los números de la tabla. Un medidor solo se pinta si están **los dos** números y el necesario es mayor que 0; si no, "Plata: sin dato" u "Horas de trabajo: sin dato". Así un bien de otro territorio sin datos no rompe ni muestra 0.
2. **Función pura** `medidaDe(par)` en `lib/territorios/` que devuelve `{ actual, tope } | null`. Se testea con Vitest (completo, falta uno, necesario 0, todo vacío).
3. **Texto del medidor.** Se reusa `Medidor` tal cual (unidad `"USD "` para plata, sin unidad para horas, `dorado` para horas como en el mock-up). No se cambia el componente.
4. **⚖ `guardianes`.** Se copia textual de `LEGAL.guardianes` del mock-up ("Guardianes de la tierra" / "Servidumbre real negativa y perpetua a favor de un ente guardián (arts. 2162–2165 CCyCN). La pone la dueña del suelo y sobrevive a todas las reventas."). No es borrador porque viene del mock-up. Se suma al test del catálogo que compara contra el HTML.
5. **Prueba contra el mock-up.** El test de `lib/territorios/datos.test.ts` lee el HTML del mock-up (como `lib/sumarte/sumarte.test.ts`) y comprueba que cada bien aparece como `["<nombre>",<plata>,<meta>,<horas>,<meta>]`.
6. **Layout.** Grilla de 1 columna en celular y 2 en pantallas medianas (`grid-cols-1 md:grid-cols-2`), tarjetas con `border-faint` y `bg-surface` como el resto de la página. Solo tokens.

## Risks / Trade-offs

- **Otros consumidores de `bienesComunes`.** Si alguna pantalla o test usa la lista de nombres, hay que adaptarlo. Mitigación: tarea 1.1 busca usos con `grep -rn bienesComunes`.
- **Conflicto con cambios abiertos** que toquen `app/territorios/[id]/page.tsx`. Es una sección acotada al final de la página; el conflicto sería chico.

## Open Questions

- ¿Los números de plata y horas de los bienes comunes son los definitivos de ejemplo o hay que tomarlos del modelo financiero de Vagner?

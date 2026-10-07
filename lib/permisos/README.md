# Servicio de permisos

Función pura que dice qué puertas están abiertas para una persona, en qué grado y por qué motivo. Fuente: `NS_platform/Documentation/18 - Integración plataforma y tokenomics.md` §3. La tabla vive como datos en `tabla.ts`.

## Uso

```ts
import { calcularPermisos, puede } from "@/lib/permisos/calcular";

const persona = { plan: "miembro", pase: null, tribus: ["valle"], presenciaGenesis: false, residente: false };
puede(persona, "sala-tribu", "valle"); // { abierta: true, grado: "completa", motivos: ["tribu"], ... }
calcularPermisos(persona);              // todas las puertas
```

Ojo: `calcularPermisos(persona)` no recibe tribu, así que usa el criterio conservador y muestra **cerradas** la `sala-tribu` y la `voz-tribu` de una persona aceptada que no tiene plan ni pase que las abra por sí solos. Para esas puertas hay que usar `puede(persona, puerta, tribuId)`. `tribusPropias` solo se completa cuando la puerta se abre por la celda "su tribu".

## Tabla

| Puerta | Explorador | Miembro | Pase Fundador | Tribu (aceptado) | Presencia Genesis | Residente |
|---|---|---|---|---|---|---|
| mapa-tribus-eventos | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| registrar-ticket | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| foros-red | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| sala-tribu | — | visita | visita | completa (su tribu) | — | — |
| canal-fundadores | — | — | ✓ | — | — | — |
| voz-tribu | — | — | — | según estatuto (su tribu) | — | — |
| voz-fondo-comun | — | — | 1 voz | — | refuerzo (solo con pase) | — |
| voto-asamblea-residentes | — | — | — | — | — | 1 persona = 1 voto |
| creditos | — | — | ✓ | — | — | — |

Los tres pases (`semilla`, `brote`, `raiz`) abren lo mismo.

**Decisión del 7-oct-2026 (Gus):** todas las tribus pertenecen al Lighthouse, que es común a todas. Ser residente abre lo que es de todo el Lighthouse (foros de la red, Asamblea de residentes), pero **no** abre salas ni voz de tribus: a una tribu se entra siendo miembro aceptado de ella, y quien es miembro de más de una tribu entra a cada una de ellas. La nota 18 §3 decía "✓" para residentes en esas dos filas; la nota se tiene que actualizar.

## A decidir

- Refuerzo de la voz por presencia en el Fondo Común (la nota dice "×1,5 a ×2 con tope"): se devuelve `refuerzoPresencia: "a decidir"`, nunca un número.
- Fila "Descuentos y prioridad en estadías y eventos" de la nota: no está en la spec, no se implementó.
- Residente en `sala-tribu`: la nota pone ✓ sin "(su tribu)"; se transcribió literal (grado completa).

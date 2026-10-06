# Servicio de permisos

Función pura que dice qué puertas están abiertas para una persona, en qué grado y por qué motivo. Fuente: `NS_platform/Documentation/18 - Integración plataforma y tokenomics.md` §3. La tabla vive como datos en `tabla.ts`.

## Uso

```ts
import { calcularPermisos, puede } from "@/lib/permisos/calcular";

const persona = { plan: "miembro", pase: null, tribus: ["valle"], presenciaGenesis: false, residente: false };
puede(persona, "sala-tribu", "valle"); // { abierta: true, grado: "completa", motivos: ["tribu"], ... }
calcularPermisos(persona);              // todas las puertas
```

## Tabla

| Puerta | Explorador | Miembro | Pase Fundador | Tribu (aceptado) | Presencia Genesis | Residente |
|---|---|---|---|---|---|---|
| mapa-tribus-eventos | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| registrar-ticket | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| foros-red | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| sala-tribu | — | visita | visita | completa (su tribu) | — | completa |
| canal-fundadores | — | — | ✓ | — | — | — |
| voz-tribu | — | — | — | según estatuto (su tribu) | — | ✓ |
| voz-fondo-comun | — | — | 1 voz | — | refuerzo (solo con pase) | — |
| voto-asamblea-residentes | — | — | — | — | — | 1 persona = 1 voto |
| creditos | — | — | ✓ | — | — | — |

Los tres pases (`semilla`, `brote`, `raiz`) abren lo mismo.

## A decidir

- Refuerzo de la voz por presencia en el Fondo Común (la nota dice "×1,5 a ×2 con tope"): se devuelve `refuerzoPresencia: "a decidir"`, nunca un número.
- Fila "Descuentos y prioridad en estadías y eventos" de la nota: no está en la spec, no se implementó.
- Residente en `sala-tribu`: la nota pone ✓ sin "(su tribu)"; se transcribió literal (grado completa).

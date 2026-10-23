# Design

## Context

El Fogón hoy tiene decisiones de ejemplo en el navegador (`lib/fogon/`) y consultas de voto cuadrático (`fogon-cuadratico`, con su paso a la base en `fogon-cuadratico-en-la-base` y ADR-007). `fogon-gobernanza-fractal` agrega los ámbitos círculo, tribu, el común y consejo. Hifa (`asistente-hifa`) ya fija el patrón de "IA honesta y guionada" sin API real. No hay ningún cambio que conecte la API de Claude.

## Goals / Non-Goals

**Goals:**
- Un modelo de etapas explícito y testeable, separado de la interfaz.
- Una facilitación intercambiable: hoy guionada y mañana una IA real, sin cambiar las pantallas.
- Registros de solo agregar con la forma de constancia (ADR-012).

**Non-Goals:**
- Persistencia en la base, IA real, pesos de credibilidad, reglas de qué decisión va por cuál mecanismo.

## Decisions

- **Máquina de estados pura** en `lib/fogon/consenso/etapas.ts`: estado = la propuesta más su lista de registros; las acciones válidas se calculan por etapa. Así cada regla del spec es un test unitario. Alternativa descartada: lógica dentro de los componentes (difícil de testear).
- **El estado se deriva de los registros.** No se guarda "la etapa actual" editable: se calcula de los registros (presentación, avances de etapa, versiones, cierres). Es coherente con los libros de solo agregar (ADR-001, ADR-012) y deja el paso a la base como copiar filas.
- **Puerto de facilitación** `Facilitador` con `resumir`, `preocupacionesAbiertas`, `reflejar` y `marcarRuido`, más un adaptador `facilitadorGuionado` (`lib/fogon/consenso/guion.ts`) que responde con textos de ejemplo por etapa. La IA real será otro adaptador, elegido por una variable de entorno, en un cambio aparte (patrón de la skill `integracion-externa`). Alternativa descartada: llamar a la API ahora. Exige decidir antes la privacidad (qué texto sale y a quién) y el consentimiento.
- **El tipo de consulta** (`consenso` | `cuadratica`) es un campo de la consulta en el Fogón. El filtro por tipo convive con el filtro por ámbito. El voto cuadrático no cambia.
- **Voz con contexto** se calcula con lo que ya existe en el navegador (pactos aceptados, membresías, sellos de presencia). Sin dato no es cero: se muestra "sin dato".
- **Datos de ejemplo:** dos propuestas. Una de tribu ("Horario de riego compartido", en etapa Preocupaciones, con una persona que se aparta) y una del común ("Regla de visitas al vivero", cerrada por consenso con versión 2).

## Risks / Trade-offs

- [La facilitación guionada puede parecer "inteligente" y confundir] → Aviso fijo de simulación en el panel, igual que Hifa.
- [La marca de "fuera de tema" puede sentirse como censura] → Nunca oculta el aporte, y la persona puede discutir la marca.
- [Dos mecanismos pueden confundir] → El tipo de consulta tiene nombre y explicación en una línea ("Para decidir" o "Para repartir y priorizar").
- [Al pasar a IA real, el texto de la deliberación sale a un proveedor] → Fuera de alcance acá. El cambio de IA real necesita su propia decisión de privacidad y consentimiento (Ley 25.326, ADR-005).

## Open Questions

- Criterios de "voz con contexto" (qué pacto, cuánta presencia o qué validación habilita o pondera la voz): a definir con Gus y la tokenomics (NS_Tokenomics doc 10).
- Qué tipos de decisión van por consenso y cuáles por voto cuadrático: a definir más adelante (decisión de Gus del 23-oct-2026).
- Quién facilita cuando haya IA real (una persona con rol de facilitación y la IA como asistente, o solo la IA).

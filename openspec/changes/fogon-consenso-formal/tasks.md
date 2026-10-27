# Tasks

## 1. Modelo de etapas y registros

- [ ] 1.1 Crear `lib/fogon/consenso/tipos.ts` y `etapas.ts`: registros de solo agregar (pregunta, preocupación, retiro, versión, avance de etapa, cierre) y una función pura que deriva la etapa y las acciones válidas. Verificar con tests unitarios de cada escenario de "Etapas del Consenso Formal".
- [ ] 1.2 Reglas de cierre (consenso, apartarse o bloqueo, siempre con razón), versiones y "una preocupación abierta por persona y versión". Verificar con tests unitarios de los escenarios de cierre, versiones y reducción de ruido.
- [ ] 1.3 Participación por ámbito y voz con contexto (solo mostrar, "sin dato" cuando falta), usando los ámbitos de `fogon-gobernanza-fractal`. Verificar con tests unitarios.

## 2. Facilitación guionada

- [ ] 2.1 Puerto `Facilitador` y adaptador `facilitadorGuionado` con textos de ejemplo por etapa, aviso de simulación y marcas de ruido que no ocultan el aporte. Verificar con tests unitarios: no expone ninguna acción de cierre ni de bloqueo.

## 3. Pantallas

- [ ] 3.1 `app/fogon/propuestas/` (lista) y `[id]` (detalle con etapa, historial de versiones, panel de facilitación y botones por etapa), estado en el navegador con clave nueva en `lib/demo/claves.ts`. Verificar con un e2e que recorre presentación → preguntas → preocupaciones → modificar → cierre con una persona que se aparta.
- [ ] 3.2 Tipo de consulta en el Fogón ("Propuesta (consenso)" y "Reparto o prioridad (voto cuadrático)") con su filtro, sin cambiar el voto cuadrático. Verificar con un e2e del filtro y con los tests existentes del voto cuadrático en verde.
- [ ] 3.3 Textos es/en en los diccionarios y términos ⚖ (consenso, bloqueo, apartarse) con `borrador: true` en `lib/legal/terminos.ts`. Verificar con el test del catálogo legal y la cobertura de idioma.
- [ ] 3.4 Accesibilidad y red: auditoría axe sin violaciones serias en lista y detalle, y un e2e que comprueba que no sale ningún pedido de red con texto de la deliberación.

## 4. Cierre

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde. Reporte de la noche con las preguntas abiertas del design (criterios de voz con contexto, qué decisión va por cuál mecanismo).

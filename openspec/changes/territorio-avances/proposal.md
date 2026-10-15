# Proposal

## Why

La **US-04 de la nota 15** (ficha del territorio, prioridad M, It.1 "Explorar") pide que la inversora vea "qué se va a construir, **cómo avanza** y quién lo hace, para confiar", con **avances por frente** (Legal, Masterplan, Financiero, Comunidad), responsable y fecha. La ficha `/territorios/lighthouse` ya tiene mapa, barrios, estado administrativo y bienes comunes, pero no dice nada del avance del proyecto. `territorio-ficha` dejó afuera las barras y `territorio-bienes-comunes` (P5 del backlog, cerrada) también dejó afuera "avances por frente". Este cambio cubre solo eso, sin retomar P5.

Dos de los cuatro frentes se pueden calcular con datos de ejemplo que ya existen en el prototipo, así que no hace falta inventar números: **Comunidad** (tribus activas sobre los doce barrios) y **Financiero** (lo juntado por el Pase Fundador sobre el mínimo para abrir el Fondo Común, la misma barra que ya muestra `/sumarte`). Los otros dos (Legal y Masterplan) no tienen un número: se muestran con su estado escrito y "sin dato" en el porcentaje.

## What Changes

- **Sección "Cómo avanza el proyecto"** en `/territorios/[id]`, entre la vitrina (mapa) y "Bienes comunes", con cuatro frentes en este orden: Legal, Masterplan, Financiero y Comunidad. Cada frente muestra:
  - el nombre y un estado escrito ("En curso", "Sin empezar", "Listo");
  - el avance en porcentaje con una barra, o **"sin dato"** y ninguna barra si no hay número;
  - qué mide el número, en una línea (por ejemplo "4 de 12 barrios con tribu activa");
  - quién lo lleva (un rol, no un nombre de persona) y la fecha de la última actualización, o "sin dato".
- **Comunidad** se calcula con las tribus del territorio (activas sobre el total de barrios). **Financiero** se calcula con los datos de la cohorte del Pase (recaudado sobre mínimo) y lleva el ⚖ `guardian`. **Legal** y **Masterplan** vienen de un dato de ejemplo con estado "En curso" y porcentaje sin dato.
- Los datos de los frentes no calculados viven junto al territorio en `lib/territorios/` (opcionales: un territorio sin frentes muestra "sin dato" en la sección, nunca 0).

**Fuera de alcance:**
- Nombres de responsables (Gabriel, Martín, Vagner): se usan roles hasta que Gus confirme (pregunta abierta).
- Porcentajes de avance de Legal y Masterplan: quedan "sin dato" hasta que el equipo los dé.
- Masterplan real, fases o capas GIS (L4 del backlog, depende de Martín).
- Compound Rubania y su costo de referencia (US-04, otra pieza).
- Bienes comunes con plata y horas (P5, cerrada).
- Historial de avances, edición desde la plataforma o avisos cuando cambia un frente.

## Capabilities

### New Capabilities
- `territorio-avances`: los cuatro frentes de avance del proyecto en la ficha del territorio, con el dato que falta como "sin dato".

### Modified Capabilities

## Impact

`app/territorios/[id]/page.tsx` (sección nueva, quizás un componente `avances-territorio.tsx`), `lib/territorios/` (tipo y datos de frentes, función pura que arma los cuatro frentes) con tests de Vitest, y `e2e/territorio.spec.ts`. Lee `COHORT` de `lib/sumarte/datos.ts`. Sin dependencias npm nuevas. No toca datos personales, tablas, permisos ni pagos.

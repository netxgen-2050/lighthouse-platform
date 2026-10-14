---
name: decisiones-adr
description: Escribe o actualiza un registro de decisión de arquitectura (ADR) en docs/decisiones/, con opciones, pros y contras, recomendación y una explicación simple para Gus. Usar cuando un cambio elige entre caminos técnicos que cuestan revertir (base de datos, proveedor externo, identidad, pagos, estructura del código).
---

# Decisiones de arquitectura (ADR)

Un ADR es una nota corta que responde "¿por qué hicimos esto así?". Sirve para que Gus, un agente nuevo o un inversor técnico entiendan una decisión meses después, y para no volver a discutir lo ya decidido.

## Cuándo escribir uno
- Se elige entre dos o más caminos y volver atrás cuesta más de una noche de trabajo.
- Se suma un servicio externo, una tabla con datos de valor (Semillas, votos, pagos) o una regla de identidad o permisos.
- Se decide **no** hacer algo importante (también es una decisión).

No hace falta para cambios de pantalla, textos o estilos.

## Dónde y cómo se llama
- Carpeta: `docs/decisiones/` en este repo (las noches en la nube no ven `NS_platform`).
- Nombre: `ADR-<NNN>-<tema-en-kebab>.md`, con el siguiente número libre (`ls docs/decisiones`).
- Índice: agregá una línea en `docs/decisiones/README.md` (crealo si no existe) con número, título, estado y fecha.

## Plantilla
```markdown
# ADR-<NNN> · <la decisión, en una frase>

- **Estado:** Propuesta | Aceptada | Reemplazada por ADR-<NNN> | Descartada
- **Fecha:** AAAA-MM-DD
- **Cambio OpenSpec relacionado:** <id> (si hay)

## Contexto
Qué pasa y por qué hay que decidir ahora. Máximo 6 líneas.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · … | … | … |
| B · … | … | … |

## Decisión
Cuál, y la razón principal en una o dos frases.

## Consecuencias
- Lo que ganamos.
- Lo que aceptamos perder o el riesgo que asumimos.
- Cuándo revisar esta decisión (una fecha o una señal concreta: "si UnityHub no expone check-ins al 1-dic").

## En palabras simples
3 a 5 líneas para alguien sin formación técnica, con un ejemplo de la plataforma.
```

## Reglas
- Un agente siempre escribe el ADR en estado **Propuesta**. Solo Gus lo pasa a **Aceptada** (en su commit a `main`).
- Un ADR aceptado no se edita para cambiar la decisión: se escribe uno nuevo que lo **reemplaza** y se actualiza el estado del viejo.
- Opciones reales: al menos dos, incluida la de "no hacer nada todavía" cuando aplique.
- Sin jerga sin explicar. Si usás un término técnico, explicalo en la misma línea.
- Citá las fuentes: notas de `NS_platform` por nombre, specs, documentación externa con fecha de consulta.

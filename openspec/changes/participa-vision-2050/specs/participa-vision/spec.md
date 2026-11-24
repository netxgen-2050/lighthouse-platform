# Spec Delta

## Purpose

Muestra en la pestaña Visión de Participa el manifiesto "Lighthouse 2050", una visión solarpunk del territorio que invita a colaborar por la regeneración y el bien común, por pedido de Gus del 24-nov-2026.

## ADDED Requirements

### Requirement: Manifiesto Lighthouse 2050
`/participa?ver=vision` SHALL mostrar el manifiesto "Lighthouse 2050 · Una luz en el borde del desierto" con el texto de `design.md` §3, en el idioma de la persona, con la marca visible "Visión, no promesa · borrador" y, al final, un enlace a la pestaña Equipos. El texto MUST NOT usar "token", "inversión", "reservá", "lotes", "prioridad" ni "apreciación".

#### Scenario: Abrir la visión
- **WHEN** una persona abre `/participa?ver=vision`
- **THEN** ve el título "Lighthouse 2050", la marca "Visión, no promesa · borrador" y las secciones Postal desde 2050, De dónde venimos, Lo que creemos y Lo que pedimos

#### Scenario: Llamado a los equipos
- **WHEN** la persona llega al final del manifiesto
- **THEN** ve un enlace que la lleva a la pestaña Equipos de `/participa`

#### Scenario: En inglés
- **WHEN** la persona abre la visión en inglés
- **THEN** el manifiesto se ve en inglés

### Requirement: Lectura cómoda
El manifiesto SHALL leerse con un ancho de línea de 60 a 75 caracteres, títulos en la tipografía de títulos y contraste AA en los dos temas, sin scroll horizontal a 390 px.

#### Scenario: Celular
- **WHEN** una persona abre la visión a 390 × 844
- **THEN** el texto se lee sin scroll horizontal

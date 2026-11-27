# Spec Delta

## Purpose

Inicio abre con el territorio y le dice a cada público por dónde seguir, sin tarjetas iguales que no jerarquizan nada (dirección B, Gus, 25-nov-2026).

## ADDED Requirements

### Requirement: Héroe a sangre
Inicio SHALL abrir con la foto del valle de borde a borde y el título, la bajada y las acciones directo sobre la foto, sin caja translúcida. El texto sobre la foto MUST pasar AA en los dos temas. El héroe MUST NOT medir el alto completo de la pantalla.

#### Scenario: Compu
- **WHEN** una persona abre `/` a 1440 px
- **THEN** ve la foto de borde a borde con el título encima y la acción "Explorar el territorio", y debajo empieza a verse la siguiente sección

### Requirement: Tres caminos por público
Inicio SHALL ofrecer tres caminos, cada uno con la pregunta de su público: quien quiere vivir (a Explorar), quien invierte (a Invertir) y quien cuida el bien común (a Participa o Bien común). Cada camino MUST ser un solo enlace.

#### Scenario: Quien invierte
- **WHEN** una persona toca el camino "¿Qué financio y cómo me devuelven?"
- **THEN** llega a `/invertir`

### Requirement: Cifras con fuente en una franja
Las cifras del sitio SHALL mostrarse juntas en una franja, cada una con su unidad y su fuente. Los números MUST salir de la misma fuente de datos que hoy.

#### Scenario: Fuente visible
- **WHEN** una persona mira la cifra de lluvia
- **THEN** ve el número, la unidad y la fuente debajo

# Spec Delta

## Purpose

Que cada persona diga cuánto se quiere involucrar con el Lighthouse (US-05) y que la plataforma use ese dato para sugerirle por dónde seguir y para saber si quiere invertir.

## ADDED Requirements

### Requirement: Elegir cuánto te querés involucrar
La página `/perfil` SHALL mostrar, arriba del formulario del perfil, un grupo de opciones con la leyenda "¿Cuánto te querés involucrar?" y exactamente estas cuatro opciones, en este orden: "Solo invertir", "Visitar", "Vivir parte del año" y "Mudarme". Elegir una opción MUST guardarla al instante en el navegador con la clave `lh-permanencia` (con el prefijo por persona de `login-privy`) y mostrar el texto "Guardado". La persona MUST poder cambiar la opción en cualquier momento.

#### Scenario: Primera elección
- **WHEN** la persona entra a `/perfil` sin haber elegido nada y marca "Visitar"
- **THEN** "Visitar" queda marcada, se ve "Guardado" y `lh-permanencia` guarda el valor `visitar`

#### Scenario: Cambiar de opinión
- **WHEN** la persona eligió "Visitar", recarga la página y marca "Mudarme"
- **THEN** al recargar se veía "Visitar" marcada y ahora queda "Mudarme" guardada

### Requirement: Sin elegir es sin dato
Si no hay nada guardado en `lh-permanencia`, o lo guardado no es uno de los cuatro valores (`invertir`, `visitar`, `parte-del-anio`, `mudarme`), el sistema MUST tratarlo como "sin dato": ninguna opción marcada en `/perfil` y la pantalla no falla.

#### Scenario: Valor raro guardado
- **WHEN** `lh-permanencia` contiene `"vacaciones"` y la persona abre `/perfil`
- **THEN** ninguna de las cuatro opciones está marcada y la página se ve normal

### Requirement: Sugerencia de por dónde seguir
Con una opción elegida, `/perfil` SHALL mostrar debajo del grupo un único enlace "Te sugerimos seguir por…" según esta tabla: "Solo invertir" → la sección "Para inversores" de `/sumarte` (`/sumarte#inversores`); "Visitar" → `/congreso`; "Vivir parte del año" y "Mudarme" → `/tribus`. Sin opción elegida, la sugerencia MUST no mostrarse.

#### Scenario: Persona que solo quiere invertir
- **WHEN** la persona marca "Solo invertir"
- **THEN** aparece un enlace a `/sumarte#inversores`

#### Scenario: Sin elegir
- **WHEN** la persona no eligió ninguna opción
- **THEN** no aparece ningún enlace "Te sugerimos seguir por…"

### Requirement: Mi recorrido sabe si querés invertir
En "Mi recorrido" (`/panel`), el progreso SHALL considerar que la persona quiere invertir si eligió "Solo invertir" **o** si inició el KYC del Pasaporte. El panel MUST mostrar el dato "Cómo te querés involucrar:" seguido del nombre de la opción elegida, o "sin dato" si no eligió.

#### Scenario: Elegir "Solo invertir" suma el paso de identidad
- **WHEN** la persona tiene el perfil completo, adhirió a una comunidad, propuso un pacto, no inició el KYC y eligió "Solo invertir"
- **THEN** el próximo paso de `/panel` es "Verificá tu identidad"

#### Scenario: Otra opción no lo suma
- **WHEN** la persona está en la misma situación pero eligió "Visitar"
- **THEN** el próximo paso de `/panel` no es "Verificá tu identidad"

#### Scenario: Dato faltante en el panel
- **WHEN** la persona no eligió ninguna opción
- **THEN** `/panel` muestra "Cómo te querés involucrar: sin dato"

### Requirement: Borrar el dato
"Borrar todo lo de este navegador" SHALL quitar también `lh-permanencia`.

#### Scenario: Borrar todo
- **WHEN** la persona eligió "Mudarme" y usa "Borrar todo lo de este navegador" y confirma
- **THEN** `lh-permanencia` ya no existe y en `/perfil` no hay ninguna opción marcada

### Requirement: Calidad
El grupo MUST ser un `fieldset` con `legend` (o un `radiogroup` con nombre accesible), usable solo con teclado (Tab para entrar, flechas para cambiar), la opción elegida MUST distinguirse por algo más que el color (el control marcado y el texto "Guardado"), la página MUST usar solo tokens del tema y no anidar otro `<main>`, y `/perfil` con una opción elegida MUST pasar la auditoría de axe sin violaciones `serious` ni `critical`.

#### Scenario: Solo teclado
- **WHEN** la persona llega con Tab al grupo y usa las flechas
- **THEN** la opción enfocada queda marcada y guardada sin usar el mouse

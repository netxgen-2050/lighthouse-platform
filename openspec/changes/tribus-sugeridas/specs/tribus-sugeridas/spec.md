# Spec Delta

## Purpose

Sugerir a cada persona tres tribus del territorio a partir de lo que confirmó en su perfil, con su nivel de afinidad y el porqué en palabras simples, dejando claro que es una sugerencia y nunca un filtro de ingreso.

## ADDED Requirements

### Requirement: Tres tribus sugeridas
Si el perfil guardado tiene al menos una respuesta confirmada, `/tribus` SHALL mostrar, antes del directorio, una sección "Sugeridas para vos" con tres tribus que no sean barrios vacantes: las dos de mayor afinidad y, como tercera, la de menor afinidad entre las restantes. Los empates MUST resolverse por número de barrio ascendente, para que el resultado sea siempre el mismo con el mismo perfil.

#### Scenario: Perfil confirmado
- **WHEN** la persona confirmó respuestas en su perfil y abre `/tribus`
- **THEN** ve la sección "Sugeridas para vos" con tres tarjetas antes del directorio

#### Scenario: Sin barrios vacantes
- **WHEN** se muestran las sugerencias
- **THEN** ninguna tarjeta corresponde a un barrio vacante

#### Scenario: Resultado estable
- **WHEN** la persona recarga `/tribus` sin cambiar su perfil
- **THEN** ve las mismas tres tribus en el mismo orden

### Requirement: Solo respuestas confirmadas
La sugerencia SHALL calcularse únicamente con las respuestas que la persona confirmó o corrigió. Las respuestas sin confirmar MUST NOT influir. Si no hay ninguna respuesta confirmada, la sección MUST mostrar "Completá tu perfil para ver tribus sugeridas" con un enlace a `/perfil` y ninguna tarjeta.

#### Scenario: Sin perfil
- **WHEN** no hay perfil guardado y la persona abre `/tribus`
- **THEN** ve "Completá tu perfil para ver tribus sugeridas" con enlace a `/perfil`
- **AND** no ve tarjetas sugeridas

#### Scenario: Respuesta sin confirmar
- **WHEN** la única respuesta que menciona "solar" está sin confirmar
- **THEN** "solar" no aparece en ningún porqué

### Requirement: Nivel de afinidad visible en texto
Cada tarjeta sugerida SHALL mostrar su nivel como texto: "Afinidad alta", "Afinidad media" o "Afinidad baja", acompañado del ⚖ `afinidad`. El nivel MUST NOT comunicarse solo con color.

#### Scenario: Nivel en texto
- **WHEN** la persona ve una tarjeta sugerida
- **THEN** lee el nivel de afinidad en texto y puede abrir la explicación ⚖ "Afinidad" con teclado

### Requirement: El porqué de cada sugerencia
Cada tarjeta SHALL explicar la sugerencia con frases armadas solo con datos de la tribu que coinciden con palabras de las respuestas confirmadas: "Coinciden en: …" y, si alguna coincidencia está entre lo que la tribu busca, "Vos aportás: …, que hoy buscan." Si no hay coincidencias, MUST decir "No encontramos puntos en común con lo que contaste." y MUST NOT inventar motivos.

#### Scenario: Aporta lo que buscan
- **WHEN** la persona confirmó "Sé instalar paneles de energía solar" y Valle Solar busca "Energía solar"
- **THEN** la tarjeta de Valle Solar dice "Vos aportás: Energía solar, que hoy buscan."

#### Scenario: Sin coincidencias
- **WHEN** una tribu sugerida no tiene ninguna palabra en común con el perfil
- **THEN** su tarjeta dice "No encontramos puntos en común con lo que contaste."

### Requirement: Aviso respetuoso para la menor afinidad
La tarjeta con "Afinidad baja" SHALL decir "Sus valores parecen distintos de los tuyos. Te la mostramos para que compares." y MUST NOT ofrecer "Proponer mi pacto". Las demás tarjetas MUST ofrecer "Ver la tribu" (→ `/tribus/<id>`) y "Proponer mi pacto" (→ `/pactos`).

#### Scenario: Tarjeta de afinidad baja
- **WHEN** una tarjeta sugerida tiene "Afinidad baja"
- **THEN** muestra el aviso y el botón "Ver la tribu", sin "Proponer mi pacto"

#### Scenario: Tarjeta afín
- **WHEN** una tarjeta sugerida tiene "Afinidad alta"
- **THEN** muestra "Ver la tribu" y "Proponer mi pacto"

### Requirement: La sugerencia no filtra
El directorio completo de tribus SHALL seguir mostrándose debajo de las sugerencias, sin cambios, con o sin perfil.

#### Scenario: Directorio completo
- **WHEN** la persona tiene sugerencias en `/tribus`
- **THEN** el directorio debajo sigue mostrando todas las tribus del territorio

### Requirement: Cierre de la entrevista hacia las sugerencias
Al completar la entrevista, `/perfil` SHALL ofrecer el enlace "Ver mis tribus" que lleva a la sección de sugerencias de `/tribus`.

#### Scenario: Terminar la entrevista
- **WHEN** la persona responde la última pregunta
- **THEN** ve el enlace "Ver mis tribus" con el foco puesto en él
- **AND** al activarlo llega a "Sugeridas para vos" en `/tribus`

# Spec Delta

## Purpose

Que las tribus, la interfaz del manifiesto, la postulación de comunidades y el territorio se lean en inglés, traduciendo lo que escribe la plataforma y respetando la voz de las comunidades y los nombres propios.

## ADDED Requirements

### Requirement: Tribus en inglés
With English as the platform language, the tribes list, the tribe page, the manifesto reading interface and the community application form SHALL show their interface, states, figures and error messages in English, with the same behavior as in Spanish.

#### Scenario: Listado
- **WHEN** una persona con la plataforma en inglés abre `/tribus`
- **THEN** ve los estados "Active", "Forming" y "Looking for a tribe" y los nombres de las tribus sin traducir

#### Scenario: Postulación con error
- **WHEN** envía la postulación de un barrio vacante sin completar un campo obligatorio
- **THEN** el error aparece en inglés, asociado al campo, y el foco va a ese campo

### Requirement: Datos descriptivos traducidos
The descriptive fields of each sample tribe and the territory texts (common land, places of interest and descriptive place names) SHALL have an English version; proper names MUST stay as in the source.

#### Scenario: Ficha de tribu
- **WHEN** una persona con la plataforma en inglés abre la ficha de Valle Solar
- **THEN** "Qué tiene", "Qué busca" y el ritual de entrada se leen en inglés y el nombre sigue siendo "Valle Solar"

#### Scenario: Lugar del mapa
- **WHEN** abre en el mapa el lugar de servicios compartidos
- **THEN** su nombre y su descripción están en inglés, y "Temazcal" sigue igual

### Requirement: Voz de la comunidad en el original
Manifestos and tribe declarations SHALL be shown in their original language, marked as Spanish, with a visible "Written in Spanish" note in English pages.

#### Scenario: Manifiesto
- **WHEN** una persona con la plataforma en inglés abre el manifiesto de Valle Solar
- **THEN** los botones y ayudas están en inglés y el texto del manifiesto está en español con `lang="es"` y la nota "Written in Spanish"

### Requirement: Páginas revisadas automáticamente
The tribes, manifesto, application and territory pages SHALL be in the list of translated pages, so the untranslated-text check covers them in English.

#### Scenario: Revisión automática
- **WHEN** corre el e2e de idioma
- **THEN** `/tribus`, `/tribus/valle`, `/tribus/valle/manifiesto`, la postulación de un barrio vacante y `/territorios/lighthouse` no tienen palabras en español fuera de lo marcado

### Requirement: Español sin cambios
With Spanish as the platform language, these pages SHALL show exactly the same texts as before this change.

#### Scenario: Pruebas existentes
- **WHEN** corren los e2e de tribus, territorio, mapa, postulación, membresía y Descubrir
- **THEN** pasan sin cambios

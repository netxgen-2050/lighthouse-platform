# Spec Delta

## ADDED Requirements

### Requirement: Valores de ejemplo, a re-ajustar
`/sumarte` SHALL decir en texto, arriba de los planes, que los valores son de ejemplo y a re-ajustar y que nada se cobra de verdad. Los precios MUST seguir siendo los vigentes: Miembro USD 10/mes o 100/año, Plan Tribu USD 60/mes o 600/año, Pase USD 300, 1.500 y 5.000.

#### Scenario: Aviso en español
- **WHEN** una persona abre `/sumarte`
- **THEN** lee "Valores de ejemplo, a re-ajustar" y que nada se cobra de verdad antes de llegar a los planes

#### Scenario: Aviso en inglés
- **WHEN** una persona abre `/sumarte` con el idioma en inglés
- **THEN** lee "Sample values, to be re-tuned" antes de llegar a los planes

### Requirement: A dónde va la plata de cada plan
Las tarjetas de los planes pagos SHALL decir en texto a dónde iría la plata: Miembro de la red a NetX, Plan Tribu a NetX como servicio que le factura a la tribu, y Pase Fundador al Fondo Común del procomún, con la aclaración de que no va a NetX.

#### Scenario: Pase Fundador
- **WHEN** una persona mira la tarjeta del Pase Fundador
- **THEN** lee que la plata va al Fondo Común del procomún, no a NetX

#### Scenario: Membresía y Plan Tribu
- **WHEN** una persona mira las tarjetas de Miembro de la red y Plan Tribu
- **THEN** cada una dice que ese plan lo cobra NetX

### Requirement: Pase Fundador con influencia en el Fondo Común
La tarjeta del Pase Fundador y la comparativa SHALL ofrecer "Influencia en el Fondo Común" con conviction voting como "próximamente", igual en los tres niveles, y MUST NOT ofrecer voto o voz en un fideicomiso ni la Ronda 0. "Conviction voting" MUST NOT traducirse.

#### Scenario: Tarjeta
- **WHEN** una persona mira la tarjeta del Pase Fundador
- **THEN** lee "Influencia en el Fondo Común" y "conviction voting (próximamente)" con su ⚖ "Influencia en el Fondo Común"
- **AND** lee que es la misma influencia en los tres niveles
- **AND** no lee "fideicomiso", "voto" ni "Ronda 0" en la tarjeta

#### Scenario: Comparativa
- **WHEN** una persona lee "Qué incluye cada plan"
- **THEN** la fila "Influencia en el Fondo Común (próximamente: conviction voting)" está incluida solo en el Pase Fundador
- **AND** la tabla sigue teniendo ocho filas

### Requirement: Créditos del Pase con vencimiento
La tarjeta del Pase Fundador SHALL decir que los créditos se liberan en 3 años y que vencen, y MUST NOT presentarlos como noches ni como un derecho permanente. Los montos MUST seguir siendo el 30 % del precio de cada nivel.

#### Scenario: Nivel Raíz
- **WHEN** una persona elige el nivel Raíz
- **THEN** lee "USD 1.500 en créditos", que se liberan en 3 años y que vencen a los 12 meses de liberarse

### Requirement: Qué es y qué no es el Pase
La tarjeta del Pase Fundador SHALL mostrar, en el idioma de la página, que no es una inversión y que no da tierra, lotes, prioridad ni rendimiento, y que no se revende. Esa frase y su explicación ⚖ MUST salir del catálogo legal, marcadas como borrador.

#### Scenario: En español
- **WHEN** una persona lee la tarjeta del Pase Fundador
- **THEN** lee "No es una inversión: no da tierra, lotes, prioridad ni rendimiento, y no se revende." junto a su ⚖

#### Scenario: En inglés
- **WHEN** una persona lee la tarjeta con el idioma en inglés
- **THEN** lee la frase en inglés, sin la marca de "solo en español"

### Requirement: Adhesión para participar
`/sumarte` SHALL decir, fuera de las tarjetas de planes, que participar en las decisiones pide adherir al manifiesto de Lighthouse VRN, que al adherir se queda adentro al instante sin aceptación de nadie, y que elegir un plan no hace adherir. SHALL enlazar a `/tribus/lighthouse` y mostrar el ⚖ `adhesiongobernanza`. Elegir un plan MUST NOT registrar una adhesión.

#### Scenario: Línea informativa
- **WHEN** una persona abre `/sumarte`
- **THEN** lee que participar en las decisiones pide adherir al manifiesto de Lighthouse VRN, con un enlace a su ficha y el ⚖ "Adherir para participar"

#### Scenario: Elegir un plan no adhiere
- **WHEN** una persona sin adhesión activa el Pase Fundador
- **THEN** su adhesión al manifiesto de Lighthouse VRN sigue sin registrarse

### Requirement: Planes sin Congreso
Los textos de los planes y de la comparativa SHALL dejar de ofrecer el Congreso y su ticket. La cohorte del Pase MUST NOT mostrar la fecha de febrero de 2027: SHALL decir "fecha a definir". El registro Genesis SHALL nombrar los eventos de comunidad como "a definir".

#### Scenario: Plan Explorador
- **WHEN** una persona lee el plan Explorador y la comparativa
- **THEN** no lee "Congreso" ni "ticket"

#### Scenario: Cohorte
- **WHEN** una persona mira la tarjeta del Pase Fundador
- **THEN** lee "Cohorte Génesis · fecha a definir" y no lee "Feb 2027"

### Requirement: Invertir sin oferta pública
`/sumarte` SHALL mostrar una sección "Invertir" con el texto visible "Esto no es una oferta" y su ⚖ en borrador, y dos tarjetas: "En los proyectos de regeneración" y "En NetX como empresa". La sección MUST NOT mostrar tasas, tickets, descuentos, cupos, medidores ni retornos, y MUST NOT tener una acción de pago o aporte.

#### Scenario: Sección
- **WHEN** una persona abre `/sumarte`
- **THEN** ve el título "Invertir" y lee "Esto no es una oferta" antes de las dos tarjetas

#### Scenario: Sin números de inversión
- **WHEN** una persona lee la sección "Invertir"
- **THEN** no hay montos, porcentajes ni medidores de lugares
- **AND** no lee "Lote 7"

### Requirement: Proyectos de regeneración por invitación
La tarjeta "En los proyectos de regeneración" SHALL explicar en palabras simples que la plata iría a proyectos y no a la tierra, que las series todavía no existen y que el SAFU se convertiría en Unidades de la Serie Madre, con ⚖ en cada término. SHALL conservar "Pedir invitación", que pide antes la verificación de identidad, y registrar el pedido como "Programa de series".

#### Scenario: Términos
- **WHEN** una persona lee la tarjeta
- **THEN** encuentra los ⚖ de Serie, SAFU, Serie Madre y Círculo por invitación

#### Scenario: Pedir invitación sin el sello
- **WHEN** una persona con sesión y sin el sello de identidad aprieta "Pedir invitación"
- **THEN** se abre la verificación de identidad, como hoy

#### Scenario: Pedir invitación con el sello
- **WHEN** una persona con el sello de identidad envía el pedido
- **THEN** ve "Invitación pedida (simulado)" y el pedido figura como "Invitación al círculo · Programa de series"
- **AND** ningún medidor cambia, porque no hay medidores

### Requirement: Lighthouse VRN no vende tierra
La tarjeta "En los proyectos de regeneración" SHALL decir que en el Juego B Lighthouse VRN no vende tierra y que la tierra queda en una Fundación que todavía no existe, con su ⚖. Sumarte MUST NOT ofrecer, reservar ni dar prioridad sobre lotes o tierra.

#### Scenario: Texto
- **WHEN** una persona lee la tarjeta
- **THEN** lee que Lighthouse VRN no vende tierra en el Juego B, con el ⚖ "Fundación de la tierra"

### Requirement: Enlaces a la Vista NetX
Cada tarjeta de "Invertir" SHALL enlazar a la Vista NetX: los proyectos a `/netx/financiamiento#m-temprano` y la empresa a `/netx`. Sin sesión, el enlace MUST seguir la regla de acceso de la Vista NetX. En inglés, el enlace SHALL avisar que la Vista NetX está en español.

#### Scenario: Con sesión
- **WHEN** una persona con sesión aprieta "Ver cómo funciona en la Vista NetX"
- **THEN** se abre `/netx/financiamiento` en la sección de dinero temprano

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión aprieta ese enlace
- **THEN** termina en `/sumarte` con el aviso de que se habilita al sumarse gratis como Explorador

#### Scenario: Con teclado
- **WHEN** una persona llega al enlace con Tab y aprieta Enter
- **THEN** se abre el mismo destino

#### Scenario: En inglés
- **WHEN** una persona lee la sección con el idioma en inglés
- **THEN** cada enlace a la Vista NetX aclara "(in Spanish)"

### Requirement: Empresa por conversación privada
La tarjeta "En NetX como empresa" SHALL decir que es otra inversión, en la compañía y no en los proyectos, y SHALL conservar "Pedir una charla" con su ⚖ "Invertir en la empresa".

#### Scenario: Pedir una charla
- **WHEN** una persona con sesión envía el pedido de charla
- **THEN** ve "Charla pedida (simulado)" y no se hace ningún pedido de red

### Requirement: Sumarte alineado en los dos idiomas
Todo texto nuevo o cambiado de `/sumarte` SHALL tener versión en español y en inglés. Los ⚖ nuevos o reescritos MUST estar marcados como borrador. Con el idioma en inglés, el contenido de la página MUST NOT dejar español suelto.

#### Scenario: Página en inglés
- **WHEN** una persona abre `/sumarte` con el idioma en inglés
- **THEN** ve el título "Invest" y "This is not an offer"
- **AND** la página no tiene textos en español sin marcar

#### Scenario: Accesibilidad
- **WHEN** se corre la auditoría de axe sobre `/sumarte` en los dos idiomas
- **THEN** no hay violaciones serias ni críticas

## REMOVED Requirements

### Requirement: Acceso para inversores
**Reason**: Presentaba el fideicomiso del Lote 7 y los cupos del círculo, del diseño anterior al 17-oct. Mostrar cupos en una página pública se parece a difundir una oferta.
**Migration**: La reemplazan "Invertir sin oferta pública", "Proyectos de regeneración por invitación" y "Empresa por conversación privada". Los pedidos y los estados guardados en el navegador siguen valiendo.

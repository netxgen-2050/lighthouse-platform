# Spec Delta

## ADDED Requirements

### Requirement: Consultas por repartir
La plataforma SHALL calcular, a partir de la lista de consultas del repositorio, las consultas **abiertas** en las que la persona no guardó ningún reparto o su último reparto guardado no tiene ningún voto, ordenadas por fecha de cierre (la más próxima primero). Cada una SHALL llevar su título, un enlace a su detalle y el texto del cierre: "Cierra hoy", "Cierra mañana" o "Cierra el <fecha>", según la fecha en la zona horaria de Argentina. Una consulta cerrada MUST NOT aparecer, aunque la persona no haya repartido.

#### Scenario: Una consulta abierta sin repartir
- **WHEN** la persona está en el padrón de U1, abierta, y no guardó ningún reparto
- **THEN** U1 aparece entre sus consultas por repartir con su fecha de cierre

#### Scenario: Reparto en cero
- **WHEN** la persona guardó en U1 un reparto con todas las opciones en 0
- **THEN** U1 sigue apareciendo entre sus consultas por repartir

#### Scenario: Ya repartió
- **WHEN** la persona guarda en U1 un reparto con al menos un voto
- **THEN** U1 deja de aparecer entre sus consultas por repartir

#### Scenario: Cierra mañana
- **WHEN** la fecha de cierre de U2 es el día siguiente
- **THEN** U2 muestra "Cierra mañana"

### Requirement: Aviso en el Fogón
`/fogon` y `/fogon/consultas` SHALL mostrar arriba, cuando hay consultas por repartir, el aviso "Tenés N consultas por repartir" (o "Tenés 1 consulta por repartir") con cada consulta enlazada y su cierre. Sin consultas por repartir MUST NOT mostrar el aviso. Si la lista no se pudo leer, SHALL decir "No pudimos saber si tenés consultas por repartir" y MUST NOT mostrar un 0. Sin sesión o sin consentimiento vigente, el aviso MUST NOT aparecer.

#### Scenario: Dos consultas pendientes
- **WHEN** la persona tiene U1 y U4 abiertas sin repartir y abre `/fogon`
- **THEN** ve "Tenés 2 consultas por repartir" con los dos títulos enlazados, la que cierra primero arriba

#### Scenario: Lectura fallida
- **WHEN** la lista de consultas responde con error
- **THEN** el Fogón dice "No pudimos saber si tenés consultas por repartir", sin ningún número

#### Scenario: Nada pendiente
- **WHEN** la persona ya repartió en todas sus consultas abiertas
- **THEN** no ve el aviso

### Requirement: Campanita y bandeja
La campanita SHALL sumar las consultas por repartir a su número de avisos y a su nombre accesible. `/bandeja` SHALL mostrarlas primero, en un grupo "Consultas por repartir", cada una con su enlace y su cierre. Esos ítems SHALL calcularse en cada lectura, sin guardarse: MUST NOT marcarse como leídos con "Marcar todo como leído" y SHALL desaparecer cuando la persona reparte o cuando la consulta cierra. Si la lista no se pudo leer, la campanita SHALL contar solo los demás avisos, y la bandeja SHALL decir "No pudimos saber si tenés consultas por repartir".

#### Scenario: Número de la campanita
- **WHEN** la persona tiene 1 aviso sin leer y 2 consultas por repartir
- **THEN** la campanita muestra 3 y su nombre accesible lo dice

#### Scenario: Marcar todo como leído
- **WHEN** la persona aprieta "Marcar todo como leído" en `/bandeja`
- **THEN** el grupo "Consultas por repartir" sigue ahí hasta que reparta

### Requirement: Preferencia de avisos del Fogón
`/configuracion` SHALL ofrecer un tipo de aviso "Consultas del Fogón", prendido por defecto. Apagado, la campanita y la bandeja MUST NOT contar ni mostrar las consultas por repartir, y el aviso dentro del Fogón SHALL seguir viéndose.

#### Scenario: Aviso apagado
- **WHEN** la persona apaga "Consultas del Fogón" y tiene 2 consultas por repartir
- **THEN** la campanita no las cuenta, la bandeja no las muestra y `/fogon` sigue diciendo "Tenés 2 consultas por repartir"

### Requirement: Próximo paso en Mi recorrido
Cuando hay consultas por repartir, el próximo paso de Mi recorrido SHALL ser "Repartí tus votos", con el título de la consulta que cierra primero, su cierre y un botón que lleva a esa consulta. Este paso SHALL ir antes que los demás. Sin consultas por repartir, o si la lista no se pudo leer, el próximo paso SHALL ser el mismo que antes de este cambio.

#### Scenario: Paso con fecha
- **WHEN** la persona tiene el perfil incompleto y U1 por repartir
- **THEN** Mi recorrido muestra "Repartí tus votos" con U1, antes de "Completá tu perfil"

### Requirement: Cuándo se revisa y accesibilidad del aviso
Las consultas por repartir SHALL leerse al cargar la página y cada vez que la pestaña vuelve a estar visible, sin consultas periódicas ni rutas nuevas. El aviso SHALL comunicarse con texto (no solo con color o con un punto), ser usable con teclado, pasar la auditoría de axe y no generar scroll horizontal a 390 px.

#### Scenario: Volver a la pestaña
- **WHEN** la persona reparte en U1 desde otra pestaña y vuelve a la primera
- **THEN** la campanita y el aviso ya no cuentan U1

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon` y `/bandeja` con consultas por repartir
- **THEN** no hay violaciones serias ni críticas

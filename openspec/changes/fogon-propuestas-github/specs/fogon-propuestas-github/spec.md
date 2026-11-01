## ADDED Requirements

### Requirement: Webhook firmado
`POST /api/fogon/github` SHALL accept only requests whose `X-Hub-Signature-256` matches an HMAC-SHA256 of the raw body with `GITHUB_WEBHOOK_SECRET`, compared in constant time. Requests with a missing or invalid signature MUST get 401 and MUST NOT write anything. Without the secret configured the route MUST answer 503. Bodies over 1 MB MUST be rejected, and a repeated `X-GitHub-Delivery` MUST be acknowledged without acting twice.

#### Scenario: Firma inválida
- **WHEN** llega un pedido con una firma que no coincide
- **THEN** la ruta responde 401 y no crea ninguna consulta

#### Scenario: Entrega repetida
- **WHEN** GitHub reenvía el mismo `X-GitHub-Delivery`
- **THEN** la ruta responde 200 y no crea una segunda consulta

#### Scenario: Preview sin secreto
- **WHEN** un preview recibe un pedido en la ruta
- **THEN** responde 503

### Requirement: Un PR etiquetado abre una consulta
When a pull request in an allowed repository receives the label `propuesta`, the platform SHALL create a `decision` consultation in the Equipo scope with open vote, result visible at close, the default founders roll copied at creation, and closing date after the configured number of days (default 7). The consultation SHALL show the PR title and author as plain text, the repository, a link to the PR, the changed files (up to 100, then "y N más") and the commit being voted. The platform SHALL comment on the PR with a link to the consultation. A PR MUST NOT have two open consultations. Events from repositories not on the allowed list, and labels other than `propuesta`, MUST be ignored.

#### Scenario: Etiquetar una propuesta
- **WHEN** alguien del equipo pone la etiqueta `propuesta` a un PR de `netxgen-2050/NS_permacultura`
- **THEN** aparece en `/fogon/consultas` una consulta "Aprobar / Rechazar / Abstenerme" con el título del PR, los archivos cambiados y el commit, y el PR recibe un comentario con el enlace

#### Scenario: Repo fuera de la lista
- **WHEN** llega el evento de un repo que no está en la lista de repos permitidos
- **THEN** la ruta responde 204 y no crea nada

#### Scenario: Etiquetar dos veces
- **WHEN** el PR ya tiene una consulta abierta y alguien quita y vuelve a poner la etiqueta
- **THEN** no se crea una segunda consulta

#### Scenario: Título con HTML
- **WHEN** el título del PR trae `<script>`
- **THEN** la consulta lo muestra como texto literal

### Requirement: La propuesta cambia durante la votación
When an open consultation's PR receives new commits, the consultation SHALL show "La propuesta cambió después de abrir la consulta" with the voted commit and the current one, and stay open. When the PR is closed without merge, the consultation SHALL close with the note "El PR se cerró antes de decidir".

#### Scenario: Commits nuevos
- **WHEN** el autor suma un commit al PR mientras se vota
- **THEN** la consulta muestra el aviso con los dos commits y se puede seguir votando

#### Scenario: PR cerrado
- **WHEN** el autor cierra el PR sin mergear
- **THEN** la consulta queda cerrada con la nota "El PR se cerró antes de decidir"

### Requirement: El resultado vuelve al PR
When a consultation created from a PR closes (by date or manually), the platform SHALL comment on the PR with the votes per option, participation ("votaron X de N"), the result and the voted commit (and the current one if it changed), and SHALL add the label `aprobada`, `rechazada` or `sin-quorum`. The platform MUST NOT merge, push or edit repository contents, and its GitHub credentials MUST NOT allow it. If GitHub fails, the consultation SHALL still close, and the super admin SHALL see "Reintentar aviso a GitHub" in `/netx`. Expired consultations SHALL be notified within one hour without anyone opening them.

#### Scenario: Aprobada
- **WHEN** cierra una consulta de un padrón de 5 con 3 votos para Aprobar y 1 para Rechazar
- **THEN** el PR recibe el comentario con "Aprobada · votaron 4 de 5" y la etiqueta `aprobada`, y sigue sin mergear

#### Scenario: Sin quórum
- **WHEN** cierra una consulta de un padrón de 6 en la que solo votaron 2 personas
- **THEN** el PR recibe la etiqueta `sin-quorum`

#### Scenario: GitHub caído
- **WHEN** GitHub responde con error al cerrar
- **THEN** la consulta queda cerrada en el Fogón y el super admin ve "Reintentar aviso a GitHub"

### Requirement: Configuración de propuestas
The super admin SHALL set, in `/netx`, the default founders roll (people that exist in the database), the allowed repositories (`owner/repo`) and the closing days. Other people MUST NOT see or change it, and the API MUST refuse them on the server. Changes MUST NOT affect consultations already created.

#### Scenario: Cambiar el padrón
- **WHEN** el super admin saca a una persona del padrón de socios
- **THEN** las consultas abiertas conservan su padrón y las nuevas ya no la incluyen

#### Scenario: Otra persona
- **WHEN** una persona sin rol de super admin llama a la API de configuración
- **THEN** recibe 403

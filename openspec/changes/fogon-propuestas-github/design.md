# Design

## Context

- Las consultas del Fogón viven en la base. `fogon-cuadratico-en-la-base` deja las tablas `consultas`, `consulta_opciones`, `consulta_padron` y el libro `consulta_envios` / `consulta_envio_votos`, con triggers que lo hacen de solo agregar (ADR-001). `fogon-consultas-panel` deja la administración en `/netx`.
- Los repos de conocimiento (`netxgen-2050/NS_Tokenomics`, `NS_permacultura` y `NS_platform`, este último cuando tenga remoto) son **públicos**. Cualquiera puede hacer un fork y abrir un PR, pero solo quien tiene el rol Triage o más puede poner etiquetas, y solo Gus (code owner, con la ruleset de `main`) mergea.
- `reportes-sin-cuenta` (ADR-006) ya escribe en GitHub con `REPORTES_GITHUB_TOKEN`. Ese token es personal y alcanza a un solo repo, así que acá conviene una GitHub App: permisos mínimos, instalada en la organización y con su token renovado solo.
- Decisión de Gus (21-oct-2026): al principio votan **solo los socios fundadores**, con **igual poder de voto**. Los mecanismos por tipo de decisión, incluido Formal Consensus facilitado por IA, quedan para después.

## Goals / Non-Goals

**Goals:**
- Que un PR elegido por el equipo se convierta en una consulta de sí o no en el Fogón, sin cargarla a mano.
- Que el resultado quede escrito en el PR, atado al commit que se votó.
- Que la plataforma nunca pueda escribir el contenido de los repos.

**Non-Goals:** mergear desde la plataforma, Formal Consensus, identidad de GitHub, proponer desde la plataforma o el MCP, notificaciones.

## Decisions

### 1. Disparador: webhook de la organización, filtrado por etiqueta

Se configura un webhook de organización (no por repo) que envía el evento `pull_request` a `POST /api/fogon/github`. La ruta:

1. Lee el cuerpo crudo y verifica `X-Hub-Signature-256` con HMAC-SHA256 y `GITHUB_WEBHOOK_SECRET`, comparando en tiempo constante. Si la firma es inválida, responde 401 sin leer nada más. Sin la variable, responde 503 (como `reportes`).
2. Ignora (responde 204) todo repo que no esté en `repos_permitidos` y todo evento que no sea uno de estos:
   - `labeled` con la etiqueta `propuesta`: **crea** la consulta, si el PR no tiene ya una abierta (es idempotente por `(repo, pr)` y por el `X-GitHub-Delivery`);
   - `synchronize` sobre un PR con consulta abierta: registra el SHA nuevo;
   - `closed` sin merge sobre un PR con consulta abierta: cierra la consulta con la nota "El PR se cerró antes de decidir".
3. Rechaza cuerpos de más de 1 MB y entregas repetidas (`X-GitHub-Delivery` único en `propuestas_github_eventos`).

Por qué la etiqueta y no "cada PR": en un repo público, cualquiera puede abrir PRs. Poner etiquetas requiere Triage o más, así que solo el equipo puede convertir un PR en votación. Esto evita que alguien de afuera inunde el Fogón y no hace falta ningún límite por IP.

Alternativa descartada: una GitHub Action en cada repo que llame a la API. Necesita un secreto en cada repo, y con PRs de forks obliga a usar `pull_request_target`, que es fácil de configurar mal.

### 2. Modo `decision`

- Se agrega `decision` al enum `modo`. Las opciones son fijas y las crea el servidor: `aprobar`, `rechazar` y `abstenerme`.
- **Voto**: cada envío tiene exactamente una opción con valor 1 y las demás en 0. Un trigger lo exige para `modo = 'decision'`. La regla de créditos cuadráticos no aplica a este modo: el `check (creditos = 100)` se mantiene por compatibilidad y el motor cuadrático no se usa.
- **Resultado** (función pura `resultadoDecision`):
  - es **aprobada** si `aprobar > rechazar` y votó (sin contar abstenciones) al menos la mitad del padrón;
  - es **rechazada** si `rechazar ≥ aprobar` con quórum;
  - queda **sin quórum** en otro caso.
  Esta regla está marcada como [a confirmar con Gus] y vive en un solo lugar para poder cambiarla.
- Siempre con voto abierto y el resultado visible al cierre, que son los valores por defecto de las consultas de Equipo (ADR-007).

### 3. Tablas (una migración nueva)

| Tabla | Columnas | Garantías |
|---|---|---|
| `propuestas_github` | `id uuid`, `consulta_id → consultas unique`, `repo text`, `pr int`, `url`, `titulo_pr`, `autor_login`, `sha_inicial`, `sha_actual`, `cambio_at` nula, `comentario_url` nula, `creada_at` | `unique (repo, pr, consulta_id)`; un índice parcial impide dos consultas abiertas para el mismo `(repo, pr)` (por trigger, porque el estado vive en `consultas`) |
| `propuestas_github_eventos` | `delivery_id text primary key`, `evento`, `recibido_at` | Solo agregar, para ignorar entregas repetidas |
| `fogon_config` | `clave text primary key`, `valor jsonb`, `cambiado_por → personas`, `cambiado_at` | Guarda `padron_socios` (lista de `persona_id`), `repos_permitidos` (lista de `owner/repo`) y `dias_cierre` (por defecto 7) |

El padrón de cada consulta se **copia** de `padron_socios` cuando se crea (`consulta_padron`). Cambiar la configuración no altera las consultas que ya están abiertas.

### 4. Escribir en GitHub: GitHub App de permisos mínimos

- App de la organización, "NetX Fogón", con permisos `Pull requests: write`, `Issues: write` (para comentar y etiquetar), `Contents: read` y `Metadata: read`. **Nunca `Contents: write`**: la plataforma no puede pushear ni mergear.
- `lib/github/app.ts` firma un JWT con la clave privada, pide un token de instalación (dura 1 h) y lo guarda en memoria hasta 5 minutos antes de que venza.
- **Al crear la consulta**, la plataforma pide `GET /repos/{repo}/pulls/{n}/files` para listar los archivos cambiados (como máximo 100; si hay más, muestra "y N más") y comenta en el PR: "Se abrió una consulta en el Fogón (cierra el …)", con el enlace.
- **Al cerrar la consulta** (por fecha o a mano), comenta el resultado y pone la etiqueta `aprobada`, `rechazada` o `sin-quorum`. Si GitHub falla, la consulta se cierra igual y en `/netx` aparece "Reintentar aviso a GitHub". El cierre nunca depende de GitHub.
- El cierre por fecha ya es perezoso (se calcula al leer). Para que el comentario salga sin que nadie abra la consulta, un cron de Vercel (`/api/fogon/cron/cierres`, cada hora, protegido con `CRON_SECRET`) avisa a GitHub de las consultas vencidas.

### 5. Seguridad y previews (ADR-010, nuevo)

- Las variables de la App y del webhook existen **solo en Production**. Sin ellas, los previews responden 503 en la ruta (ADR-008: los previews no tocan datos ni servicios reales).
- La ruta no usa la sesión: su autenticación es la firma. Todo lo que escribe sale del cuerpo firmado, pero el título y el autor se muestran **como texto**, nunca como HTML, porque vienen de un desconocido.
- **Corte de emergencia**: quitar `GITHUB_WEBHOOK_SECRET` en Vercel, o desactivar el webhook en GitHub.

## Risks / Trade-offs

- **[Un socio con Triage etiqueta PRs basura]** → Mitigación: es alguien del equipo y queda registrado en el historial del PR. El super admin puede cerrar la consulta a mano.
- **[La propuesta cambia mientras se vota]** → Mitigación: se muestra y se comenta el SHA votado contra el actual. Gus decide si mergea o si pide reetiquetar (quitar y volver a poner `propuesta` abre una consulta nueva después de cerrar la anterior).
- **[GitHub no responde al cerrar]** → Mitigación: la consulta se cierra igual y se puede reintentar desde `/netx`.
- **[El resultado no obliga técnicamente a mergear]** → Es a propósito: la decisión es del Fogón y la ejecución es de Gus. La ruleset de GitHub garantiza que nadie más pueda mergear.

## Migration Plan

1. Mergear este cambio a `dev`, con la migración hacia adelante.
2. Gus sigue `docs/guiones/github-propuestas.md`: rulesets, `CODEOWNERS`, etiquetas, crear e instalar la App, webhook de la organización y variables en Vercel Production.
3. En `/netx`, cargar el padrón de socios y los repos permitidos.
4. Prueba real: un PR de prueba en `NS_permacultura` con la etiqueta `propuesta`.

Rollback: desactivar el webhook. Las consultas que ya existen quedan como están.

## Open Questions

- ¿La regla de resultado (mayoría simple con quórum de la mitad del padrón) está bien para empezar? [a confirmar con Gus]
- Si el PR cambia durante la votación, ¿alcanza con avisar o la consulta se debería anular sola?
- ¿Quiénes son exactamente los "socios fundadores" del primer padrón?
- `NS_platform` no tiene remoto en GitHub: ¿se publica y se suma a la lista?

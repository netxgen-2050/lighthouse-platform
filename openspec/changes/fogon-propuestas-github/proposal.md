# Proposal

## Why

El conocimiento de NetX Gen vive en repos públicos de GitHub (`NS_Tokenomics`, `NS_permacultura`, `NS_platform`) y pronto lo van a leer las IAs del equipo por un servidor MCP. Gus quiere que **cualquiera pueda proponer un cambio** a ese conocimiento con un Pull Request, pero que **la decisión se tome en el Fogón**, entre los socios fundadores y con igual poder de voto, y no la tome una sola persona en GitHub. Hoy el Fogón solo tiene consultas cuadráticas cargadas a mano: falta una consulta de **sí o no** que nazca de un PR y que devuelva el resultado al PR.

## What Changes

- **Modo de consulta nuevo `decision`**: una persona, un voto (Aprobar / Rechazar / Abstenerme), sin créditos cuadráticos. Usa el mismo libro de solo agregar de `fogon-cuadratico-en-la-base`: vale el último voto de cada persona hasta el cierre.
- **Ruta `POST /api/fogon/github`** que recibe el webhook de la organización `netxgen-2050`. Verifica la firma HMAC (`X-Hub-Signature-256`) con `GITHUB_WEBHOOK_SECRET` y actúa solo cuando:
  - un PR de un repo de la lista permitida recibe la etiqueta `propuesta`; poner etiquetas exige el rol Triage o más, así que **el equipo elige qué PR llega al Fogón** y nadie de afuera puede abrir una votación;
  - un PR con consulta abierta recibe commits nuevos (`synchronize`) o se cierra sin decisión.
- **Consulta automática**: con la etiqueta, se crea una consulta `decision`, de ámbito Equipo y voto abierto, con el padrón de **socios fundadores** (el padrón por defecto que configura el super admin) y cierre a 7 días. La consulta muestra título, autor, repo, el enlace al diff, la lista de archivos cambiados y el **commit (SHA) sobre el que se vota**.
- **Resultado al PR**: al cerrar, la plataforma comenta en el PR el resultado (votos por opción, participación, SHA votado) y pone la etiqueta `aprobada` o `rechazada`. La plataforma **no mergea**: lo hace Gus como code owner. El token es de una GitHub App con permisos de PR e issues en escritura y de contenido **solo lectura**.
- **Si la propuesta cambia durante la votación**: la consulta muestra "La propuesta cambió después de abrir la consulta" con el SHA nuevo, y el comentario final lo aclara. La consulta sigue abierta y decide Gus (ver Open Questions en design).
- **Panel `/netx`**: el super admin define el padrón por defecto ("socios fundadores") y la lista de repos permitidos, y ve las consultas que nacieron de PRs.
- Una tabla nueva `propuestas_github`, que vincula repo, número de PR, SHA y consulta, y un ADR nuevo, ADR-010, sobre la ruta pública que escribe desde un webhook.

**Fuera de alcance:**
- **Formal Consensus facilitado por IA** y cualquier otro mecanismo por tipo de decisión: va al backlog del Fogón.
- Mergear desde la plataforma o auto-merge.
- Vincular la cuenta de GitHub del autor con una persona de la plataforma: votan las personas del padrón con el login de la plataforma, y el autor se muestra solo como texto.
- Proponer cambios desde la plataforma o desde el MCP (un PR creado por otra vía entra igual, con la etiqueta).
- Resúmenes del diff hechos con IA y notificaciones ("hay una propuesta nueva").
- Configurar las rulesets, `CODEOWNERS` y la App en GitHub: es un guion manual para Gus (`docs/guiones/github-propuestas.md`).

## Capabilities

### New Capabilities
- `fogon-propuestas-github`: un PR etiquetado `propuesta` abre una consulta de decisión y el resultado vuelve al PR.

### Modified Capabilities
- `fogon-consultas`: suma el modo `decision` (una persona, un voto) y el padrón por defecto de socios fundadores.

## Impact

Orden: `base-neon` → `consentimiento-en-la-base` → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel` → **`fogon-propuestas-github`**. Si alguno no está en `dev`, frenar.

Archivos:
- `lib/db/schema.ts` y una migración nueva (enum `modo` + `decision`, tabla `propuestas_github`, ajuste de triggers);
- `lib/fogon/consultas/` (tipos, reglas y resultado del modo `decision`);
- `lib/github/` (firma del webhook, cliente de la App);
- `app/api/fogon/github/route.ts` y el cierre de consultas, que avisa a GitHub;
- la sección de `/netx`;
- `docs/decisiones/ADR-010-webhook-github.md` y `docs/guiones/github-propuestas.md`;
- los e2e.

Variables nuevas, **solo en Production**: `GITHUB_WEBHOOK_SECRET`, `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` y `GITHUB_APP_INSTALLATION_ID`.

Toca una ruta pública que escribe, credenciales externas y votos: requiere revisión de arquitectura.

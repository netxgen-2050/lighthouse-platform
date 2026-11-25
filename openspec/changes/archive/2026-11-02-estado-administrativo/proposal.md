# Proposal

## Why

`territorio-macrolote` (aprobado el 7-oct) pone en el mapa del Lighthouse las **175 fincas de Chacras de Soluna** con su estado y un botón "Consultar por este lote", porque NetX actúa como agencia de BioPueblo. Es la primera vista de la plataforma que **muestra lotes**. La regla **C1** de cumplimiento (Desarrollo/03, Ordenanza 173/2026 de Mainqué) entra en la It.1 del roadmap (Desarrollo/06) y pide un componente `EstadoAdministrativo` obligatorio en toda vista con lotes, con el estado del loteo y el expediente, y que no haya botones de compra ni de reserva hasta que la aprobación municipal esté cargada. Hoy no existe ni el componente ni el dato, y nada impide que una vista nueva muestre lotes sin el aviso.

Aunque estamos en fase de prototipo interno (plata e inversión permitidas, ver `CLAUDE.md`), la Ordenanza 173 no es una regla de plata sino de **publicidad de lotes**, y el mock-up v6 la sigue mostrando ("Los lotes de Chacras de Soluna son de BioPueblo, loteo en trámite, Ord. 173/2026"). Conviene que el aviso esté antes de mostrar el mapa con fincas a más gente.

## What Changes

- **Dato del estado administrativo por proyecto** (`lib/legal/estado-administrativo.ts`): por ahora un solo proyecto, Chacras de Soluna, con titular (BioPueblo), estado ("Loteo en trámite"), norma ("Ord. 173/2026 de Mainqué"), expediente (sin dato: la Memoria Técnica no lo trae), `aprobacionMunicipal: false` y fecha del dato. Un dato que falta se muestra "sin dato", nunca vacío ni inventado.
- **Componente `EstadoAdministrativo`** (`components/estado-administrativo.tsx`), con dos tamaños:
  - **Completo**, arriba del mapa en `/territorios/lighthouse`: "Chacras de Soluna · Loteo en trámite · Ord. 173/2026 de Mainqué · Expediente: sin dato · Aprobación municipal: pendiente", con el ⚖ `loteo`.
  - **Compacto**, dentro de la ficha de cada finca de Soluna: "Loteo en trámite · Ord. 173/2026" con el ⚖ `loteo`.
  - Se comunica con texto y un ícono, no solo con color; es una región con nombre accesible "Estado administrativo".
- **Sin compra ni reserva mientras no haya aprobación:** una función pura `accionesDeLote(proyecto)` devuelve qué acciones puede ofrecer una vista sobre un lote. Con `aprobacionMunicipal: false` solo devuelve "consultar"; nunca "comprar", "reservar" ni "señar". La ficha de la finca usa esa función para decidir qué botón muestra.
- **Registro de vistas con lotes** (`lib/legal/vistas-con-lotes.ts`): la lista de rutas que muestran lotes (hoy `/territorios/lighthouse`). Un e2e recorre la lista y falla si alguna no muestra el componente. Quien agregue una vista con lotes la suma a la lista.
- **Catálogo legal con borradores:** si `borrador: true` todavía no existe en `lib/legal/terminos.ts` (lo trae también `privacidad-consentimiento`, en espera), este cambio lo agrega con el mismo diseño: el ⚖ de un término borrador muestra "Borrador: texto a revisar".
- **Un ⚖ nuevo, `loteo`** ("Estado del loteo"), redactado por el agente, con `borrador: true`.

**Fuera de alcance:**
- Cargar el número de expediente real o cambiar el estado: es un dato que da Gabriel/Diego; el campo queda "sin dato".
- Habilitar compra o reserva cuando llegue la aprobación (flujo de boleto, corredor matriculado): otro cambio.
- Decidir si "Consultar por este lote" está permitido mientras el loteo sigue en trámite (ver preguntas abiertas). Este cambio no saca ni agrega ese botón: lo deja como lo define `territorio-macrolote`.
- La bitácora de qué se le mostró a cada persona (C11): cambio `bitacora-exposicion`.
- Lotes en otras vistas (Vista NetX muestra una columna "Fincas" por tribu, interna): no se suma a la lista hasta que Gus lo decida.
- Otros proyectos u otros territorios: el dato admite más de uno, pero hoy solo se carga Soluna.

## Capabilities

### New Capabilities
- `estado-administrativo`: el estado del loteo por proyecto, el aviso obligatorio en las vistas con lotes y la regla de no ofrecer compra ni reserva sin aprobación municipal.

### Modified Capabilities

## Impact

Código nuevo en `lib/legal/estado-administrativo.ts`, `lib/legal/vistas-con-lotes.ts` (con tests de Vitest) y `components/estado-administrativo.tsx`; cambio chico en la página y en la ficha de finca de `app/territorios/[id]/` (lo que deja `territorio-macrolote`); `lib/legal/terminos.ts` y su test (término `loteo`, y `borrador` si falta); `components/termino-legal.tsx` (marca de borrador, si falta); `e2e/estado-administrativo.spec.ts`. **Depende de** `territorio-macrolote` en `main`. Sin dependencias npm nuevas.

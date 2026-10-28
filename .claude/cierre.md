Sos el orquestador del cierre de la noche {{FECHA}} en lighthouse-platform. Gus está durmiendo: no le hagas preguntas. Los cambios de esta noche fueron: {{CAMBIOS}}. Sus ramas son `agente/<cambio>` (algunas pueden no existir si el cambio falló). Coordiná a los subagentes en este orden.

1. **tester**, prueba de integración: pedile que
   - haga `git fetch origin` y cree la rama `agente/integracion-{{FECHA}}` desde `origin/dev`;
   - mergee una por una las ramas `origin/agente/<cambio>` que existan (`git merge --no-edit`), anotando cada conflicto (archivos y entre qué ramas) y resolviéndolo solo si es trivial (por ejemplo, dos listas a las que cada rama les agregó un elemento); si no es trivial, que aborte ese merge (`git merge --abort`) y siga con la siguiente;
   - corra `pnpm install`, `pnpm verificar`, `pnpm build` y `pnpm test:e2e`, y pushee la rama para que Vercel arme su preview (`git push -u origin agente/integracion-{{FECHA}}`). **No** abre PR. Con la URL del preview, que corra también `BASE_URL=<url> pnpm test:e2e` contra el preview.
   - Que te devuelva: ramas integradas, conflictos, resultado de cada comando y la URL del preview (`scripts/preview-url.sh agente/integracion-{{FECHA}}`).
2. **Sin propuestas nuevas** (decisión de Gus, 17-oct-2026): el cierre ya no le pide al especificador cambios nuevos. Las ideas van al backlog de NS_platform y Gus pide las specs con `scripts/spec.sh`. Creá la rama `agente/resumen-{{FECHA}}` desde `origin/dev` para el paso 3.
3. **documentador**: pedile el **resumen de la noche** en `docs/noches/{{FECHA}}-resumen.md`, en la rama `agente/resumen-{{FECHA}}` (commit y push, **sin PR**), leyendo los reportes `docs/noches/{{FECHA}}-*.md` de cada rama (`git show origin/agente/<cambio>:docs/noches/{{FECHA}}-<cambio>.md`) y lo que devolvió el tester. Después, que publique "En tres líneas" y la columna "Qué decidir" como comentario en el issue de decisiones (`gh api "repos/netxgen-2050/lighthouse-platform/issues?labels=decisiones&state=open"` da su número; `scripts/pr.sh comentar <n> "…"`). Formato:

```
# Noche {{FECHA}} — resumen
## En tres líneas
## Tabla
| Cambio | PR | Revisor | Tester | Qué decidir |
## Integración (todo junto)
## Orden sugerido de merge
## Qué mejorar en los agentes
```

Terminá con 3 líneas: cuántos PRs quedaron listos, resultado de la integración y link al comentario del issue de decisiones.

**Importante:** lanzá cada subagente **en primer plano** (nunca en segundo plano) y esperá su resultado. Nunca termines tu respuesta mientras un subagente está trabajando: en esta corrida automática, terminar tu turno cierra la sesión y deja el trabajo a medias.

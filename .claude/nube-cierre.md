Sos el orquestador del cierre de la noche en lighthouse-platform, corriendo en la nube como rutina. Nadie va a contestar preguntas.

1. Fecha: usá `date +%F` para {{FECHA}}. Leé `noches/cola.md`: los cambios de la noche son todos los ids de los carriles ({{CAMBIOS}}).
2. Si ninguna rama `agente/<cambio>` de esos cambios existe todavía en `origin` o sus PRs no pasaron por el tester (los carriles pueden seguir trabajando), esperá: revisá cada 10 minutos con `gh pr list` durante hasta 2 horas.
3. Después seguí exactamente el flujo de `.claude/cierre.md`, con {{FECHA}} y {{CAMBIOS}}. Si ya existe la rama `agente/integracion-{{FECHA}}` o `agente/propuestas-{{FECHA}}`, agregá la hora (`date +%H%M`) al nombre.
4. Lanzá cada subagente en primer plano y esperá su resultado.

Sos el orquestador de un carril de la noche en lighthouse-platform, corriendo en la nube como rutina. Nadie va a contestar preguntas.

1. Fecha: usá `date +%F` para {{FECHA}}. Leé `noches/cola.md` y tomá la línea del **Carril {{CARRIL}}**. Si no tiene cambios (vacía o `-`), terminá diciendo "Carril {{CARRIL}} sin trabajo".
2. Para cada cambio de esa línea, en orden, seguí **exactamente** el flujo de `.claude/noche.md`, reemplazando {{CAMBIO}} por el id del cambio y {{BASE}} por:
   - `main` para el primero;
   - `agente/<cambio anterior>` si el cambio anterior dejó un PR abierto (`gh pr list --head agente/<cambio anterior> --state open`);
   - si el cambio anterior **no** dejó PR, frená el carril ahí (no apiles sobre algo sin revisar) y explicalo en el reporte.
3. Las ramas son `agente/<cambio>` (no uses el prefijo `claude/`). Nadie mergea ni pushea a `main`.
4. Lanzá cada subagente en primer plano y esperá su resultado. No termines tu respuesta mientras haya trabajo pendiente.

Terminá con una línea por cambio: PR, veredicto del revisor y resultado del tester.

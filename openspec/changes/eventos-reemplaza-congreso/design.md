# Design

## Context

`/congreso` está conectada con media plataforma: rail, portada, Mi recorrido, Pasaporte, Semillas, Sumarte, idioma y muchos e2e. Si solo se redirigiera, quedarían invitaciones sin salida: por ejemplo, Mi recorrido recomendaría para siempre "Registrá tu ticket", y el enlace llevaría a una página donde no hay dónde registrarlo. Hay un precedente de pausa: Compromisos (`rail-sin-compromisos`, `docs/notas/compromisos-en-pausa.md`).

## Goals / Non-Goals

**Goals:** que nada lleve a un callejón; poder volver cambiando pocas líneas; no romper a quien ya tiene un ticket guardado.

**Non-Goals:** resolver Genesis, la cohorte o el modelo financiero (dependen de D16 e I-15); borrar la vitrina.

## Decisions

### 1. Redirección en `next.config.ts`

```ts
async redirects() {
  return [
    { source: "/congreso", destination: "/eventos", permanent: false },
    { source: "/congreso/en", missing: [{ type: "cookie", key: "lh-idioma" }], destination: "/eventos?lang=en", permanent: false },
    { source: "/congreso/en", destination: "/eventos", permanent: false },
  ];
}
```

- `permanent: false` responde 307. Un 308 quedaría guardado en el navegador de cada persona y dificultaría volver.
- Next pasa la query a la redirección y el navegador conserva el ancla.
- `next.config` corre antes del middleware, así que las reglas de idioma sobre `/congreso` no se ejecutan y su lógica pura no cambia.
- `?lang=en` reutiliza el mecanismo del middleware: fija la cookie y limpia la dirección. La regla `missing` evita pisar un idioma ya elegido, que es lo mismo que garantizaba ADR-003 ("no cambia lo elegido"). El nombre de la cookie debe coincidir con `COOKIE_IDIOMA`: se importa de `lib/idioma/cookie` si `next.config.ts` puede hacerlo sin arrastrar nada más; si no, se usa el literal y un test unitario compara los dos.

**Alternativas descartadas:**
- Redirigir en `resolverIdioma`: mezcla idioma con navegación y obliga a cambiar una función con muchos tests.
- `redirect()` en `app/congreso/page.tsx`: toca la vitrina, y volver sería más que quitar tres reglas.
- Borrar las páginas: Gus pidió conservarlas.

### 2. Navegación

- `lib/idioma/glosario.ts` suma `eventos: { es: "Eventos", en: "Events" }`. `G.congreso` se mantiene, porque sigue en uso. `lib/idioma/textos/marco.ts` suma el destino.
- En `DESTINOS` se agrega `{ href: "/eventos", clave: "eventos", icono: CalendarDays, grupo: "participar", existe: true }` antes de Congreso, y Congreso queda `oculto: true`. El comentario del campo `oculto` suma este caso y remite a la nota. El test que compara `existe` con el disco sigue pasando sin cambios.
- `/congreso` sigue en `RUTAS_PUBLICAS` y `RUTAS_TRADUCIDAS`: la página existe y `rutas.test.ts` lo vigila.

### 3. Portada y origen

`CAMINOS_VALIDOS` pasa a `["tribus", "perfil", "eventos"]`. `caminoValido` traduce el alias `congreso` a `eventos`, tanto en la dirección como al leer `lh-origen` guardado. Sus claves en `textos/portada` pasan a `eventos`. Se mantienen la etiqueta "Encontrarse en persona" y la descripción "Visita al Lighthouse, encuentros de tribus y mingas."; el título pasa a `G.eventos`. Los valores de `utm_campaign` no se tocan: son texto libre.

### 4. Próximo paso

- `ClavePaso`: `ticket` pasa a `evento`, con `href: "/eventos"`.
- `Progreso.tieneTicket` pasa a `eligioEvento`, calculado en `leerProgreso` como ticket válido **o** alguna entrada en `eventosQuieroIr`. Lo que importa es que eligió, así que no se quita el paso si el evento ya pasó.
- Textos de `recorrido`: "Elegí un evento" / "Mirá lo que viene y contá a cuál querés ir." / "Ver los eventos" (más su inglés).

### 5. Sello Genesis

En `lib/pasaporte/sellos.ts`:
- `presenciaGenesis` sigue como obtenido.
- Con ticket sigue `en-tramite`, con `detalleTicket` nuevo: "Tu ticket quedó registrado, pero el Congreso se canceló. Se está definiendo cómo se obtiene este sello."
- Sin ticket pasa de `disponible` a `no-disponible`, con `detalleSin`: "Todavía no se puede obtener: se está definiendo cómo." y acción "Ver los eventos", `href: "/eventos"`. Si la tarjeta `no-disponible` no dibuja acciones, se quita la acción, igual que en Residente.
- `detalleObtenido` sigue diciendo "check-in del Congreso": en el prototipo no se puede obtener de otra forma y corresponde a D16. Se anota en la nota.

No se adopta la propuesta de la nota 20 ("los primeros N encuentros") porque Gus todavía no la decidió.

### 6. Regla para decidir qué texto cambia

Cambia lo que **enlaza a `/congreso`** o **invita a hacer algo imposible**. No cambia lo que describe a Genesis o a la cohorte como beneficio, porque depende de D16 e I-15. Queda sin cambios y listado en la nota:

| Lugar | Texto | Depende de |
|---|---|---|
| `textos/sumarte`, `cohorte` | "Cohorte Génesis · Feb 2027" | D16, I-15 |
| `textos/sumarte`, `registroGenesis` | "Registro Genesis si venís al Congreso" | D16 |
| `lib/legal/terminos.ts`, `ronda0` | "En el Congreso, quienes tienen el Pase…" | D38, I-15 |
| `lib/financiamiento/fuentes.ts`, `SUPUESTO_CONGRESO` | Ya aclara la cancelación | I-15 |
| `textos/semillas`, `presenciaCongreso` y textos del ticket válido | Solo los ve quien ya tiene un ticket | D16 |

### 7. Tests de la vitrina

`e2e/congreso.spec.ts`, `e2e/congreso-en.spec.ts` y los bloques sobre la vitrina en `accesibilidad`, `idioma`, `descubrir-publico` y `bandeja` quedan con `test.describe.skip` (o `test.skip`) y el comentario `// En pausa: ver docs/notas/congreso-en-pausa.md`. No se borran, para poder reactivarlos. Se suma `e2e/eventos-reemplazo.spec.ts` con el comportamiento nuevo.

**Se pierde cobertura:** la vitrina deja de probarse en e2e. Sus piezas siguen con tests unitarios, incluida la portabilidad, y el tema se sigue usando en `/eventos`.

### 8. Nota para volver

`docs/notas/congreso-en-pausa.md`, con la estructura de `compromisos-en-pausa.md`:
1. Qué pasó y por qué, con las fuentes (D16, decisión del 2-nov-2026).
2. Qué quedó en el código, y **qué no se puede borrar aunque la vitrina siga en pausa**: `app/congreso/evento/`, `app/congreso/netx/ir-al-ancla.tsx`, `app/congreso/tema-evento.css`, `lib/congreso/{idioma,formatos,ancla,mostrar-ticket,ticket}.ts`, de los que dependen `/eventos`, el Pasaporte, Semillas y el idioma. <!-- arquitecto: faltaba ir-al-ancla.tsx, que /eventos importa de netx/ -->
3. La tabla de pendientes de la decisión 6, más check-in, Genesis, venta de entradas y el botón para quitar el ticket (ver "Risks").
4. Los pasos para volver: quitar los redirects, quitar `oculto`, reordenar el rail, devolver textos y enlaces, y reactivar los e2e, con la lista de archivos.

## Risks / Trade-offs

- **`/congreso/en?lang=es`** combina el `lang` de la dirección con el de la redirección → es un caso raro y no se especifica; un test e2e deja registrado qué pasa, y lo único que debe garantizar es que termine en `/eventos`.
- **Reglas inalcanzables** en el middleware y en `rutaParaIdioma` → es deuda aceptada para poder volver; la nota lo dice.
- **Cookie con valor inválido** en `/congreso/en` → cae en la tercera regla y llega a `/eventos` con el idioma que resuelva el pedido. Es aceptable.
- **Sello que cambia de estado** → puede afectar conteos en el Pasaporte; se revisa con los tests de sellos.
- **Choque con otra spec:** la lista de Participar aparece en la spec de `rail-sin-compromisos` (ver `proposal.md`).
<!-- arquitecto: tres riesgos encontrados en la revisión -->
- **El ticket ya no se puede quitar solo** → el botón "Quitar" vive en `app/congreso/registro-ticket.tsx`, dentro de la vitrina que deja de verse. El ticket se puede descargar, y borrar con "Borrar todo" o "Retirar mi consentimiento", pero eso se lleva todo lo demás. Se acepta mientras dure la pausa en un prototipo; la nota lo lista como pendiente y Gus decide si hace falta un botón en el Pasaporte.
- **La preferencia guardada puede cambiar a inglés** → la regla `missing` solo mira la cookie. Una persona con sesión, español guardado en sus preferencias y sin cookie que abre `/congreso/en` recibe `lang=en`; como "la cookie manda" (`decidirSincronizacion`), su preferencia pasa a inglés. Es un caso raro, se cambia con un clic y no se puede saber en `next.config.ts`. Se acepta y se anota.
- **La redirección es temporal, y ADR-003 promete una permanente** si la dirección cambia para siempre → el 307 es correcto mientras sea una pausa. La nota de ADR-003 lo aclara: si Gus retira la vitrina para siempre, `/congreso/en` pasa a redirección permanente.

## Migration Plan

1. Mergear `eventos` en `dev`.
2. Implementar este cambio desde ese `dev`.
3. Para volver atrás, seguir `docs/notas/congreso-en-pausa.md` o revertir el commit. Como es un 307, los navegadores no guardan la redirección.

## Open Questions

La decisión de redirigir está tomada por recomendación de Gus. Lo que falta decidir (Cohorte, Genesis y `ronda0`) no bloquea este cambio y se le pregunta en el resumen.

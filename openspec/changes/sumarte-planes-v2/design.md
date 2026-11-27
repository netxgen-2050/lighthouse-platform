# Design

## 1. Los planes

Valores de ejemplo, a validar con Vagner. Viven en `lib/sumarte/datos.ts` (un solo lugar); la página no escribe ningún número a mano.

| | Explorador | Amigo (destacado) | Fundador | Aliados |
|---|---|---|---|---|
| Precio | Gratis | USD 9/mes · USD 90/año ("2 meses gratis") | USD 1.500 · pago único | "Hablemos" (sin precio) |
| Para quién | Quien recién conoce el proyecto | Quien sigue el proyecto y quiere estar cerca | Quien quiere apoyar desde el principio | Empresas, ONG, universidades |
| Incluye | Mapa, lotes en vitrina, Bien común, Participa (sumarse a un equipo), adherir al manifiesto, Mi tierra, Hifa, novedades mensuales | Todo lo de Explorador; bitácora de obra y masterplan*; una sesión al mes con el equipo*; cupo antes que nadie en visitas y eventos*; FARO de prepago por mes | Todo lo de Amigo mientras dure su FARO; FARO de prepago de una vez; visita guiada al sitio*; nombre en el registro Génesis | Patrocinar un proyecto de regeneración*; talleres para equipos*; acceso a datos para investigación* |
| Cupo | — | — | Cohorte de 100 (medidor "N de 100", en texto) | — |

`*` = no existe todavía: se muestra con la marca "próximamente" (texto, no solo un ícono).

Fundador ya no dice "de por vida": su FARO vence (§2). Lo permanente es el nombre en el registro Génesis.

Aliados no se elige con un botón de plan: abre el formulario de contacto que ya existe (pedido de contacto, simulado).

## 2. FARO de prepago (borrador)

Amigo y Fundador usan la tercera puerta de FARO ("Prepagando servicios", `lib/idioma/textos/bien-comun.ts` → `puertas.prepagando`). En `lib/sumarte/datos.ts`:

```ts
export const FARO_PREPAGO = {
  borrador: true, // Gus, 27-nov-2026: reglas como placeholders
  precioUsd: 1,             // 1 FARO = USD 1 a precio de lista
  amigoPorMes: 5,
  fundadorDeUnaVez: 1200,
  venceAmigoMeses: 12,
  venceFundadorMeses: 36,
  parteServicioAmigo: 0.45, // de la cuota: servicio de NetX; el resto se acredita como FARO para el bien común
  daVoz: false,
} as const;
```

En el plan elegido, un bloque "Cómo funciona el FARO de tu plan" muestra estas cinco reglas en texto, con la etiqueta **"Borrador · a definir"** visible arriba:

1. Precio fijo: 1 FARO = USD 1 a precio de lista.
2. Se canjea solo por lo que existe (en la fase 1: eventos de comunidad, visitas, talleres y sesiones).
3. Se quema al usarse y no se devuelve en plata.
4. Vence: el de Amigo a los 12 meses de acreditarse, el de Fundador a los 36.
5. No da voz: la voz sale del FARO del lote, del trabajo en Participa y de adherir al manifiesto.

Si `borrador` es `true`, cada número de estas reglas lleva al lado "(a definir)". El reparto del pago se muestra en texto ("De tu cuota: USD X por el servicio de NetX · USD Y en FARO para el bien común"). No se dice "Fundación": se dice "se reserva para el bien común".

Nada de esto toca la política de FARO de `/bien-comun`. La tercera puerta allá sigue diciendo que "todavía no se ofrece": acá se muestra como plan simulado del prototipo (R14).

## 3. Vista

**Compu (≥ 1024 px):** encabezado con los tres caminos (ux-sumarte), después la tabla de precios: tres columnas de igual ancho (Explorador, Amigo, Fundador), Amigo con la etiqueta "El más elegido" en texto y un borde de acento (nunca solo color). Cada columna: nombre, precio, para quién, 4 o 5 beneficios y su acción. El selector Mensual/Anual va arriba de la tabla y solo cambia a Amigo. Debajo, la franja de Aliados (una línea y "Hablemos"). Después, "Qué incluye cada plan" como tabla con encabezado fijo (Explorador, Amigo, Fundador) y celdas con texto ("Incluido", "No incluido", "Próximamente"). Al final, las tarjetas "Comprar un lote" e "Invertir" y el cajón "Modo de prueba".

**Celular (< 1024 px):** igual que ux-sumarte: selector `radiogroup` con tres opciones (Explorador, Amigo, Fundador), un plan por vez y su lista; Aliados como tarjeta debajo del plan; sin tabla.

**URL:** `?plan=explorador|amigo|fundador`. Las direcciones viejas `?plan=miembro` y `?plan=comunidad` llevan a `amigo` y a la franja de Aliados.

**Este cambio reemplaza el "Selector de planes" de cuatro opciones de `ux-sumarte`.** Si `ux-sumarte` todavía no está archivado cuando se implemente, se implementa igual: la regla nueva manda.

## 4. Matriz de acceso

| Qué | Sin cuenta | Explorador | Amigo | Fundador | Aliado |
|---|---|---|---|---|---|
| Inicio, Explorar, lotes, Bien común (leer), Participa (ver), Sumarte | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reservar un lote (simulado), Mi tierra, Hifa | — | ✓ | ✓ | ✓ | ✓ |
| Adherir al manifiesto · sumarse a un equipo de Participa | — | ✓ | ✓ | ✓ | ✓ |
| Números de Invertir · pedir hablar con alguien | — | ✓ | ✓ | ✓ | ✓ |
| Bitácora, sesiones, cupo antes que nadie, FARO de prepago | — | — | ✓ | ✓ | según el acuerdo |
| Registro Génesis, visita guiada | — | — | — | ✓ | — |

Reglas:
- **La voz y el trabajo no se compran:** adherir y sumarse a un equipo piden cuenta, no un plan pago.
- **Invertir no depende de ningún plan.** Tiene su propio camino y sus propios documentos. Un plan que diera acceso a invertir parecería vender acceso a una inversión [verificar].
- **Ningún plan da prioridad, reserva ni crédito sobre un lote.** "Cupo antes que nadie" es para visitas y eventos, nunca para lotes.

En el código, la tabla vive en `lib/permisos/niveles.ts`. `NIVEL_MINIMO.adherir` pasa de `miembro` a `explorador`. `participar` (Pactos, Semillas, Fogón y Compromisos, en pausa) queda como está.

## 5. Nombres internos

Para no romper los e2e de las funciones en pausa ni el estado guardado, los identificadores internos se quedan: `miembro` = Amigo y `lider` = Aliado. Cambian los nombres que se ven, en `marco.niveles` y en el glosario: "Amigo", "Fundador" y "Aliado". El renombre interno queda para cuando se retomen o se borren esas funciones.

`lib/sumarte/estado.ts` migra el estado guardado en el navegador: un `pase` viejo (`semilla`, `brote`, `raiz`) pasa a `fundador`, y `tribu: true` pasa a Aliado sin tribu elegida. La migración se prueba con tests.

## 6. Textos

- La bajada de Sumarte deja de decir "todo lo que elijas acá es simulado". Pasa a decir que el pago es simulado y que no se cobra nada.
- Ningún texto dice "inversión", "retorno", "rendimiento" ni "de por vida". Un test lo revisa en es y en en.
- Amigo con sesión ve "Darme de baja" (simulado) junto a su plan, en un lugar tan visible como el botón para elegirlo [verificar: botón de baja, Res. 424/2020].

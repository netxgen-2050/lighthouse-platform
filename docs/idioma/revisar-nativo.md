# Inglés pendiente de revisión por un hablante nativo

Este archivo lo genera `pnpm idioma:pendientes` (no se edita a mano) a partir de `lib/idioma/revision-nativa.ts`.
Todo el inglés lo escribió un agente y está pendiente hasta que un hablante nativo lo revise.

**Cómo marcar algo como revisado:** en `lib/idioma/revision-nativa.ts`, cambiá el `estado` de la fuente a `"revisado"`
y sumá `revisadoPor` y `fecha` (AAAA-MM-DD). Después corré `pnpm idioma:pendientes`.

Fuentes pendientes: 32

| Fuente | Qué es | Textos en inglés |
|---|---|---|
| `glosario` | Glosario de términos de la plataforma (Pase Fundador, Fogón…); confirmado por Gus el 15-oct-2026, falta el nativo | 23 |
| `lib/compromisos/mercado.ts` | Ofertas de ejemplo del Mercado con su inglés, traducidas del español (las que publica la persona no se traducen) | — |
| `lib/congreso/evento-ejemplo.ts` | Página del Congreso en inglés (/congreso/en): datos de ejemplo del evento | — |
| `lib/economia/terminos.ts` | Término económico 🌱 de Semillas en inglés (borrador, sin revisión) | — |
| `lib/fogon/consultas/ejemplo.ts` | Consultas de ejemplo del Fogón (título, descripción, opciones y nota del monto) con su inglés, traducidas del español | — |
| `lib/fogon/datos.ts` | Decisiones de ejemplo del Fogón (título, lugar y regla; incluye las de círculo, tribu, común y consejo) con su inglés, traducidas del español | — |
| `lib/gobernanza/datos.ts` | Nombres, propósitos y 'Decide sobre' de los círculos de ejemplo del común, de cada tribu y del círculo transversal, con su inglés | — |
| `lib/legal/terminos.ts` | Catálogo de términos legales (⚖) con su explicación en inglés; borradores sin revisión legal | — |
| `lib/manifiestos/datos.ts` | Manifiestos de ejemplo (el del Lighthouse y siete de tribus) traducidos del español: voz de la comunidad, a revisar también con quien los escriba de verdad | — |
| `lib/pactos/datos.ts` | Roles de ejemplo (nombre y descripción), pestañas y pasos de un pacto, con su inglés | — |
| `lib/semillas/datos.ts` | Datos de ejemplo de la ronda de reconocimiento con su inglés (compañeros, criterios y reconocimiento recibido) | — |
| `lib/sumarte/datos.ts` | Comparativa de planes de Sumarte (filas de ejemplo con su inglés) | — |
| `lib/territorios/textos.ts` | Textos del territorio con su inglés: terreno común, descripción y nombres descriptivos de los lugares, bienes comunes | — |
| `lib/tribus/datos.ts` | Datos de ejemplo de las 12 tribus con su inglés (foco, qué tiene, qué busca, ritual, forma jurídica…) y la declaración de cada tribu, traducida del español | — |
| `textos/bandeja` | Bandeja y notificaciones: textos de cada evento de la actividad, que se arman al mostrarlos en el idioma actual | 29 |
| `textos/canales` | Canales: por qué se abre cada puerta, qué la abre, refuerzo por presencia y nombres de planes y niveles del pase | 31 |
| `textos/compromisos` | Compromisos y Mercado: formulario, validaciones, tipos y medios de intercambio, filtros y avisos | 58 |
| `textos/comunes` | Textos que se repiten en todas las zonas (cargando, cancelar, sin dato, notas de traducción…) | 15 |
| `textos/configuracion` | Configuración: apariencia, avisos por tipo, Hifa, moneda, idioma y borrado de lo guardado en el navegador | 48 |
| `textos/fogon` | Fogón: encabezado, enlace a Cómo decidimos, filtros por ámbito (Círculo, Tribu, común, Consejo, Fideicomiso), opciones de voto, motivos para no votar, llevar al consejo, acta de ejemplo y ayudas ("Fideicomiso" = Trust) | 57 |
| `textos/fogonConsultas` | Consultas del Fogón: lista, reparto de créditos con voto cuadrático, voto abierto o secreto, padrón, resultado por grupo, acta de ejemplo, gráfico de dona y errores de lectura | 119 |
| `textos/gobernanza` | Gobernanza fractal: página Cómo decidimos (estructura, círculos, consejo), marca de validación de la ficha de tribu y Quiénes te validaron en Mi recorrido | 120 |
| `textos/marco` | Marco de la plataforma: rail, barra superior, menú de la persona, campanita, pie, 404 y pantallas de la puerta | 57 |
| `textos/pactos` | Pactos: pactos de tiempo y de plata, cambios, historial, avisos y anuncios | 124 |
| `textos/pasaporte` | Pasaporte: sellos y lo que abren, tarjeta y diálogo de verificación de identidad (KYC) con sus errores, sello de la billetera y datos de aporte | 149 |
| `textos/perfil` | Perfil: encabezado, formulario, tarjetas, errores de validación y las seis preguntas de la entrevista | 58 |
| `textos/portada` | Portada: título, bajada, los tres caminos y la cantidad de barrios | 17 |
| `textos/recorrido` | Mi recorrido: próximo paso (cinco pasos), pestañas, línea de tiempo y tabla de la Bitácora | 45 |
| `textos/semillas` | Semillas: libro por comunidad, detalle, meta de sembrador/a activo/a y ronda de reconocimiento ("Semillas" no se traduce) | 73 |
| `textos/sumarte` | Sumarte: planes, niveles del pase (Seed, Sprout, Root, a confirmar), inversores, avisos de nivel, formulario de pedido de contacto y panel Entrar como… | 144 |
| `textos/territorio` | Territorio: vitrina, leyenda y controles del mapa, ficha lateral y marcadores | 60 |
| `textos/tribus` | Tribus: listado, ficha, botones de membresía, interfaz del manifiesto y postulación de una comunidad (formulario, requisitos y errores) | 140 |

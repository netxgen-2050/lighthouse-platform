// Manifiesto "Lighthouse 2050" de la pestaña Visión de Participa (spec participa-vision, cambio participa-vision-2050).
// El texto es el canónico de `openspec/changes/participa-vision-2050/design.md` §3: no se reescribe. Es una visión, no un
// plan: no cifra metas ni promete nada. Borrador de agente, para que Gus lo ajuste; el inglés espera al hablante nativo
// (fuente `lib/idioma/textos/vision-2050.ts` en docs/idioma/revisar-nativo.md).
// No es un diccionario de zona: tiene nombres propios con ñ ("chañar") que el control de español del lado inglés rechazaría.
import type { Textos } from "../tipos";

const es = {
  titulo: "Lighthouse 2050",
  subtitulo: "Una luz en el borde del desierto",
  marca: "Visión, no promesa · borrador",
  lema: "Visión, no promesa. Un borrador para conversar.",
  ilustracionAria: "Amanecer sobre el río Negro, con el faro, una cortina de álamos y la barda al fondo",
  postal: {
    titulo: "Postal desde 2050",
    parrafos: [
      "Amanece sobre el río Negro. El agua que baja del Limay y del Neuquén sigue su camino como siempre: 640 kilómetros sin recibir un solo afluente. Lo que cambió es la orilla.",
      "Donde en 2026 había diez por ciento de verde y noventa de desierto, hoy el verde baja por el cañadón como un río quieto. Los diques de piedra frenan cada tormenta, las medias lunas guardan la lluvia en el suelo y el humedal de la desembocadura se volvió la plaza donde nos encontramos. El sauce criollo volvió a la costa. La jarilla, el alpataco y el chañar sostienen la barda que antes se deshacía en cárcavas.",
      "Las chacras de vid y olivo cortan el viento con hileras de álamos. En los techos, el sol hace la luz y las cisternas guardan el agua. En el vivero, la semilla local pasa de mano en mano. Las parcelas que plantamos cada año, una al lado de la otra, son un libro abierto: se puede caminar desde la primera hasta la última y ver cómo el desierto aprende a ser monte.",
      "No es un paraíso. Es trabajo. Es una comunidad que aprendió a decidir junta.",
    ],
  },
  origen: {
    titulo: "De dónde venimos",
    parrafos: [
      "Esta tierra tiene historia antes que nosotros. La de los pueblos que la caminaron primero, que todavía tenemos que aprender a contar con respeto. La de los canales centenarios que convirtieron el desierto en el Alto Valle de las peras y las manzanas. La de una familia que la cuidó durante generaciones y que ya había empezado a plantar.",
      "Y venimos de un país que conoce bien el cansancio. Crisis que vuelven cada pocos años, ahorros que se evaporan, la sensación de que cada uno tiene que salvarse solo. Esa lógica tiene una trampa: cuando todos corren para no quedar atrás, todos terminan perdiendo. Se tala el monte porque si no lo tala uno, lo tala otro. Se quema la poda porque no hay tiempo de compostarla. Se gasta el agua de hoy porque nadie confía en mañana.",
      "Pero también venimos de las cooperativas del valle, de los clubes de barrio, de las ollas que se arman en una esquina cuando hace falta. Sabemos coordinar. Lo que nos faltó fueron acuerdos y herramientas a la altura.",
    ],
  },
  creemos: {
    titulo: "Lo que creemos",
    principios: [
      { frase: "El agua es el centro.", resto: "Primero la cuenca, después las casas. Frenar, esparcir, infiltrar, guardar." },
      { frase: "Regenerar es rendimiento, no costo.", resto: "Cada hectárea que vuelve a estar viva es riqueza del bien común." },
      { frase: "Lo común se cuida entre todos.", resto: "El río, el cauce y el monte no son de nadie en particular: son la base de todo lo demás." },
      { frase: "Se participa por conducta y por aporte.", resto: "No preguntamos qué pensás: miramos qué hacés y qué das." },
      {
        frase: "Se diseña de lo grande a lo chico y se construye de lo chico a lo grande.",
        resto: "Una hectárea primero. Después, la que sigue.",
      },
      { frase: "Diseñamos para 500 años.", resto: "No para el próximo ciclo, ni la próxima elección, ni el próximo trimestre." },
      { frase: "Lo que no sabemos, lo decimos.", resto: "El dato que falta no es cero." },
    ],
  },
  pedimos: {
    titulo: "Lo que pedimos",
    parrafos: [
      "Ninguna persona sola le gana al desierto. Ninguna empresa sola, ningún gobierno solo. Lo que sí puede ganarle es una red de gente que pone en común lo que tiene (sus manos, su oficio, su tiempo, lo que sabe) y que se pone de acuerdo en reglas claras para que el esfuerzo de cada uno sume al de los demás en lugar de anularlo.",
      "Por eso Lighthouse no es un barrio cerrado ni un refugio para escaparse del mundo. Es un faro: un lugar para probar, a la vista de todos, que se puede vivir de otra manera y dejar la tierra mejor de lo que la encontramos.",
      "Si sabés de agua, de suelo, de leyes, de números, de construir, de cuidar personas o de contar historias, hay un lugar para vos en alguno de los equipos.",
    ],
    invitacion: "Vení a plantar.",
    cierre: "Lo que siembres hoy le va a dar sombra a alguien en 2050.",
    boton: "Conocé los equipos",
  },
};

const en: Textos<typeof es> = {
  titulo: "Lighthouse 2050",
  subtitulo: "A light at the edge of the desert",
  marca: "A vision, not a promise · draft",
  lema: "A vision, not a promise. A draft to talk about.",
  ilustracionAria: "Dawn over the Río Negro, with the lighthouse, a row of poplars and the escarpment in the distance",
  postal: {
    titulo: "A postcard from 2050",
    parrafos: [
      "Dawn breaks over the Río Negro. The water that comes down from the Limay and the Neuquén flows on as it always has: 640 kilometers without a single tributary. What changed is the shore.",
      "Where in 2026 there was ten percent green and ninety percent desert, today the green runs down the ravine like a still river. Stone check dams slow every storm, half-moon basins keep the rain in the soil, and the wetland at the ravine's mouth has become the square where we meet. The native willow has come back to the riverbank. Jarilla, alpataco and chañar hold together the escarpment that used to crumble into gullies.",
      "Vineyards and olive groves break the wind with rows of poplars. On the roofs, the sun makes our power and the cisterns keep our water. In the nursery, local seed passes from hand to hand. The plots we plant each year, side by side, are an open book: you can walk from the first to the last and watch the desert learn to become woodland.",
      "It is not paradise. It is work. It is a community that learned to decide together.",
    ],
  },
  origen: {
    titulo: "Where we come from",
    parrafos: [
      "This land had a history before us. The history of the peoples who walked it first, which we still have to learn to tell with respect. The history of the century-old canals that turned the desert into the Alto Valle of pears and apples. The history of a family that looked after it for generations and had already started planting.",
      "And we come from a country that knows exhaustion well. Crises that return every few years, savings that evaporate, the feeling that everyone has to save themselves. That logic has a trap: when everyone runs so as not to fall behind, everyone ends up losing. The woodland gets cut because if one person doesn't cut it, someone else will. Prunings get burned because there is no time to compost them. Today's water gets spent because nobody trusts tomorrow.",
      "But we also come from the valley's cooperatives, from neighborhood clubs, from the community kitchens that spring up on a street corner when they are needed. We know how to coordinate. What we lacked were agreements and tools that matched the task.",
    ],
  },
  creemos: {
    titulo: "What we believe",
    principios: [
      { frase: "Water is the center.", resto: "The watershed first, the houses after. Slow it, spread it, sink it, store it." },
      { frase: "Regeneration is yield, not cost.", resto: "Every hectare that comes back to life is wealth for the commons." },
      { frase: "The commons is cared for by everyone.", resto: "The river, the ravine and the woodland belong to no one in particular: they are the ground everything else stands on." },
      { frase: "People take part through conduct and contribution.", resto: "We don't ask what you think: we look at what you do and what you give." },
      { frase: "Design from large to small, build from small to large.", resto: "One hectare first. Then the next." },
      { frase: "We design for 500 years.", resto: "Not for the next cycle, the next election or the next quarter." },
      { frase: "What we don't know, we say.", resto: "Missing data is not zero." },
    ],
  },
  pedimos: {
    titulo: "What we ask",
    parrafos: [
      "No one person beats the desert alone. No company alone, no government alone. What can beat it is a network of people who pool what they have (their hands, their craft, their time, what they know) and agree on clear rules so that each person's effort adds to everyone else's instead of canceling it out.",
      "That is why Lighthouse is not a gated community or a refuge to escape the world. It is a lighthouse: a place to show, in plain sight, that another way of living is possible, and to leave the land better than we found it.",
      "If you know about water, soil, law, numbers, building, caring for people or telling stories, there is a place for you in one of the teams.",
    ],
    invitacion: "Come and plant.",
    cierre: "What you sow today will give someone shade in 2050.",
    boton: "Meet the teams",
  },
};

export const vision2050 = { es, en };

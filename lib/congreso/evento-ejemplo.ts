// Contenido de ejemplo: se reemplaza por el real del organizador.
// Sale del mock-up v2 (docs/referencia/congreso-unityhub-mockup-v2.html), pasado a voseo; el inglés es de ejemplo,
// como el español, y se revisa antes de cualquier uso real.
// Nadie lo importa directo: las pantallas lo leen con obtenerEvento() (lib/congreso/evento.ts).
import type { Evento } from "./evento";
import type { Bilingue } from "./idioma";

export const EVENTO_EJEMPLO: Evento<Bilingue> = {
  esEjemplo: true,
  nombre: "Solarpunk Patagonia",
  sobreTitulo: { es: "Primera edición, bajo el anillo de fuego", en: "First edition, under the ring of fire" },
  lema: {
    es: "Una civilización regenerativa, un pueblo a la vez.",
    en: "A regenerative civilization, one village at a time.",
  },
  bajada: {
    es: "Cinco días entre el eclipse anular en la costa atlántica y un valle donde el agua vuelve a la tierra. Para quienes diseñan, construyen y financian los pueblos que vienen.",
    en: "Five days between the annular eclipse on the Atlantic coast and a valley where water returns to the land. For those who design, build and fund the villages to come.",
  },
  fechas: { inicio: "2027-02-05", fin: "2027-02-09" },
  momentoClave: {
    etiqueta: { es: "Cuenta regresiva al eclipse", en: "Countdown to the eclipse" },
    iso: "2027-02-06T12:00:00-03:00",
  },
  lugar: {
    detalle: { es: "BioPueblo, valle del Río Negro", en: "BioPueblo, Río Negro valley" },
    region: { es: "Patagonia, Argentina", en: "Patagonia, Argentina" },
  },
  cifras: [
    { valor: { es: "5", en: "5" }, etiqueta: { es: "días de la costa al valle", en: "days from the coast to the valley" } },
    { valor: { es: "200", en: "200" }, etiqueta: { es: "lugares en el territorio", en: "spots in the territory" } },
    { valor: { es: "7 min", en: "7 min" }, etiqueta: { es: "de anillo de fuego", en: "of ring of fire" } },
    { valor: { es: "10.000", en: "10,000" }, etiqueta: { es: "hectáreas para regenerar", en: "hectares to regenerate" } },
  ],
  encuentro: {
    manifiesto: {
      es: "Contra los futuros distópicos, uno que vale la pena construir: tecnología, diseño de sistemas y vida que se restaura.",
      en: "Against dystopian futures, one worth building: technology, systems design and life being restored.",
    },
    destacado: { es: "Primero la cultura. Después, la tierra.", en: "Culture first. Then, the land." },
    parrafos: [
      {
        es: "El Gathering reúne a quienes ya están levantando asentamientos regenerativos, a quienes se mudan para empezar uno y a quienes los financian. En el lugar donde uno está naciendo.",
        en: "The Gathering brings together those already raising regenerative settlements, those moving to start one and those who fund them. In the place where one is being born.",
      },
      {
        es: "Es un encuentro educativo: charlas, obra con las manos y caminatas por la tierra. Los proyectos que buscan socios se presentan aparte, y sumarse siempre es opcional.",
        en: "It is an educational gathering: talks, hands-on building and walks across the land. Projects looking for partners are presented separately, and joining is always optional.",
      },
    ],
  },
  recorrido: {
    titulo: {
      es: "De la costa al valle, siguiendo la sombra de la luna",
      en: "From the coast to the valley, following the moon's shadow",
    },
    bajada: {
      es: "El programa es un viaje. Arranca frente al mar, cruza la estepa en caravana y termina con las manos en el suelo.",
      en: "The program is a journey. It starts facing the sea, crosses the steppe in a caravan and ends with hands in the soil.",
    },
    paradas: [
      {
        id: "llegadas",
        etiquetaCorta: { es: "Vie 5", en: "Fri 5" },
        cuando: { es: "Viernes 5 de febrero", en: "Friday, February 5" },
        titulo: { es: "Llegadas", en: "Arrivals" },
        texto: {
          es: "Bienvenida y una primera ronda para poner las visiones sobre la mesa.",
          en: "A welcome and a first round to put everyone's visions on the table.",
        },
        lugar: { es: "Puerto Madryn", en: "Puerto Madryn" },
        destacada: false,
      },
      {
        id: "anillo-de-fuego",
        etiquetaCorta: { es: "Sáb 6", en: "Sat 6" },
        cuando: { es: "Sábado 6 de febrero", en: "Saturday, February 6" },
        titulo: { es: "Anillo de fuego", en: "Ring of fire" },
        texto: {
          es: "El eclipse anular desde la playa. Al atardecer, caravana al oeste y fogón bajo luna nueva.",
          en: "The annular eclipse from the beach. At dusk, a caravan heads west and a campfire burns under the new moon.",
        },
        lugar: { es: "Playas Doradas", en: "Playas Doradas" },
        destacada: true,
      },
      {
        id: "gathering",
        etiquetaCorta: { es: "Dom 7", en: "Sun 7" },
        cuando: { es: "Domingo 7 de febrero", en: "Sunday, February 7" },
        titulo: { es: "El Gathering", en: "The Gathering" },
        texto: {
          es: "Un día al aire libre con charlas en persona y a distancia, paneles y casos reales. Cierra con el Manifiesto Solarpunk.",
          en: "An open-air day with in-person and remote talks, panels and real cases. It closes with the Solarpunk Manifesto.",
        },
        lugar: { es: "BioPueblo", en: "BioPueblo" },
        destacada: false,
      },
      {
        id: "manos-en-la-tierra",
        etiquetaCorta: { es: "8–9", en: "8–9" },
        cuando: { es: "Lunes 8 y martes 9", en: "Monday 8 and Tuesday 9" },
        titulo: { es: "Manos en la tierra", en: "Hands in the soil" },
        texto: {
          es: "Keyline y cosecha de agua, bioconstrucción, diseño en el sitio y recorridas con quienes desarrollan el territorio.",
          en: "Keyline and water harvesting, natural building, on-site design and walks with the people developing the territory.",
        },
        lugar: { es: "El territorio", en: "The territory" },
        destacada: false,
      },
    ],
  },
  voces: {
    titulo: {
      es: "Voces que ya imaginaron el futuro, y lo construyeron",
      en: "Voices that already imagined the future, and built it",
    },
    principales: [
      { id: "roxanne-meadows", nombre: "Roxanne Meadows", afiliacion: { es: "The Venus Project", en: "The Venus Project" }, iniciales: "RM", estado: "por-confirmar", tono: 1 },
      { id: "michel-bauwens", nombre: "Michel Bauwens", afiliacion: { es: "P2P Foundation", en: "P2P Foundation" }, iniciales: "MB", estado: "por-confirmar", tono: 2 },
      { id: "michael-reynolds", nombre: "Michael Reynolds", afiliacion: { es: "Earthship Biotecture", en: "Earthship Biotecture" }, iniciales: "MR", estado: "por-confirmar", tono: 3 },
      { id: "bill-reed", nombre: "Bill Reed", afiliacion: { es: "Regen Dev Corp", en: "Regen Dev Corp" }, iniciales: "BR", estado: "por-confirmar", tono: 4 },
    ],
    regionalesTitulo: { es: "Voces de la región", en: "Voices from the region" },
    regionales: [
      {
        id: "marcela-vega",
        nombre: "Marcela Vega",
        afiliacion: { es: "Agricultura biodinámica en Lawenmalal, Chile", en: "Biodynamic farming in Lawenmalal, Chile" },
        iniciales: "MV",
        estado: "por-confirmar",
        tono: 2,
      },
      {
        id: "lucas-omar-porro",
        nombre: "Lucas Omar Porro",
        afiliacion: { es: "Permacultura y autosuficiencia", en: "Permaculture and self-sufficiency" },
        iniciales: "LP",
        estado: "por-confirmar",
        tono: 3,
      },
    ],
    notaHibrido: {
      es: "Escenario híbrido: quien no puede viajar en febrero habla en vivo desde una pantalla gigante, en conversación con alguien en el escenario.",
      en: "Hybrid stage: those who cannot travel in February speak live from a giant screen, in conversation with someone on stage.",
    },
  },
  ejes: {
    titulo: { es: "Ocho conversaciones, un mismo suelo", en: "Eight conversations, one shared ground" },
    items: [
      { id: "agua", titulo: { es: "Agua y cuencas", en: "Water and watersheds" }, texto: { es: "Keyline y cosecha pasiva de agua en tierra seca.", en: "Keyline and passive water harvesting in dry land." }, icono: "agua" },
      { id: "suelo", titulo: { es: "Suelo y alimento", en: "Soil and food" }, texto: { es: "Permacultura, agricultura regenerativa, bosques comestibles.", en: "Permaculture, regenerative agriculture, edible forests." }, icono: "suelo" },
      { id: "restauracion", titulo: { es: "Restauración", en: "Restoration" }, texto: { es: "Reparar sistemas vivos con la biomímesis como método.", en: "Repairing living systems with biomimicry as a method." }, icono: "restauracion" },
      { id: "habitat", titulo: { es: "Hábitat y bioconstrucción", en: "Habitat and natural building" }, texto: { es: "Casas autónomas de tierra que siguen al paisaje.", en: "Self-sufficient earthen homes that follow the landscape." }, icono: "habitat" },
      { id: "energia", titulo: { es: "Energía y materiales", en: "Energy and materials" }, texto: { es: "Renovables distribuidas y ciclos cerrados.", en: "Distributed renewables and closed loops." }, icono: "energia" },
      { id: "economia", titulo: { es: "Economía de recursos", en: "Resource economy" }, texto: { es: "Economías circulares y producción de lo común.", en: "Circular economies and the production of the commons." }, icono: "economia" },
      { id: "gobernanza", titulo: { es: "Gobernanza y comunes", en: "Governance and commons" }, texto: { es: "Coordinación entre pares y redes de pueblos.", en: "Peer coordination and networks of villages." }, icono: "gobernanza" },
      { id: "cultura", titulo: { es: "Cultura y sistemas", en: "Culture and systems" }, texto: { es: "Pensamiento sistémico e historias que hacen deseable el cambio.", en: "Systems thinking and stories that make change desirable." }, icono: "cultura" },
    ],
  },
  entradas: {
    titulo: { es: "Reservá tu lugar bajo el anillo", en: "Reserve your spot under the ring" },
    bajada: {
      es: "Doscientos lugares en el territorio. Las primeras entradas tienen el mejor precio.",
      en: "Two hundred spots in the territory. The first tickets get the best price.",
    },
    tipos: [
      {
        id: "pase-completo",
        nombre: { es: "Pase completo", en: "Full pass" },
        etiqueta: { es: "Preventa, hasta el 30 de noviembre", en: "Presale, until November 30" },
        descripcion: {
          es: "Los cinco días: llegada, eclipse, caravana, Gathering y manos en la tierra.",
          en: "All five days: arrival, eclipse, caravan, Gathering and hands in the soil.",
        },
        precio: { monto: 290, moneda: "USD" },
        esEjemplo: true,
        destacado: true,
        textoBoton: { es: "Comprar pase completo", en: "Buy full pass" },
      },
      {
        id: "pase-de-tribu",
        nombre: { es: "Pase de tribu", en: "Tribe pass" },
        etiqueta: { es: "Desde 4 personas", en: "From 4 people" },
        descripcion: {
          es: "El pase completo para quienes llegan juntos desde una tribu de NetX.",
          en: "The full pass for those arriving together from a NetX tribe.",
        },
        precio: { monto: 250, moneda: "USD", unidad: { es: "c/u", en: "each" } },
        esEjemplo: true,
        destacado: false,
        textoBoton: { es: "Comprar pase de tribu", en: "Buy tribe pass" },
      },
      {
        id: "gathering-en-biopueblo",
        nombre: { es: "Gathering en BioPueblo", en: "Gathering at BioPueblo" },
        etiqueta: { es: "Valle", en: "Valley" },
        descripcion: {
          es: "Del domingo 7 al martes 9, sin la costa ni la caravana.",
          en: "From Sunday 7 to Tuesday 9, without the coast or the caravan.",
        },
        precio: { monto: 190, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: { es: "Comprar pase de valle", en: "Buy valley pass" },
      },
      {
        id: "domingo-del-gathering",
        nombre: { es: "Domingo del Gathering", en: "Gathering Sunday" },
        etiqueta: { es: "Un día", en: "One day" },
        descripcion: {
          es: "El día de las charlas y el Manifiesto, en el territorio.",
          en: "The day of the talks and the Manifesto, in the territory.",
        },
        precio: { monto: 90, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: { es: "Comprar pase de un día", en: "Buy one-day pass" },
      },
      {
        id: "vecinos-del-valle",
        nombre: { es: "Vecinos del valle", en: "Valley neighbors" },
        etiqueta: { es: "Con DNI de Río Negro", en: "With a Río Negro national ID" },
        descripcion: {
          es: "Para quienes ya viven en la región y quieren ser parte desde el inicio.",
          en: "For those who already live in the region and want to be part of it from the start.",
        },
        precio: { monto: 30, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: { es: "Comprar pase de vecino", en: "Buy neighbor pass" },
      },
      {
        id: "escenario-en-linea",
        nombre: { es: "Escenario en línea", en: "Online stage" },
        etiqueta: { es: "Desde cualquier lugar", en: "From anywhere" },
        descripcion: {
          es: "Las charlas del domingo en vivo y la grabación completa.",
          en: "Sunday's talks live and the full recording.",
        },
        precio: { monto: 25, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: { es: "Comprar pase en línea", en: "Buy online pass" },
      },
    ],
    nota: {
      es: "Pago seguro con Stripe en UnityHub. Recibís un email con tu entrada, el código QR y los próximos pasos.",
      en: "Secure payment with Stripe on UnityHub. You get an email with your ticket, the QR code and the next steps.",
    },
  },
  preguntas: {
    titulo: { es: "Antes de armar la mochila", en: "Before you pack your bag" },
    items: [
      {
        id: "incluye",
        pregunta: { es: "¿Qué incluye el pase completo?", en: "What does the full pass include?" },
        respuesta: {
          es: "Ejemplo: traslados de la caravana, comidas del Gathering, acceso a todas las actividades y campamento en el territorio. El organizador lo confirma al publicar las entradas.",
          en: "Example: caravan transfers, Gathering meals, access to all activities and camping in the territory. The organizer confirms it when the tickets are published.",
        },
      },
      {
        id: "eclipse",
        pregunta: { es: "¿Se ve el eclipse completo desde BioPueblo?", en: "Can the full eclipse be seen from BioPueblo?" },
        respuesta: {
          es: "No. En BioPueblo el eclipse es parcial. El anillo completo se ve desde la costa, en Playas Doradas, el sábado 6 cerca del mediodía. Por eso el viaje empieza ahí.",
          en: "No. At BioPueblo the eclipse is partial. The full ring is seen from the coast, at Playas Doradas, on Saturday 6 near noon. That is why the journey starts there.",
        },
      },
      {
        id: "alojamiento",
        pregunta: { es: "¿Dónde duermo?", en: "Where do I sleep?" },
        respuesta: {
          es: "Ejemplo: campamento en el territorio, con opciones de alojamiento cercanas. Se confirma más adelante.",
          en: "Example: camping in the territory, with lodging options nearby. To be confirmed later.",
        },
      },
      {
        id: "cuenta-netx",
        pregunta: { es: "¿Necesito una cuenta en NetX para ir?", en: "Do I need a NetX account to attend?" },
        respuesta: {
          es: "No. La entrada se compra en UnityHub. Si querés que tus días en el territorio queden registrados y sumar el sello Genesis, vinculás tu ticket en NetX.",
          en: "No. The ticket is bought on UnityHub. If you want your days in the territory recorded and to earn the Genesis seal, you link your ticket on NetX.",
        },
      },
      {
        id: "inversion",
        pregunta: { es: "¿Hay oportunidades para invertir?", en: "Are there investment opportunities?" },
        respuesta: {
          es: "El Gathering es educativo. Los proyectos que buscan socios se presentan por separado, y participar siempre es opcional.",
          en: "The Gathering is educational. Projects looking for partners are presented separately, and taking part is always optional.",
        },
      },
    ],
  },
  cierre: {
    frase: { es: "El futuro no se espera. Se planta.", en: "The future is not awaited. It is planted." },
    convocan: { es: "Convocan NetX Gen, BioPueblo y Rubania", en: "Hosted by NetX Gen, BioPueblo and Rubania" },
    entradasCon: { es: "Entradas y check-in con UnityHub", en: "Tickets and check-in with UnityHub" },
  },
  paginaOficial: {
    url: "#pagina-oficial",
    etiqueta: { es: "Página oficial del evento", en: "Official event page" },
    esEjemplo: true,
  },
};

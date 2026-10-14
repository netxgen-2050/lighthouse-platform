// Contenido de ejemplo: se reemplaza por el real del organizador.
// Sale del mock-up v2 (docs/referencia/congreso-unityhub-mockup-v2.html), pasado a voseo.
// Nadie lo importa directo: las pantallas lo leen con obtenerEvento() (lib/congreso/evento.ts).
import type { Evento } from "./evento";

export const EVENTO_EJEMPLO: Evento = {
  esEjemplo: true,
  nombre: "Solarpunk Patagonia",
  sobreTitulo: "Primera edición, bajo el anillo de fuego",
  lema: "Una civilización regenerativa, un pueblo a la vez.",
  bajada:
    "Cinco días entre el eclipse anular en la costa atlántica y un valle donde el agua vuelve a la tierra. Para quienes diseñan, construyen y financian los pueblos que vienen.",
  fechas: { inicio: "2027-02-05", fin: "2027-02-09" },
  momentoClave: { etiqueta: "Cuenta regresiva al eclipse", iso: "2027-02-06T12:00:00-03:00" },
  lugar: { detalle: "BioPueblo, valle del Río Negro", region: "Patagonia, Argentina" },
  cifras: [
    { valor: "5", etiqueta: "días de la costa al valle" },
    { valor: "200", etiqueta: "lugares en el territorio" },
    { valor: "7 min", etiqueta: "de anillo de fuego" },
    { valor: "10.000", etiqueta: "hectáreas para regenerar" },
  ],
  encuentro: {
    manifiesto:
      "Contra los futuros distópicos, uno que vale la pena construir: tecnología, diseño de sistemas y vida que se restaura.",
    destacado: "Primero la cultura. Después, la tierra.",
    parrafos: [
      "El Gathering reúne a quienes ya están levantando asentamientos regenerativos, a quienes se mudan para empezar uno y a quienes los financian. En el lugar donde uno está naciendo.",
      "Es un encuentro educativo: charlas, obra con las manos y caminatas por la tierra. Los proyectos que buscan socios se presentan aparte, y sumarse siempre es opcional.",
    ],
  },
  recorrido: {
    titulo: "De la costa al valle, siguiendo la sombra de la luna",
    bajada: "El programa es un viaje. Arranca frente al mar, cruza la estepa en caravana y termina con las manos en el suelo.",
    paradas: [
      {
        id: "llegadas",
        etiquetaCorta: "Vie 5",
        cuando: "Viernes 5 de febrero",
        titulo: "Llegadas",
        texto: "Bienvenida y una primera ronda para poner las visiones sobre la mesa.",
        lugar: "Puerto Madryn",
        destacada: false,
      },
      {
        id: "anillo-de-fuego",
        etiquetaCorta: "Sáb 6",
        cuando: "Sábado 6 de febrero",
        titulo: "Anillo de fuego",
        texto: "El eclipse anular desde la playa. Al atardecer, caravana al oeste y fogón bajo luna nueva.",
        lugar: "Playas Doradas",
        destacada: true,
      },
      {
        id: "gathering",
        etiquetaCorta: "Dom 7",
        cuando: "Domingo 7 de febrero",
        titulo: "El Gathering",
        texto:
          "Un día al aire libre con charlas en persona y a distancia, paneles y casos reales. Cierra con el Manifiesto Solarpunk.",
        lugar: "BioPueblo",
        destacada: false,
      },
      {
        id: "manos-en-la-tierra",
        etiquetaCorta: "8–9",
        cuando: "Lunes 8 y martes 9",
        titulo: "Manos en la tierra",
        texto:
          "Keyline y cosecha de agua, bioconstrucción, diseño en el sitio y recorridas con quienes desarrollan el territorio.",
        lugar: "El territorio",
        destacada: false,
      },
    ],
  },
  voces: {
    titulo: "Voces que ya imaginaron el futuro, y lo construyeron",
    principales: [
      { id: "roxanne-meadows", nombre: "Roxanne Meadows", afiliacion: "The Venus Project", iniciales: "RM", estado: "por-confirmar", tono: 1 },
      { id: "michel-bauwens", nombre: "Michel Bauwens", afiliacion: "P2P Foundation", iniciales: "MB", estado: "por-confirmar", tono: 2 },
      { id: "michael-reynolds", nombre: "Michael Reynolds", afiliacion: "Earthship Biotecture", iniciales: "MR", estado: "por-confirmar", tono: 3 },
      { id: "bill-reed", nombre: "Bill Reed", afiliacion: "Regen Dev Corp", iniciales: "BR", estado: "por-confirmar", tono: 4 },
    ],
    regionalesTitulo: "Voces de la región",
    regionales: [
      { id: "marcela-vega", nombre: "Marcela Vega", afiliacion: "Agricultura biodinámica en Lawenmalal, Chile", iniciales: "MV", estado: "por-confirmar", tono: 2 },
      { id: "lucas-omar-porro", nombre: "Lucas Omar Porro", afiliacion: "Permacultura y autosuficiencia", iniciales: "LP", estado: "por-confirmar", tono: 3 },
    ],
    notaHibrido:
      "Escenario híbrido: quien no puede viajar en febrero habla en vivo desde una pantalla gigante, en conversación con alguien en el escenario.",
  },
  ejes: {
    titulo: "Ocho conversaciones, un mismo suelo",
    items: [
      { id: "agua", titulo: "Agua y cuencas", texto: "Keyline y cosecha pasiva de agua en tierra seca.", icono: "agua" },
      { id: "suelo", titulo: "Suelo y alimento", texto: "Permacultura, agricultura regenerativa, bosques comestibles.", icono: "suelo" },
      { id: "restauracion", titulo: "Restauración", texto: "Reparar sistemas vivos con la biomímesis como método.", icono: "restauracion" },
      { id: "habitat", titulo: "Hábitat y bioconstrucción", texto: "Casas autónomas de tierra que siguen al paisaje.", icono: "habitat" },
      { id: "energia", titulo: "Energía y materiales", texto: "Renovables distribuidas y ciclos cerrados.", icono: "energia" },
      { id: "economia", titulo: "Economía de recursos", texto: "Economías circulares y producción de lo común.", icono: "economia" },
      { id: "gobernanza", titulo: "Gobernanza y comunes", texto: "Coordinación entre pares y redes de pueblos.", icono: "gobernanza" },
      { id: "cultura", titulo: "Cultura y sistemas", texto: "Pensamiento sistémico e historias que hacen deseable el cambio.", icono: "cultura" },
    ],
  },
  entradas: {
    titulo: "Reservá tu lugar bajo el anillo",
    bajada: "Doscientos lugares en el territorio. Las primeras entradas tienen el mejor precio.",
    tipos: [
      {
        id: "pase-completo",
        nombre: "Pase completo",
        etiqueta: "Preventa, hasta el 30 de noviembre",
        descripcion: "Los cinco días: llegada, eclipse, caravana, Gathering y manos en la tierra.",
        precio: { monto: 290, moneda: "USD" },
        esEjemplo: true,
        destacado: true,
        textoBoton: "Comprar pase completo",
      },
      {
        id: "pase-de-tribu",
        nombre: "Pase de tribu",
        etiqueta: "Desde 4 personas",
        descripcion: "El pase completo para quienes llegan juntos desde una tribu de NetX.",
        precio: { monto: 250, moneda: "USD", unidad: "c/u" },
        esEjemplo: true,
        destacado: false,
        textoBoton: "Comprar pase de tribu",
      },
      {
        id: "gathering-en-biopueblo",
        nombre: "Gathering en BioPueblo",
        etiqueta: "Valle",
        descripcion: "Del domingo 7 al martes 9, sin la costa ni la caravana.",
        precio: { monto: 190, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: "Comprar pase de valle",
      },
      {
        id: "domingo-del-gathering",
        nombre: "Domingo del Gathering",
        etiqueta: "Un día",
        descripcion: "El día de las charlas y el Manifiesto, en el territorio.",
        precio: { monto: 90, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: "Comprar pase de un día",
      },
      {
        id: "vecinos-del-valle",
        nombre: "Vecinos del valle",
        etiqueta: "Con DNI de Río Negro",
        descripcion: "Para quienes ya viven en la región y quieren ser parte desde el inicio.",
        precio: { monto: 30, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: "Comprar pase de vecino",
      },
      {
        id: "escenario-en-linea",
        nombre: "Escenario en línea",
        etiqueta: "Desde cualquier lugar",
        descripcion: "Las charlas del domingo en vivo y la grabación completa.",
        precio: { monto: 25, moneda: "USD" },
        esEjemplo: true,
        destacado: false,
        textoBoton: "Comprar pase en línea",
      },
    ],
    nota: "Pago seguro con Stripe en UnityHub. Recibís un email con tu entrada, el código QR y los próximos pasos.",
  },
  preguntas: {
    titulo: "Antes de armar la mochila",
    items: [
      {
        id: "incluye",
        pregunta: "¿Qué incluye el pase completo?",
        respuesta:
          "Ejemplo: traslados de la caravana, comidas del Gathering, acceso a todas las actividades y campamento en el territorio. El organizador lo confirma al publicar las entradas.",
      },
      {
        id: "eclipse",
        pregunta: "¿Se ve el eclipse completo desde BioPueblo?",
        respuesta:
          "No. En BioPueblo el eclipse es parcial. El anillo completo se ve desde la costa, en Playas Doradas, el sábado 6 cerca del mediodía. Por eso el viaje empieza ahí.",
      },
      {
        id: "alojamiento",
        pregunta: "¿Dónde duermo?",
        respuesta: "Ejemplo: campamento en el territorio, con opciones de alojamiento cercanas. Se confirma más adelante.",
      },
      {
        id: "cuenta-netx",
        pregunta: "¿Necesito una cuenta en NetX para ir?",
        respuesta:
          "No. La entrada se compra en UnityHub. Si querés que tus días en el territorio queden registrados y sumar el sello Genesis, vinculás tu ticket en NetX.",
      },
      {
        id: "inversion",
        pregunta: "¿Hay oportunidades para invertir?",
        respuesta:
          "El Gathering es educativo. Los proyectos que buscan socios se presentan por separado, y participar siempre es opcional.",
      },
    ],
  },
  cierre: {
    frase: "El futuro no se espera. Se planta.",
    convocan: "Convocan NetX Gen, BioPueblo y Rubania",
    entradasCon: "Entradas y check-in con UnityHub",
  },
  paginaOficial: { url: "#pagina-oficial", etiqueta: "Página oficial del evento", esEjemplo: true },
};

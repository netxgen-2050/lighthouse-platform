// Textos fijos de las piezas de NetX en /congreso. Todo en voseo (decisión de Gus, 14-oct-2026).
// Un solo lugar para cambiarlos cuando se sepa quién cobra el ticket (pregunta abierta para Gabriel).

export const TEXTO_CINTA = {
  aviso: "Prototipo interno · datos de ejemplo",
  boton: "¿Qué viene de UnityHub?",
};

/** Diálogo de demostración de la compra. NO dice quién cobra: ni UnityHub, ni Stripe, ni NetX. */
export const DIALOGO_COMPRA = {
  titulo: "Acá se abriría la compra del ticket",
  texto:
    "En la versión real, este botón abriría la compra del pase elegido. Al terminar, te llegaría un email con tu entrada y su código.",
  prototipo: "Prototipo: no se cobra nada ni se abre otra página.",
  cerrar: "Entendido",
};

export const DIALOGO_PAGINA_OFICIAL = {
  titulo: "Acá se abriría la página oficial del evento",
  texto: "En la versión real, este botón te llevaría a la página oficial del evento.",
  prototipo: "Prototipo: no se abre otra página.",
  cerrar: "Entendido",
};

export const TEXTO_TERRITORIO = {
  titulo: "Un valle que aprende a guardar el agua",
  cuerpo:
    "Estepa semiárida donde la lluvia de cada temporada todavía corre y se lleva el suelo. Devolverle el agua a la tierra es la primera tarea del pueblo, y la primera lección del Gathering.",
  alternativa: "Ilustración del valle: el Río Negro atraviesa la estepa y el Lighthouse está en su orilla",
  boton: "Explorar el mapa en NetX",
  superficie: "de superficie",
  barrios: "barrios con tribu",
};

export const TEXTO_TRIBUS = {
  titulo: "No vengas solo. Llegá con tu tribu.",
  bajada:
    "Las tribus son los grupos que se forman en NetX para vivir y construir juntos. Si llegan juntas, tienen precio especial y su primera minga en el territorio.",
  encontrar: "Encontrar mi tribu",
  precio: "Precio de tribu",
  lista: "Tribus con tickets vinculados (ejemplo)",
  ejemplo: "ejemplo",
};

export const TEXTO_TICKET = {
  titulo: "Tu ticket también abre la puerta a NetX",
  bajada:
    "Cada día que estés en el territorio queda registrado. La primera vez, recibís el sello Genesis: la prueba de que estuviste en el comienzo.",
  pasos: [
    { id: "compra", titulo: "Comprás tu entrada", texto: "En la página de entradas del evento.", quien: "UnityHub" },
    { id: "email", titulo: "Te llega el email con tu QR", texto: "Con tu entrada, el código y el calendario.", quien: "UnityHub" },
    { id: "vinculo", titulo: "Vinculás tu ticket", texto: "Con el código que te llegó por email.", quien: "NetX" },
    { id: "escaneo", titulo: "Te escanean al llegar", texto: "Cada día, en la entrada del territorio.", quien: "UnityHub" },
    { id: "presencia", titulo: "Sumás tu presencia", texto: "Días en el territorio y sello Genesis en tu pasaporte.", quien: "NetX" },
  ],
  llamado: {
    titulo: "¿Ya tenés tu entrada?",
    texto: "Para vincular tu ticket a tu perfil necesitás una cuenta gratis.",
    sumate: "Sumate gratis para vincular tu ticket",
    politica: "Aceptá la política de privacidad para vincular tu ticket",
  },
  genesis: {
    titulo: "Sello Genesis",
    sinTicket: "Se activa con tu primer check-in en el territorio.",
    conTicket: "Pendiente del primer check-in",
    presencia: "La presencia da acceso y voz, no se compra ni se transfiere.",
    sello: "GENESIS 2027",
  },
};

export const TEXTO_PAGINA_OFICIAL = { boton: "Página oficial del evento" };

/** Todos los textos fijos, para los tests de voseo. */
export function todosLosTextos(): string[] {
  const salida: string[] = [];
  const recorrer = (v: unknown) => {
    if (typeof v === "string") salida.push(v);
    else if (Array.isArray(v)) v.forEach(recorrer);
    else if (v && typeof v === "object") Object.values(v).forEach(recorrer);
  };
  [TEXTO_CINTA, DIALOGO_COMPRA, DIALOGO_PAGINA_OFICIAL, TEXTO_TERRITORIO, TEXTO_TRIBUS, TEXTO_TICKET, TEXTO_PAGINA_OFICIAL].forEach(recorrer);
  return salida;
}

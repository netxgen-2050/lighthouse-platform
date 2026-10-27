// Textos de Pactos (`/pactos`): proponer y aceptar pactos de tiempo y de plata, valor de la hora de referencia, aportes,
// cambios a un pacto aceptado, historial, avisos y errores. Los roles, las pestañas y los pasos viven en
// `lib/pactos/datos.ts` con su inglés. Lo que escribe la persona (descripción, rol "Otro") nunca se traduce.
// "Semillas" no se traduce; la primera mención del contenido va como "Semillas (seeds)" (glosario).
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.pactos.es,
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: G.pactos.es,
    h1: "Tus pactos con la comunidad",
    intro:
      "Un pacto por cada forma de aportar: tiempo o plata. Solo podés proponerlo en una comunidad donde sos miembro y lo acepta quien la administra. Todo es simulado: no se paga nada y lo que elijas queda solo en este navegador.",
  },
  cargando: "Cargando tus comunidades…",
  errorAlmacenamiento:
    "Error: tu navegador no permite guardar datos en este sitio, así que el pacto no se puede guardar. Revisá la configuración de privacidad o probá en otro navegador.",
  sinComunidad: {
    aria: "Sin comunidad",
    texto: "Para proponer un pacto primero tenés que pertenecer a una comunidad.",
    ver: "Ver las comunidades",
  },
  comunidad: {
    aria: "Comunidad del pacto",
    pregunta: "¿En qué comunidad es el pacto?",
    ayuda: "Solo podés proponer pactos en las comunidades donde sos miembro. Las Semillas son de cada comunidad.",
  },
  estadoAria: "Estado del pacto",
  pasosAria: "Pasos del pacto",
  tipoAria: "Tipo de pacto",
  version: (n: number) => `Versión ${n}`,
  tiempo: {
    legend: (nombre: string) => `Pacto de tiempo en ${nombre}`,
    rol: (nombre: string) => `1. Rol que asumís en ${nombre}`,
    elegiRol: "Elegí un rol",
    queRol: "¿Qué rol es?",
    descripcion: "Tu descripción: qué vas a hacer",
    compromiso: (horas: number) => `2. Compromiso mensual: ${horas} h/mes`,
    valorHora: "Valor de referencia de la hora",
    referenciaPorAhora: "referencia, por ahora",
    obra: "Horas de obra presenciales",
    obraFin: ": antes de la primera minga hace falta el seguro y la modalidad (voluntariado o locación de servicios).",
    remoto: "Aporte remoto desde el exterior",
    remotoLargo: (horas: number, pais: string) =>
      `: comprometés ${horas} h/mes${pais ? ` viviendo en ${pais}` : ""}. ¿Parte es presencial? Conviene un pacto de verano aparte.`,
    remotoCorto: ".",
    sinModalidad: "Sin dato de tu modalidad (presencial o remota).",
    cargala: "Cargala en Tus datos",
    sinModalidadFin: "para ver los avisos que te tocan.",
    porMes: "3. Por mes",
    semillas: G.semillas.es,
    deNombre: (nombre: string) => ` de ${nombre}`,
    formula: "Fórmula",
    formulaValor: "horas × valor de referencia de la hora",
    nota: "En esta fase solo se da: tiempo o plata. 1 Semilla = 1 USD de referencia: una hora y un dólar se miden igual.",
  },
  plata: {
    antes: "Sumarte con plata en",
    medio: " se registra como Semillas",
    fin: ": 1 USD = 1 Semilla de referencia. Es simulado: no se paga nada.",
    monto: "Monto (USD)",
    equivale: (semillas: string, enPesos: string) =>
      `Este aporte equivale a ${semillas} Semillas${enPesos ? ` (${enPesos})` : ""}.`,
    montoInvalido: (min: string, max: string) => `Poné un monto entero de USD ${min} a ${max}.`,
    registrar: "Registrar aporte (simulado)",
    ningunCobro: "Ningún flujo cobra de verdad: el aporte solo queda registrado en este navegador.",
    registradoEn: (nombre: string) => `Registrado en ${nombre}`,
    sinAportes: "Todavía no registraste aportes en plata.",
    total: (semillas: string) => `${semillas} Semillas de plata (simulado)`,
  },
  pasos: {
    enviar: "Enviar a la comunidad",
    nombrarRol: "Para enviarlo nombrá el rol.",
    elegirRol: "Para enviarlo elegí un rol y contá qué vas a hacer.",
    simularAcepta: "Simular: la comunidad acepta",
    retirar: "Retirar y editar",
    aceptado: "✓ Pacto aceptado",
    verLibro: (nombre: string) => `Tus Semillas de ${nombre} se ven en el libro de semillas.`,
    proponerCambio: "Proponer un cambio",
  },
  cambio: {
    titulo: "Cambio propuesto",
    pasosAria: "Pasos del cambio",
    vigente: (version: number, horas: number, semillas: string) =>
      `Mientras tanto sigue vigente la versión ${version}: ${horas} h/mes, ${semillas} semillas por mes.`,
    legend: (nombre: string) => `Cambio al pacto de tiempo en ${nombre}`,
    rol: "Rol propuesto",
    queRol: "¿Qué rol es el propuesto?",
    descripcion: "Descripción propuesta: qué vas a hacer",
    compromiso: (horas: number) => `Compromiso mensual propuesto: ${horas} h/mes`,
    conCambio: (semillas: string) => `Con el cambio serían ${semillas} semillas por mes.`,
    enviar: "Enviar cambio a la comunidad",
    descartar: "Descartar cambio",
    simularAcepta: "Simular: la comunidad acepta el cambio",
    simularRechaza: "Simular: la comunidad no lo acepta",
  },
  historial: {
    titulo: (n: number) => `Historial de versiones (${n})`,
    aria: "Versiones aceptadas",
    version: (n: number) => `Versión ${n}`,
    horas: (n: number) => `${n} h/mes`,
    fechaSinDato: "fecha sin dato",
  },
  /** Anuncios para lectores de pantalla (región viva) y aviso visible cuando la comunidad no acepta un cambio. */
  anuncios: {
    retiraste: (donde: string) => `Retiraste el pacto de ${donde}: volvió a borrador.`,
    cambioAbierto: "Se abrió un borrador del cambio, con los datos de la versión vigente.",
    cambioEnviado: (donde: string) => `Cambio enviado a ${donde}.`,
    cambioAceptado: (donde: string, version: number) => `Quien administra ${donde} aceptó el cambio. Ahora rige la versión ${version}.`,
    cambioRechazado: (donde: string, version: number) =>
      `Quien administra ${donde} no aceptó el cambio. Sigue vigente la versión ${version}.`,
    cambioDescartado: (version: number) => `Descartaste el cambio. Sigue vigente la versión ${version}.`,
    pactoEnviado: (donde: string) => `Pacto enviado a ${donde}.`,
    pactoAceptado: (donde: string) => `Quien administra ${donde} aceptó el pacto.`,
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: G.pactos.en,
    volverInicio: `← ${G.inicio.en}`,
    sobretitulo: G.pactos.en,
    h1: "Your pacts with the community",
    intro:
      "One pact for each way of contributing: time or money. You can only propose it in a community where you are a member, and whoever manages it accepts it. Everything is simulated: nothing is paid and what you choose stays only in this browser.",
  },
  cargando: "Loading your communities…",
  errorAlmacenamiento:
    "Error: your browser doesn't allow saving data on this site, so the pact can't be saved. Check your privacy settings or try another browser.",
  sinComunidad: {
    aria: "No community",
    texto: "To propose a pact you first have to belong to a community.",
    ver: "See the communities",
  },
  comunidad: {
    aria: "Community of the pact",
    pregunta: "In which community is the pact?",
    ayuda: `You can only propose pacts in the communities where you are a member. ${G.semillas.explicada.en} belong to each community.`,
  },
  estadoAria: "Status of the pact",
  pasosAria: "Steps of the pact",
  tipoAria: "Type of pact",
  version: (n: number) => `Version ${n}`,
  tiempo: {
    legend: (nombre: string) => `Time pact in ${nombre}`,
    rol: (nombre: string) => `1. Role you take on in ${nombre}`,
    elegiRol: "Choose a role",
    queRol: "What role is it?",
    descripcion: "Your description: what you will do",
    compromiso: (horas: number) => `2. Monthly commitment: ${horas} h/month`,
    valorHora: "Reference value of the hour",
    referenciaPorAhora: "reference, for now",
    obra: "On-site work hours",
    obraFin: ": before the first minga (work party) you need insurance and a mode (volunteering or service contract).",
    remoto: "Remote contribution from abroad",
    remotoLargo: (horas: number, pais: string) =>
      `: you commit ${horas} h/month${pais ? ` while living in ${pais}` : ""}. Is part of it on site? A separate summer pact may suit you better.`,
    remotoCorto: ".",
    sinModalidad: "No data on your mode (on-site or remote).",
    cargala: "Add it in My data",
    sinModalidadFin: "to see the notices that apply to you.",
    porMes: "3. Per month",
    semillas: G.semillas.en,
    deNombre: (nombre: string) => ` of ${nombre}`,
    formula: "Formula",
    formulaValor: "hours × reference value of the hour",
    nota: "In this phase there are only two ways to give: time or money. 1 Semilla = 1 reference USD: an hour and a dollar are measured the same.",
  },
  plata: {
    antes: "Joining with money in",
    medio: " is recorded as Semillas",
    fin: ": 1 USD = 1 reference Semilla. It is simulated: nothing is paid.",
    monto: "Amount (USD)",
    equivale: (semillas: string, enPesos: string) =>
      `This contribution is equivalent to ${semillas} Semillas${enPesos ? ` (${enPesos})` : ""}.`,
    montoInvalido: (min: string, max: string) => `Enter a whole amount of USD ${min} to ${max}.`,
    registrar: "Record contribution (simulated)",
    ningunCobro: "No flow charges anything for real: the contribution is only recorded in this browser.",
    registradoEn: (nombre: string) => `Recorded in ${nombre}`,
    sinAportes: "You haven't recorded any money contributions yet.",
    total: (semillas: string) => `${semillas} Semillas from money (simulated)`,
  },
  pasos: {
    enviar: "Send to the community",
    nombrarRol: "To send it, name the role.",
    elegirRol: "To send it, choose a role and tell us what you will do.",
    simularAcepta: "Simulate: the community accepts",
    retirar: "Withdraw and edit",
    aceptado: "✓ Pact accepted",
    verLibro: (nombre: string) => `Your Semillas in ${nombre} show up in the Semillas ledger.`,
    proponerCambio: "Propose a change",
  },
  cambio: {
    titulo: "Proposed change",
    pasosAria: "Steps of the change",
    vigente: (version: number, horas: number, semillas: string) =>
      `Meanwhile version ${version} stays in force: ${horas} h/month, ${semillas} Semillas per month.`,
    legend: (nombre: string) => `Change to the time pact in ${nombre}`,
    rol: "Proposed role",
    queRol: "What is the proposed role?",
    descripcion: "Proposed description: what you will do",
    compromiso: (horas: number) => `Proposed monthly commitment: ${horas} h/month`,
    conCambio: (semillas: string) => `With the change it would be ${semillas} Semillas per month.`,
    enviar: "Send change to the community",
    descartar: "Discard change",
    simularAcepta: "Simulate: the community accepts the change",
    simularRechaza: "Simulate: the community does not accept it",
  },
  historial: {
    titulo: (n: number) => `Version history (${n})`,
    aria: "Accepted versions",
    version: (n: number) => `Version ${n}`,
    horas: (n: number) => `${n} h/month`,
    fechaSinDato: "date: no data",
  },
  anuncios: {
    retiraste: (donde: string) => `You withdrew the pact in ${donde}: it went back to draft.`,
    cambioAbierto: "A draft of the change was opened, with the data of the version in force.",
    cambioEnviado: (donde: string) => `Change sent to ${donde}.`,
    cambioAceptado: (donde: string, version: number) =>
      `Whoever manages ${donde} accepted the change. Version ${version} now applies.`,
    cambioRechazado: (donde: string, version: number) =>
      `Whoever manages ${donde} did not accept the change. Version ${version} stays in force.`,
    cambioDescartado: (version: number) => `You discarded the change. Version ${version} stays in force.`,
    pactoEnviado: (donde: string) => `Pact sent to ${donde}.`,
    pactoAceptado: (donde: string) => `Whoever manages ${donde} accepted the pact.`,
  },
};

export const pactos = { es, en };

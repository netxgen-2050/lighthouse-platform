/**
 * Contenido de la política de privacidad (BORRADOR: lo revisa Gabriel antes de cualquier uso real, pendiente R14).
 * Vive acá, y no en la página, para que la pantalla de consentimiento y `/privacidad` digan lo mismo.
 *
 * 27-oct-2026: se quitaron los compromisos del resumen, de la tabla y de las finalidades sin subir `VERSION_POLITICA`
 * (solo reduce lo descrito; cambio `rail-sin-compromisos`, ADR-017).
 * 3-nov-2026: se suman los lotes simulados (qué lote reservó o "pagó" la persona en la simulación) a la tabla, al resumen,
 * a las finalidades y a los términos, y `VERSION_POLITICA` sube a `2026-11-03-borrador` (amplía lo descrito; cambio
 * `lote-ficha-y-compra`, ADR-017). Cada persona vuelve a aceptar la política una vez.
 */

/**
 * 23-nov-2026 (cambio `consentimiento-alta`): sube a `2026-11-23-borrador` e informa de una vez tres novedades: aceptar antes
 * de entrar o de crear la cuenta, la cookie de idioma `lh-idioma` y las novedades por email opcionales. La spec nombraba la
 * versión `2026-10-15-borrador`, pero `main` ya estaba en `2026-11-03-borrador` (lotes): una versión vieja no puede subir nada.
 * `idioma-legal` traduce esta misma versión sin volver a subirla.
 *
 * 25-nov-2026 (cambio `lotes-en-la-base`): las reservas de lotes pasan a la base y la fila "Lotes (simulado)" deja de decir
 * "solo en tu navegador". Sube a `2026-11-25-borrador`; Gus aprobó pedir la re-aceptación (todo uso hasta hoy fue de prueba).
 */
export type VersionPolitica = { version: string; fecha: string; cambios: readonly string[] };

/** Las versiones de la política, en orden. La última es la vigente (`VERSION_POLITICA`). Toda versión después de la primera lista qué cambió. */
export const VERSIONES_POLITICA: readonly VersionPolitica[] = [
  { version: "2026-10-14-borrador", fecha: "2026-10-14", cambios: [] },
  {
    version: "2026-11-03-borrador",
    fecha: "2026-11-03",
    cambios: ["Sumamos los lotes simulados: guardamos en tu navegador qué lote reservaste o “pagaste” en la simulación."],
  },
  {
    version: "2026-11-23-borrador",
    fecha: "2026-11-23",
    cambios: [
      "Ahora aceptás la política y los términos antes de entrar o de crear tu cuenta, cada vez que entrás. Mientras no aceptes, no guardamos nada a tu nombre.",
      "Si elegís un idioma, lo guardamos en tu navegador para mostrarte la plataforma en ese idioma.",
      "Podés pedir que te mandemos novedades por email. Es opcional y lo podés retirar cuando quieras desde Mis datos.",
    ],
  },
  {
    // BORRADOR (cambio `login-neon-auth`): versión nueva porque cambia quién trata tu email al entrar. Si Gus prefiere que el
    // equipo no vuelva a aceptar ahora, se quita esta versión y se vuelve a la anterior (pregunta abierta, design §5).
    version: "2026-11-24-borrador",
    fecha: "2026-11-24",
    cambios: ["El login pasa a hacerse con Neon (Neon Auth); Privy se va a retirar."],
  },
  {
    // Cambio `lotes-en-la-base` (decisión de Gus del 25-nov: todo uso hasta hoy fue de prueba, así que pedir la re-aceptación no es problema).
    version: "2026-11-25-borrador",
    fecha: "2026-11-25",
    cambios: [
      "Las reservas de lotes simulados ya no quedan solo en tu navegador: se guardan en la base de la plataforma para que un lote reservado se vea reservado para todos.",
    ],
  },
];

export const RESPONSABLE = {
  nombre: "NetXGen",
  detalle: "entidad registrada en Honduras",
  /** Email de ejemplo: a definir antes de cualquier uso real. */
  contacto: "privacidad@netx.example",
} as const;

export const UBICACION_DATOS = "Estados Unidos";

/** Resumen en palabras simples, el mismo en la pantalla de consentimiento y al principio de `/privacidad`. */
export const RESUMEN: readonly string[] = [
  "Quién se ocupa de tus datos: NetXGen, una entidad registrada en Honduras.",
  "Qué guardamos: tu email y tu billetera (por el login), y lo que cargues en la plataforma: perfil, comunidades, pactos, Semillas, votos, contactos, lotes simulados, verificación de identidad y reportes.",
  "Para qué: para que la plataforma funcione y para conectar tu presencia con tu perfil. Nada más.",
  "Dónde: los servicios que usamos (Privy, Vercel, Neon y GitHub) están en Estados Unidos. Es una transferencia internacional de datos.",
  "Tus derechos: podés ver y descargar tus datos, borrarlos y retirar tu consentimiento cuando quieras desde Mis datos, y corregirlos desde tu Perfil.",
];

export type DatosDePantalla = { pantalla: string; datos: string; donde: string };

/** Qué datos se tratan, por pantalla. "Hoy" es el prototipo; "con la base" es cuando exista `base-neon`. */
export const DATOS_POR_PANTALLA: readonly DatosDePantalla[] = [
  {
    pantalla: "Entrar (login)",
    datos: "Tu email, la dirección de tu billetera y, si entrás con Google, tu nombre.",
    donde: "Privy o Neon (Neon Auth), según cómo entraste. En la plataforma solo se usa para reconocerte.",
  },
  {
    pantalla: "Perfil",
    datos: "Tu nombre, dónde vivís, una frase tuya, tus roles y lo que contestes en la entrevista con Hifa.",
    donde: "Hoy, solo en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Comunidades y tribus",
    datos: "A qué comunidades pedís entrar o adherís, y tus postulaciones.",
    donde: "Hoy, solo en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Pactos y Semillas",
    datos: "Los pactos que proponés o aceptás, tus horas y aportes, y tus Semillas.",
    donde: "Hoy, solo en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Votos",
    datos: "Cómo votás en las rondas.",
    donde: "Hoy, solo en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Contactos",
    datos: "Los pedidos de contacto o de invitación que enviás y cómo preferís que te escriban.",
    donde: "Hoy, solo en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Lotes (simulado)",
    datos:
      "Qué lote reservaste o “pagaste” en la simulación, la opción que elegiste, las fechas y los valores que viste. Nunca datos de pago ni de identidad.",
    donde:
      "En Neon, la base de la plataforma. Los demás ven que el lote está reservado, pero no quién lo reservó. Si retirás tu consentimiento, tus lotes se liberan y el registro de las reservas queda como historial.",
  },
  {
    pantalla: "Pasaporte y verificación de identidad (KYC)",
    datos:
      "Nombre, documento, fecha de nacimiento, nacionalidad, residencia fiscal y origen de los fondos. Son datos sensibles: se piden aparte, con tu consentimiento específico.",
    donde:
      "Hoy es una simulación y queda solo en tu navegador. En la versión real los verifica un tercero (el fiduciario o un proveedor de KYC).",
  },
  {
    pantalla: "Origen de la visita",
    datos: "De qué campaña o enlace llegaste (por ejemplo, un newsletter), para saber qué convoca.",
    donde: "Hoy, solo en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Configuración y barra superior",
    datos: "El idioma que elegís, en una cookie del navegador (lh-idioma) y en tus preferencias. No lleva tu identidad.",
    donde: "Hoy, en tu navegador. Con la base, en Neon.",
  },
  {
    pantalla: "Novedades por email (opcional)",
    datos: "Si pediste recibirlas o no, con la fecha y el camino por el que lo elegiste. Se usa tu email de la cuenta.",
    donde: "Hoy, solo en tu navegador, y no mandamos ningún email. Con la base, en Neon.",
  },
  {
    pantalla: "Reportar un problema o idea",
    datos:
      "Lo que escribas, el contacto que dejes (sin cuenta, tu email) y datos técnicos de tu pantalla y navegador. Sin cuenta, además, tu IP (convertida en un código y solo en memoria) para limitar los envíos.",
    donde:
      "GitHub: el reporte se publica como un issue que ve el equipo de NetX, con el email si lo dejaste. La IP se usa un rato solo para limitar los envíos, no se guarda en disco ni va al issue.",
  },
];

export const FINALIDADES: readonly string[] = [
  "Reconocerte y que cada persona vea solo lo suyo.",
  "Mostrarte el territorio, las comunidades y lo que podés hacer según tu plan, y simular la reserva y la compra de un lote.",
  "Registrar tus pactos, Semillas y votos.",
  "Responder a tus pedidos de contacto y a tus reportes.",
  "Si lo pedís (es opcional): mandarte novedades por email. Base: tu consentimiento opcional, que podés retirar desde Mis datos.",
  "Cuando exista la versión real: verificar tu identidad antes de que aportes, como exige la prevención de lavado de activos.",
];

export const BASE_LEGAL =
  "Tu consentimiento, que das antes de entrar o de crear tu cuenta y podés retirar cuando quieras. Para los datos sensibles del Pasaporte te pedimos un consentimiento aparte, y las novedades por email son otro consentimiento opcional.";

export const CONSERVACION: readonly string[] = [
  "Mientras tengas cuenta. Si retirás tu consentimiento o pedís que borren tu cuenta, se borran.",
  "En el prototipo, lo que queda en tu navegador se borra con “Retirar mi consentimiento” (en Mis datos) o con “Borrar todo” (en Configuración).",
  "Los reportes quedan en GitHub hasta que el equipo los cierre o los borre.",
  "En la versión real, la verificación de identidad la conserva el fiduciario 10 años, porque la ley se lo exige (UIF, Ley 25.246).",
];

export type Encargado = { nombre: string; para: string; donde: string; estado: string };

/** Quiénes tratan datos por cuenta de NetXGen (encargados) y dónde. */
export const ENCARGADOS: readonly Encargado[] = [
  { nombre: "Privy", para: "Login y billetera, hasta que se retire", donde: UBICACION_DATOS, estado: "En uso" },
  { nombre: "Vercel", para: "Hosting de la plataforma", donde: UBICACION_DATOS, estado: "En uso" },
  { nombre: "Neon", para: "Base de datos y login (Neon Auth)", donde: UBICACION_DATOS, estado: "En uso" },
  { nombre: "GitHub", para: "Reportes y pedidos al equipo", donde: UBICACION_DATOS, estado: "En uso" },
];

export type Derecho = { nombre: string; que: string };

export const DERECHOS: readonly Derecho[] = [
  { nombre: "Acceso", que: "Saber qué datos tuyos tenemos y recibir una copia." },
  { nombre: "Rectificación", que: "Corregir lo que esté mal (por ejemplo, desde tu Perfil)." },
  { nombre: "Supresión", que: "Pedir que borremos tus datos y tu cuenta." },
  { nombre: "Retiro del consentimiento", que: "Retirarlo cuando quieras, sin tener que dar explicaciones." },
  { nombre: "Baja de las novedades", que: "Dejar de recibir las novedades por email cuando quieras, desde Mis datos." },
];

export const MARCO_LEGAL =
  "Para personas en Argentina: Ley 25.326 de Protección de los Datos Personales (arts. 14 a 16: acceso, rectificación, actualización y supresión). Para personas en Europa: Reglamento General de Protección de Datos (RGPD).";

/** Términos de uso del prototipo (la segunda casilla de la pantalla de consentimiento). */
export const TERMINOS_DE_USO: readonly string[] = [
  "Esto es un prototipo interno para pruebas del equipo: los datos son de ejemplo y puede cambiar o dejar de funcionar sin aviso.",
  "Ningún flujo cobra de verdad: planes, Pase Fundador, aportes, inversión y lotes son simulados.",
  "Lo que ves no es una oferta de inversión ni de venta de lotes.",
  "Usá la plataforma de buena fe: no cargues datos de otras personas sin su permiso.",
];

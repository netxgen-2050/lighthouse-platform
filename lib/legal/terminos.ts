// Catálogo único de textos legales. Copiados textualmente de LEGAL en
// docs/referencia/netx-tribus-mockup-v6.html. Los textos nuevos los escribe o aprueba Gabriel.
export const TERMINOS = {
  ritual: {
    titulo: "Ritual de entrada",
    texto:
      "Cada tribu decide quién entra según su propio estatuto (por ejemplo, asociación civil o SAS). Eso no condiciona tu derecho a sumarte al proyecto del territorio: ese acceso no filtra por ideas ni valores (Ley 23.592).",
  },
  personeria: {
    titulo: "Comunidad con personería",
    texto:
      "Una tribu puede sumarse como asociación civil (sin fin de lucro, con estatuto que regula ingreso y salida) o como SAS (si hay retorno).",
  },
  ticket: {
    titulo: "Ticket del Congreso",
    texto:
      "El organizador vende el Congreso por su cuenta. La plataforma solo registra tu ticket para conectar tu presencia con tu perfil.",
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Congress ticket",
      texto:
        "The organizer sells the Congress on its own. The platform only records your ticket to connect your presence with your profile.",
    },
  },
  presencia: {
    titulo: "Presencia",
    texto:
      "Un registro que confirma el anfitrión con el check-in. Da acceso y voz (con un tope), nunca valor económico. No se compra ni se transfiere.",
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Presence",
      texto:
        "A record the host confirms at check-in. It gives access and a voice (with a cap), never economic value. It cannot be bought or transferred.",
    },
  },
  ribera: {
    titulo: "Tierra ribereña",
    texto:
      "Ley 26.737 de Tierras Rurales: una persona extranjera no puede adquirir dominio de tierra rural ribereña de cuerpos de agua de envergadura. El derecho de superficie es la etapa favorable; la conversión a dominio es la sensible. A confirmar si el predio queda en el ejido urbano.",
  },
  obra: {
    titulo: "Horas de obra",
    texto:
      "Trabajo presencial en obra: hay que definir la modalidad (voluntariado, Ley 25.855, o locación de servicios) y contratar un seguro de accidentes. Si se presume relación laboral, aplica la LCT (art. 23).",
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Construction hours",
      texto:
        "On-site construction work: the arrangement has to be defined (volunteering under Law 25.855, or a service contract) and accident insurance has to be taken out. If an employment relationship is presumed, the Employment Contract Law (LCT, art. 23) applies.",
    },
  },
  sumarte: {
    titulo: "Sumarte al proyecto",
    texto:
      "Adherís al Fideicomiso de Desarrollo del Macrolote como fiduciante-beneficiario/a. Es un derecho personal contra el fideicomiso, no una chacra identificada. Se firma por escritura con el fiduciario (art. 1618 CCyCN).",
  },
  circulo: {
    titulo: "Círculo por invitación",
    texto:
      "Oferta privada: acceso por invitación, hasta 35 aportantes por emisión y 15 no calificados como máximo, sin difusión masiva del instrumento (RG CNV 1016/2024, mod. RG 1088/2025). El contenido de comunidad sí es público.",
  },
  caja: {
    titulo: "La caja del proyecto",
    texto:
      "La plata va directo a la cuenta del fiduciario. Ni la plataforma ni NetX Gen reciben fondos de inversores: hacerlo exigiría registrarse como plataforma de financiamiento colectivo.",
  },
  espejo: {
    titulo: "Espejo del proyecto",
    texto:
      "La plataforma muestra un registro espejo de quién aportó qué, conciliado con el del fiduciario. Si hay diferencia, manda el registro del fiduciario.",
  },
  art32: {
    titulo: "Reglamento de Soluna, art. 32",
    texto:
      "Consenso para el funcionamiento habitual, consentimiento para lo operativo y 2/3 para modificar el reglamento. El voto vale porque lo dice el reglamento, no porque lo diga la plataforma.",
  },
  semillas: {
    titulo: "Semillas",
    texto:
      "Registro contable interno de la plataforma: no transferible, sin precio y sin mercado. No es un activo virtual ni un valor negociable. Su conversión en derechos la define el contrato del fideicomiso.",
  },
  hacienda: {
    titulo: "Residencia fiscal",
    texto:
      "Si un solo aportante tiene residencia fiscal en el exterior, el fideicomiso deja de ser transparente y tributa Ganancias entero como sujeto, 25–35% (LIG art. 73 a.6 y Título V).",
  },
  membresia: {
    titulo: "Membresía de la red",
    texto: "Un servicio: acceso a la red, a las tribus y a los eventos. No da derechos sobre la tierra.",
  },
  pasefundador: {
    titulo: "Pase Fundador",
    texto:
      "Una membresía no transferible del Guardián del Lighthouse (la asociación que custodia el Fondo Común). Da voz, acceso y créditos de servicios. No da tierra, lotes, prioridad ni rendimiento, y no se puede revender (así no es un activo virtual ni un valor negociable).",
  },
  guardian: {
    titulo: "El Guardián y el Fondo Común",
    texto:
      "El Guardián del Lighthouse es una asociación civil que custodia el Fondo Común (agua, energía, vivero, incubación de tribus). Recibe el pago del Pase directamente; NetX cobra una tarifa de servicio fija y publicada por operar la plataforma.",
  },
  creditos: {
    titulo: "Créditos comunes y de estadía",
    texto:
      "Un saldo con un solo emisor (el Guardián): se canjea por productos de las tribus y por estadías. No se transfiere, vence y no se rescata en dinero, para no ser un medio de pago.",
  },
  ronda0: {
    titulo: "Ronda 0",
    texto:
      "En el Congreso, quienes tienen el Pase reparten fondos de incubación entre propuestas de tribus con financiamiento cuadrático (pesa más el apoyo amplio que el monto). El Consejo de Regeneración revisa que respeten los principios. Se apoya en el estatuto del Guardián.",
  },
  plantribu: {
    titulo: "Plan Tribu",
    texto: "Un servicio de software que NetX le factura a la tribu (asociación civil o SAS). No es un aporte ni una inversión.",
  },
  remoto: {
    titulo: "Aporte remoto",
    texto:
      "Desde el exterior, un aporte de trabajo remunerado sería una locación de servicios (exportación de servicios para quien lo presta). A definir con el contador.",
  },
  pase: {
    titulo: "Pase de estadías",
    texto:
      "Créditos de hospedaje intransferibles: un contrato de servicios con defensa del consumidor (Ley 24.240). Es un saldo de noches, no un token que se pueda vender.",
  },
  pacto: {
    titulo: "Pacto de convivencia",
    texto:
      "Reglamento de propiedad horizontal especial (arts. 2078–2086 CCyCN): reglas ecológicas medibles que se transcriben en cada escritura. Puede limitar pero no impedir que vendas, y da preferencia de compra a la comunidad.",
  },
  safe: {
    titulo: "Invertir en la empresa",
    texto:
      "La inversión en NetX como compañía es otra cosa: se hace con un SAFE en el holding, en conversaciones privadas, uno a uno. No se ofrece públicamente en la plataforma.",
  },
  art35: {
    titulo: "Reglamento de Soluna, art. 35",
    texto: "Fondo comunitario: contribución mensual fijada en asamblea, reserva de 3 meses, rendición mensual de cuentas.",
  },
  art44: {
    titulo: "Reglamento de Soluna, art. 44",
    texto: "El reglamento se modifica con 2/3 de los copropietarios con derecho a voto y aviso de 30 días.",
  },
  fidasamblea: {
    titulo: "Asamblea de beneficiarios",
    texto:
      "La define el contrato de fideicomiso: mayorías, comité y derechos de información. El fiduciario rinde cuentas al menos una vez por año y no se puede dispensar (arts. 1675–1676 CCyCN).",
  },
  estatuto: {
    titulo: "Estatuto de la tribu",
    texto:
      "La tribu se organiza como asociación civil: elige autoridades y decide ingresos según su estatuto. Solo puede excluir con causa y con derecho de defensa (art. 180 CCyCN).",
  },
  pasaporte: {
    titulo: "Pasaporte",
    texto:
      "Identificación (KYC) que el fiduciario está obligado a pedir (UIF, Ley 25.246): identidad, residencia fiscal, nacionalidad y origen de fondos. Se conserva 10 años. La plataforma la recolecta por delegación.",
  },
  chacra: {
    titulo: "Tu chacra",
    texto:
      "Con aprobación municipal, cada unidad se vende por boleto con un corredor matriculado. Hoy, en la realidad, la Ordenanza 173 prohíbe ofrecerla, publicitarla o reservarla.",
  },
  calificado: {
    titulo: "Inversor no calificado",
    texto:
      "Quien no cumple los requisitos de inversor calificado de la CNV. En oferta privada puede haber como máximo 15 por emisión.",
  },
  licencia: {
    titulo: "Licencia de uso",
    texto:
      "La tribu no compra tierra: recibe una licencia de uso de su barrio otorgada por el fideicomiso del Lote 7 (un derecho de superficie no puede darse sobre otro, art. 2118 CCyCN). Plazo y renovación atados a conducta. Forma exacta a confirmar con el equipo legal.",
  },
  adherente: {
    titulo: "Tribu adherente",
    texto:
      "Una tribu con personería (asociación civil o SAS) podría adherir al proyecto del Lote 7 y recibir la licencia de su barrio. A confirmar con el equipo legal: si adhiere al fideicomiso y con qué rol.",
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  agencia: {
    titulo: "NetX como agencia",
    texto:
      "En las Chacras de Soluna, NetX actúa como agencia: muestra los lotes y pone en contacto a las partes. La compra es privada entre quien vende y quien compra; NetX no vende ni cobra el lote por la plataforma.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  loteo: {
    titulo: "Estado del loteo",
    texto:
      "Los lotes de Chacras de Soluna son de BioPueblo. Su loteo está en trámite según la Ordenanza 173/2026 de Mainqué: hasta que el municipio lo apruebe no se pueden reservar, señar ni comprar. Lo que ves acá es informativo. NetX actúa como agencia y publica el número de expediente cuando exista.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  contacto: {
    titulo: "Pedir contacto",
    texto:
      "Pedir contacto no es una reserva, una oferta ni una inversión: no te compromete a nada, no se paga nada y no asegura un lote ni un lugar en el círculo. Una persona del equipo te escribe. Si es por un lote de Chacras de Soluna, la compra es privada entre vos y BioPueblo; NetX actúa como agencia.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  bitacora: {
    titulo: "Bitácora de lo que te mostramos",
    texto:
      "Anotamos qué estado del loteo y qué explicaciones legales te mostramos, y cuándo, para poder probar con qué información contabas al decidir (Ley 24.240 de Defensa del Consumidor). En el prototipo queda solo en este navegador, no tiene datos personales y se borra con 'Borrar todo'.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  adhesion: {
    titulo: "Adherir a un manifiesto",
    texto:
      "Adherir es aceptar por escrito los principios y las reglas de convivencia de una comunidad. No te hace dueño de nada ni te obliga a pagar: te compromete a cuidar esos acuerdos. En Lighthouse VRN, adherir al manifiesto es lo que te permite participar en las decisiones; la adhesión vale desde que adherís, y si el manifiesto cambia de versión tenés que volver a adherir. Podés retirarte siguiendo lo que diga el propio manifiesto. En el prototipo todo es simulado y queda solo en este navegador.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  manifiestovrn: {
    titulo: "Manifiesto de Lighthouse VRN",
    texto:
      "Es el texto donde Lighthouse VRN, la meta-tribu de la que forman parte todas las tribus, dice qué cuida y cómo decide: propósito, principios, derechos de la tierra y compromisos. Hoy es un borrador escrito por un agente: el común todavía no lo ratificó, y solo vale como ejemplo. No es un contrato ni un reglamento legal.",
    en: {
      titulo: "Lighthouse VRN manifesto",
      texto:
        "This is the text where Lighthouse VRN, the meta-tribe all tribes belong to, says what it looks after and how it decides: purpose, principles, rights of the land and commitments. Today it is a draft written by an agent: the commons has not ratified it yet, and it only counts as an example. It is not a contract or a legal rulebook.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  derechostierra: {
    titulo: "Derechos de la tierra",
    texto:
      "Son lo que el común se compromete a respetar con la tierra, el agua y los seres que viven en ella. Se inspiran en la Declaración Universal de los Derechos de la Madre Tierra, pero no son un texto jurídico y no te dan derechos ante un juez. Es un borrador para revisar antes de cualquier uso real.",
    en: {
      titulo: "Rights of the land",
      texto:
        "These are what the commons commits to respect regarding the land, the water and the beings that live in it. They draw on the Universal Declaration of the Rights of Mother Earth, but they are not a legal text and they do not give you rights before a judge. It is a draft to be reviewed before any real use.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  adhesiongobernanza: {
    titulo: "Adherir para participar",
    texto:
      "Para votar, repartir créditos o llevar una decisión al consejo hace falta haber adherido al manifiesto de Lighthouse VRN: es el compromiso de cuidar la vida en cada decisión. Sin adherir podés mirar todo, pero no participar. Si el manifiesto cambia de versión, volvés a adherir. En el prototipo la adhesión queda en este navegador y es un borrador a revisar antes de cualquier uso real.",
    en: {
      titulo: "Sign on to take part",
      texto:
        "To vote, distribute credits or take a decision to the council you must have signed on to the Lighthouse VRN manifesto: it is the commitment to look after life in every decision. Without signing on you can look at everything, but not take part. If the manifesto changes version, you sign on again. In the prototype the sign-on stays in this browser and it is a draft to be reviewed before any real use.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  kyc: {
    titulo: "Verificación de identidad",
    texto:
      "Antes de aportar plata, quien administra el fideicomiso tiene que saber quién sos, dónde tributás y de dónde vienen los fondos (prevención de lavado de activos). En la versión real lo hace el fiduciario y custodia tus datos. En el prototipo es una simulación: no se verifica ningún documento y nada sale de este navegador.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  inversorexterior: {
    titulo: "Aportantes con residencia fiscal en el exterior",
    texto:
      "Si entrara al fideicomiso una persona con residencia fiscal en el exterior, todo el fideicomiso pasaría a pagar Ganancias como sujeto, y eso afectaría a todos los aportantes. Por eso, por ahora, no se habilita. El equipo está estudiando una vía separada para aportantes del exterior.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  datos: {
    titulo: "Tus datos personales",
    texto:
      "NetXGen (entidad registrada en Honduras) es la responsable de tus datos. Los usa solo para que la plataforma funcione, con tu consentimiento, y podés pedir verlos, corregirlos, borrarlos o retirar tu consentimiento cuando quieras (Ley 25.326, arts. 14 a 16, para personas en Argentina; RGPD para personas en Europa). En el prototipo la mayor parte queda solo en tu navegador.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  transferencia: {
    titulo: "Transferencia internacional de datos",
    texto:
      "Los servicios que usamos para entrar, alojar la plataforma y guardar datos (Privy, Vercel, Neon y GitHub) tienen sus servidores en Estados Unidos. Eso es una transferencia internacional de datos: por eso te pedimos tu consentimiento antes de usar la plataforma con tu cuenta. Las cláusulas con cada proveedor todavía están por definirse.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  gobernanzafideicomiso: {
    titulo: "Voto en el Fideicomiso",
    texto:
      "El fideicomiso decide cosas como el presupuesto de obra del macrolote. En el prototipo, quien tiene el Pase Fundador vota esas decisiones, con el mismo voto en los tres niveles del pase, y el voto es simulado. En la versión real, quién vota y con qué alcance lo define el contrato del fideicomiso, que todavía hay que confirmar con el equipo legal.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  encuentroeducativo: {
    titulo: "Encuentro educativo",
    texto:
      "El Congreso es un encuentro educativo, no una oferta de inversión. Los proyectos que buscan socios se presentan por separado, solo a quien lo pida, y sumarse es siempre opcional. Cualquier aporte pasa por los documentos propios de cada proyecto.",
    borrador: true,
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Educational gathering",
      texto:
        "The Congress is an educational gathering, not an investment offer. Projects looking for partners are presented separately, only to those who ask, and joining is always optional. Any contribution goes through each project's own documents.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  consultivo: {
    titulo: "Resultado consultivo",
    // La frase es la que se ve en el acta (aprobada por Gus); `texto` es la explicación del ⚖.
    frase: "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.",
    texto:
      "Consultivo quiere decir que el resultado orienta una decisión, pero no obliga a nadie a seguirlo. Muestra qué le importa más al grupo; la decisión la toma después quien tiene esa facultad según el contrato o el estatuto, y puede decidir otra cosa. Votar no te cuesta plata: los créditos no se compran ni se cobran, y la consulta no mueve fondos por sí sola.",
    borrador: true,
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Advisory result",
      frase: "The result is advisory: it does not replace the decisions reserved by the contract or the statute.",
      texto:
        "Advisory means the result guides a decision, but does not bind anyone to follow it. It shows what matters most to the group; the decision is then made by whoever holds that power under the contract or the statute, and they may decide something else. Voting costs you no money: credits are not bought or charged, and the consultation does not move funds by itself.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  avisosimulador: {
    titulo: "Aviso del simulador",
    texto:
      "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  unidadesregeneracion: {
    titulo: "Unidades de Regeneración",
    texto:
      "Participaciones en una serie del programa de fideicomisos. Cobran después de la Fundación y de las Notas Verdes, y solo hasta un tope por año; lo que sobra va casi todo al procomún. No dan ningún derecho sobre la tierra, que sigue siendo de la Fundación.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  notasverdes: {
    titulo: "Notas Verdes",
    texto:
      "Deuda de una serie: cobra un interés fijo y devuelve su capital antes que los otros inversores. Su garantía es el derecho de superficie y las instalaciones de la serie, nunca la tierra.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  primeraperdida: {
    titulo: "Primera pérdida",
    texto:
      "Plata catalítica (fundaciones, fondos climáticos, donantes) que cobra después de las Unidades y es la primera en perder si el proyecto rinde menos. Esa protección es la que permite que entren inversores más prudentes.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  safu: {
    titulo: "SAFU",
    texto:
      "Acuerdo simple por Unidades futuras: alguien pone plata hoy, antes de que existan las series, y la recibe como Unidades de la Serie Madre cuando abra, con un descuento. Cómo se ofrece legalmente todavía lo tiene que confirmar un abogado.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  serieprograma: {
    titulo: "Serie",
    texto:
      "Un proyecto con su propia plata, sus propios ingresos y sus propios inversores (por ejemplo, el viñedo o el parque solar) dentro del programa de fideicomisos. Cada fideicomiso es un patrimonio separado: un problema en una serie no alcanza a otra.",
    borrador: true,
  },
  // Textos nuevos de la gobernanza fractal, no vienen del mock-up: borradores a revisar antes de cualquier uso real.
  circulotrabajo: {
    titulo: "Círculo de trabajo",
    texto:
      "Un grupo de personas que se hace cargo de un tema (por ejemplo, el cuidado de la tierra o la comunicación) dentro de una tribu, o entre varias tribus. Decide lo suyo sin pedir permiso arriba. Los círculos de esta página son un ejemplo: cómo se forman y qué pueden decidir lo define el reglamento, que todavía no existe.",
    borrador: true,
    en: {
      titulo: "Working circle",
      texto:
        "A group of people who take charge of a topic (for example, land care or communications) inside a tribe, or across several tribes. It decides its own matters without asking for permission above. The circles on this page are an example: how they form and what they can decide is set by the rules, which do not exist yet.",
    },
  },
  consejo: {
    titulo: "Consejo de las tribus",
    texto:
      "Un espacio de coordinación con un lugar por tribu validada por el común. Cada tribu decide primero adentro y después lleva al consejo lo que no puede resolver sola, por ejemplo pedir plata del fondo común. No es un órgano del fideicomiso. En el prototipo todo es de ejemplo; cómo vota el consejo y con qué mayoría lo define el diseño legal, que todavía hay que confirmar con el equipo legal.",
    borrador: true,
    en: {
      titulo: "Council of the tribes",
      texto:
        "A coordination space with one seat for each tribe validated by the commons. Each tribe first decides internally and then brings to the council what it cannot solve alone, for example asking for money from the common fund. It is not a body of the trust. In the prototype everything is an example; how the council votes and with what majority is set by the legal design, which still has to be confirmed with the legal team.",
    },
  },
  representante: {
    titulo: "Representante de la tribu",
    texto:
      "La persona que ocupa el lugar de su tribu en el consejo y lleva lo que la tribu votó adentro. En el prototipo no se eligió a nadie: por eso dice «Sin representante elegido». Cómo se elige y por cuánto tiempo lo define el reglamento, que todavía hay que escribir.",
    borrador: true,
    en: {
      titulo: "Tribe representative",
      texto:
        "The person who holds the tribe's seat on the council and carries what the tribe voted on internally. In the prototype nobody was elected, which is why it says \"No representative chosen\". How they are chosen and for how long is set by the rules, which still have to be written.",
    },
  },
  validacioncomun: {
    titulo: "Validación del común",
    texto:
      "Una afirmación de que el común (Lighthouse) reconoce a una tribu, y de que una tribu reconoce a una persona. Se guarda como un registro que no se edita: si se retira, se agrega otro registro que lo anula y el original queda a la vista. En el prototipo vive solo en este navegador y no tiene valor legal; qué efectos tiene una validación lo define el diseño legal, que todavía hay que confirmar con el equipo legal.",
    borrador: true,
    en: {
      titulo: "Validation by the commons",
      texto:
        "A statement that the commons (Lighthouse) recognizes a tribe, and that a tribe recognizes a person. It is kept as a record that is never edited: if it is withdrawn, another record is added that cancels it and the original stays visible. In the prototype it lives only in this browser and has no legal value; what effects a validation has is set by the legal design, which still has to be confirmed with the legal team.",
    },
  },
  // Textos nuevos de la holarquía de la gobernanza, no vienen del mock-up: borradores a revisar antes de cualquier uso real.
  dobleenlace: {
    titulo: "Doble enlace",
    texto:
      "Cada tribu manda un enlace al consejo y el común manda un enlace a cada tribu, así lo que se decide arriba y lo que se decide abajo se conectan en las dos direcciones. En el prototipo nadie fue elegido: los enlaces que ves son de ejemplo. Cómo se eligen y qué pueden hacer lo define el reglamento, que todavía no existe.",
    borrador: true,
    en: {
      titulo: "Double link",
      texto:
        "Each tribe sends a link to the council and the commons sends a link to each tribe, so what is decided above and what is decided below are connected in both directions. In the prototype nobody was elected: the links you see are examples. How they are chosen and what they can do is set by the rules, which do not exist yet.",
    },
  },
  dominio: {
    titulo: "Decide sobre (dominio)",
    texto:
      "Lo que un círculo decide sin pedir permiso arriba. Los temas que figuran en esta página son de ejemplo: el reglamento real lo define el diseño legal, que todavía hay que confirmar con el equipo legal.",
    borrador: true,
    en: {
      titulo: "Decides about (domain)",
      texto:
        "What a circle decides without asking for permission above. The topics on this page are examples: the real rules are set by the legal design, which still has to be confirmed with the legal team.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  seriemadre: {
    titulo: "Serie Madre",
    texto:
      "Una serie que no tiene un proyecto propio: invierte en todas las demás. Quien entra ahí tiene un pedacito de todos los proyectos, con menos riesgo que en uno solo. Es donde terminan el SAFU y, más adelante, los tokens.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  fundaciontierra: {
    titulo: "Fundación de la tierra",
    texto:
      "En el Juego B, la entidad en la que queda la tierra del Lighthouse. Todavía no existe: se crea si se acepta el diseño y el dueño actual le pasa la tierra. Su estatuto le prohibiría venderla, hipotecarla o darla en garantía (cómo hacer que eso valga frente a terceros está a verificar con abogado). Cobra un canon y una regalía de cada serie antes que cualquier inversor y con eso paga el procomún. NetX no puede tomar un porcentaje de su plata.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  ordenanza173: {
    titulo: "Ordenanza 173/2026 de Mainqué",
    texto:
      "Hasta que el municipio apruebe un loteo, nadie puede ofrecer, vender, reservar ni dar prioridad sobre esos lotes. Por eso NetX no se financia vendiendo lotes: no puede, y en el Juego B la tierra del Lighthouse queda en una Fundación que no la vende. A verificar con abogado.",
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  pactoDosPartes: {
    titulo: "Pacto aceptado por las dos partes",
    texto:
      "Un acuerdo social entre vos y tu tribu, registrado en la plataforma: vos lo propusiste y quien lidera la tribu lo aceptó. No es un contrato de trabajo ni de inversión, y cada tribu lo revisa según su estatuto. En el prototipo la constancia queda solo en este navegador.",
    en: {
      titulo: "Pact accepted by both parties",
      texto:
        "A social agreement between you and your tribe, recorded on the platform: you proposed it and whoever leads the tribe accepted it. It is not an employment or investment contract, and each tribe reviews it according to its own bylaws. In the prototype the record stays only in this browser.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar (con abogado) antes de cualquier uso real. Escrito con criterio de
  // la legislación argentina (LCT 20.744 arts. 21-23 y 103; Ley de Voluntariado Social 25.855): sin subordinación ni sueldo.
  pactopuntual: {
    titulo: "Pacto puntual",
    texto:
      "Es un acuerdo voluntario para colaborar con una sola tarea. No es un contrato de trabajo: no tenés horario impuesto, nadie te da órdenes sobre cómo hacerla y no hay pago en dinero. Vos proponés las horas y la fecha. El círculo o la tribu decide si te la deja tomar y, al final, verifica que la tarea quedó hecha. Tus horas verificadas se reconocen con Semillas, que no son un sueldo: no se compran ni se venden.",
    en: {
      titulo: "One-off pact",
      texto:
        "It is a voluntary agreement to help with a single task. It is not an employment contract: you have no imposed schedule, nobody gives you orders on how to do it and there is no payment in money. You propose the hours and the date. The circle or the tribe decides whether to let you take it and, at the end, checks that the task was done. Your verified hours are recognized with Semillas, which are not a salary: they cannot be bought or sold.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar (con abogado) antes de cualquier uso real. Escrito con criterio de
  // la legislación argentina (LCT 20.744: período de prueba art. 92 bis [verificar]; sanciones y retenciones arts. 67, 131 y
  // 132 [verificar]; Ley de Voluntariado Social 25.855): un compromiso voluntario, sin subordinación ni sueldo.
  compromisominimo: {
    titulo: "Compromiso mínimo",
    texto:
      "Es el tiempo mínimo que te comprometés a sostener este pacto (de 1 a 3 meses, lo fija la tribu). Es un compromiso voluntario, de palabra: no es un contrato de trabajo ni un período de prueba, no hay horario impuesto ni pago en dinero, y podés dejarlo antes avisando. Las horas de cada mes las confirma la tribu y generan Semillas pendientes, que recibís al cumplir el compromiso (o, si lo dejás antes avisando, las de los meses confirmados). Las Semillas no son un sueldo.",
    en: {
      titulo: "Minimum commitment",
      texto:
        "It is the minimum time you commit to sustaining this pact (1 to 3 months, set by the tribe). It is a voluntary commitment, by word: it is not an employment contract or a probationary period, there is no imposed schedule or payment in money, and you can leave earlier by giving notice. The tribe confirms the hours of each month and they generate pending Semillas, which you receive when you complete the commitment (or, if you leave earlier giving notice, those of the confirmed months). Semillas are not a salary.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  evaluacionPares: {
    titulo: "Evaluación entre pares",
    texto:
      "Las personas de tu equipo te puntúan de 1 a 5, siempre con un motivo. Lo que ves es privado y agregado: no sabés quién puso cada nota, y lo que escribieron no se muestra tal cual sino resumido. Ajusta tus Semillas entre un 20 % menos y un 20 % más. Las Semillas no son plata ni se transfieren. Los parámetros son de prueba.",
    en: {
      titulo: "Peer evaluation",
      texto:
        "The people on your team score you from 1 to 5, always with a reason. What you see is private and aggregated: you do not know who gave each score, and what they wrote is not shown as is but summarized. It adjusts your Semillas between 20% less and 20% more. Semillas are not money and cannot be transferred. The parameters are for testing.",
    },
    borrador: true,
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  constanciaSemillas: {
    titulo: "Constancia de Semillas",
    texto:
      "Un registro que afirma NetX sobre tus Semillas. No se edita: si hay un error, se revoca y se vuelve a emitir. Hoy es solo un ejemplo que vive en tu navegador; nunca se guardan datos personales en una cadena de bloques.",
    en: {
      titulo: "Semillas attestation",
      texto:
        "A record NetX asserts about your Semillas. It is never edited: if there is a mistake it is revoked and issued again. Today it is only an example that lives in your browser; personal data is never stored on a blockchain.",
    },
    borrador: true,
  },
} as const;

/** Claves de los textos que son borrador (no vienen del mock-up). */
export function esBorrador(clave: ClaveTermino): boolean {
  return "borrador" in TERMINOS[clave];
}

export type ClaveTermino = keyof typeof TERMINOS;

/**
 * Versión en inglés de un término, si la tiene. Toda versión en inglés es borrador por definición, aunque el español
 * de esa clave no lo sea: nadie la revisó todavía.
 */
export function terminoEn(clave: ClaveTermino): { titulo: string; texto: string } | undefined {
  const t: Readonly<{ titulo: string; texto: string; en?: { titulo: string; texto: string } }> = TERMINOS[clave];
  return t.en;
}

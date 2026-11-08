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
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Riverside land",
      texto:
        "Law 26,737 on Rural Land: a foreign person cannot acquire ownership of rural land on the banks of large bodies of water. The surface right is the favorable stage; conversion to ownership is the sensitive one. To be confirmed whether the property falls within the urban boundary.",
    },
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
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Circle by invitation",
      texto:
        "Private offer: access by invitation, up to 35 contributors per issue and at most 15 non-qualified, with no mass promotion of the instrument (CNV General Resolution 1016/2024, as amended by 1088/2025). Community content is public.",
    },
  },
  // Para "Invertir" de Sumarte: sin cupos ni descuentos en esa sección (decisión de Gus, 4-nov-2026). Borrador.
  circuloinvertir: {
    titulo: "Círculo por invitación",
    texto:
      "Oferta privada: acceso por invitación y sin difusión masiva del instrumento, con los topes que fija la CNV (RG CNV 1016/2024, mod. RG 1088/2025). El contenido de comunidad sí es público.",
    borrador: true,
    en: {
      titulo: "Circle by invitation",
      texto:
        "Private offer: access by invitation and with no mass promotion of the instrument, within the limits set by the CNV (General Resolution 1016/2024, as amended by 1088/2025). Community content is public.",
    },
  },
  safuinvertir: {
    titulo: "SAFU",
    texto:
      "Acuerdo simple por Unidades futuras: alguien pone plata hoy, antes de que existan las series, y la recibe como Unidades de la Serie Madre cuando abra. Las condiciones y cómo se ofrece legalmente todavía las tiene que confirmar un abogado.",
    borrador: true,
    en: {
      titulo: "SAFU",
      texto:
        "A simple agreement for future Units: someone puts in money today, before the series exist, and receives it as Units of the Mother Series when it opens. The terms and how it can legally be offered still have to be confirmed by a lawyer.",
    },
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
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Network membership",
      texto: "A service: access to the network, the tribes and the events. It gives no rights over the land.",
    },
  },
  pasefundador: {
    titulo: "Pase Fundador",
    texto:
      "Una membresía no transferible del bien común del Lighthouse. Da influencia en el Fondo Común, acceso y créditos de servicios. No da tierra, lotes, prioridad ni rendimiento, y no se puede revender. La plata del Pase va al Fondo Común, no a NetX. En el modelo híbrido la recibe la Fundación de la tierra, que todavía no existe; quién la recibiría mientras tanto está sin definir. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "Founder Pass",
      texto:
        "A non-transferable membership of the Lighthouse commons. It gives influence in the Common Fund, access and service credits. It gives no land, lots, priority or return, and it cannot be resold. The Pass money goes to the Common Fund, not to NetX. Under the hybrid model it is received by the land Foundation, which does not exist yet; who would receive it in the meantime is still undefined. To be verified with a lawyer.",
    },
  },
  guardian: {
    titulo: "El Fondo Común",
    texto:
      "La plata del bien común para agua, energía, vivero e incubación de tribus. Recibe el pago del Pase directamente. NetX nunca toma un porcentaje: como mucho cobra una tarifa de servicio fija y publicada, si se la contrata para operar la plataforma. En el modelo híbrido lo administra la Fundación de la tierra, que todavía no existe. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "The Common Fund",
      texto:
        "The commons' money for water, energy, the nursery and incubating tribes. It receives the Pass payment directly. NetX never takes a percentage: at most it charges a fixed, published service fee, if it is hired to operate the platform. Under the hybrid model it is managed by the land Foundation, which does not exist yet. To be verified with a lawyer.",
    },
  },
  creditos: {
    titulo: "Créditos comunes y de estadía",
    texto:
      "Un saldo con un solo emisor, quien custodie el Fondo Común: se canjea por productos de las tribus y por estadías. Se libera por partes en 3 años y cada parte vence a los 12 meses. No se transfiere y no se rescata en dinero, para no ser un medio de pago. Valores de ejemplo, a re-ajustar.",
    borrador: true,
    en: {
      titulo: "Common and stay credits",
      texto:
        "A balance with a single issuer, whoever holds the Common Fund: it can be redeemed for tribe products and stays. It is released in parts over 3 years and each part expires after 12 months. It cannot be transferred or cashed out, so that it is not a means of payment. Sample values, to be re-tuned.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real. La frase es la que se ve en la
  // tarjeta del Pase en Sumarte (R16); `texto` es la explicación del ⚖.
  noesinversion: {
    titulo: "No es una inversión",
    frase: "No es una inversión: no da tierra, lotes, prioridad ni rendimiento, y no se revende.",
    texto:
      "El Pase Fundador es una membresía: pagás para sostener el bien común y recibís acceso, influencia y créditos de servicios. No esperes una ganancia en plata. Invertir es otro camino, separado y con otros documentos.",
    borrador: true,
    en: {
      titulo: "It is not an investment",
      frase: "It is not an investment: it gives no land, lots, priority or return, and it cannot be resold.",
      texto:
        "The Founder Pass is a membership: you pay to support the commons and you receive access, influence and service credits. Do not expect a money gain. Investing is a different path, separate and with different documents.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  noesoferta: {
    titulo: "Esto no es una oferta",
    frase: "Esto no es una oferta: desde esta sección no se vende ni se cobra nada. Contamos cómo funcionaría.",
    texto:
      "Ofrecer inversiones al público necesita autorización de la CNV. Acá solo contamos un diseño que todavía no revisó un abogado: el SAFU y las series no existen. Si algún día se concreta, sería en forma privada, por invitación, con documentos propios y verificando tu identidad antes. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "This is not an offer",
      frase: "This is not an offer: nothing is sold or charged from this section. We explain how it would work.",
      texto:
        "Offering investments to the public requires authorization from the CNV (Argentina's securities regulator). Here we only describe a design that no lawyer has reviewed yet: the SAFU and the series do not exist. If it ever happens, it would be private, by invitation, with its own documents and after verifying your identity. To be verified with a lawyer.",
    },
  },
  ronda0: {
    titulo: "Ronda 0",
    texto:
      "En el Congreso, quienes tienen el Pase reparten fondos de incubación entre propuestas de tribus con financiamiento cuadrático (pesa más el apoyo amplio que el monto). El Consejo de Regeneración revisa que respeten los principios. Se apoya en el estatuto del Guardián.",
  },
  plantribu: {
    titulo: "Plan Tribu",
    texto: "Un servicio de software que NetX le factura a la tribu (asociación civil o SAS). No es un aporte ni una inversión.",
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Tribe Plan",
      texto:
        "A software service that NetX bills to the tribe (a nonprofit association or a simplified company). It is not a contribution or an investment.",
    },
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
    // Traducción nueva: borrador a revisar antes de cualquier uso real.
    en: {
      titulo: "Investing in the company",
      texto:
        "Investing in NetX as a company is something else: it is done with a SAFE in the holding, in private conversations, one on one. It is not publicly offered on the platform.",
    },
  },
  art35: {
    titulo: "Reglamento de Soluna, art. 35",
    texto: "Fondo comunitario: contribución mensual fijada en asamblea, reserva de 3 meses, rendición mensual de cuentas.",
  },
  art44: {
    titulo: "Reglamento de Soluna, art. 44",
    texto: "El reglamento se modifica con 2/3 de los copropietarios con derecho a voto y aviso de 30 días.",
  },
  destinoconsejofundacion: {
    titulo: "Lo decide el Consejo de la Fundación",
    texto:
      "En el diseño legal en estudio, la tierra y el Fondo Común son de una Fundación. Su consejo decide el presupuesto del Fondo Común. Lo que se vota acá es una recomendación del común para ese consejo: no lo obliga. Cómo se compone el consejo y cómo recibe las recomendaciones lo define su estatuto, que todavía hay que confirmar con el equipo legal.",
    en: {
      titulo: "Decided by the Foundation Council",
      texto:
        "In the legal design under study, the land and the Common Fund belong to a Foundation. Its council decides the Common Fund budget. What is voted here is a recommendation from the commons to that council: it does not bind it. How the council is made up and how it receives recommendations is set by its bylaws, which still have to be confirmed with the legal team.",
    },
    borrador: true,
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
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real (ADR-030).
  // Textos nuevos (Gus, 4-nov-2026): borrador a revisar antes de cualquier uso real.
  infraestructuralote: {
    titulo: "Infraestructura por lote",
    texto:
      "Lo que costaría llevar caminos, agua y energía hasta cada lote. Es una estimación de ejemplo, sin presupuesto detrás. En el modelo de ejemplo sale de lo que paga la familia: no se suma aparte. Quién contrata la obra y cuándo se hace: sin dato.",
    borrador: true,
    en: {
      titulo: "Infrastructure per lot",
      texto:
        "What it would cost to bring roads, water and power to each lot. It is a sample estimate, with no quote behind it. In the sample model it comes out of what the family pays: it is not added on top. Who contracts the work and when it happens: no data.",
    },
  },
  partedueno: {
    titulo: "Parte del dueño",
    texto:
      "La parte del precio del lote que le correspondería al dueño registral de la tierra, porque NetX no es dueña de la tierra. El porcentaje es un ejemplo: todavía no hay ningún acuerdo. En el modelo de ejemplo sale del precio del lote: no se suma aparte.",
    borrador: true,
    en: {
      titulo: "Owner's share",
      texto:
        "The part of the lot price that would go to the registered owner of the land, because NetX does not own the land. The percentage is a sample: there is no agreement yet. In the sample model it comes out of the lot price: it is not added on top.",
    },
  },
  retribucionraiz: {
    titulo: "Retribución en RAIZ: medida provisoria",
    texto:
      "Es una idea a conversar con el equipo, no una decisión. RAIZ sería el token del bien común: membresía y voz, con beneficios en especie como estadías, alimentos y cursos. Todavía no existe. No hay cantidad, ni fecha, ni valor, y no se promete ganancia. Prometer tokens futuros a cambio de plata puede ser un contrato de inversión: hay que revisarlo con un abogado antes de decirlo fuera del equipo.",
    borrador: true,
    en: {
      titulo: "Compensation in RAIZ: provisional measure",
      texto:
        "This is an idea to discuss with the team, not a decision. RAIZ would be the commons token: membership and voice, with benefits in kind such as stays, food and courses. It does not exist yet. There is no amount, date or value, and no profit is promised. Promising future tokens in exchange for money can be an investment contract: a lawyer has to review it before it is said outside the team.",
    },
  },
  // Texto nuevo (R40): borrador a revisar antes de cualquier uso real.
  primeroslotes: {
    titulo: "Primeros 4 lotes",
    texto:
      "Estos 4 lotes están fuera del polígono del 7A, junto a Lighthouse VRN: son las fincas 535 a 538 del loteo de Chacras de Soluna. Nos informaron que ya están aprobados por la municipalidad, pero todavía no tenemos el documento: por eso no lo mostramos como una aprobación otorgada. Número de expediente y fecha: sin dato. Este prototipo solo simula la venta: no se cobra nada y no se reserva ningún lote de verdad.",
    borrador: true,
    en: {
      titulo: "First 4 lots",
      texto:
        "These 4 lots are outside the 7A polygon, next to Lighthouse VRN: they are plots 535 to 538 of the Chacras de Soluna subdivision. We were told they already have municipal approval, but we do not have the document yet, so we do not show it as a granted approval. File number and date: no data. This prototype only simulates the sale: nothing is charged and no lot is really reserved.",
    },
  },
  loteonorte: {
    titulo: "Loteo provisorio de Lighthouse VRN",
    texto:
      "Este prototipo simula la venta de lotes en el sector norte de Lighthouse VRN. Trabaja con el supuesto de que el loteo se va a aprobar: hoy la aprobación municipal no está otorgada y no tiene fecha (sin dato). La Ordenanza 173/2026 de Mainqué no permite ofrecer, publicitar ni reservar parcelas sin aprobación, así que esto solo vale como prueba dentro del equipo: no es una oferta, no se cobra nada y no reserva ningún lote de verdad. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "Provisional subdivision of Lighthouse VRN",
      texto:
        "This prototype simulates selling lots in the north sector of Lighthouse VRN. It works on the assumption that the subdivision will be approved: today municipal approval has not been granted and has no date (no data). Mainqué Ordinance 173/2026 does not allow offering, advertising or reserving plots without approval, so this only counts as a test inside the team: it is not an offer, nothing is charged and no lot is really reserved. To be verified with a lawyer.",
    },
  },
  // Textos de la ficha de un lote (lote-ficha-y-compra): nuevos, no vienen del mock-up. Borrador a revisar antes de cualquier uso real.
  precioreferencia: {
    titulo: "Precio de ejemplo",
    texto:
      "Un valor provisorio para el prototipo, a confirmar, igual que los precios de las casas: no salen de un presupuesto. No es una oferta ni un precio de venta.",
    borrador: true,
    en: {
      titulo: "Sample price",
      texto:
        "A provisional value for the prototype, to be confirmed, like the house prices: they do not come from a quote. It is not an offer or a sale price.",
    },
  },
  aporteunico: {
    titulo: "Aporte único al bien común",
    texto:
      "Una parte del precio que cada lote aportaría una sola vez a lo que es de todos. Es de ejemplo: quién la recibe depende de una entidad que todavía no existe. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "One-off contribution to the commons",
      texto:
        "A share of the price that each lot would contribute once to what belongs to everyone. It is a sample: who receives it depends on an entity that does not exist yet. To be verified with a lawyer.",
    },
  },
  expensas: {
    titulo: "Expensas",
    texto:
      "Lo que cada lote pagaría por año para sostener lo común. Es un valor de ejemplo y todavía no hay reglamento que lo fije.",
    borrador: true,
    en: {
      titulo: "Common charges",
      texto:
        "What each lot would pay per year to sustain the commons. It is a sample value and no regulation sets it yet.",
    },
  },
  derechosdeberes: {
    titulo: "Derechos y deberes de un lote",
    texto:
      "Borrador de lo que traería comprar un lote en el modelo híbrido. Las servidumbres, el reglamento y la preferencia de reventa todavía no existen. Un lote vendido se rige por su título, las servidumbres y el reglamento: si alguien no cumple, el camino es el de cualquier vecino o barrio con reglamento, no una decisión de la plataforma. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "Rights and duties of a lot",
      texto:
        "A draft of what buying a lot would bring under the hybrid model. The easements, the regulation and the resale preference do not exist yet. A sold lot is governed by its title, the easements and the regulation: if someone does not comply, the path is that of any neighbor or community with a regulation, not a decision by the platform. To be verified with a lawyer.",
    },
  },
  boletoejemplo: {
    titulo: "Boleto de ejemplo",
    texto:
      "Es una simulación del prototipo: no es un boleto de compraventa, no obliga a nadie, no transfiere ningún derecho y no se pagó nada.",
    borrador: true,
    en: {
      titulo: "Sample purchase agreement",
      texto:
        "This is a prototype simulation: it is not a purchase agreement, it binds nobody, it transfers no rights and nothing was paid.",
    },
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
      "Adherir es aceptar por escrito los principios y las reglas de convivencia de una comunidad. No te hace dueño de nada ni te obliga a pagar: te compromete a cuidar esos acuerdos, y en una tribu la comunidad decide si te acepta. En Lighthouse VRN, adherir al manifiesto es lo que te permite participar en las decisiones; la adhesión vale desde que adherís, y si el manifiesto cambia de versión tenés que volver a adherir. Podés retirarte siguiendo lo que diga el propio manifiesto. En el prototipo todo es simulado y queda solo en este navegador.",
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
  influenciafondocomun: {
    titulo: "Influencia en el Fondo Común",
    texto:
      "El Pase Fundador te va a dar influencia en cómo se reparten las sumas grandes del Fondo Común, con un mecanismo llamado conviction voting: tu apoyo a una propuesta pesa más cuanto más tiempo lo sostenés. Todavía no está construido. No es un voto en ningún fideicomiso ni en las series: esas asambleas votan por capital y fuera de la plataforma. Quién decide el presupuesto del Fondo Común lo define el estatuto de la Fundación, a confirmar con el equipo legal.",
    en: {
      titulo: "Influence in the Common Fund",
      texto:
        "The Founder Pass will give you influence over how large sums of the Common Fund are distributed, with a mechanism called conviction voting: your support for a proposal weighs more the longer you sustain it. It is not built yet. It is not a vote in any trust or in the series: those assemblies vote by capital and outside the platform. Who decides the Common Fund budget is defined by the Foundation's bylaws, to be confirmed with the legal team.",
    },
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
      "Participaciones en una serie del programa de fideicomisos. Cobran después de la Fundación y de las Notas Verdes, y solo hasta un tope por año; lo que sobra va casi todo al bien común. No dan ningún derecho sobre la tierra, que sigue siendo de la Fundación.",
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
    en: {
      titulo: "SAFU",
      texto:
        "A simple agreement for future Units: someone puts in money today, before the series exist, and receives it as Units of the Mother Series when it opens, at a discount. How it can legally be offered still has to be confirmed by a lawyer.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  serieprograma: {
    titulo: "Serie",
    texto:
      "Un proyecto con su propia plata, sus propios ingresos y sus propios inversores (por ejemplo, el viñedo o el parque solar) dentro del programa de fideicomisos. Cada fideicomiso es un patrimonio separado: un problema en una serie no alcanza a otra.",
    borrador: true,
    en: {
      titulo: "Series",
      texto:
        "A project with its own money, its own income and its own investors (for example, the vineyard or the solar park) within the trust program. Each trust is a separate estate: a problem in one series does not reach another.",
    },
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
    en: {
      titulo: "Mother Series",
      texto:
        "A series with no project of its own: it invests in all the others. Whoever comes in holds a small piece of every project, with less risk than in a single one. It is where the SAFU and, later, the tokens end up.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  fundaciontierra: {
    titulo: "Fundación de la tierra",
    texto:
      "En el modelo híbrido, la entidad en la que queda la tierra común del Lighthouse. Todavía no existe: se crea si se acepta el diseño y el dueño actual le pasa esa tierra. Los lotes privados no quedan en ella. Su estatuto le prohibiría vender, hipotecar o dar en garantía la tierra común (cómo hacer que eso valga frente a terceros está a verificar con abogado). Cobra un canon y una regalía de cada serie antes que cualquier inversor y con eso paga el bien común. NetX no puede tomar un porcentaje de su plata.",
    borrador: true,
    en: {
      titulo: "Land Foundation",
      texto:
        "Under the hybrid model, the entity that holds the Lighthouse common land. It does not exist yet: it is created if the design is accepted and the current owner transfers that land to it. Private lots do not stay in it. Its statute would forbid selling, mortgaging or pledging the common land as collateral (how to make that binding on third parties is to be verified with a lawyer). It collects a ground rent and a royalty from each series before any investor, and uses them to fund the commons. NetX cannot take a percentage of its money.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real.
  ordenanza173: {
    titulo: "Ordenanza 173/2026 de Mainqué",
    texto:
      "Hasta que el municipio apruebe un loteo, nadie puede ofrecer, vender, reservar ni dar prioridad sobre esos lotes. Por eso, en este prototipo, la venta de lotes de Lighthouse VRN es una simulación sobre un supuesto de trabajo: la aprobación no está otorgada y no tiene fecha. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "Mainqué Ordinance 173/2026",
      texto:
        "Until the municipality approves a subdivision, nobody can offer, sell, reserve or give priority over those lots. That is why, in this prototype, selling Lighthouse VRN lots is a simulation on a working assumption: approval has not been granted and has no date. To be verified with a lawyer.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real (modelo-hibrido-procomun, design §5).
  resguardoshibrido: {
    titulo: "Resguardos del modelo híbrido",
    texto:
      "Son condiciones que el modelo híbrido pide para que vender un lote no le saque derechos a la tierra ni al bien común. Ninguna existe todavía. Una preferencia contractual sobre un inmueble dura poco; la forma duradera depende del régimen del barrio. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "Hybrid model safeguards",
      texto:
        "These are conditions the hybrid model asks for, so that selling a lot does not take rights away from the land or the commons. None of them exists yet. A contractual preference over real estate is short-lived; the lasting form depends on the community's legal regime. To be verified with a lawyer.",
    },
  },
  // Texto nuevo, no viene del mock-up: borrador a revisar antes de cualquier uso real (modelo-hibrido-procomun, design §10).
  consorciofundacion: {
    titulo: "Consorcio y Fundación",
    texto:
      "Propuesta para el equipo, no una decisión: lo que los vecinos usan todos los días (caminos, agua, aguas grises y negras, basura) lo cuidaría un consorcio de propietarios, y lo que cuida el territorio (restauración, corredor, producción, escuela) quedaría en una Fundación al servicio de la comunidad que adhiere al manifiesto. Ninguna de las dos existe todavía. A verificar con abogado.",
    borrador: true,
    en: {
      titulo: "Owners' association and Foundation",
      texto:
        "A proposal for the team, not a decision: what neighbors use every day (roads, water, grey and black water, waste) would be looked after by an owners' association, and what looks after the land (restoration, corridor, production, school) would stay in a Foundation serving the community that adheres to the manifesto. Neither of them exists yet. To be verified with a lawyer.",
    },
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
  // ---- Propuestas del Fogón (fogon-propuestas). Textos nuevos, no vienen del mock-up: borrador a revisar antes de cualquier uso real.
  concern: {
    titulo: "Concern",
    texto:
      "Una preocupación fundada sobre una propuesta: algo que, si se aprueba así, podría dañar al grupo, a la tierra o al propósito. No es un voto en contra: es una pista para mejorar la propuesta. Hoy es una regla de prueba del prototipo.",
    en: {
      titulo: "Concern",
      texto:
        "A well-founded worry about a proposal: something that, if approved as it is, could harm the group, the land or the purpose. It is not a vote against: it is a clue to improve the proposal. Today it is a trial rule of the prototype.",
    },
    borrador: true,
  },
  bloqueo: {
    titulo: "Bloqueo",
    texto:
      "Un concern tan grave que frena la decisión. Hay que dar una razón y citar un principio del Lighthouse. Si el grupo del ámbito no lo considera legítimo, queda como un concern más. Regla de prueba del prototipo.",
    en: {
      titulo: "Block",
      texto:
        "A concern so serious that it stops the decision. A reason is required and a Lighthouse principle has to be cited. If the group concerned does not consider it legitimate, it stays as one more concern. Trial rule of the prototype.",
    },
    borrador: true,
  },
  aunlado: {
    titulo: "Hacerse a un lado",
    texto:
      "Decir que vos no lo harías así, pero no vas a frenar al grupo. Queda registrado con tu razón y la decisión puede seguir. Quien presenta la propuesta no puede hacerse a un lado de la suya. Regla de prueba del prototipo.",
    en: {
      titulo: "Standing aside",
      texto:
        "Saying that you would not do it this way, but you will not hold the group back. It is recorded with your reason and the decision can go on. Whoever presents the proposal cannot stand aside from their own. Trial rule of the prototype.",
    },
    borrador: true,
  },
  afectada: {
    titulo: "Persona afectada",
    texto:
      "Quien no es del ámbito pero vive las consecuencias de la decisión. Se declara con un motivo de una línea y el grupo del ámbito puede objetarlo. Hoy es una declaración simulada que vive en tu navegador.",
    en: {
      titulo: "Affected person",
      texto:
        "Someone who is not in the circle of the decision but lives its consequences. It is declared with a one-line reason and the group concerned can object. Today it is a simulated statement that lives in your browser.",
    },
    borrador: true,
  },
  acuseConformidad: {
    titulo: "Acuse de conformidad",
    texto:
      "Firmar \"Entiendo la propuesta y no tengo ningún concern\". Cuenta para el quórum de participación y vale para una versión: si la propuesta cambia, hay que volver a firmar. No es un voto ni una firma legal, y por sí solo no cierra ni adopta nada. Hoy es simulado.",
    en: {
      titulo: "Acknowledgment of agreement",
      texto:
        "Signing \"I understand the proposal and I have no concern\". It counts toward the participation quorum and holds for one version: if the proposal changes, it has to be signed again. It is neither a vote nor a legal signature, and by itself it neither closes nor adopts anything. Today it is simulated.",
    },
    borrador: true,
  },
  quorum: {
    titulo: "Quórum de participación",
    texto:
      "La cantidad mínima de personas del ámbito (o afectadas) que tienen que haber participado para cerrar por consenso: la mitad del ámbito, y nunca menos de 3 (o todas, si son menos de 3). Participar es escribir en la discusión o firmar el acuse. Abrir la propuesta no cuenta. Regla de prueba del prototipo.",
    en: {
      titulo: "Participation quorum",
      texto:
        "The minimum number of people in the circle (or affected) who must have taken part to close by consensus: half of the circle, and never fewer than 3 (or all of them, if there are fewer than 3). Taking part means writing in the discussion or signing the acknowledgment. Opening the proposal does not count. Trial rule of the prototype.",
    },
    borrador: true,
  },
  urgencia: {
    titulo: "Urgencia",
    texto:
      "Una propuesta se puede marcar urgente con tres datos (qué se pierde si se espera, la fecha límite real y por qué la medida es reversible) y dos respaldos de personas del ámbito. Un pedido de plata urgente tiene tope y solo vale para algo que se pueda revender o reutilizar. Nunca vale para tierra, reglas ni el manifiesto. Regla de prueba del prototipo.",
    en: {
      titulo: "Urgency",
      texto:
        "A proposal can be marked urgent with three facts (what is lost by waiting, the real deadline and why the measure is reversible) and two backers from the circle. An urgent money request has a cap and only holds for something that can be resold or reused. It never holds for land, rules or the manifesto. Trial rule of the prototype.",
    },
    borrador: true,
  },
  medidaProvisoria: {
    titulo: "Medida provisoria",
    texto:
      "Lo que se aplica por urgencia cuando no hubo consenso pero lo apoya la mayoría. Se revisa antes de una fecha y los concerns abiertos obligan a revisarla. Mientras se revisa, sigue aplicándose. Regla de prueba del prototipo.",
    en: {
      titulo: "Provisional measure",
      texto:
        "What is applied for urgency when there was no consensus but the majority supports it. It is reviewed before a date and open concerns require reviewing it. While it is under review, it keeps applying. Trial rule of the prototype.",
    },
    borrador: true,
  },
  principios: {
    titulo: "Principios del Lighthouse",
    texto:
      "La lista de principios que se citan para bloquear una propuesta. Es un punto de partida: el común tiene que ratificarla, y va a vivir en el manifiesto de la meta-tribu Lighthouse. Hoy es una lista de ejemplo.",
    en: {
      titulo: "Lighthouse principles",
      texto:
        "The list of principles cited to block a proposal. It is a starting point: the common has to ratify it, and it will live in the Lighthouse meta-tribe manifesto. Today it is a sample list.",
    },
    borrador: true,
  },
  guardianIA: {
    titulo: "Guardián (IA, simulado)",
    texto:
      "Una IA simulada que defiende la Voz de la Tierra: habla por el agua, el suelo y la vida nativa y desafía lo que pueda dañarlos desde los principios de la vida y la tierra. Nunca pausa ni decide, ni declara nada ilegítimo. Su desafío no pausa nada: los plazos siguen. Lo único que pide es que una persona del ámbito le responda por escrito antes del llamado al consenso (o del período de objeción); si nadie responde y el plazo vence, la propuesta se cierra sin llegar al llamado, como cualquier propuesta que nadie hace avanzar. No es un órgano de la Fundación: el Fondo Común lo administra el Consejo de la Fundación.",
    en: {
      titulo: "Guardian (AI, simulated)",
      texto:
        "A simulated AI that defends the Voice of the Earth: it speaks for the water, the soil and native life and challenges what could harm them, from the principles of life and land. It never pauses nor decides, nor declares anything illegitimate. Its challenge does not pause anything: the deadlines keep running. All it asks is that a person in the scope answers it in writing before the consensus call (or the objection period); if nobody answers and the deadline passes, the proposal closes without reaching the call, like any proposal nobody moves forward. It is not a body of the Foundation: the Common Fund is administered by the Foundation Council.",
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

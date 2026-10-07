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
  },
  presencia: {
    titulo: "Presencia",
    texto:
      "Un registro que confirma el anfitrión con el check-in. Da acceso y voz (con un tope), nunca valor económico. No se compra ni se transfiere.",
  },
  obra: {
    titulo: "Horas de obra",
    texto:
      "Trabajo presencial en obra: hay que definir la modalidad (voluntariado, Ley 25.855, o locación de servicios) y contratar un seguro de accidentes. Si se presume relación laboral, aplica la LCT (art. 23).",
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
  safe: {
    titulo: "Invertir en la empresa",
    texto:
      "La inversión en NetX como compañía es otra cosa: se hace con un SAFE en el holding, en conversaciones privadas, uno a uno. No se ofrece públicamente en la plataforma.",
  },
} as const;

export type ClaveTermino = keyof typeof TERMINOS;

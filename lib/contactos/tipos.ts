export type Motivo = "consulta-lote" | "invitacion-circulo" | "charla-netx";
export type Canal = "email" | "telegram" | "whatsapp";
export type Momento = "manana" | "tarde" | "noche";

/** De qué campaña vino la persona (solo describe el link, no a la persona). */
export type OrigenPedido = { fuente?: string; medio?: string; campana?: string };

export type Pedido = {
  id: string;
  /** Fecha y hora en ISO. */
  fecha: string;
  motivo: Motivo;
  referencia: string;
  canal: Canal;
  momento?: Momento;
  mensaje?: string;
  /** Quién lo atendería. */
  destino: string;
  /** Estado administrativo que se le mostró a la persona (solo en pedidos de lotes). */
  estadoMostrado?: string;
  /** Origen de la visita guardado en el navegador, si lo había. */
  origen?: OrigenPedido;
};

/** Lo que la persona va completando antes de enviar. */
export type Borrador = {
  motivo: Motivo;
  referencia: string;
  canal: Canal | "";
  momento: Momento | "";
  mensaje: string;
  estadoMostrado?: string;
  origen?: OrigenPedido;
};

export type Errores = { canal?: string; mensaje?: string };

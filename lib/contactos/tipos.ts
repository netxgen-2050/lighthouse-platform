export type Motivo = "consulta-lote" | "invitacion-circulo" | "charla-netx";
export type Canal = "email" | "telegram" | "whatsapp";
export type Momento = "manana" | "tarde" | "noche";

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
};

/** Lo que la persona va completando antes de enviar. */
export type Borrador = {
  motivo: Motivo;
  referencia: string;
  canal: Canal | "";
  momento: Momento | "";
  mensaje: string;
  estadoMostrado?: string;
};

export type Errores = { canal?: string; mensaje?: string };

export type FormaJuridica = "asociacion-civil" | "sas" | "cooperativa" | "fundacion" | "ninguna";

/** Lo que escribe la persona, tal cual (todo texto). */
export type Borrador = {
  nombreComunidad: string;
  lider: string;
  contacto: string;
  personas: string;
  hogares: string;
  desdeCuando: string;
  foco: string;
  rolesTienen: string;
  rolesBuscan: string;
  pozo: string;
  formaJuridica: FormaJuridica | "";
  decisiones: string;
  ritual: string;
  tierra: string;
  compromisoTiempo: string;
};

export type CampoBorrador = keyof Borrador;

export type Errores = Partial<Record<CampoBorrador, string>>;

export type Postulacion = {
  id: string;
  fecha: string;
  /** Id de la tribu vacante (por ejemplo "grano"). */
  tribuId: string;
  barrio: number;
  nombreComunidad: string;
  lider: string;
  contacto: string;
  personas: number;
  hogares: number;
  desdeCuando?: string;
  foco: string;
  rolesTienen?: string;
  rolesBuscan?: string;
  pozo: string;
  formaJuridica: FormaJuridica;
  decisiones: string;
  ritual: string;
  tierra?: string;
  compromisoTiempo: string;
};

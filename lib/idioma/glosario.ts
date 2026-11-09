// Glosario de la plataforma: un solo inglés para cada término. Confirmado por Gus el 15-oct-2026.
// "Semillas" no se traduce: en inglés también se dice "Semillas", y la primera mención en el contenido de una página
// usa `explicada` ("Semillas (seeds)"). Los diccionarios toman estos términos de acá.

export type Termino = {
  es: string;
  en: string;
  /** Cómo se escribe la primera vez que aparece en el contenido de una página (solo si hace falta explicarlo). */
  explicada?: { es?: string; en: string };
};

export const GLOSARIO = {
  inicio: { es: "Inicio", en: "Home" },
  descubrir: { es: "Descubrir", en: "Discover" },
  viene: { es: "Lo que viene", en: "Coming next" },
  territorio: { es: "Territorio", en: "Territory" },
  lotes: { es: "Lotes", en: "Lots" },
  biencomun: { es: "Bien común", en: "Commons" },
  tribus: { es: "Comunidades", en: "Communities" },
  pactos: { es: "Pactos", en: "Pacts" },
  semillas: { es: "Semillas", en: "Semillas", explicada: { en: "Semillas (seeds)" } },
  fogon: { es: "Fogón", en: "Fireside" },
  compromisos: { es: "Compromisos", en: "Commitments" },
  congreso: { es: "Congreso", en: "Congress" },
  sumarte: { es: "Sumarte", en: "Join" },
  perfil: { es: "Perfil", en: "Profile" },
  pasaporte: { es: "Pasaporte", en: "Passport" },
  miRecorrido: { es: "Mi recorrido", en: "My journey" },
  configuracion: { es: "Configuración", en: "Settings" },
  misDatos: { es: "Mis datos", en: "My data" },
  explorador: { es: "Explorador", en: "Explorer" },
  miembro: { es: "Miembro", en: "Member" },
  paseFundador: { es: "Pase Fundador", en: "Founder Pass" },
  planTribu: { es: "Plan Comunidad", en: "Community Plan" },
  ronda0: { es: "Ronda 0", en: "Round 0" },
  fondoComun: { es: "Fondo Común", en: "Common Fund" },
  sellos: { es: "Sellos", en: "Stamps" },
} as const satisfies Record<string, Termino>;

export type ClaveGlosario = keyof typeof GLOSARIO;

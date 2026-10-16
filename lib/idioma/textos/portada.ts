// Textos de la portada (`/`): título, bajada, los tres caminos y los enlaces.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  sobretitulo: "Corredor regenerativo patagónico",
  tituloInicio: "Encontrá tu tribu.",
  tituloFin: "Construí en común.",
  bajada:
    "Conocé a las personas con quienes vale la pena invertir, trabajar y quizás vivir. Pónganse de acuerdo antes de comprometer capital, y avancen juntos sobre un territorio real. Explorar es gratis.",
  explorar: "Explorar el Lighthouse",
  sumarte: "Elegí cómo sumarte",
  porDondeEmpezar: "Por dónde empezar",
  recomendado: "Recomendado para vos",
  caminos: {
    tribus: {
      etiqueta: G.descubrir.es,
      titulo: "Ver las tribus",
    },
    perfil: {
      etiqueta: "Encontrarse",
      titulo: "Encontrar mi tribu",
      descripcion: "Armá tu perfil: quién sos, qué sabés hacer y cómo te gusta decidir.",
    },
    congreso: {
      etiqueta: "Encontrarse en persona",
      titulo: `${G.congreso.es} · Feb 2027`,
      descripcion: "Visita al Lighthouse, encuentros de tribus y mingas.",
    },
  },
  /** Descripción del camino "Explorar": con `cantidad` 0 no hay dato y no se muestra número. */
  barrios: (cantidad: number) =>
    cantidad === 1
      ? "1 barrio y las tribus que lo están formando."
      : cantidad > 0
        ? `${cantidad} barrios y las tribus que los están formando.`
        : "Los barrios y las tribus que los están formando.",
};

const en: Textos<typeof es> = {
  sobretitulo: "Patagonian regenerative corridor",
  tituloInicio: "Find your tribe.",
  tituloFin: "Build in common.",
  bajada:
    "Meet the people you'd want to invest, work and maybe live with. Reach agreement before committing capital, and move forward together on a real territory. Exploring is free.",
  explorar: "Explore the Lighthouse",
  sumarte: "Choose how to join",
  porDondeEmpezar: "Where to start",
  recomendado: "Recommended for you",
  caminos: {
    tribus: {
      etiqueta: G.descubrir.en,
      titulo: "See the tribes",
    },
    perfil: {
      etiqueta: "Meet up",
      titulo: "Find my tribe",
      descripcion: "Build your profile: who you are, what you know how to do and how you like to decide.",
    },
    congreso: {
      etiqueta: "Meet in person",
      titulo: `${G.congreso.en} · Feb 2027`,
      descripcion: "A visit to the Lighthouse, tribe meetings and community work parties (mingas).",
    },
  },
  barrios: (cantidad: number) =>
    cantidad === 1
      ? "1 neighborhood and the tribes forming it."
      : cantidad > 0
        ? `${cantidad} neighborhoods and the tribes forming them.`
        : "The neighborhoods and the tribes forming them.",
};

export const portada = { es, en };

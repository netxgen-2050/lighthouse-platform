// Para cada número incómodo: qué supuesto del diseño lo movería y en qué dirección. Texto sin cifras (la cifra la pone la
// página desde armarResumen). Son para discutir, no decisiones.

export type IdPalanca = "capital" | "membresias" | "primeraPerdida" | "contratoDiseno";

export type Palanca = {
  id: IdPalanca;
  /** Qué número incómodo explica (texto, sin cifras). */
  numero: string;
  supuesto: string;
  direccion: string;
  fuente: string;
};

export const PALANCAS: readonly Palanca[] = [
  {
    id: "capital",
    numero: "El capital bajo gestión que hace falta para pagar el consumo solo con comisiones",
    supuesto: "El consumo del equipo y la comisión de gestión.",
    direccion:
      "Bajar el consumo (empezando por la parte \"otros\" que todavía no tiene desglose) o subir la comisión dentro del rango del modelo baja el capital bajo gestión necesario; sumar ingresos por trabajo que no dependan de la comisión de gestión (comisión de desarrollo, contratos de operación, licencias del kit a otros proyectos) acorta el tiempo de puente.",
    fuente: "doc 30 §2 y §2b; capitalNecesario",
  },
  {
    id: "membresias",
    numero: "Lo poco que cubren las membresías del consumo mensual",
    supuesto: "Los precios de los planes (son de ejemplo), cuántos pasan a pagar y licenciar la plataforma a otros proyectos.",
    direccion:
      "Las suscripciones solas no mueven la cuenta; la palanca que la cambia es licenciar la plataforma y el kit a otros proyectos, cobrando como parte de su presupuesto de desarrollo y no como suscripción. Además, re-correr el modelo sin el Congreso cambia el punto de partida.",
    fuente: "doc 30 §2b; NS_Tokenomics I-15",
  },
  {
    id: "primeraPerdida",
    numero: "Que la primera pérdida no se recupere completa en buena parte de los futuros simulados",
    supuesto: "El lugar de la primera pérdida en la cascada.",
    direccion:
      "Ponerla antes del tope de las Unidades (retorno preferente para las Unidades, después la primera pérdida, después el tope) la hace recuperable en más futuros; un seguro o reserva contra heladas y abrir series solo con los permisos dados bajan el riesgo de fondo.",
    fuente: "doc 29 §5, hallazgos 1 y 3",
  },
  {
    id: "contratoDiseno",
    numero: "Que el contrato de diseño con BioPueblo todavía no tenga monto",
    supuesto: "El alcance del primer contrato con BioPueblo.",
    direccion:
      "Cotizar primero una parte chica (la hectárea piloto y el primer barrio) da un primer monto sin esperar al plan de todo el territorio.",
    fuente: "doc 30 §2 y §4",
  },
];

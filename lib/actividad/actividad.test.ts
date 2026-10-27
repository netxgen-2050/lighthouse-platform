import { describe, expect, it } from "vitest";
import { borrarDemo } from "../demo/borrar";
import { CLAVES } from "../demo/claves";
import {
  contarNoLeidas,
  leerEventos,
  listarActividad,
  listarNotificaciones,
  marcarTodasLeidas,
  nombreCampanita,
  partesDeTexto,
  registrar,
  textoDeEvento,
  type EventoActividad,
} from "./actividad";
import { EVENTOS } from "./eventos";

const t0 = new Date("2026-10-09T10:00:00Z");
const en = (s: number) => new Date(t0.getTime() + s * 1000);

function con(lista: EventoActividad[], e: Parameters<typeof registrar>[1], cuando: Date, id: string) {
  return registrar(lista, e, cuando, id);
}

describe("registro de eventos", () => {
  it("la adhesión aceptada deja una actividad y una notificación", () => {
    let l: EventoActividad[] = [];
    l = con(l, EVENTOS.adheriste("Valle Solar", "valle-solar"), t0, "a");
    l = con(l, EVENTOS.adhesionAceptada("Valle Solar", "valle-solar"), en(5), "b");
    expect(listarActividad(l, en(10)).map((e) => e.texto)).toEqual([
      "Valle Solar aceptó tu adhesión",
      "Adheriste al manifiesto de Valle Solar",
    ]);
    expect(listarNotificaciones(l, en(10)).map((e) => e.texto)).toEqual(["Valle Solar aceptó tu adhesión"]);
  });

  it("una clave repetida no se registra dos veces", () => {
    let l: EventoActividad[] = [];
    l = con(l, EVENTOS.pactoAceptado("Valle Solar", "valle-solar"), t0, "a");
    l = con(l, EVENTOS.pactoAceptado("Valle Solar", "valle-solar"), en(1), "b");
    expect(l).toHaveLength(1);
  });

  it("lo que la persona hizo no cuenta como notificación", () => {
    const l = con([], EVENTOS.registrasteTicket(), t0, "a");
    expect(listarNotificaciones(l, en(1))).toEqual([]);
    expect(contarNoLeidas(l, en(1))).toBe(0);
  });

  it("el aviso simulado no se ve hasta que pasa la demora", () => {
    const l = con([], EVENTOS.interesEnOferta("c1"), t0, "a");
    expect(contarNoLeidas(l, en(1))).toBe(0);
    expect(contarNoLeidas(l, en(60))).toBe(1);
  });
});

describe("no leídas y marcar", () => {
  const base = () => {
    let l: EventoActividad[] = [];
    l = con(l, EVENTOS.adhesionAceptada("A", "a"), t0, "1");
    l = con(l, EVENTOS.pactoAceptado("A", "a"), en(1), "2");
    return l;
  };

  it("cuenta y ordena de la más nueva a la más vieja", () => {
    const l = base();
    expect(contarNoLeidas(l, en(2))).toBe(2);
    expect(listarNotificaciones(l, en(2)).map((e) => e.id)).toEqual(["2", "1"]);
  });

  it("marcar todas deja la cuenta en cero y no toca lo que todavía no llegó", () => {
    let l = con(base(), EVENTOS.interesEnOferta("c"), en(2), "3");
    l = marcarTodasLeidas(l, en(3));
    expect(contarNoLeidas(l, en(3))).toBe(0);
    expect(contarNoLeidas(l, en(100))).toBe(1);
  });
});

describe("campanita", () => {
  it("anuncia la cantidad en texto", () => {
    expect(nombreCampanita(2)).toBe("2 notificaciones sin leer");
    expect(nombreCampanita(1)).toBe("1 notificación sin leer");
    expect(nombreCampanita(0)).toBe("Notificaciones, sin novedades");
    expect(nombreCampanita(0, "en")).toBe("Notifications, nothing new");
    expect(nombreCampanita(1, "en")).toBe("1 unread notification");
    expect(nombreCampanita(3, "en")).toBe("3 unread notifications");
  });
});

describe("texto de un evento en el idioma actual", () => {
  const nuevo = () => con([], EVENTOS.adhesionAceptada("Valle Solar", "valle-solar"), t0, "a")[0];

  it("un evento nuevo guarda su mensaje y sus datos, además del texto en español", () => {
    expect(nuevo()).toMatchObject({
      mensaje: "adhesionAceptada",
      datos: { comunidad: "Valle Solar" },
      texto: "Valle Solar aceptó tu adhesión",
    });
  });

  it("se arma en los dos idiomas, con el nombre de la comunidad tal cual", () => {
    expect(textoDeEvento(nuevo(), "es")).toEqual({ texto: "Valle Solar aceptó tu adhesión", idioma: "es" });
    expect(textoDeEvento(nuevo(), "en")).toEqual({ texto: "Valle Solar accepted your membership", idioma: "en" });
  });

  it("el texto en español de cada evento es el de siempre", () => {
    expect(EVENTOS.publicasteEnMercado("Miel").texto).toBe("Publicaste en el mercado: Miel");
    expect(EVENTOS.enviastePostulacion("").texto).toBe("Enviaste una postulación de tu comunidad");
    expect(textoDeEvento(con([], EVENTOS.enviastePostulacion(""), t0, "b")[0], "en").texto).toBe(
      "You sent an application for your community",
    );
    expect(textoDeEvento(con([], EVENTOS.interesEnOferta("c"), t0, "c")[0], "en").texto).toBe(
      "Someone is interested in your offer (simulated)",
    );
  });

  it("un evento guardado antes, solo con texto, se muestra en español en los dos idiomas", () => {
    const viejo: EventoActividad = {
      id: "v",
      tipo: "adhesion-aceptada",
      texto: "Valle Solar aceptó tu adhesión",
      fecha: t0.toISOString(),
      enlace: "/tribus",
      notificacion: true,
      leida: false,
    };
    expect(textoDeEvento(viejo, "en")).toEqual({ texto: "Valle Solar aceptó tu adhesión", idioma: "es" });
    expect(leerEventos(JSON.stringify([viejo]))).toEqual([viejo]);
  });

  it("los datos dañados se descartan y el evento vuelve a mostrar su texto", () => {
    const base = nuevo();
    const dañados = [
      { ...base, datos: { comunidad: 3 } },
      { ...base, datos: null },
      { ...base, datos: {} },
      { ...base, mensaje: "noExiste" },
      { ...base, mensaje: "__proto__" },
    ];
    for (const e of leerEventos(JSON.stringify(dañados))) {
      expect(e.mensaje).toBeUndefined();
      expect(e.datos).toBeUndefined();
      expect(textoDeEvento(e, "en")).toEqual({ texto: "Valle Solar aceptó tu adhesión", idioma: "es" });
    }
    expect(leerEventos(JSON.stringify(dañados))).toHaveLength(5);
  });

  it("lo guardado y vuelto a leer conserva el mensaje y los datos", () => {
    expect(leerEventos(JSON.stringify([nuevo()]))).toEqual([nuevo()]);
  });

  it("parte el texto por la plantilla aunque el dato repita una palabra de la frase fija", () => {
    expect(partesDeTexto("publicasteEnMercado", { descripcion: "market" }, "en")).toEqual({
      antes: "You posted in the market: ",
      dato: "market",
      despues: "",
    });
    expect(partesDeTexto("propusistePacto", { comunidad: "pacto" }, "es")).toEqual({
      antes: "Propusiste un pacto en ",
      dato: "pacto",
      despues: "",
    });
  });

  it("sin dato (o sin nombre de comunidad) no marca nada y devuelve el texto entero", () => {
    expect(partesDeTexto("enviastePostulacion", { comunidad: "" }, "en")).toEqual({
      antes: "You sent an application for your community",
      dato: null,
      despues: "",
    });
    expect(partesDeTexto("interesEnOferta", {}, "es").dato).toBeNull();
  });
});

describe("lectura de lo guardado", () => {
  it("datos dañados o ausentes dan lista vacía", () => {
    expect(leerEventos(null)).toEqual([]);
    expect(leerEventos("{no es json")).toEqual([]);
    expect(leerEventos('{"a":1}')).toEqual([]);
  });

  it("descarta entradas inválidas y conserva las buenas", () => {
    const buena = con([], EVENTOS.registrasteTicket(), t0, "a");
    const crudo = JSON.stringify([...buena, { id: 3 }, null, { ...buena[0], fecha: "nada" }]);
    expect(leerEventos(crudo)).toEqual(buena);
  });

  it("solo acepta enlaces a rutas del propio sitio", () => {
    const buena = con([], EVENTOS.registrasteTicket(), t0, "a");
    const con_ = (enlace: string) => ({ ...buena[0], enlace });
    const crudo = JSON.stringify([con_("//ejemplo.com"), con_("https://ejemplo.com"), con_("/\\ejemplo.com"), con_("/\t/ejemplo.com"), con_("/\n/ejemplo.com"), con_("/ a"), con_("congreso"), con_("/congreso")]);
    expect(leerEventos(crudo)).toEqual([con_("/congreso")]);
  });

  it("guarda solo los últimos 200", () => {
    let l: EventoActividad[] = [];
    for (let i = 0; i < 205; i++) l = con(l, EVENTOS.registrasteTicket(), t0, String(i));
    expect(l).toHaveLength(200);
    expect(l[0].id).toBe("5");
  });
});

it("el borrado de la demo quita también la actividad", () => {
  const quitadas: string[] = [];
  borrarDemo((k) => quitadas.push(k));
  expect(quitadas).toContain(CLAVES.actividad);
});

describe("tipos de notificación apagados", () => {
  const lista = () => {
    let l: EventoActividad[] = [];
    l = con(l, EVENTOS.rondaAbierta("Valle Solar", "valle-solar"), t0, "a");
    l = con(l, EVENTOS.pactoAceptado("Valle Solar", "valle-solar"), t0, "b");
    return l;
  };

  it("un tipo apagado no se lista ni se cuenta", () => {
    expect(listarNotificaciones(lista(), en(1), ["ronda-abierta"]).map((e) => e.tipo)).toEqual(["pacto-aceptado"]);
    expect(contarNoLeidas(lista(), en(1), ["ronda-abierta"])).toBe(1);
  });

  it("sin tipos apagados se ve todo", () => {
    expect(contarNoLeidas(lista(), en(1))).toBe(2);
  });
});

describe("eventos de cambio a un pacto, en los dos idiomas", () => {
  const guardado = (e: ReturnType<typeof EVENTOS.cambioDePactoRechazado>, id: string) => registrar([], e, t0, id)[0];

  it("el cambio aceptado se guarda con tipo y datos y se arma en el idioma actual", () => {
    const e = guardado(EVENTOS.cambioDePactoAceptado("Valle Solar", "valle-solar", 2), "a");
    expect(e.mensaje).toBe("cambioDePactoAceptado");
    expect(e.datos).toEqual({ comunidad: "Valle Solar" });
    expect(textoDeEvento(e, "es")).toEqual({ texto: "Valle Solar aceptó el cambio a tu pacto", idioma: "es" });
    expect(textoDeEvento(e, "en")).toEqual({ texto: "Valle Solar accepted the change to your pact", idioma: "en" });
  });

  it("el cambio rechazado también", () => {
    const e = guardado(EVENTOS.cambioDePactoRechazado("Valle Solar", "valle-solar"), "b");
    expect(e.mensaje).toBe("cambioDePactoRechazado");
    expect(e.datos).toEqual({ comunidad: "Valle Solar" });
    expect(textoDeEvento(e, "es").texto).toBe("Valle Solar no aceptó el cambio a tu pacto");
    expect(textoDeEvento(e, "en").texto).toBe("Valle Solar did not accept the change to your pact");
  });

  it("la propuesta de cambio dice 'tu comunidad' / 'your community' sin nombre", () => {
    const e = guardado(EVENTOS.propusisteCambioDePacto("", "valle-solar"), "c");
    expect(textoDeEvento(e, "es").texto).toContain("tu comunidad");
    expect(textoDeEvento(e, "en").texto).toContain("your community");
  });
});

it("el borrado de la demo quita también las preferencias", () => {
  const quitadas: string[] = [];
  borrarDemo((k) => quitadas.push(k));
  expect(quitadas).toContain(CLAVES.configuracion);
});

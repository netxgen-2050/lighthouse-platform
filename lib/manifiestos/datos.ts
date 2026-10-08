// Manifiestos de EJEMPLO para el prototipo interno. Los redactó un agente inspirándose en el foco, el ritual
// y la forma de decidir de cada tribu (lib/tribus/datos.ts). No son los textos reales de ninguna comunidad:
// son borradores a revisar con cada una antes de cualquier uso real.
import { buscarTribu, listarTribus } from "@/lib/tribus/datos";

export type Compromiso = { titulo: string; texto: string };

export type Manifiesto = {
  /** `lighthouse` o el id de una tribu. */
  id: string;
  /** Nombre de la comunidad. */
  comunidad: string;
  titulo: string;
  introduccion: string;
  /** Entre 5 y 7: cuidado, decisiones, conflictos, aporte a la tierra y al común, salida. */
  compromisos: Compromiso[];
  /** Fecha de la versión, para mostrarla tal cual. */
  version: string;
  /** Siempre true en el prototipo: texto de ejemplo. */
  ejemplo: true;
};

const VERSION = "8 de octubre de 2026";

type Base = Omit<Manifiesto, "version" | "ejemplo">;

const BASES: Base[] = [
  {
    id: "lighthouse",
    comunidad: "Lighthouse",
    titulo: "Pacto de convivencia del Lighthouse",
    introduccion:
      "El Lighthouse es un lugar donde van a vivir y trabajar muchas personas y muchas tribus. Antes de cualquier pacto, este es el piso común: lo que nos prometemos a todas las personas que decidimos pertenecer, sea cual sea la tribu a la que nos sumemos.",
    compromisos: [
      {
        titulo: "Nos cuidamos",
        texto:
          "Tratamos a cada persona como alguien con quien vamos a convivir años. Preguntamos antes de suponer, escuchamos antes de contestar y nadie queda solo cuando está pasando un mal momento.",
      },
      {
        titulo: "Decidimos juntos lo que es de todos",
        texto:
          "Lo que afecta a todo el Lighthouse (el agua, los caminos, el terreno común) se decide con consenso en la asamblea. Lo que le toca a una tribu lo decide esa tribu, y lo hace público.",
      },
      {
        titulo: "Hablamos antes de que el conflicto crezca",
        texto:
          "Si algo nos duele o nos molesta, lo decimos pronto y cara a cara, con respeto. Si no alcanza, pedimos una mediación de la comunidad antes de acudir a otra instancia.",
      },
      {
        titulo: "Cuidamos la tierra",
        texto:
          "Dejamos el suelo, el agua y el monte mejor de como los encontramos. No hacemos obras, quemas ni vertidos que dañen lo que es de todos.",
      },
      {
        titulo: "Aportamos al común",
        texto:
          "Cada tribu y cada persona suma al pozo común lo que acordó: tiempo, trabajo, saberes o recursos. Lo que se aporta se registra y se rinde cuentas a la comunidad.",
      },
      {
        titulo: "Cuando alguien se va, nos vamos bien",
        texto:
          "Nadie queda atado. Quien decide irse avisa con tiempo, deja en orden lo que tenía a cargo y se lleva lo que es suyo. Si algún día no podemos cumplir un acuerdo, lo hablamos con la comunidad en lugar de callarlo.",
      },
    ],
  },
  {
    id: "semilla",
    comunidad: "Semilla Viva",
    titulo: "Manifiesto de Semilla Viva",
    introduccion:
      "Somos una tribu que cuida el suelo y las semillas criollas para que todo el Lighthouse coma bien. Sumarte es aceptar un ritmo de campo: se siembra, se espera y se comparte la cosecha.",
    compromisos: [
      {
        titulo: "Nos cuidamos como se cuida una huerta",
        texto:
          "Miramos cómo está cada persona de la tribu igual que miramos cómo está el suelo. Una persona cansada o desanimada es motivo de una charla, no de un reproche.",
      },
      {
        titulo: "Decidimos en la ronda de palabra",
        texto:
          "Las decisiones de la tribu se toman en rondas donde habla cada persona. Buscamos que nadie se oponga con firmeza; si alguien lo hace, lo escuchamos hasta entender qué cuida.",
      },
      {
        titulo: "Resolvemos los conflictos en la minga",
        texto:
          "Trabajar codo a codo ablanda las diferencias. Si una tensión persiste, la llevamos a la ronda con alguien de la tribu que acompañe la conversación.",
      },
      {
        titulo: "Las semillas no se privatizan",
        texto:
          "Las semillas criollas del banco son de todas y todos. Las intercambiamos y las multiplicamos, y no las patentamos ni las vendemos como propias.",
      },
      {
        titulo: "Aportamos verdura y plantines",
        texto:
          "Compartimos con el Lighthouse la verdura y los plantines que la tribu se propone cada temporada, y cada persona colabora con sus jornadas de huerta.",
      },
      {
        titulo: "Si te vas, dejás el suelo vivo",
        texto:
          "Quien se va deja su parcela cuidada y comparte lo aprendido con quien la sigue. Las puertas quedan abiertas para volver.",
      },
    ],
  },
  {
    id: "barda",
    comunidad: "Barda Productiva",
    titulo: "Manifiesto de Barda Productiva",
    introduccion:
      "Producimos aceite y vino con manejo regenerativo y abrimos la bodega a los vecinos. Somos pocos hogares con proyectos propios, y por eso lo que prometemos tiene que ser claro y estar escrito.",
    compromisos: [
      {
        titulo: "Cuidamos a los socios y a sus familias",
        texto:
          "Cada hogar es parte de la tribu, no solo una firma en la sociedad. Estamos atentos a las épocas difíciles de la cosecha y nos damos una mano.",
      },
      {
        titulo: "Decidimos como socios",
        texto:
          "Lo que compromete a la sociedad se vota entre los socios de la SAS. Lo cotidiano de cada proyecto lo decide cada hogar, informando al resto.",
      },
      {
        titulo: "Los desacuerdos se hablan con números sobre la mesa",
        texto:
          "Cuando hay diferencias de dinero o de criterio, compartimos los datos, escuchamos todas las miradas y, si hace falta, pedimos una opinión externa que acordamos entre todos.",
      },
      {
        titulo: "Manejo regenerativo",
        texto:
          "Trabajamos el olivar y la vid sin agotar el suelo ni el agua, y medimos año a año cómo mejora la barda.",
      },
      {
        titulo: "Abrimos la bodega",
        texto:
          "Compartimos con el Lighthouse parte del aceite y las visitas guiadas que nos propusimos, y recibimos a los vecinos con la puerta abierta.",
      },
      {
        titulo: "Salir sin romper",
        texto:
          "Quien deja la sociedad lo hace según lo que dice el estatuto, con aviso previo y sin dañar la producción de los demás.",
      },
    ],
  },
  {
    id: "monte",
    comunidad: "Monte Nuevo",
    titulo: "Manifiesto de Monte Nuevo",
    introduccion:
      "Plantamos el bosque que va a dar la madera y la paja de las casas del Lighthouse. Un bosque tarda décadas: pertenecer a esta tribu es pensar en lo que va a quedar cuando ya no estemos.",
    compromisos: [
      {
        titulo: "Nos cuidamos en la obra y fuera de ella",
        texto:
          "Trabajamos con ropa y herramientas seguras, nos turnamos en lo pesado y paramos cuando alguien está agotado. La obra nunca vale más que una persona.",
      },
      {
        titulo: "Decidimos por consentimiento",
        texto:
          "Avanzamos con una propuesta cuando nadie tiene una objeción razonable. Las objeciones se escuchan y se usan para mejorar la propuesta.",
      },
      {
        titulo: "Los conflictos se hablan en la caminata",
        texto:
          "Salimos a caminar el bosque juntas y juntos para conversar lo difícil. Si no se resuelve, lo llevamos a la reunión de la tribu con alguien que modere.",
      },
      {
        titulo: "Cada árbol que sacamos, lo reponemos",
        texto:
          "Plantamos más de lo que cortamos, elegimos especies que le sirvan al lugar y cuidamos las plantas nuevas hasta que se sostengan solas.",
      },
      {
        titulo: "Madera y saberes para todos",
        texto:
          "Compartimos con el Lighthouse la madera que nos propusimos entregar y damos talleres de bioconstrucción abiertos a quien quiera aprender.",
      },
      {
        titulo: "Despedirse con un árbol",
        texto:
          "Quien se va lo hace avisando con tiempo, terminando lo que empezó o entregándolo en orden, y planta un árbol como señal de que su paso por la tribu no se borra.",
      },
    ],
  },
  {
    id: "agua",
    comunidad: "Agua Clara",
    titulo: "Manifiesto de Agua Clara",
    introduccion:
      "Diseñamos y cuidamos el agua común: toma, cisterna, riego y tratamiento. El agua es de todas y de todos, y quien la administra tiene una responsabilidad enorme. Este manifiesto lo recuerda.",
    compromisos: [
      {
        titulo: "Cuidamos primero a las personas que dependen del agua",
        texto:
          "Nuestro trabajo es que nadie se quede sin agua segura. Cuando hay una falla, avisamos rápido, explicamos qué pasó y lo arreglamos sin culpar.",
      },
      {
        titulo: "Decidimos con criterio técnico y con la comunidad",
        texto:
          "Las decisiones técnicas las toma el equipo con datos a la vista. Lo que cambia el servicio o el costo para otros se consulta antes con quienes lo usan.",
      },
      {
        titulo: "Los conflictos por el agua se hablan en público",
        texto:
          "Los reclamos y los desacuerdos sobre el uso del agua se tratan en reuniones abiertas, con los datos de consumo y de calidad a la vista de todos.",
      },
      {
        titulo: "Devolvemos el agua limpia",
        texto:
          "Tratamos lo que usamos antes de devolverlo a la tierra o al río, y medimos la calidad con regularidad.",
      },
      {
        titulo: "El servicio es un aporte al común",
        texto:
          "Llevamos agua a todos los barrios del Lighthouse y rendimos cuentas de cómo se usan los recursos que se aportan para sostener el servicio.",
      },
      {
        titulo: "Un traspaso responsable",
        texto:
          "Quien deja un rol técnico documenta lo que sabe y acompaña a quien lo reemplaza, para que el servicio no dependa de una sola persona.",
      },
    ],
  },
  {
    id: "valle",
    comunidad: "Valle Solar",
    titulo: "Manifiesto de Valle Solar",
    introduccion:
      "Somos familias que queremos criar en comunidad, con energía y agua propias. Aquí los chicos crecen rodeados de muchos adultos, así que lo que prometemos pesa: sumarte es ser parte de la crianza compartida de todas y todos.",
    compromisos: [
      {
        titulo: "Cuidamos a los chicos y a los grandes",
        texto:
          "Los niños y las niñas son responsabilidad de toda la tribu. Los adultos nos cuidamos también: cuando una familia pasa por una crisis, las demás se acercan.",
      },
      {
        titulo: "Decidimos por consentimiento",
        texto:
          "Una decisión avanza cuando nadie del grupo tiene una objeción de fondo. Escuchamos las objeciones, ajustamos la propuesta y volvemos a consultar.",
      },
      {
        titulo: "Los conflictos se hablan en familia",
        texto:
          "Si hay un malestar, lo conversamos primero entre las personas involucradas, después con alguien de confianza de la tribu y, si hace falta, en el círculo completo, sin reproches y con tiempo.",
      },
      {
        titulo: "Energía y agua con cabeza",
        texto:
          "Usamos la energía solar y el agua sabiendo que son limitadas. Nos ponemos de acuerdo sobre los consumos y los cuidados de los sistemas compartidos.",
      },
      {
        titulo: "Aportamos al núcleo común",
        texto:
          "Sostenemos la energía solar del núcleo común y la hospitalidad que prometimos (noches de hospedaje) para recibir a quienes visitan el Lighthouse.",
      },
      {
        titulo: "Irse con cariño",
        texto:
          "Si una familia decide irse, lo conversamos con tiempo, acompañamos a los chicos en el cambio y cerramos los acuerdos pendientes con respeto.",
      },
    ],
  },
  {
    id: "taller",
    comunidad: "Taller Común",
    titulo: "Manifiesto de Taller Común",
    introduccion:
      "Arreglamos, fabricamos y enseñamos: nada se tira si se puede reparar. Esa idea vale también entre nosotras y nosotros, y los vínculos también se reparan.",
    compromisos: [
      {
        titulo: "Cuidamos las manos y a quien las usa",
        texto:
          "Respetamos las normas de seguridad del taller, enseñamos a usar cada máquina antes de usarla y nadie trabaja solo con una herramienta peligrosa.",
      },
      {
        titulo: "Decidimos con quien sabe y con quien usa",
        texto:
          "Las compras y los cambios del taller se deciden en asamblea. Quien conoce el oficio propone, y todas las personas que usan el espacio tienen voz.",
      },
      {
        titulo: "Los conflictos se reparan",
        texto:
          "Si algo se rompe entre nosotros, lo ponemos sobre la mesa como una pieza a arreglar: qué pasó, qué hace falta y quién ayuda. Buscamos reparar, no buscar culpables.",
      },
      {
        titulo: "Lo compartido se devuelve limpio",
        texto:
          "Dejamos las herramientas y el espacio mejor de como los encontramos y avisamos cuando algo falla o se acaba.",
      },
      {
        titulo: "Horas para el común",
        texto:
          "Ponemos a disposición del Lighthouse las horas de taller que nos propusimos por mes y enseñamos lo que sabemos a quien quiera aprender.",
      },
      {
        titulo: "Cuando te vas, devolvés y enseñás",
        texto:
          "Quien deja la tribu devuelve las herramientas prestadas y, antes de irse, deja enseñado a alguien lo que sabía hacer solo.",
      },
    ],
  },
  {
    id: "escuela",
    comunidad: "Escuela de la Tierra",
    titulo: "Manifiesto de Escuela de la Tierra",
    introduccion:
      "Una escuela al aire libre para los chicos del Lighthouse y de los barrios vecinos. Aprender es un acto de confianza: quien se suma acepta cuidar la curiosidad y la dignidad de cada niño y de cada adulto.",
    compromisos: [
      {
        titulo: "Cuidamos a quienes aprenden",
        texto:
          "Ningún niño ni adulto es expuesto, comparado ni humillado. Cuidamos los tiempos de cada uno y avisamos a las familias cuando algo les preocupa a sus hijos.",
      },
      {
        titulo: "Decidimos con las familias",
        texto:
          "Lo pedagógico se decide en el equipo docente y lo que afecta a las familias se conversa con ellas en reuniones abiertas, con voz para todas.",
      },
      {
        titulo: "Los conflictos son parte de aprender",
        texto:
          "Los resolvemos con la misma pedagogía que enseñamos: escuchar, nombrar lo que pasó, reparar y volver a intentar. Si hace falta, pedimos acompañamiento externo.",
      },
      {
        titulo: "Aprendemos de la tierra",
        texto:
          "Las clases salen al campo: huerta, monte y agua. Cuidamos los lugares donde aprendemos y enseñamos a cuidarlos.",
      },
      {
        titulo: "Un aula abierta a los vecinos",
        texto:
          "Ofrecemos cursos y estadías de aprendizaje abiertos al Lighthouse y a los barrios cercanos, y compartimos lo que producimos en la escuela.",
      },
      {
        titulo: "Cerrar un ciclo con cuidado",
        texto:
          "Quien se va, o se va un alumno, lo hace con una despedida y un cierre de lo trabajado. Una despedida bien hecha también enseña.",
      },
    ],
  },
  {
    id: "avelan",
    comunidad: "Fundación Avelan Kerum",
    titulo: "Manifiesto de la Fundación Avelan Kerum",
    introduccion:
      "Somos una comunidad que se organiza en áreas con representantes elegidos entre pares, y que nació en lo virtual antes de llegar al territorio. Sumarte es comprometerte con una comunidad que cuida la vida interior de cada persona y la vida compartida de todas.",
    compromisos: [
      {
        titulo: "Cuidamos lo interior y lo compartido",
        texto:
          "Respetamos los procesos personales de cada integrante, sin presionar ni juzgar, y nos acompañamos en los momentos de cambio.",
      },
      {
        titulo: "Elegimos entre pares",
        texto:
          "Cada área tiene una persona que la representa, elegida por quienes la integran. El cargo es un servicio, es rotativo y se puede revocar si deja de representar al grupo.",
      },
      {
        titulo: "Los conflictos pasan por el área de Acuerdos",
        texto:
          "Cuando algo no se resuelve entre las personas, se lleva al área de Acuerdos, que escucha a todas las partes y propone una salida que se pueda cumplir.",
      },
      {
        titulo: "Cuidamos el espacio virtual y el real",
        texto:
          "Mantenemos las conversaciones en línea con respeto y cuidamos el territorio cuando nos encontramos en persona.",
      },
      {
        titulo: "Encuentros abiertos",
        texto:
          "Aportamos retiros y encuentros abiertos al Lighthouse, y sostenemos las áreas con tiempo y trabajo, sin esperar nada a cambio que no esté acordado.",
      },
      {
        titulo: "Retirarse sin deuda",
        texto:
          "Quien deja un área o la comunidad lo avisa, entrega lo que tenía a cargo y puede volver cuando quiera, retomando el proceso de ingreso.",
      },
    ],
  },
  {
    id: "puerto",
    comunidad: "Puerto Trueque",
    titulo: "Manifiesto de Puerto Trueque",
    introduccion:
      "Somos la puerta de entrada del Lighthouse: hospedaje, mercado de los barrios y eventos. Quien llega, llega primero a nosotros; por eso nuestra forma de tratarnos es también la primera imagen del lugar.",
    compromisos: [
      {
        titulo: "Recibimos con el mismo cuidado con que nos cuidamos",
        texto:
          "Tratamos a las visitas y a la tribu con la misma amabilidad. Nadie se lleva un mal trato por estar cansado ni por ser nuevo.",
      },
      {
        titulo: "Decidimos antes de cada evento",
        texto:
          "Los eventos, los precios del mercado y las reglas del hospedaje se acuerdan en reuniones previas, y quien trabaja en un evento tiene voz en cómo se hace.",
      },
      {
        titulo: "Los conflictos se resuelven sin público",
        texto:
          "Una diferencia en pleno evento se pausa y se conversa después, a solas y con calma. Nunca se discute delante de las visitas.",
      },
      {
        titulo: "Trueque justo",
        texto:
          "En el mercado y en el hospedaje buscamos que cada intercambio sea bueno para las dos partes, con reglas claras que todas conocen.",
      },
      {
        titulo: "Noches y mercado para el común",
        texto:
          "Aportamos las noches de estadía y el mercado mensual que nos propusimos, y cuidamos que lo que ocurre en el Puerto beneficie también a los barrios.",
      },
      {
        titulo: "Salir dejando la puerta abierta",
        texto:
          "Quien deja la tribu avisa con tiempo, cumple los compromisos de los eventos ya confirmados y puede volver a trabajar con nosotros más adelante.",
      },
    ],
  },
  {
    id: "guardia",
    comunidad: "Guardianes del Monte",
    titulo: "Manifiesto de Guardianes del Monte",
    introduccion:
      "Cuidamos el bosque ribereño y medimos cómo mejora la tierra año a año. Un guardián no es dueño del monte: es alguien a quien el monte, y la comunidad, le confían su cuidado.",
    compromisos: [
      {
        titulo: "Nos cuidamos en el campo",
        texto:
          "Salimos de a dos o más a monitorear, avisamos adónde vamos y volvemos juntos. El monte se cuida mejor si quienes lo cuidan están bien.",
      },
      {
        titulo: "Decidimos con datos y con la tribu",
        texto:
          "Las decisiones sobre qué cuidar primero se basan en lo que medimos y se acuerdan en la reunión de la tribu, con voz para todas.",
      },
      {
        titulo: "Los conflictos se hablan a la vuelta de la caminata",
        texto:
          "Después de monitorear conversamos con calma. Si queda una diferencia sin resolver, pedimos a alguien de otra tribu que nos ayude a escucharnos.",
      },
      {
        titulo: "Medimos con honestidad",
        texto:
          "Registramos lo que vemos aunque no sea lo que esperábamos, y compartimos los datos tal cual. Un dato incómodo vale más que uno maquillado.",
      },
      {
        titulo: "Un informe para todos",
        texto:
          "Entregamos cada año al Lighthouse un informe de biodiversidad, claro y abierto, y proponemos cuidados concretos para el santuario.",
      },
      {
        titulo: "Pasar la posta",
        texto:
          "Quien deja la guardia entrega su cuaderno de campo y enseña su recorrido a quien sigue, para que el cuidado del monte no se interrumpa.",
      },
    ],
  },
];

const MANIFIESTOS: Manifiesto[] = BASES.map((b) => ({ ...b, version: VERSION, ejemplo: true }));

/** Manifiesto de una comunidad (`lighthouse` o id de tribu activa o en formación). `undefined` si no tiene. */
export function buscarManifiesto(id: string): Manifiesto | undefined {
  return MANIFIESTOS.find((m) => m.id === id);
}

/** Ids con manifiesto: el Lighthouse y cada tribu activa o en formación. */
export function idsConManifiesto(): string[] {
  return MANIFIESTOS.map((m) => m.id);
}

/** Tribus activas o en formación (las que tienen manifiesto), en el orden de los barrios. */
export function tribusConManifiesto() {
  return listarTribus().filter((t) => t.estado !== "vacante");
}

export function tieneManifiesto(id: string): boolean {
  const t = buscarTribu(id);
  return id === "lighthouse" || (t !== undefined && t.estado !== "vacante");
}

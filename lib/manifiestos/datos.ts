// Manifiestos de EJEMPLO para el prototipo interno. Los redactó un agente inspirándose en el foco, el ritual
// y la forma de decidir de cada tribu (lib/tribus/datos.ts). No son los textos reales de ninguna comunidad:
// son borradores a revisar con cada una antes de cualquier uso real.
//
// Son la voz de la comunidad: se escribieron en español (`original: "es"`) y en inglés se muestran traducidos, con la
// nota "Translated from Spanish". Esa traducción también la escribió un agente y está pendiente de revisión nativa
// (y de la comunidad que los escriba de verdad). Los nombres de las comunidades no se traducen.
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";

/** Un texto del manifiesto: español original y su traducción al inglés. */
const v = (es: string, en: string): BilingueConOriginal => ({ es, en, original: "es" });

export type Compromiso = { titulo: string; texto: string };
export type CompromisoBilingue = { titulo: BilingueConOriginal; texto: BilingueConOriginal };

export type Manifiesto = {
  /** `lighthouse` o el id de una tribu. */
  id: string;
  /** Nombre de la comunidad (nombre propio: no se traduce). */
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

/** El manifiesto como se guarda: cada texto con su español original y su inglés. */
export type ManifiestoBilingue = Omit<Manifiesto, "titulo" | "introduccion" | "compromisos" | "version"> & {
  titulo: BilingueConOriginal;
  introduccion: BilingueConOriginal;
  compromisos: CompromisoBilingue[];
  version: BilingueConOriginal;
};

const VERSION = v("8 de octubre de 2026", "October 8, 2026");

type Base = Omit<ManifiestoBilingue, "version" | "ejemplo">;

const BASES: Base[] = [
  {
    id: "lighthouse",
    comunidad: "Lighthouse",
    titulo: v("Pacto de convivencia del Lighthouse", "Lighthouse Coexistence Pact"),
    introduccion: v(
      "El Lighthouse es un lugar donde van a vivir y trabajar muchas personas y muchas tribus. Antes de cualquier pacto, este es el piso común: lo que nos prometemos a todas las personas que decidimos pertenecer, sea cual sea la tribu a la que nos sumemos.",
      "The Lighthouse is a place where many people and many tribes will live and work. Before any pact, this is the common ground: what we promise to all of us who decide to belong, whichever tribe we join.",
    ),
    compromisos: [
      {
        titulo: v("Nos cuidamos", "We take care of each other"),
        texto: v(
          "Tratamos a cada persona como alguien con quien vamos a convivir años. Preguntamos antes de suponer, escuchamos antes de contestar y nadie queda solo cuando está pasando un mal momento.",
          "We treat each person as someone we will live alongside for years. We ask before assuming, we listen before answering, and no one is left alone when going through a hard time.",
        ),
      },
      {
        titulo: v("Decidimos juntos lo que es de todos", "We decide together what belongs to everyone"),
        texto: v(
          "Lo que afecta a todo el Lighthouse (el agua, los caminos, el terreno común) se decide con consenso en la asamblea. Lo que le toca a una tribu lo decide esa tribu, y lo hace público.",
          "What affects the whole Lighthouse (water, roads, the common land) is decided by consensus in the assembly. What concerns a single tribe is decided by that tribe, and made public.",
        ),
      },
      {
        titulo: v("Hablamos antes de que el conflicto crezca", "We talk before conflict grows"),
        texto: v(
          "Si algo nos duele o nos molesta, lo decimos pronto y cara a cara, con respeto. Si no alcanza, pedimos una mediación de la comunidad antes de acudir a otra instancia.",
          "If something hurts or bothers us, we say so early and face to face, with respect. If that is not enough, we ask the community for mediation before turning to any other body.",
        ),
      },
      {
        titulo: v("Cuidamos la tierra", "We care for the land"),
        texto: v(
          "Dejamos el suelo, el agua y el monte mejor de como los encontramos. No hacemos obras, quemas ni vertidos que dañen lo que es de todos.",
          "We leave the soil, the water and the woodland better than we found them. We do not carry out works, burning or dumping that harm what belongs to everyone.",
        ),
      },
      {
        titulo: v("Aportamos al común", "We contribute to the commons"),
        texto: v(
          "Cada tribu y cada persona suma al pozo común lo que acordó: tiempo, trabajo, saberes o recursos. Lo que se aporta se registra y se rinde cuentas a la comunidad.",
          "Each tribe and each person adds to the common pool what they agreed to: time, work, knowledge or resources. What is contributed is recorded and reported back to the community.",
        ),
      },
      {
        titulo: v("Cuando alguien se va, nos vamos bien", "When someone leaves, we part well"),
        texto: v(
          "Nadie queda atado. Quien decide irse avisa con tiempo, deja en orden lo que tenía a cargo y se lleva lo que es suyo. Si algún día no podemos cumplir un acuerdo, lo hablamos con la comunidad en lugar de callarlo.",
          "No one is tied down. Whoever decides to leave gives notice, leaves in order whatever they were in charge of, and takes what is theirs. If one day we cannot keep an agreement, we talk about it with the community instead of staying silent.",
        ),
      },
    ],
  },
  {
    id: "semilla",
    comunidad: "Semilla Viva",
    titulo: v("Manifiesto de Semilla Viva", "Semilla Viva Manifesto"),
    introduccion: v(
      "Somos una tribu que cuida el suelo y las semillas criollas para que todo el Lighthouse coma bien. Sumarte es aceptar un ritmo de campo: se siembra, se espera y se comparte la cosecha.",
      "We are a tribe that looks after the soil and the native seeds so that all of the Lighthouse eats well. Joining means accepting the rhythm of the field: we sow, we wait, and we share the harvest.",
    ),
    compromisos: [
      {
        titulo: v("Nos cuidamos como se cuida una huerta", "We look after each other the way a garden is looked after"),
        texto: v(
          "Miramos cómo está cada persona de la tribu igual que miramos cómo está el suelo. Una persona cansada o desanimada es motivo de una charla, no de un reproche.",
          "We check in on each person in the tribe the way we check on the soil. A tired or discouraged person is a reason for a conversation, not a reproach.",
        ),
      },
      {
        titulo: v("Decidimos en la ronda de palabra", "We decide in the talking circle"),
        texto: v(
          "Las decisiones de la tribu se toman en rondas donde habla cada persona. Buscamos que nadie se oponga con firmeza; si alguien lo hace, lo escuchamos hasta entender qué cuida.",
          "The tribe's decisions are made in circles where every person speaks. We aim for no one to object firmly; if someone does, we listen until we understand what they are protecting.",
        ),
      },
      {
        titulo: v("Resolvemos los conflictos en la minga", "We resolve conflicts at the work party"),
        texto: v(
          "Trabajar codo a codo ablanda las diferencias. Si una tensión persiste, la llevamos a la ronda con alguien de la tribu que acompañe la conversación.",
          "Working side by side softens differences. If a tension persists, we take it to the circle with someone from the tribe who accompanies the conversation.",
        ),
      },
      {
        titulo: v("Las semillas no se privatizan", "Seeds are not privatized"),
        texto: v(
          "Las semillas criollas del banco son de todas y todos. Las intercambiamos y las multiplicamos, y no las patentamos ni las vendemos como propias.",
          "The native seeds in the bank belong to everyone. We exchange them and multiply them, and we neither patent them nor sell them as our own.",
        ),
      },
      {
        titulo: v("Aportamos verdura y plantines", "We contribute vegetables and seedlings"),
        texto: v(
          "Compartimos con el Lighthouse la verdura y los plantines que la tribu se propone cada temporada, y cada persona colabora con sus jornadas de huerta.",
          "We share with the Lighthouse the vegetables and seedlings the tribe sets out to grow each season, and each person helps with their days in the garden.",
        ),
      },
      {
        titulo: v("Si te vas, dejás el suelo vivo", "If you leave, you leave the soil alive"),
        texto: v(
          "Quien se va deja su parcela cuidada y comparte lo aprendido con quien la sigue. Las puertas quedan abiertas para volver.",
          "Whoever leaves hands over their plot well cared for and shares what they have learned with whoever follows. The doors stay open for returning.",
        ),
      },
    ],
  },
  {
    id: "barda",
    comunidad: "Barda Productiva",
    titulo: v("Manifiesto de Barda Productiva", "Barda Productiva Manifesto"),
    introduccion: v(
      "Producimos aceite y vino con manejo regenerativo y abrimos la bodega a los vecinos. Somos pocos hogares con proyectos propios, y por eso lo que prometemos tiene que ser claro y estar escrito.",
      "We produce oil and wine with regenerative farming and we open the winery to our neighbors. We are a few households with projects of our own, and that is why what we promise has to be clear and written down.",
    ),
    compromisos: [
      {
        titulo: v("Cuidamos a los socios y a sus familias", "We look after the partners and their families"),
        texto: v(
          "Cada hogar es parte de la tribu, no solo una firma en la sociedad. Estamos atentos a las épocas difíciles de la cosecha y nos damos una mano.",
          "Each household is part of the tribe, not just a signature in the company. We are mindful of the hard times of the harvest and we lend each other a hand.",
        ),
      },
      {
        titulo: v("Decidimos como socios", "We decide as partners"),
        texto: v(
          "Lo que compromete a la sociedad se vota entre los socios de la SAS. Lo cotidiano de cada proyecto lo decide cada hogar, informando al resto.",
          "What binds the company is voted on by the partners of the SAS. The day-to-day of each project is decided by each household, keeping the rest informed.",
        ),
      },
      {
        titulo: v("Los desacuerdos se hablan con números sobre la mesa", "Disagreements are discussed with the numbers on the table"),
        texto: v(
          "Cuando hay diferencias de dinero o de criterio, compartimos los datos, escuchamos todas las miradas y, si hace falta, pedimos una opinión externa que acordamos entre todos.",
          "When there are differences over money or judgment, we share the data, listen to every point of view and, if needed, ask for an outside opinion that we agree on together.",
        ),
      },
      {
        titulo: v("Manejo regenerativo", "Regenerative farming"),
        texto: v(
          "Trabajamos el olivar y la vid sin agotar el suelo ni el agua, y medimos año a año cómo mejora la barda.",
          "We work the olive grove and the vineyard without depleting the soil or the water, and we measure year by year how the bluff improves.",
        ),
      },
      {
        titulo: v("Abrimos la bodega", "We open the winery"),
        texto: v(
          "Compartimos con el Lighthouse parte del aceite y las visitas guiadas que nos propusimos, y recibimos a los vecinos con la puerta abierta.",
          "We share with the Lighthouse part of the oil and the guided visits we set out to offer, and we welcome our neighbors with an open door.",
        ),
      },
      {
        titulo: v("Salir sin romper", "Leaving without breaking things"),
        texto: v(
          "Quien deja la sociedad lo hace según lo que dice el estatuto, con aviso previo y sin dañar la producción de los demás.",
          "Whoever leaves the company does so as the bylaws say, with prior notice and without harming anyone else's production.",
        ),
      },
    ],
  },
  {
    id: "monte",
    comunidad: "Monte Nuevo",
    titulo: v("Manifiesto de Monte Nuevo", "Monte Nuevo Manifesto"),
    introduccion: v(
      "Plantamos el bosque que va a dar la madera y la paja de las casas del Lighthouse. Un bosque tarda décadas: pertenecer a esta tribu es pensar en lo que va a quedar cuando ya no estemos.",
      "We are planting the forest that will provide the timber and straw for the Lighthouse homes. A forest takes decades: belonging to this tribe means thinking about what will remain when we are no longer here.",
    ),
    compromisos: [
      {
        titulo: v("Nos cuidamos en la obra y fuera de ella", "We look after each other on the building site and off it"),
        texto: v(
          "Trabajamos con ropa y herramientas seguras, nos turnamos en lo pesado y paramos cuando alguien está agotado. La obra nunca vale más que una persona.",
          "We work with safe clothing and tools, we take turns with the heavy tasks and we stop when someone is exhausted. The work is never worth more than a person.",
        ),
      },
      {
        titulo: v("Decidimos por consentimiento", "We decide by consent"),
        texto: v(
          "Avanzamos con una propuesta cuando nadie tiene una objeción razonable. Las objeciones se escuchan y se usan para mejorar la propuesta.",
          "We move ahead with a proposal when no one has a reasonable objection. Objections are heard and used to improve the proposal.",
        ),
      },
      {
        titulo: v("Los conflictos se hablan en la caminata", "Conflicts are talked through on a walk"),
        texto: v(
          "Salimos a caminar el bosque juntas y juntos para conversar lo difícil. Si no se resuelve, lo llevamos a la reunión de la tribu con alguien que modere.",
          "We walk the forest together to talk about the difficult things. If it is not resolved, we take it to the tribe's meeting with someone to moderate.",
        ),
      },
      {
        titulo: v("Cada árbol que sacamos, lo reponemos", "Every tree we take, we replace"),
        texto: v(
          "Plantamos más de lo que cortamos, elegimos especies que le sirvan al lugar y cuidamos las plantas nuevas hasta que se sostengan solas.",
          "We plant more than we cut, we choose species that suit the place, and we tend the young plants until they can stand on their own.",
        ),
      },
      {
        titulo: v("Madera y saberes para todos", "Timber and knowledge for everyone"),
        texto: v(
          "Compartimos con el Lighthouse la madera que nos propusimos entregar y damos talleres de bioconstrucción abiertos a quien quiera aprender.",
          "We share with the Lighthouse the timber we set out to deliver, and we give natural building workshops open to anyone who wants to learn.",
        ),
      },
      {
        titulo: v("Despedirse con un árbol", "Saying goodbye with a tree"),
        texto: v(
          "Quien se va lo hace avisando con tiempo, terminando lo que empezó o entregándolo en orden, y planta un árbol como señal de que su paso por la tribu no se borra.",
          "Whoever leaves gives notice in good time, finishes what they started or hands it over in order, and plants a tree as a sign that their time in the tribe is not erased.",
        ),
      },
    ],
  },
  {
    id: "agua",
    comunidad: "Agua Clara",
    titulo: v("Manifiesto de Agua Clara", "Agua Clara Manifesto"),
    introduccion: v(
      "Diseñamos y cuidamos el agua común: toma, cisterna, riego y tratamiento. El agua es de todas y de todos, y quien la administra tiene una responsabilidad enorme. Este manifiesto lo recuerda.",
      "We design and look after the shared water: intake, cistern, irrigation and treatment. Water belongs to everyone, and whoever manages it carries an enormous responsibility. This manifesto is a reminder of that.",
    ),
    compromisos: [
      {
        titulo: v("Cuidamos primero a las personas que dependen del agua", "We look first after the people who depend on the water"),
        texto: v(
          "Nuestro trabajo es que nadie se quede sin agua segura. Cuando hay una falla, avisamos rápido, explicamos qué pasó y lo arreglamos sin culpar.",
          "Our job is that no one is left without safe water. When something fails, we say so quickly, explain what happened and fix it without blaming anyone.",
        ),
      },
      {
        titulo: v("Decidimos con criterio técnico y con la comunidad", "We decide with technical judgment and with the community"),
        texto: v(
          "Las decisiones técnicas las toma el equipo con datos a la vista. Lo que cambia el servicio o el costo para otros se consulta antes con quienes lo usan.",
          "Technical decisions are made by the team with the data in plain view. Anything that changes the service or the cost for others is first discussed with the people who use it.",
        ),
      },
      {
        titulo: v("Los conflictos por el agua se hablan en público", "Water conflicts are discussed in public"),
        texto: v(
          "Los reclamos y los desacuerdos sobre el uso del agua se tratan en reuniones abiertas, con los datos de consumo y de calidad a la vista de todos.",
          "Complaints and disagreements about water use are dealt with in open meetings, with the consumption and quality data visible to everyone.",
        ),
      },
      {
        titulo: v("Devolvemos el agua limpia", "We return the water clean"),
        texto: v(
          "Tratamos lo que usamos antes de devolverlo a la tierra o al río, y medimos la calidad con regularidad.",
          "We treat what we use before returning it to the land or the river, and we measure its quality regularly.",
        ),
      },
      {
        titulo: v("El servicio es un aporte al común", "The service is a contribution to the commons"),
        texto: v(
          "Llevamos agua a todos los barrios del Lighthouse y rendimos cuentas de cómo se usan los recursos que se aportan para sostener el servicio.",
          "We bring water to every neighborhood of the Lighthouse and report on how the resources contributed to sustain the service are used.",
        ),
      },
      {
        titulo: v("Un traspaso responsable", "A responsible handover"),
        texto: v(
          "Quien deja un rol técnico documenta lo que sabe y acompaña a quien lo reemplaza, para que el servicio no dependa de una sola persona.",
          "Whoever leaves a technical role documents what they know and supports whoever replaces them, so that the service does not depend on a single person.",
        ),
      },
    ],
  },
  {
    id: "valle",
    comunidad: "Valle Solar",
    titulo: v("Manifiesto de Valle Solar", "Valle Solar Manifesto"),
    introduccion: v(
      "Somos familias que queremos criar en comunidad, con energía y agua propias. Aquí los chicos crecen rodeados de muchos adultos, así que lo que prometemos pesa: sumarte es ser parte de la crianza compartida de todas y todos.",
      "We are families who want to raise our children in community, with our own energy and water. Here the children grow up surrounded by many adults, so what we promise carries weight: joining means taking part in the shared parenting of all our children.",
    ),
    compromisos: [
      {
        titulo: v("Cuidamos a los chicos y a los grandes", "We look after the children and the grown-ups"),
        texto: v(
          "Los niños y las niñas son responsabilidad de toda la tribu. Los adultos nos cuidamos también: cuando una familia pasa por una crisis, las demás se acercan.",
          "The children are the responsibility of the whole tribe. We adults look after each other too: when a family goes through a crisis, the others draw near.",
        ),
      },
      {
        titulo: v("Decidimos por consentimiento", "We decide by consent"),
        texto: v(
          "Una decisión avanza cuando nadie del grupo tiene una objeción de fondo. Escuchamos las objeciones, ajustamos la propuesta y volvemos a consultar.",
          "A decision moves ahead when no one in the group has a fundamental objection. We listen to the objections, adjust the proposal and consult again.",
        ),
      },
      {
        titulo: v("Los conflictos se hablan en familia", "Conflicts are talked through as a family"),
        texto: v(
          "Si hay un malestar, lo conversamos primero entre las personas involucradas, después con alguien de confianza de la tribu y, si hace falta, en el círculo completo, sin reproches y con tiempo.",
          "If something is bothering us, we talk about it first among the people involved, then with someone the tribe trusts and, if needed, in the full circle, without reproach and taking our time.",
        ),
      },
      {
        titulo: v("Energía y agua con cabeza", "Energy and water, used wisely"),
        texto: v(
          "Usamos la energía solar y el agua sabiendo que son limitadas. Nos ponemos de acuerdo sobre los consumos y los cuidados de los sistemas compartidos.",
          "We use solar energy and water knowing they are limited. We agree on consumption and on the upkeep of the shared systems.",
        ),
      },
      {
        titulo: v("Aportamos al núcleo común", "We contribute to the common core"),
        texto: v(
          "Sostenemos la energía solar del núcleo común y la hospitalidad que prometimos (noches de hospedaje) para recibir a quienes visitan el Lighthouse.",
          "We sustain the solar energy of the common core and the hospitality we promised (nights of lodging) to welcome those who visit the Lighthouse.",
        ),
      },
      {
        titulo: v("Irse con cariño", "Leaving with affection"),
        texto: v(
          "Si una familia decide irse, lo conversamos con tiempo, acompañamos a los chicos en el cambio y cerramos los acuerdos pendientes con respeto.",
          "If a family decides to leave, we talk it over in good time, support the children through the change and close the pending agreements with respect.",
        ),
      },
    ],
  },
  {
    id: "taller",
    comunidad: "Taller Común",
    titulo: v("Manifiesto de Taller Común", "Taller Común Manifesto"),
    introduccion: v(
      "Arreglamos, fabricamos y enseñamos: nada se tira si se puede reparar. Esa idea vale también entre nosotras y nosotros, y los vínculos también se reparan.",
      "We fix, make and teach: nothing gets thrown away if it can be repaired. That idea holds between us too, and relationships can be repaired as well.",
    ),
    compromisos: [
      {
        titulo: v("Cuidamos las manos y a quien las usa", "We look after hands and the people who use them"),
        texto: v(
          "Respetamos las normas de seguridad del taller, enseñamos a usar cada máquina antes de usarla y nadie trabaja solo con una herramienta peligrosa.",
          "We follow the workshop's safety rules, we teach how to use each machine before using it, and no one works alone with a dangerous tool.",
        ),
      },
      {
        titulo: v("Decidimos con quien sabe y con quien usa", "We decide with those who know and those who use"),
        texto: v(
          "Las compras y los cambios del taller se deciden en asamblea. Quien conoce el oficio propone, y todas las personas que usan el espacio tienen voz.",
          "Purchases and changes to the workshop are decided in assembly. Whoever knows the trade makes proposals, and everyone who uses the space has a voice.",
        ),
      },
      {
        titulo: v("Los conflictos se reparan", "Conflicts get repaired"),
        texto: v(
          "Si algo se rompe entre nosotros, lo ponemos sobre la mesa como una pieza a arreglar: qué pasó, qué hace falta y quién ayuda. Buscamos reparar, no buscar culpables.",
          "If something breaks between us, we put it on the table like a piece to fix: what happened, what is needed and who helps. We look to repair, not to find someone to blame.",
        ),
      },
      {
        titulo: v("Lo compartido se devuelve limpio", "What is shared is returned clean"),
        texto: v(
          "Dejamos las herramientas y el espacio mejor de como los encontramos y avisamos cuando algo falla o se acaba.",
          "We leave the tools and the space better than we found them, and we say so when something breaks or runs out.",
        ),
      },
      {
        titulo: v("Horas para el común", "Hours for the commons"),
        texto: v(
          "Ponemos a disposición del Lighthouse las horas de taller que nos propusimos por mes y enseñamos lo que sabemos a quien quiera aprender.",
          "We make available to the Lighthouse the workshop hours we set out to give each month, and we teach what we know to anyone who wants to learn.",
        ),
      },
      {
        titulo: v("Cuando te vas, devolvés y enseñás", "When you leave, you return and you teach"),
        texto: v(
          "Quien deja la tribu devuelve las herramientas prestadas y, antes de irse, deja enseñado a alguien lo que sabía hacer solo.",
          "Whoever leaves the tribe returns any borrowed tools and, before going, teaches someone what only they knew how to do.",
        ),
      },
    ],
  },
  {
    id: "avelan",
    comunidad: "Fundación Avelan Kerum",
    titulo: v("Manifiesto de la Fundación Avelan Kerum", "Fundación Avelan Kerum Manifesto"),
    introduccion: v(
      "Somos una comunidad que se organiza en áreas con representantes elegidos entre pares, y que nació en lo virtual antes de llegar al territorio. Sumarte es comprometerte con una comunidad que cuida la vida interior de cada persona y la vida compartida de todas.",
      "We are a community organized in areas with representatives chosen among peers, and we were born online before arriving at the territory. Joining means committing to a community that looks after each person's inner life and the shared life of all.",
    ),
    compromisos: [
      {
        titulo: v("Cuidamos lo interior y lo compartido", "We care for the inner and the shared"),
        texto: v(
          "Respetamos los procesos personales de cada integrante, sin presionar ni juzgar, y nos acompañamos en los momentos de cambio.",
          "We respect each member's personal process, without pressure or judgment, and we accompany each other through times of change.",
        ),
      },
      {
        titulo: v("Elegimos entre pares", "We choose among peers"),
        texto: v(
          "Cada área tiene una persona que la representa, elegida por quienes la integran. El cargo es un servicio, es rotativo y se puede revocar si deja de representar al grupo.",
          "Each area has a person who represents it, chosen by those who belong to it. The role is a service, it rotates, and it can be revoked if the person stops representing the group.",
        ),
      },
      {
        titulo: v("Los conflictos pasan por el área de Acuerdos", "Conflicts go through the Agreements area"),
        texto: v(
          "Cuando algo no se resuelve entre las personas, se lleva al área de Acuerdos, que escucha a todas las partes y propone una salida que se pueda cumplir.",
          "When something cannot be resolved between the people involved, it is taken to the Agreements area, which listens to all sides and proposes a way out that can be kept.",
        ),
      },
      {
        titulo: v("Cuidamos el espacio virtual y el real", "We look after the virtual space and the real one"),
        texto: v(
          "Mantenemos las conversaciones en línea con respeto y cuidamos el territorio cuando nos encontramos en persona.",
          "We keep online conversations respectful and we care for the territory when we meet in person.",
        ),
      },
      {
        titulo: v("Encuentros abiertos", "Open gatherings"),
        texto: v(
          "Aportamos retiros y encuentros abiertos al Lighthouse, y sostenemos las áreas con tiempo y trabajo, sin esperar nada a cambio que no esté acordado.",
          "We contribute retreats and open gatherings to the Lighthouse, and we sustain the areas with time and work, expecting nothing in return that has not been agreed.",
        ),
      },
      {
        titulo: v("Retirarse sin deuda", "Stepping away with no debt"),
        texto: v(
          "Quien deja un área o la comunidad lo avisa, entrega lo que tenía a cargo y puede volver cuando quiera, retomando el proceso de ingreso.",
          "Whoever leaves an area or the community says so, hands over what they were in charge of, and may come back whenever they wish, resuming the entry process.",
        ),
      },
    ],
  },
  {
    id: "puerto",
    comunidad: "Puerto Trueque",
    titulo: v("Manifiesto de Puerto Trueque", "Puerto Trueque Manifesto"),
    introduccion: v(
      "Somos la puerta de entrada del Lighthouse: hospedaje, mercado de los barrios y eventos. Quien llega, llega primero a nosotros; por eso nuestra forma de tratarnos es también la primera imagen del lugar.",
      "We are the front door of the Lighthouse: lodging, the neighborhoods' market and events. Whoever arrives, arrives at us first; that is why the way we treat each other is also the first impression of the place.",
    ),
    compromisos: [
      {
        titulo: v("Recibimos con el mismo cuidado con que nos cuidamos", "We welcome with the same care with which we look after each other"),
        texto: v(
          "Tratamos a las visitas y a la tribu con la misma amabilidad. Nadie se lleva un mal trato por estar cansado ni por ser nuevo.",
          "We treat visitors and the tribe with the same kindness. No one gets poor treatment for being tired or for being new.",
        ),
      },
      {
        titulo: v("Decidimos antes de cada evento", "We decide before each event"),
        texto: v(
          "Los eventos, los precios del mercado y las reglas del hospedaje se acuerdan en reuniones previas, y quien trabaja en un evento tiene voz en cómo se hace.",
          "Events, market prices and lodging rules are agreed in earlier meetings, and whoever works at an event has a say in how it is done.",
        ),
      },
      {
        titulo: v("Los conflictos se resuelven sin público", "Conflicts are resolved without an audience"),
        texto: v(
          "Una diferencia en pleno evento se pausa y se conversa después, a solas y con calma. Nunca se discute delante de las visitas.",
          "A disagreement in the middle of an event is paused and talked through afterwards, privately and calmly. We never argue in front of visitors.",
        ),
      },
      {
        titulo: v("Trueque justo", "Fair barter"),
        texto: v(
          "En el mercado y en el hospedaje buscamos que cada intercambio sea bueno para las dos partes, con reglas claras que todas conocen.",
          "In the market and in the lodging, we aim for every exchange to be good for both sides, with clear rules that everyone knows.",
        ),
      },
      {
        titulo: v("Noches y mercado para el común", "Nights and market for the commons"),
        texto: v(
          "Aportamos las noches de estadía y el mercado mensual que nos propusimos, y cuidamos que lo que ocurre en el Puerto beneficie también a los barrios.",
          "We contribute the nights of stay and the monthly market we set out to provide, and we make sure that what happens at the Port benefits the neighborhoods too.",
        ),
      },
      {
        titulo: v("Salir dejando la puerta abierta", "Leaving with the door open"),
        texto: v(
          "Quien deja la tribu avisa con tiempo, cumple los compromisos de los eventos ya confirmados y puede volver a trabajar con nosotros más adelante.",
          "Whoever leaves the tribe gives notice in good time, honors the commitments for events already confirmed, and may come back to work with us later on.",
        ),
      },
    ],
  },
];

const MANIFIESTOS: ManifiestoBilingue[] = BASES.map((b) => ({ ...b, version: VERSION, ejemplo: true }));

/** El manifiesto con sus textos en los dos idiomas (para mostrar la nota de traducción y para los tests). */
export function buscarManifiestoBilingue(id: string): ManifiestoBilingue | undefined {
  return MANIFIESTOS.find((m) => m.id === id);
}

/** Manifiesto de una comunidad (`lighthouse` o id de tribu activa o en formación) en un idioma. `undefined` si no tiene. */
export function buscarManifiesto(id: string, idioma: Idioma = "es"): Manifiesto | undefined {
  const m = buscarManifiestoBilingue(id);
  if (!m) return undefined;
  return {
    ...m,
    titulo: textoEn(m.titulo, idioma),
    introduccion: textoEn(m.introduccion, idioma),
    compromisos: m.compromisos.map((c) => ({ titulo: textoEn(c.titulo, idioma), texto: textoEn(c.texto, idioma) })),
    version: textoEn(m.version, idioma),
  };
}

/** Ids con manifiesto: el Lighthouse y cada tribu activa o en formación. */
export function idsConManifiesto(): string[] {
  return MANIFIESTOS.map((m) => m.id);
}

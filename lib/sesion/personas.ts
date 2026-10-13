/** Ajustes por email del prototipo (super admin, nivel asignado de antemano): vienen de la variable de entorno `LH_PERSONAS` (solo servidor, nunca en el repo). */

export const ROLES_SESION = ["superadmin", "admin-tribu", "persona"] as const;
export const PERFILES_PRUEBA = ["usuario", "inversor", "comunidad"] as const;

export type RolSesion = (typeof ROLES_SESION)[number];
export type PerfilPrueba = (typeof PERFILES_PRUEBA)[number];

export type Persona = {
  email: string;
  rol: RolSesion;
  perfil: PerfilPrueba;
  /** Tribu que administra; en el POC siempre `valle` y solo para `admin-tribu`. */
  tribuAdmin: "valle" | null;
};

/** Lo que devuelve `/api/sesion`. */
export type Sesion = Persona;

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Formato: `email=rol:perfil;email=rol:perfil`. Los espacios y las mayúsculas no importan;
 * las entradas mal formadas se ignoran y se avisan con `avisar` (el log del servidor).
 */
export function parsearPersonas(texto: string | undefined, avisar: (mensaje: string) => void = () => {}): Persona[] {
  const resultado = new Map<string, Persona>();
  for (const crudo of (texto ?? "").split(";")) {
    const entrada = crudo.trim();
    if (entrada === "") continue;
    const igual = entrada.indexOf("=");
    const email = igual > 0 ? normalizarEmail(entrada.slice(0, igual)) : "";
    const [rolCrudo, perfilCrudo, ...resto] = (igual > 0 ? entrada.slice(igual + 1) : "").split(":");
    const rol = (rolCrudo ?? "").trim().toLowerCase();
    const perfil = (perfilCrudo ?? "").trim().toLowerCase();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (
      !emailValido ||
      resto.length > 0 ||
      !(ROLES_SESION as readonly string[]).includes(rol) ||
      !(PERFILES_PRUEBA as readonly string[]).includes(perfil)
    ) {
      avisar(`LH_PERSONAS: entrada ignorada (mal formada): posición ${resultado.size + 1} o posterior`);
      continue;
    }
    resultado.set(email, {
      email,
      rol: rol as RolSesion,
      perfil: perfil as PerfilPrueba,
      tribuAdmin: rol === "admin-tribu" ? "valle" : null,
    });
  }
  return [...resultado.values()];
}

export function buscarPersona(personas: Persona[], email: string | null | undefined): Persona | null {
  if (!email) return null;
  const e = normalizarEmail(email);
  return personas.find((p) => p.email === e) ?? null;
}

/**
 * Acceso abierto: quien se registra con un email válido entra como persona común (Explorador como mínimo) aunque no esté en
 * `LH_PERSONAS`, que solo ajusta emails puntuales. Con `LH_ACCESO=lista` vuelve la lista cerrada (solo entran los de la lista).
 */
export function personaConAcceso(
  personas: Persona[],
  email: string | null | undefined,
  entorno: { LH_ACCESO?: string },
): Persona | null {
  const ajustada = buscarPersona(personas, email);
  if (ajustada) return ajustada;
  if (entorno.LH_ACCESO?.trim().toLowerCase() === "lista" || !email) return null;
  const limpio = normalizarEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return null;
  return { email: limpio, rol: "persona", perfil: "usuario", tribuAdmin: null };
}

/** El modo de prueba solo existe fuera de producción de Vercel y con `LH_AUTH_PRUEBA=1`. */
export function modoPruebaActivo(env: { LH_AUTH_PRUEBA?: string; VERCEL_ENV?: string }): boolean {
  return env.LH_AUTH_PRUEBA === "1" && env.VERCEL_ENV !== "production";
}

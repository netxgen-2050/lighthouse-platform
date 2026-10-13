/** Iniciales a partir de un email: `ana.perez@x.com` da "AP"; `super@x.com` da "S". Sin email, cadena vacía. */
export function inicialesDeEmail(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0] ?? "";
  return local
    .split(/[._\-+\s]+/)
    .filter((p) => /^\p{L}/u.test(p))
    .slice(0, 2)
    .map((p) => Array.from(p)[0].toLocaleUpperCase("es"))
    .join("");
}

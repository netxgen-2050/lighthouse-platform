/**
 * Lo que un proveedor de login verificó de quien pide (ADR-009). El resto de la app no sabe de Privy: `login-neon-auth`
 * llena este mismo tipo con Neon Auth.
 */
export type ProveedorLogin = "privy" | "neon-auth";

export type IdentidadExterna = {
  proveedor: ProveedorLogin;
  /** Id del usuario en el proveedor (Privy: `did:privy:…`). */
  idExterno: string;
  /** Email en minúsculas, o null si el proveedor no trae ninguno. */
  email: string | null;
  /** ¿El proveedor verificó ese email (código por mail o Google)? Solo así se puede vincular por email. */
  emailVerificado: boolean;
  nombre?: string;
};

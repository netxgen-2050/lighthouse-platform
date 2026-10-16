"use client";

import { createContext, useContext } from "react";
import type { Nivel } from "@/lib/permisos/niveles";
import type { EstadoConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import type { Persona } from "@/lib/sesion/personas";

export type EstadoSesion = "cargando" | "sin-sesion" | "sin-acceso" | "error" | "ok";

/** Lo que devuelve `/api/sesion`. */
export type SesionCliente = Persona & { idPersona: string; personas?: Persona[] };

/** Lo que usamos de Privy (el SDK solo se importa en `privy-puente.tsx`). */
export type PrivyMinimo = {
  ready: boolean;
  authenticated: boolean;
  email: string | null;
  nombre: string | null;
  billetera: string | null;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

export type ValorSesion = {
  estado: EstadoSesion;
  sesion: SesionCliente | null;
  /** Email con el que se entró (también cuando no está en la lista), para mostrarlo en "sin acceso". */
  emailIntento: string | null;
  /** Nombre que trae Privy (por ejemplo de Google), si lo trae. */
  nombre: string | null;
  /** Dirección abreviable de la billetera embebida de Privy, si existe. */
  billetera: string | null;
  /** ¿Está configurado Privy en este despliegue? */
  privyDisponible: boolean;
  /** Abre el login de Privy; sin Privy lleva a Sumarte, donde está "Entrar como…" del modo de prueba. */
  entrar: () => void;
  entrarComo: (email: string) => void;
  /** Nivel de la persona según cómo se sumó (sin sesión: "sin-cuenta"). Ver `lib/permisos/niveles.ts`. */
  nivel: Nivel;
  /** ¿Ya se leyó lo que la persona eligió en Sumarte? Hasta entonces `nivel` es provisorio y no se la debe redirigir. */
  nivelListo: boolean;
  /**
   * ¿Aceptó la persona la política de privacidad vigente? "cargando" hasta leer el registro (o sin sesión);
   * "pendiente" si nunca aceptó o la política cambió. Ver `lib/privacidad/consentimiento.ts`.
   */
  consentimiento: EstadoConsentimiento;
  /** Tribus que lidera (Plan Tribu o nivel asignado), o lista vacía. */
  tribusLider: string[];
  /** La tribu asignada de antemano en `LH_PERSONAS` (no se puede dejar desde Sumarte), o null. */
  tribuFija: string | null;
  salir: () => Promise<void>;
  /** Cabeceras que acreditan la sesión (token de Privy o modo de prueba) para pedir a las rutas `/api`. */
  cabeceras: () => Promise<Record<string, string>>;
};

export const ContextoSesion = createContext<ValorSesion | null>(null);

export function useSesion(): ValorSesion {
  const v = useContext(ContextoSesion);
  if (!v) throw new Error("useSesion se usa dentro de <ProveedorSesion>");
  return v;
}

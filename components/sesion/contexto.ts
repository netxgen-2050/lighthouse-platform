"use client";

import { createContext, useContext } from "react";
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
  entrar: () => void;
  /** Sin Privy: se pidió entrar en esta misma página y se muestra la pantalla de entrada sobre ella. */
  pidiendoEntrar: boolean;
  /** Vuelve a la página pública (cierra la pantalla de entrada pedida con `entrar`). */
  cancelarEntrar: () => void;
  entrarComo: (email: string) => void;
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

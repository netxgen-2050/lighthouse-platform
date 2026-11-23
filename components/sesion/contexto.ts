"use client";

import { createContext, useContext } from "react";
import type { Nivel } from "@/lib/permisos/niveles";
import type { Consentimiento } from "@/lib/privacidad/consentimiento";
import type { RegistroNovedades } from "@/lib/privacidad/estado";
import type { EstadoConsentimiento } from "@/lib/privacidad/usar-consentimiento";
import type { Persona } from "@/lib/sesion/personas";

export type EstadoSesion = "cargando" | "sin-sesion" | "sin-acceso" | "error" | "ok";

/** Lo que devuelve `/api/sesion`. */
export type SesionCliente = Persona & {
  idPersona: string;
  personaId?: string | null;
  /** Claves que `idPersona` tuvo antes para esta persona (login-neon-auth, design §4); se copian una vez a la nueva. */
  clavesAnteriores?: string[];
  /** Nombre que trae el proveedor (por ejemplo de Google), si lo trae. */
  nombre?: string | null;
};

/** Lo que usamos de la identidad del proveedor de login (el SDK de Privy solo se importa en `privy-puente.tsx`). */
export type IdentidadMinima = {
  proveedor: "privy";
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
  /** ¿Hay un login disponible en este despliegue (Privy configurado, o `NEXT_PUBLIC_LH_LOGIN=neon-auth`)? */
  loginDisponible: boolean;
  /**
   * Abre el paso con las casillas de consentimiento ("Crear tu cuenta" o "Entrar"). El login (Privy, o "Entrar como…" en el
   * modo de prueba) solo se abre desde ese paso, al aceptar. `alAceptar` corre antes de abrir el login; al cancelar no corre nada.
   */
  entrar: (opciones?: { modo?: "alta" | "entrar"; alAceptar?: () => void }) => void;
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
  /**
   * Lo que el servidor guardó del consentimiento de la persona (constancia, novedades) y si dio el de datos sensibles (KYC).
   * Se carga una vez con la sesión; `aceptarEnServidor` y compañía lo actualizan (`lib/privacidad/consentimiento.ts`).
   */
  detalleConsentimiento: {
    registro: Consentimiento | null;
    novedades: RegistroNovedades | null;
    sensibles: boolean;
  };
  /** ¿Falló guardar la aceptación que la persona dio en el paso, al entrar? La pantalla de consentimiento lo avisa. */
  falloAceptacionPrevia: boolean;
  /** Tribu que lidera (Plan Tribu), o null. */
  tribuLider: string | null;
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

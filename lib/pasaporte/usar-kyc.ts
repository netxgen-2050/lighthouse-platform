"use client";

import { useCallback, useEffect, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { DATOS_VACIOS, type DatosPersona } from "./datos";
import { leerPasaporteDelNavegador } from "./del-navegador";
import { aprobarKyc, datosDesdeBorrador, enviarKyc, KYC_VACIO, leerKycDelNavegador, type BorradorKyc, type EstadoKyc } from "./kyc";

/**
 * Trámite de identidad (simulado) guardado en el navegador. `cargado` es falso hasta leer lo guardado,
 * para no ofrecer el trámite a quien ya lo hizo.
 */
export function useKyc() {
  const [kyc, setKyc] = useState<EstadoKyc>(KYC_VACIO);
  const [datos, setDatos] = useState<DatosPersona>(DATOS_VACIOS);
  const [cargado, setCargado] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setKyc(leerKycDelNavegador(CLAVES.kyc));
    setDatos(leerPasaporteDelNavegador());
    setCargado(true);
  }, []);

  const guardarKyc = useCallback((siguiente: EstadoKyc): boolean => {
    try {
      window.localStorage.setItem(CLAVES.kyc, JSON.stringify(siguiente));
    } catch {
      setFalloAlmacen(true);
      return false;
    }
    setFalloAlmacen(false);
    setKyc(siguiente);
    return true;
  }, []);

  /** Guarda lo cargado en "Tus datos" y deja el trámite en curso. false si el navegador no deja guardar. */
  const enviar = useCallback(
    (borrador: BorradorKyc): boolean => {
      const nuevos = datosDesdeBorrador(borrador, leerPasaporteDelNavegador());
      try {
        window.localStorage.setItem(CLAVES.pasaporte, JSON.stringify(nuevos));
      } catch {
        setFalloAlmacen(true);
        return false;
      }
      if (!guardarKyc(enviarKyc(new Date()))) return false;
      setDatos(nuevos);
      return true;
    },
    [guardarKyc],
  );

  /** Aprobación simulada: solo existe en el prototipo. */
  const aprobar = useCallback(() => guardarKyc(aprobarKyc(kyc, new Date())), [guardarKyc, kyc]);

  return { kyc, datos, cargado, falloAlmacen, enviar, aprobar, verificada: kyc.estado === "aprobado" };
}

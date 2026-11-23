"use client";

import { useEffect, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { opciones as opcionesDe, type Opcion } from "@/lib/fogon/datos";
import {
  decisionesVisibles,
  INICIAL,
  leer,
  llevarAlConsejo,
  SIN_CONDICION,
  votar,
  type Condicion,
  type EstadoFogon,
} from "@/lib/fogon/estado";
import { agregar, guardarRegistros, leerRegistrosDelNavegador } from "@/lib/gobernanza/registros";
import { useParticipacion } from "@/lib/gobernanza/usar-participacion";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import { leerEstadoGuardado } from "@/lib/sesion/nivel";

// Todo queda solo en este navegador: no hay pedidos de red.

/** El estado del Fogón (votos, almacenamiento, participación, voto y "Llevar al consejo"), compartido por la lista del holón. */
export function useFogon() {
  const idioma = useIdioma();
  const t = useTextos("fogon");
  const OPCIONES = opcionesDe(idioma);
  const [estado, setEstado] = useState<EstadoFogon>(INICIAL);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listoPropio, setListo] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [condicionBase, setCondicion] = useState<Condicion>(SIN_CONDICION);
  // La adhesión al manifiesto la resuelve la regla única (`puedeParticiparEnGobernanza`); hasta leer lo guardado no se
  // muestra ni la acción ni el aviso.
  const participacion = useParticipacion();
  const listo = listoPropio && participacion.listo;
  const condicion: Condicion = { ...condicionBase, adhirio: participacion.puede };

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const sumarte = leerEstadoGuardado(window.localStorage);
      // La tribu que lidera sale de lo elegido en Sumarte (Plan Tribu); sin tribu elegida no lidera ninguna.
      const lidera = sumarte.tribu ? sumarte.tribuId : null;
      setCondicion({ residencia: leerPasaporteDelNavegador().residencia, lidera, adhirio: false });
      setEstado(leer(window.localStorage.getItem(CLAVES.fogon)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  function guardar(siguiente: EstadoFogon): boolean {
    try {
      window.localStorage.setItem(CLAVES.fogon, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
      return false;
    }
    setEstado(siguiente);
    return true;
  }

  function anunciar(texto: string) {
    // Se vacía primero y se escribe en el próximo tick: si el texto es igual al anterior (mismo voto
    // repetido), React no tocaría el DOM y el lector de pantalla no anunciaría nada.
    setAnuncio("");
    setTimeout(() => setAnuncio(texto), 50);
  }

  function elegir(id: string, opcion: Opcion) {
    const d = decisionesVisibles(estado).find((x) => x.id === id);
    if (!d || !guardar(votar(estado, id, opcion, condicion))) return;
    setAbierta(null);
    const etiqueta = OPCIONES.find((o) => o.id === opcion)!.etiqueta;
    const titulo = textoEn(d.titulo, idioma);
    anunciar(d.destino ? t.anuncioRecomendacion(etiqueta, titulo) : t.anuncioVoto(etiqueta, titulo));
    // El grupo de opciones se cierra: el foco vuelve al botón que lo abrió, en la misma decisión.
    document.getElementById(`abrir-${id}`)?.focus();
  }

  function llevar(id: string) {
    const siguiente = llevarAlConsejo(estado, id, condicion);
    const d = decisionesVisibles(estado).find((x) => x.id === id);
    if (siguiente === estado || !d?.tribuId || !guardar(siguiente)) return;
    // Registro con forma de attestation: la tribu afirma que llevó esta decisión. Solo en este navegador.
    guardarRegistros(
      agregar(leerRegistrosDelNavegador(), { esquema: "lleva-al-consejo", afirma: d.tribuId, sobre: id, datos: { titulo: d.titulo.es } }, new Date().toISOString()),
    );
    anunciar(t.llevaste(textoEn(d.titulo, idioma)));
    // El botón desaparece: el foco pasa al título de la decisión.
    document.getElementById(`dec-${id}`)?.focus();
  }

  return { estado, condicion, listo, participacion, falloAlmacen, anuncio, abierta, setAbierta, elegir, llevar };
}

export type FogonUsado = ReturnType<typeof useFogon>;

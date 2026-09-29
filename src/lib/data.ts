import {
  EFECTOS,
  FORMAS,
  INSUMO_LIST,
  KIT_IDS,
  LARGOS,
  TIEMPOS,
  freshInsumos,
  freshSet,
  freshTiempos,
  type Insumos,
  type SetState,
  type Tiempos,
} from "./defaults";
import type { Nivel } from "./calc";

export type Tema = "auto" | "claro" | "oscuro";

export interface Ajustes {
  tarifa: number;
  ganancia: number;
  tema: Tema;
}

export interface SetGuardado {
  id: string;
  nombre: string;
  /** ISO */
  fecha: string;
  precio: number;
  minutos: number;
  nivel: Nivel;
  set: SetState;
}

export interface AppData {
  version: 1;
  insumos: Insumos;
  tiempos: Tiempos;
  ajustes: Ajustes;
  actual: SetState;
  nombreActual: string;
  /** id del set guardado que estoy editando, si abrí uno */
  editandoId: string | null;
  sets: SetGuardado[];
}

export const STORAGE_KEY = "kora-press-v1";

export function freshData(): AppData {
  return {
    version: 1,
    insumos: freshInsumos(),
    tiempos: freshTiempos(),
    ajustes: { tarifa: 25000, ganancia: 60, tema: "auto" },
    actual: freshSet(),
    nombreActual: "",
    editandoId: null,
    sets: [],
  };
}

// ---------- saneamiento: todo lo que entra de localStorage o de un respaldo pasa por aquí ----------

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number, min = 0, max = Number.MAX_SAFE_INTEGER): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
const int = (v: unknown, d: number, min: number, max: number): number => Math.round(num(v, d, min, max));
const bool = (v: unknown, d: boolean): boolean => (typeof v === "boolean" ? v : d);
const oneOf = <T extends string>(v: unknown, opts: readonly T[], d: T): T => (opts.includes(v as T) ? (v as T) : d);

export function sanitizeInsumos(v: unknown): Insumos {
  const out = freshInsumos();
  if (!isObj(v)) return out;
  for (const d of INSUMO_LIST) {
    const i = v[d.id];
    if (!isObj(i)) continue;
    out[d.id] = { p: num(i.p, d.p), r: num(i.r, d.r, 0), c: bool(i.c, d.c) };
  }
  return out;
}

export function sanitizeTiempos(v: unknown): Tiempos {
  const out = freshTiempos();
  if (!isObj(v)) return out;
  for (const t of TIEMPOS) out[t.id] = num(v[t.id], t.m, 0, 1000);
  return out;
}

export function sanitizeSet(v: unknown, tarifa = 25000, ganancia = 60): SetState {
  const d = freshSet(tarifa, ganancia);
  if (!isObj(v)) return d;
  const ef = isObj(v.ef) ? v.ef : {};
  const art = isObj(v.art) ? v.art : {};
  const kit = isObj(v.kit) ? v.kit : {};
  const s: SetState = {
    forma: oneOf(v.forma, FORMAS.map((f) => f.id), d.forma),
    largo: oneOf(v.largo, LARGOS.map((l) => l.id), d.largo),
    tipsExtra: int(v.tipsExtra, d.tipsExtra, 0, 10),
    porosidad: bool(v.porosidad, d.porosidad),
    basecoat: bool(v.basecoat, d.basecoat),
    rubber: bool(v.rubber, d.rubber),
    colores: int(v.colores, d.colores, 0, 12),
    capas: int(v.capas, d.capas, 1, 4),
    ef: { ...d.ef },
    art: { n1: int(art.n1, 0, 0, 10), n2: int(art.n2, 0, 0, 10), n3: int(art.n3, 0, 0, 10) },
    fig3d: int(v.fig3d, 0, 0, 99),
    charms: int(v.charms, 0, 0, 99),
    perlas: int(v.perlas, 0, 0, 10),
    acabado: oneOf(v.acabado, ["brillo", "mate"] as const, d.acabado),
    kit: {},
    tarifa: num(v.tarifa, d.tarifa),
    ganancia: num(v.ganancia, d.ganancia, 20, 150),
    ajusteMin: typeof v.ajusteMin === "number" && v.ajusteMin > 0 ? v.ajusteMin : null,
    envio: num(v.envio, 0),
  };
  for (const e of EFECTOS) s.ef[e.id] = int(ef[e.id], 0, 0, 10);
  for (const id of KIT_IDS) s.kit[id] = bool(kit[id], true);
  return s;
}

function sanitizeSets(v: unknown): SetGuardado[] {
  if (!Array.isArray(v)) return [];
  const niveles: Nivel[] = ["Esencial", "Detallado", "De autor", "Obra"];
  return v.filter(isObj).map((x, i) => ({
    id: typeof x.id === "string" || typeof x.id === "number" ? String(x.id) : `set-${Date.now()}-${i}`,
    nombre: typeof x.nombre === "string" && x.nombre.trim() ? x.nombre : "Sin nombre",
    fecha: typeof x.fecha === "string" ? x.fecha : new Date().toISOString(),
    precio: num(x.precio, 0),
    minutos: num(x.minutos, 0),
    nivel: oneOf(x.nivel, niveles, "Esencial"),
    set: sanitizeSet(x.set),
  }));
}

export function sanitizeData(v: unknown): AppData {
  const d = freshData();
  if (!isObj(v)) return d;
  const aj = isObj(v.ajustes) ? v.ajustes : {};
  const ajustes: Ajustes = {
    tarifa: num(aj.tarifa, d.ajustes.tarifa),
    ganancia: num(aj.ganancia, d.ajustes.ganancia, 20, 150),
    tema: oneOf(aj.tema, ["auto", "claro", "oscuro"] as const, "auto"),
  };
  const sets = sanitizeSets(v.sets);
  const editandoId = typeof v.editandoId === "string" && sets.some((s) => s.id === v.editandoId) ? v.editandoId : null;
  return {
    version: 1,
    insumos: sanitizeInsumos(v.insumos),
    tiempos: sanitizeTiempos(v.tiempos),
    ajustes,
    actual: sanitizeSet(v.actual, ajustes.tarifa, ajustes.ganancia),
    nombreActual: typeof v.nombreActual === "string" ? v.nombreActual : "",
    editandoId,
    sets,
  };
}

// ---------- respaldo JSON ----------

export interface Respaldo {
  app: "kora-ritual-press";
  exportado: string;
  datos: AppData;
}

export function crearRespaldo(data: AppData, ahora = new Date()): string {
  const r: Respaldo = { app: "kora-ritual-press", exportado: ahora.toISOString(), datos: data };
  return JSON.stringify(r, null, 2);
}

export function leerRespaldo(texto: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(texto);
  } catch {
    throw new Error("El archivo no es un JSON válido.");
  }
  if (!isObj(parsed) || parsed.app !== "kora-ritual-press" || !isObj(parsed.datos)) {
    throw new Error("Este archivo no es un respaldo de KŌRA Press.");
  }
  return sanitizeData(parsed.datos);
}

// ---------- localStorage ----------

export function cargar(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeData(JSON.parse(raw)) : freshData();
  } catch {
    return freshData();
  }
}

export function guardar(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export type Forma = "almond" | "square" | "stiletto";
export type Largo = "corto" | "medio" | "largo" | "xl";
export type Acabado = "brillo" | "mate";

export const FORMAS: { id: Forma; n: string; d: string }[] = [
  { id: "almond", n: "Almond", d: "M20 180 L20 90 C20 40 45 8 60 8 C75 8 100 40 100 90 L100 180 Q100 196 84 196 L36 196 Q20 196 20 180 Z" },
  { id: "square", n: "Cuadrada", d: "M18 180 L18 30 Q18 14 34 14 L86 14 Q102 14 102 30 L102 180 Q102 196 86 196 L34 196 Q18 196 18 180 Z" },
  { id: "stiletto", n: "Stiletto", d: "M24 180 L24 110 C24 70 50 30 60 4 C70 30 96 70 96 110 L96 180 Q96 196 80 196 L40 196 Q24 196 24 180 Z" },
];

export const LARGOS: { id: Largo; n: string; mult: number }[] = [
  { id: "corto", n: "Corto", mult: 0.9 },
  { id: "medio", n: "Medio", mult: 1 },
  { id: "largo", n: "Largo", mult: 1.12 },
  { id: "xl", n: "XL", mult: 1.25 },
];
export const LARGO_MULT: Record<Largo, number> = Object.fromEntries(LARGOS.map((l) => [l.id, l.mult])) as Record<Largo, number>;

// ---------- Insumos ----------

export type InsumoId =
  | "tip_almond" | "tip_square" | "tip_stiletto"
  | "basecoat" | "rubber"
  | "gel_color" | "cateye" | "espejo" | "esponja" | "glitter" | "painting" | "topcoat"
  | "gel3d" | "charm" | "perla"
  | "glue" | "jelly" | "lima" | "buffer" | "pusher" | "crema" | "bolsa" | "display";

export interface InsumoDef {
  id: InsumoId;
  n: string;
  /** nombre corto para el kit */
  corto?: string;
  p: number;
  r: number;
  u: string;
  /** precio confirmado */
  c: boolean;
  kit?: boolean;
}

export interface InsumoGrupo {
  g: string;
  items: InsumoDef[];
}

export const INSUMOS: InsumoGrupo[] = [
  {
    g: "Tips",
    items: [
      { id: "tip_almond", n: "Tips almond x240", p: 18000, r: 240, u: "tips", c: true },
      { id: "tip_square", n: "Tips cuadrados x240", p: 18000, r: 240, u: "tips", c: true },
      { id: "tip_stiletto", n: "Tips stiletto x240", p: 18000, r: 240, u: "tips", c: true },
    ],
  },
  {
    g: "Base",
    items: [
      { id: "basecoat", n: "Base coat 8 ml", p: 17500, r: 25, u: "sets", c: true },
      { id: "rubber", n: "Base rubber 15 ml", p: 38000, r: 20, u: "sets", c: true },
    ],
  },
  {
    g: "Color y efectos",
    items: [
      { id: "gel_color", n: "Gel de color (precio promedio)", p: 18500, r: 50, u: "sets", c: true },
      { id: "cateye", n: "Gel ojo de gato", p: 17500, r: 50, u: "sets", c: false },
      { id: "espejo", n: "Polvo espejo (caja de 6)", p: 9098, r: 60, u: "sets", c: true },
      { id: "esponja", n: "Esponjas x100", p: 7489, r: 100, u: "unidades", c: true },
      { id: "glitter", n: "Glitter", p: 15000, r: 100, u: "sets", c: false },
      { id: "painting", n: "Gel painting", p: 17500, r: 100, u: "sets", c: false },
      { id: "topcoat", n: "Top coat", p: 17500, r: 50, u: "sets", c: false },
    ],
  },
  {
    g: "Relieve",
    items: [
      { id: "gel3d", n: "Gel 3D para esculpir", p: 25000, r: 80, u: "figuras", c: false },
      { id: "charm", n: "Charms y piezas metálicas", p: 15000, r: 100, u: "piezas", c: false },
      { id: "perla", n: "Microperlas", p: 10000, r: 50, u: "uñas", c: false },
    ],
  },
  {
    g: "Kit",
    items: [
      { id: "glue", n: "Nail glue", corto: "Nail glue", p: 27336, r: 30, u: "unidades", c: true, kit: true },
      { id: "jelly", n: "Jelly adhesive", corto: "Jelly adhesive", p: 2164, r: 10, u: "sachets", c: true, kit: true },
      { id: "lima", n: "Lima", corto: "Lima", p: 6484, r: 100, u: "unidades", c: true, kit: true },
      { id: "buffer", n: "Buffer", corto: "Buffer", p: 15242, r: 100, u: "unidades", c: true, kit: true },
      { id: "pusher", n: "Cuticle pusher", corto: "Cuticle pusher", p: 7590, r: 100, u: "unidades", c: true, kit: true },
      { id: "crema", n: "Crema de manos peach", corto: "Crema de manos peach", p: 8696, r: 20, u: "unidades", c: true, kit: true },
      { id: "bolsa", n: "Bolsa con diseño", corto: "Bolsa con diseño", p: 19805, r: 50, u: "unidades", c: true, kit: true },
      { id: "display", n: "Display artesanal y logo en vinilo", corto: "Display y logo en vinilo", p: 5000, r: 50, u: "unidades", c: false, kit: true },
    ],
  },
];

export const INSUMO_LIST: InsumoDef[] = INSUMOS.flatMap((g) => g.items);
export const KIT_IDS: InsumoId[] = INSUMO_LIST.filter((i) => i.kit).map((i) => i.id);

export interface Insumo {
  p: number;
  r: number;
  c: boolean;
}
export type Insumos = Record<InsumoId, Insumo>;

export function freshInsumos(): Insumos {
  const o = {} as Insumos;
  for (const i of INSUMO_LIST) o[i.id] = { p: i.p, r: i.r, c: i.c };
  return o;
}

// ---------- Tiempos ----------

export type TiempoId =
  | "prep" | "porosidad" | "basecoat" | "rubber" | "colorCapa" | "colorExtra"
  | "cateye" | "espejo" | "aura" | "glitter" | "marble" | "french"
  | "n1" | "n2" | "n3" | "fig3d" | "charm" | "perlas" | "top" | "kit";

export const TIEMPOS: { id: TiempoId; n: string; m: number; w: string; g: string }[] = [
  { id: "prep", n: "Tallas y preparación", m: 10, w: "por set", g: "Preparación y base" },
  { id: "porosidad", n: "Porosidad y limpieza del tip", m: 5, w: "por set", g: "Preparación y base" },
  { id: "basecoat", n: "Base coat y curado", m: 6, w: "por set", g: "Preparación y base" },
  { id: "rubber", n: "Base rubber y curado", m: 8, w: "por set", g: "Preparación y base" },
  { id: "colorCapa", n: "Capa de color (10 uñas)", m: 8, w: "por capa", g: "Color" },
  { id: "colorExtra", n: "Cada color adicional", m: 4, w: "por color", g: "Color" },
  { id: "cateye", n: "Ojo de gato", m: 2, w: "por uña", g: "Efectos" },
  { id: "espejo", n: "Espejo o cromado", m: 3, w: "por uña", g: "Efectos" },
  { id: "aura", n: "Aura u ombré", m: 3, w: "por uña", g: "Efectos" },
  { id: "glitter", n: "Glitter", m: 2, w: "por uña", g: "Efectos" },
  { id: "marble", n: "Marmoleado", m: 6, w: "por uña", g: "Efectos" },
  { id: "french", n: "French o curvas", m: 5, w: "por uña", g: "Efectos" },
  { id: "n1", n: "Nail art sencillo", m: 4, w: "por uña", g: "Nail art" },
  { id: "n2", n: "Nail art detallado", m: 10, w: "por uña", g: "Nail art" },
  { id: "n3", n: "Ilustración", m: 30, w: "por uña", g: "Nail art" },
  { id: "fig3d", n: "Figura 3D", m: 15, w: "por figura", g: "Relieve" },
  { id: "charm", n: "Charm o pieza metálica", m: 2, w: "por pieza", g: "Relieve" },
  { id: "perlas", n: "Microperlas", m: 5, w: "por uña", g: "Relieve" },
  { id: "top", n: "Top coat y curado final", m: 10, w: "por set", g: "Acabado y kit" },
  { id: "kit", n: "Armado del kit", m: 10, w: "por set", g: "Acabado y kit" },
];
export type Tiempos = Record<TiempoId, number>;

export function freshTiempos(): Tiempos {
  const o = {} as Tiempos;
  for (const t of TIEMPOS) o[t.id] = t.m;
  return o;
}

// ---------- Set ----------

export type EfectoId = "cateye" | "espejo" | "aura" | "glitter" | "marble" | "french";
export const EFECTOS: { id: EfectoId; n: string; s?: string }[] = [
  { id: "cateye", n: "Ojo de gato" },
  { id: "espejo", n: "Espejo o cromado" },
  { id: "aura", n: "Aura u ombré con esponja", s: "Usa 2 esponjas por set" },
  { id: "glitter", n: "Glitter" },
  { id: "marble", n: "Marmoleado" },
  { id: "french", n: "French o curvas" },
];

export interface SetState {
  forma: Forma;
  largo: Largo;
  tipsExtra: number;
  porosidad: boolean;
  basecoat: boolean;
  rubber: boolean;
  colores: number;
  capas: number;
  ef: Record<EfectoId, number>;
  art: { n1: number; n2: number; n3: number };
  fig3d: number;
  charms: number;
  perlas: number;
  acabado: Acabado;
  kit: Partial<Record<InsumoId, boolean>>;
  tarifa: number;
  ganancia: number;
  /** minutos reales; null = usar el estimado */
  ajusteMin: number | null;
  envio: number;
}

export function freshSet(tarifa = 25000, ganancia = 60): SetState {
  const kit: SetState["kit"] = {};
  for (const id of KIT_IDS) kit[id] = true;
  return {
    forma: "almond",
    largo: "medio",
    tipsExtra: 0,
    porosidad: true,
    basecoat: true,
    rubber: true,
    colores: 2,
    capas: 2,
    ef: { cateye: 0, espejo: 0, aura: 0, glitter: 0, marble: 0, french: 0 },
    art: { n1: 0, n2: 0, n3: 0 },
    fig3d: 0,
    charms: 0,
    perlas: 0,
    acabado: "brillo",
    kit,
    tarifa,
    ganancia,
    ajusteMin: null,
    envio: 0,
  };
}

export const TARIFA_ATAJOS = [15000, 25000, 40000];

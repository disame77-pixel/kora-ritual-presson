import { KIT_IDS, LARGO_MULT, type InsumoId, type Insumos, type SetState, type Tiempos } from "./defaults";

export type Nivel = "Esencial" | "Detallado" | "De autor" | "Obra";

export interface Resultado {
  /** insumos del set (sin kit) */
  insumos: number;
  kit: number;
  /** minutos estimados, redondeados */
  estimado: number;
  /** minutos usados: tiempo real si lo llené, si no el estimado */
  minutos: number;
  manoObra: number;
  costoReal: number;
  ganancia: number;
  precioExacto: number;
  /** precio redondeado hacia arriba a múltiplos de 5.000, sin envío */
  precioRedondo: number;
  envio: number;
  /** precio redondo + envío */
  precioSugerido: number;
  horaReal: number;
  /** insumos + kit como fracción del precio redondo */
  pctInsumosKit: number;
  nivel: Nivel;
}

export const uso = (ins: Insumos, id: InsumoId): number => {
  const i = ins[id];
  return i && i.r > 0 ? i.p / i.r : 0;
};

export function nivelPorMinutos(min: number): Nivel {
  if (min >= 240) return "Obra";
  if (min >= 150) return "De autor";
  if (min >= 90) return "Detallado";
  return "Esencial";
}

export function hayKit(s: SetState): boolean {
  return KIT_IDS.some((id) => s.kit[id]);
}

export function costoInsumos(s: SetState, ins: Insumos): number {
  const u = (id: InsumoId) => uso(ins, id);
  const gel = u("gel_color");

  const tips = u(`tip_${s.forma}` as InsumoId) * (10 + s.tipsExtra);
  const base = (s.basecoat ? u("basecoat") : 0) + (s.rubber ? u("rubber") : 0);
  const color = gel * s.colores * (s.capas / 2);

  const e = s.ef;
  const efectos =
    (u("cateye") * e.cateye) / 10 +
    (u("espejo") * e.espejo) / 10 +
    (gel * 0.3 * e.aura) / 10 +
    (e.aura > 0 ? 2 * u("esponja") : 0) +
    (u("glitter") * e.glitter) / 10 +
    (gel * 0.3 * e.marble) / 10 +
    (gel * 0.5 * e.french) / 10;

  const a = s.art;
  const nailArt = (u("painting") * (0.5 * a.n1 + a.n2 + 2 * a.n3)) / 10 + gel * 0.2 * a.n3;

  const relieve = s.fig3d * u("gel3d") + s.charms * u("charm") + s.perlas * u("perla");

  return tips + base + color + efectos + nailArt + relieve + u("topcoat");
}

export function costoKit(s: SetState, ins: Insumos): number {
  return KIT_IDS.reduce((sum, id) => sum + (s.kit[id] ? uso(ins, id) : 0), 0);
}

/** minutos estimados sin redondear */
export function tiempoEstimado(s: SetState, t: Tiempos): number {
  let m = t.prep + (s.porosidad ? t.porosidad : 0) + (s.basecoat ? t.basecoat : 0) + (s.rubber ? t.rubber : 0);
  if (s.colores > 0) m += t.colorCapa * s.capas + t.colorExtra * (s.colores - 1);
  const e = s.ef;
  m += e.cateye * t.cateye + e.espejo * t.espejo + e.aura * t.aura + e.glitter * t.glitter + e.marble * t.marble + e.french * t.french;
  m += s.art.n1 * t.n1 + s.art.n2 * t.n2 + s.art.n3 * t.n3;
  m += s.fig3d * t.fig3d + s.charms * t.charm + s.perlas * t.perlas;
  m += t.top;
  m *= LARGO_MULT[s.largo];
  if (hayKit(s)) m += t.kit;
  return m;
}

export function calcular(s: SetState, ins: Insumos, t: Tiempos): Resultado {
  const insumos = costoInsumos(s, ins);
  const kit = costoKit(s, ins);
  const estimado = Math.round(tiempoEstimado(s, t));
  const minutos = s.ajusteMin && s.ajusteMin > 0 ? s.ajusteMin : estimado;
  const manoObra = (minutos / 60) * s.tarifa;
  const costoReal = insumos + kit + manoObra;
  const precioExacto = costoReal * (1 + s.ganancia / 100);
  // el -1e-9 evita que un error de coma flotante (40000,0000001) suba un escalón
  const precioRedondo = Math.ceil(precioExacto / 5000 - 1e-9) * 5000;
  const envio = s.envio > 0 ? s.envio : 0;
  const horaReal = minutos > 0 ? (precioRedondo - insumos - kit) / (minutos / 60) : 0;
  return {
    insumos,
    kit,
    estimado,
    minutos,
    manoObra,
    costoReal,
    ganancia: precioExacto - costoReal,
    precioExacto,
    precioRedondo,
    envio,
    precioSugerido: precioRedondo + envio,
    horaReal,
    pctInsumosKit: precioRedondo > 0 ? (insumos + kit) / precioRedondo : 0,
    nivel: nivelPorMinutos(minutos),
  };
}

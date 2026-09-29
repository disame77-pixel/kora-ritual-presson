import { describe, expect, it } from "vitest";
import { calcular, costoInsumos, costoKit, nivelPorMinutos, tiempoEstimado, uso } from "./calc";
import { freshInsumos, freshSet, freshTiempos, KIT_IDS, type SetState } from "./defaults";
import { hm } from "./format";

const ins = freshInsumos();
const t = freshTiempos();

/** Prueba de control: almond, largo, 3 colores, 2 capas, ojo de gato 4, aura 3,
 *  nail art sencillo 3 y detallado 2, una figura 3D, 2 charms, una uña con perlas,
 *  kit completo, $25.000 la hora y 60%. */
function setControl(): SetState {
  const s = freshSet(25000, 60);
  s.forma = "almond";
  s.largo = "largo";
  s.colores = 3;
  s.capas = 2;
  s.ef.cateye = 4;
  s.ef.aura = 3;
  s.art.n1 = 3;
  s.art.n2 = 2;
  s.fig3d = 1;
  s.charms = 2;
  s.perlas = 1;
  return s;
}

describe("prueba de control", () => {
  const r = calcular(setControl(), ins, t);

  it("tarda unos 2 h 42 min", () => {
    expect(r.estimado).toBe(162);
    expect(r.minutos).toBe(162);
    expect(hm(r.minutos)).toBe("2 h 42 min");
  });

  it("sugiere $125.000", () => {
    expect(r.precioRedondo).toBe(125000);
    expect(r.precioSugerido).toBe(125000);
  });

  it("desglose coherente", () => {
    expect(r.insumos).toBeCloseTo(6006.83, 2);
    expect(r.kit).toBeCloseTo(2351.66, 2);
    expect(r.manoObra).toBeCloseTo(67500, 6);
    expect(r.costoReal).toBeCloseTo(75858.49, 2);
    expect(r.precioExacto).toBeCloseTo(121373.584, 3);
    expect(r.ganancia).toBeCloseTo(r.precioExacto - r.costoReal, 6);
    expect(r.nivel).toBe("De autor");
    expect(r.horaReal).toBeCloseTo((125000 - r.insumos - r.kit) / (162 / 60), 6);
    expect(r.pctInsumosKit).toBeCloseTo((r.insumos + r.kit) / 125000, 6);
  });
});

describe("fórmulas de insumos", () => {
  it("uso = precio del lote / rinde, y 0 si el rinde es 0", () => {
    expect(uso(ins, "rubber")).toBe(1900);
    expect(uso({ ...ins, rubber: { p: 38000, r: 0, c: true } }, "rubber")).toBe(0);
  });

  it("tips = uso del tip de la forma × (10 + repuestos)", () => {
    const s = freshSet();
    s.basecoat = s.rubber = false;
    s.colores = 0;
    const base = costoInsumos(s, ins);
    s.forma = "stiletto";
    s.tipsExtra = 4;
    expect(costoInsumos(s, ins) - base).toBeCloseTo(75 * 4, 6);
  });

  it("color = uso(gel) × colores × capas/2", () => {
    const s = freshSet();
    const a = costoInsumos({ ...s, colores: 0 }, ins);
    const b = costoInsumos({ ...s, colores: 4, capas: 3 }, ins);
    expect(b - a).toBeCloseTo(370 * 4 * 1.5, 6);
  });

  it("aura suma 2 esponjas solo si hay alguna uña con aura", () => {
    const s = freshSet();
    const a = costoInsumos(s, ins);
    const b = costoInsumos({ ...s, ef: { ...s.ef, aura: 1 } }, ins);
    expect(b - a).toBeCloseTo(370 * 0.3 * 0.1 + 2 * 74.89, 6);
  });

  it("nail art = gel painting × (0,5 sencillo + detallado + 2 ilustración)/10 + gel × 0,2 × ilustración", () => {
    const s = freshSet();
    const a = costoInsumos(s, ins);
    const b = costoInsumos({ ...s, art: { n1: 2, n2: 1, n3: 1 } }, ins);
    expect(b - a).toBeCloseTo((175 * (1 + 1 + 2)) / 10 + 370 * 0.2, 6);
  });

  it("kit suma solo los ítems activos", () => {
    const s = freshSet();
    const total = costoKit(s, ins);
    s.kit.bolsa = false;
    expect(total - costoKit(s, ins)).toBeCloseTo(396.1, 6);
    for (const id of KIT_IDS) s.kit[id] = false;
    expect(costoKit(s, ins)).toBe(0);
  });
});

describe("tiempo", () => {
  it("sin kit no suma armado; el multiplicador de largo no toca el armado", () => {
    const s = freshSet();
    for (const id of KIT_IDS) s.kit[id] = false;
    s.largo = "xl";
    // 10+5+6+8 + 8*2 + 4*1 + 10 = 59 → ×1,25
    expect(tiempoEstimado(s, t)).toBeCloseTo(59 * 1.25, 6);
    s.kit.lima = true;
    expect(tiempoEstimado(s, t)).toBeCloseTo(59 * 1.25 + 10, 6);
  });

  it("sin colores no cuenta capas ni colores adicionales", () => {
    const s = freshSet();
    const conColor = tiempoEstimado(s, t);
    expect(conColor - tiempoEstimado({ ...s, colores: 0 }, t)).toBeCloseTo(20, 6);
  });

  it("el tiempo real reemplaza al estimado", () => {
    const s = setControl();
    s.ajusteMin = 200;
    const r = calcular(s, ins, t);
    expect(r.estimado).toBe(162);
    expect(r.minutos).toBe(200);
    expect(r.manoObra).toBeCloseTo((200 / 60) * 25000, 6);
    expect(r.nivel).toBe("De autor");
  });
});

describe("precio", () => {
  it("redondea hacia arriba a múltiplos de 5.000 y suma el envío al final", () => {
    const s = setControl();
    s.envio = 12000;
    const r = calcular(s, ins, t);
    expect(r.precioRedondo).toBe(125000);
    expect(r.precioSugerido).toBe(137000);
    expect(r.horaReal).toBeCloseTo((125000 - r.insumos - r.kit) / (162 / 60), 6);
  });

  it("múltiplo exacto no sube", () => {
    const s = freshSet();
    for (const id of KIT_IDS) s.kit[id] = false;
    const zero = freshInsumos();
    for (const k of Object.keys(zero) as (keyof typeof zero)[]) zero[k].p = 0;
    s.ajusteMin = 60;
    s.tarifa = 25000;
    s.ganancia = 60;
    expect(calcular(s, zero, t).precioRedondo).toBe(40000);
  });
});

describe("nivel por minutos", () => {
  it.each([
    [89, "Esencial"],
    [90, "Detallado"],
    [149, "Detallado"],
    [150, "De autor"],
    [239, "De autor"],
    [240, "Obra"],
  ] as const)("%i min → %s", (m, n) => expect(nivelPorMinutos(m)).toBe(n));
});

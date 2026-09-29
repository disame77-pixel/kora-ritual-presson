import { describe, expect, it } from "vitest";
import { crearRespaldo, freshData, leerRespaldo, sanitizeData } from "./data";

describe("respaldo JSON", () => {
  it("exporta e importa sin perder datos", () => {
    const d = freshData();
    d.insumos.cateye = { p: 21000, r: 40, c: true };
    d.tiempos.n3 = 45;
    d.ajustes.tarifa = 40000;
    d.actual.colores = 5;
    d.sets.push({ id: "a1", nombre: "Granada", fecha: "2026-09-29T12:00:00.000Z", precio: 125000, minutos: 162, nivel: "De autor", set: d.actual });
    const back = leerRespaldo(crearRespaldo(d));
    expect(back).toEqual(d);
  });

  it("rechaza archivos que no son respaldos", () => {
    expect(() => leerRespaldo("hola")).toThrow(/JSON/);
    expect(() => leerRespaldo('{"a":1}')).toThrow(/respaldo/);
  });

  it("completa y limita valores raros", () => {
    const d = sanitizeData({ actual: { colores: 99, capas: 0, forma: "redonda", ef: { cateye: -3 } }, ajustes: { ganancia: 500 } });
    expect(d.actual.colores).toBe(12);
    expect(d.actual.capas).toBe(1);
    expect(d.actual.forma).toBe("almond");
    expect(d.actual.ef.cateye).toBe(0);
    expect(d.ajustes.ganancia).toBe(150);
    expect(d.insumos.gel_color.p).toBe(18500);
  });
});

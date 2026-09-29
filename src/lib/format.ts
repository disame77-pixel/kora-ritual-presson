const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** $125.000 */
export const cop = (n: number): string => "$" + nf.format(Math.round(n));

/** 2 h 42 min */
export function hm(min: number): string {
  const total = Math.round(min);
  const h = Math.floor(total / 60);
  const r = total % 60;
  if (!h) return `${r} min`;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export const pct = (f: number): string => `${Math.round(f * 100)}%`;

export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

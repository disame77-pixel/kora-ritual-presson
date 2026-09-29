import { INSUMOS, freshInsumos } from "../lib/defaults";
import { uso } from "../lib/calc";
import { cop } from "../lib/format";
import { useStore } from "../store";
import { NumberField, Panel } from "../components/ui";

export function Insumos() {
  const { data, update } = useStore();
  const pendientes = Object.values(data.insumos).filter((i) => !i.c).length;

  return (
    <div className="space-y-3">
      <Panel
        title="Mis insumos"
        intro={
          <>
            Lo que pagué por el lote y cuánto me rinde. De ahí sale el costo por uso. Cuando cambio un precio, deja de estar «por confirmar».
            {pendientes > 0 && <> Me faltan {pendientes} por confirmar.</>}
          </>
        }
      />

      {INSUMOS.map((g) => (
        <Panel key={g.g} title={g.g}>
          <ul className="mt-1">
            {g.items.map((d) => {
              const i = data.insumos[d.id];
              return (
                <li key={d.id} className="border-t border-line py-3 first:border-t-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="leading-snug">{d.n}</p>
                    {i.c ? (
                      <span className="shrink-0 rounded-full bg-ok/12 px-2.5 py-0.5 text-xs text-ok">Precio real</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-warn/12 px-2.5 py-0.5 text-xs text-warn">Por confirmar</span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_1fr] gap-2">
                    <div>
                      <p className="mb-1 text-xs text-soft">Precio del lote</p>
                      <NumberField
                        label={`Precio del lote de ${d.n}`}
                        value={i.p}
                        step={100}
                        onChange={(v) =>
                          update((x) => {
                            x.insumos[d.id].p = v ?? 0;
                            x.insumos[d.id].c = true;
                          })
                        }
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-soft">Rinde</p>
                      <NumberField label={`Rendimiento de ${d.n}`} value={i.r} suffix={d.u} onChange={(v) => update((x) => void (x.insumos[d.id].r = v ?? 0))} />
                    </div>
                  </div>
                  <p className="tabular mt-1.5 text-right text-sm text-soft">
                    {i.r > 0 ? (
                      <>
                        Costo por uso <strong className="font-semibold text-ink">{cop(uso(data.insumos, d.id))}</strong>
                      </>
                    ) : (
                      <span className="text-warn">El rinde tiene que ser mayor que 0</span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}

      <div className="px-1 pt-2">
        <button
          type="button"
          className="min-h-11 text-sm text-soft underline underline-offset-4"
          onClick={() => {
            if (confirm("¿Vuelvo todos los insumos a los precios y rendimientos iniciales?")) update((x) => void (x.insumos = freshInsumos()));
          }}
        >
          Restaurar insumos iniciales
        </button>
      </div>
    </div>
  );
}

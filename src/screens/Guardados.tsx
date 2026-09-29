import { FORMAS, LARGOS } from "../lib/defaults";
import { cop, fechaCorta, hm } from "../lib/format";
import { useStore } from "../store";
import { NailShape, Panel } from "../components/ui";

export function Guardados({ onOpen }: { onOpen: () => void }) {
  const { data, update } = useStore();

  if (!data.sets.length) {
    return (
      <Panel title="Sets guardados">
        <p className="py-6 text-soft">Todavía no hay sets guardados. Cuando cotizo uno y le pongo nombre, aparece aquí.</p>
      </Panel>
    );
  }

  const abrir = (id: string) => {
    const g = data.sets.find((x) => x.id === id);
    if (!g) return;
    update((d) => {
      d.actual = structuredClone(g.set);
      d.nombreActual = g.nombre;
      d.editandoId = g.id;
    });
    onOpen();
  };

  const duplicar = (id: string) => {
    update((d) => {
      const i = d.sets.findIndex((x) => x.id === id);
      if (i < 0) return;
      const g = d.sets[i];
      const copia = {
        ...structuredClone(g),
        id: crypto.randomUUID ? crypto.randomUUID() : `set-${Date.now()}`,
        nombre: `${g.nombre} (copia)`,
        fecha: new Date().toISOString(),
      };
      d.sets.splice(i, 0, copia);
    });
  };

  const eliminar = (id: string, nombre: string) => {
    if (!confirm(`¿Elimino «${nombre}»? No se puede deshacer.`)) return;
    update((d) => {
      d.sets = d.sets.filter((x) => x.id !== id);
      if (d.editandoId === id) d.editandoId = null;
    });
  };

  const accion = "min-h-11 flex-1 rounded-full border border-line px-3 text-[15px] active:bg-seed/30";

  return (
    <div className="space-y-3">
      <h2 className="px-1 font-serif text-2xl font-semibold">
        Sets guardados <span className="tabular text-soft">· {data.sets.length}</span>
      </h2>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {data.sets.map((g) => {
          const forma = FORMAS.find((f) => f.id === g.set.forma)!;
          const largo = LARGOS.find((l) => l.id === g.set.largo)!;
          return (
            <li key={g.id} className="min-w-0 rounded-2xl border border-line bg-card p-4">
              <div className="flex items-start gap-3">
                <NailShape d={forma.d} className="mt-1 h-9 w-5 shrink-0 text-pom" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-xl leading-tight font-semibold">{g.nombre}</p>
                  <p className="text-sm text-soft">
                    {g.nivel} · {hm(g.minutos)} · {forma.n} {largo.n.toLowerCase()}
                  </p>
                  <p className="text-xs text-soft">{fechaCorta(g.fecha)}</p>
                </div>
                <p className="tabular shrink-0 font-serif text-2xl leading-none">{cop(g.precio)}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className={`${accion} border-pom bg-pom font-semibold text-white active:bg-pom`} onClick={() => abrir(g.id)}>
                  Abrir
                </button>
                <button type="button" className={accion} onClick={() => duplicar(g.id)}>
                  Duplicar
                </button>
                <button type="button" className={`${accion} text-pom`} onClick={() => eliminar(g.id, g.nombre)}>
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="px-1 text-xs text-soft">El precio guardado es el de ese momento. Si cambio insumos o tiempos, lo abro para ver el precio de hoy.</p>
    </div>
  );
}

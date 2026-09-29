import { LARGOS, TIEMPOS, freshTiempos } from "../lib/defaults";
import { useStore } from "../store";
import { NumberField, Panel } from "../components/ui";

const GRUPOS = [...new Set(TIEMPOS.map((t) => t.g))];

export function Tiempos() {
  const { data, update } = useStore();
  const mult = LARGOS.map((l) => `${l.n.toLowerCase()} ×${String(l.mult).replace(".", ",")}`).join(", ");

  return (
    <div className="space-y-3">
      <Panel
        title="Mis tiempos"
        intro={
          <>
            Minutos por técnica en largo medio. Cronometro un par de sets y ajusto, así el estimado se parece cada vez más a mi ritmo. El largo multiplica
            todo menos el armado del kit ({mult}).
          </>
        }
      />

      {GRUPOS.map((g) => (
        <Panel key={g} title={g}>
          <ul className="mt-1">
            {TIEMPOS.filter((t) => t.g === g).map((t) => (
              <li key={t.id} className="flex min-h-14 items-center justify-between gap-3 border-t border-line py-2 first:border-t-0">
                <div className="min-w-0">
                  <p className="leading-snug">{t.n}</p>
                  <p className="text-[13px] text-soft">{t.w}</p>
                </div>
                <NumberField
                  className="w-28 shrink-0"
                  label={`Minutos para ${t.n}`}
                  value={data.tiempos[t.id]}
                  suffix="min"
                  onChange={(v) => update((x) => void (x.tiempos[t.id] = v ?? 0))}
                />
              </li>
            ))}
          </ul>
        </Panel>
      ))}

      <div className="px-1 pt-2">
        <button
          type="button"
          className="min-h-11 text-sm text-soft underline underline-offset-4"
          onClick={() => {
            if (confirm("¿Vuelvo todos los tiempos a los valores iniciales?")) update((x) => void (x.tiempos = freshTiempos()));
          }}
        >
          Restaurar tiempos iniciales
        </button>
      </div>
    </div>
  );
}

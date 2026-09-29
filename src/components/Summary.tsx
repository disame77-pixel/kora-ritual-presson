import { useId, useState } from "react";
import { FORMAS, TARIFA_ATAJOS, freshSet } from "../lib/defaults";
import { cop, hm, pct } from "../lib/format";
import type { SetGuardado } from "../lib/data";
import { useStore } from "../store";
import { Chip, NumberField } from "./ui";

const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : `set-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function Summary({ onSaved }: { onSaved?: () => void }) {
  const { data, resultado: r, update } = useStore();
  const s = data.actual;
  const [aviso, setAviso] = useState("");
  const gradId = "g" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const editando = data.sets.find((x) => x.id === data.editandoId);
  const forma = FORMAS.find((f) => f.id === s.forma)!;

  const guardarSet = (comoNuevo: boolean) => {
    const nombre = data.nombreActual.trim();
    if (!nombre) {
      setAviso("Ponle un nombre al set para guardarlo.");
      return;
    }
    const id = !comoNuevo && editando ? editando.id : nuevoId();
    const g: SetGuardado = {
      id,
      nombre,
      fecha: new Date().toISOString(),
      precio: r.precioSugerido,
      minutos: r.minutos,
      nivel: r.nivel,
      set: structuredClone(s),
    };
    update((d) => {
      const i = d.sets.findIndex((x) => x.id === id);
      if (i >= 0) d.sets[i] = g;
      else d.sets.unshift(g);
      d.editandoId = id;
    });
    setAviso(!comoNuevo && editando ? `Actualicé «${nombre}».` : `Guardé «${nombre}».`);
    onSaved?.();
  };

  const empezarNuevo = () => {
    update((d) => {
      d.actual = freshSet(d.ajustes.tarifa, d.ajustes.ganancia);
      d.nombreActual = "";
      d.editandoId = null;
    });
    setAviso("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fuente = s.ajusteMin ? "con mi tiempo real" : `con el tiempo estimado de ${hm(r.estimado)}`;
  const line = "flex justify-between gap-3 py-1.5 text-[15px] tabular";

  return (
    <div className="text-bar-ink">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 120 200" className="w-14 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#C23A5C" />
              <stop offset="1" stopColor="#4A0B1D" />
            </linearGradient>
          </defs>
          <path fill={`url(#${gradId})`} d={forma.d} />
          <path fill="rgba(255,255,255,.5)" d="M34 60 C36 44 42 34 48 30 C44 44 42 62 42 90 L38 92 C35 80 34 70 34 60 Z" />
        </svg>
        <div>
          <p className="text-sm opacity-70">Precio sugerido del set</p>
          <p className="tabular font-serif text-5xl leading-none">{cop(r.precioSugerido)}</p>
          <p className="mt-2 inline-block rounded-full border border-bar-ink/30 px-3 py-0.5 text-sm">
            {r.nivel} · {hm(r.minutos)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-bar-ink/20 pt-2">
        <div className={line}>
          <span className="opacity-75">Insumos del set</span>
          <span>{cop(r.insumos)}</span>
        </div>
        <div className={line}>
          <span className="opacity-75">Kit y empaque</span>
          <span>{cop(r.kit)}</span>
        </div>
        <div className={line}>
          <span className="opacity-75">Mano de obra ({hm(r.minutos)})</span>
          <span>{cop(r.manoObra)}</span>
        </div>
        <div className={`${line} mt-1 border-t border-bar-ink/20 pt-2.5 font-semibold`}>
          <span>Costo real</span>
          <span>{cop(r.costoReal)}</span>
        </div>
        <div className={line}>
          <span className="opacity-75">Ganancia ({s.ganancia}%)</span>
          <span>{cop(r.ganancia)}</span>
        </div>
        <div className={line}>
          <span className="opacity-75">Precio exacto</span>
          <span>{cop(r.precioExacto)}</span>
        </div>
        {r.envio > 0 && (
          <div className={line}>
            <span className="opacity-75">Envío</span>
            <span>{cop(r.envio)}</span>
          </div>
        )}
      </div>

      <p className="mt-4 rounded-xl bg-bar-ink/10 px-3.5 py-3 text-[15px] leading-snug">
        Cobrando {cop(r.precioRedondo)}, {fuente}, mi hora queda en <strong>{cop(r.horaReal)}</strong>. Insumos y kit son el {pct(r.pctInsumosKit)} del
        precio.
      </p>

      <div className="mt-5">
        <p className="mb-2 text-sm opacity-80">Valor de mi hora</p>
        <div className="grid grid-cols-3 gap-2">
          {TARIFA_ATAJOS.map((v) => (
            <Chip key={v} tone="dark" pressed={s.tarifa === v} onClick={() => update((d) => void (d.actual.tarifa = v))} className="px-2 tabular">
              {cop(v)}
            </Chip>
          ))}
        </div>
        <NumberField
          tone="dark"
          className="mt-2"
          label="Valor de mi hora en pesos"
          value={s.tarifa}
          step={1000}
          onChange={(v) => update((d) => void (d.actual.tarifa = v ?? 0))}
          suffix="/ hora"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="ganancia" className="mb-1 flex justify-between text-sm opacity-80">
          <span>Ganancia sobre el costo</span>
          <span className="tabular font-semibold opacity-100">{s.ganancia}%</span>
        </label>
        <input
          id="ganancia"
          type="range"
          min={20}
          max={150}
          step={5}
          value={s.ganancia}
          onChange={(e) => update((d) => void (d.actual.ganancia = Number(e.target.value)))}
          className="h-11 w-full [accent-color:var(--k-seed)]"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-sm opacity-80">Tiempo real</p>
          <NumberField
            tone="dark"
            label="Tiempo real en minutos"
            value={s.ajusteMin}
            empty={null}
            placeholder={String(r.estimado)}
            step={5}
            suffix="min"
            onChange={(v) => update((d) => void (d.actual.ajusteMin = v && v > 0 ? v : null))}
          />
        </div>
        <div>
          <p className="mb-1 text-sm opacity-80">Envío</p>
          <NumberField
            tone="dark"
            label="Costo del envío"
            value={s.envio}
            placeholder="0"
            step={1000}
            onChange={(v) => update((d) => void (d.actual.envio = v ?? 0))}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-bar-ink/20 pt-4">
        <label className="flex h-11 items-center rounded-xl border border-bar-ink/25 bg-bar-ink/10 px-3 focus-within:border-seed">
          <span className="sr-only">Nombre del set</span>
          <input
            type="text"
            value={data.nombreActual}
            onChange={(e) => {
              const v = e.target.value;
              update((d) => void (d.nombreActual = v));
              setAviso("");
            }}
            placeholder="Nombre del set"
            enterKeyHint="done"
            className="w-full bg-transparent text-base text-bar-ink outline-none placeholder:text-bar-ink/50"
          />
        </label>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => guardarSet(false)} className="min-h-11 flex-1 rounded-full bg-seed px-4 font-semibold text-[#24161C] active:brightness-95">
            {editando ? "Actualizar set" : "Guardar set"}
          </button>
          {editando && (
            <button type="button" onClick={() => guardarSet(true)} className="min-h-11 rounded-full border border-bar-ink/30 px-4">
              Guardar copia
            </button>
          )}
        </div>
        <p className="mt-2 min-h-5 text-sm text-seed" role="status">
          {aviso}
        </p>
        <button type="button" onClick={empezarNuevo} className="mt-1 min-h-11 w-full rounded-full border border-bar-ink/30 px-4">
          Empezar un set nuevo
        </button>
      </div>
    </div>
  );
}

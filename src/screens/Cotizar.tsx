import { EFECTOS, FORMAS, INSUMO_LIST, KIT_IDS, LARGOS, type SetState } from "../lib/defaults";
import { uso } from "../lib/calc";
import { cop } from "../lib/format";
import { useStore } from "../store";
import { Chip, NailShape, Row, StepCard, Stepper, Switch } from "../components/ui";

export function Cotizar() {
  const { data, update } = useStore();
  const s = data.actual;
  const set = (fn: (s: SetState) => void) => update((d) => fn(d.actual));
  const totalArt = s.art.n1 + s.art.n2 + s.art.n3;

  /** stepper que suma sobre el estado más reciente, aunque toque muy rápido */
  const count = (label: string, get: (x: SetState) => number, put: (x: SetState, v: number) => void, max: number, min = 0) => (
    <Stepper label={label} value={get(s)} min={min} max={max} onStep={(d) => set((x) => put(x, Math.min(max, Math.max(min, get(x) + d))))} />
  );

  return (
    <div className="space-y-3">
      {data.editandoId && data.nombreActual && (
        <p className="px-1 text-sm text-soft">
          Editando <strong className="font-semibold text-ink">{data.nombreActual}</strong>
        </p>
      )}

      <StepCard n={1} title="Forma y largo" hint="La forma define el tip; el largo suma tiempo a todo el trabajo.">
        <div className="grid grid-cols-3 gap-2">
          {FORMAS.map((f) => (
            <Chip key={f.id} pressed={s.forma === f.id} onClick={() => set((x) => void (x.forma = f.id))} className="px-2">
              <NailShape d={f.d} className="h-5 w-3" />
              {f.n}
            </Chip>
          ))}
        </div>
        <p className="mt-4 mb-2 text-sm text-soft">Largo</p>
        <div className="grid grid-cols-4 gap-2">
          {LARGOS.map((l) => (
            <Chip key={l.id} pressed={s.largo === l.id} onClick={() => set((x) => void (x.largo = l.id))} className="px-2">
              {l.n}
            </Chip>
          ))}
        </div>
        <div className="mt-3">
          <Row label="Tips de repuesto" hint="Tallas extra que incluyo en el set">
            {count("Tips de repuesto", (x) => x.tipsExtra, (x, v) => void (x.tipsExtra = v), 10)}
          </Row>
        </div>
      </StepCard>

      <StepCard n={2} title="Preparación y base" hint="Sobre tip: sin limpieza de uña natural.">
        <Row label="Porosidad y limpieza del tip">
          <Switch label="Porosidad y limpieza del tip" checked={s.porosidad} onChange={(v) => set((x) => void (x.porosidad = v))} />
        </Row>
        <Row label="Base coat">
          <Switch label="Base coat" checked={s.basecoat} onChange={(v) => set((x) => void (x.basecoat = v))} />
        </Row>
        <Row label="Base rubber" hint="Nivelación y estructura">
          <Switch label="Base rubber" checked={s.rubber} onChange={(v) => set((x) => void (x.rubber = v))} />
        </Row>
      </StepCard>

      <StepCard n={3} title="Color" hint="Todos los geles cuentan al mismo precio promedio.">
        <Row label="Colores de gel" hint="Blanco, rojo y marrón cuentan como 3">
          {count("Colores de gel", (x) => x.colores, (x, v) => void (x.colores = v), 12)}
        </Row>
        <Row label="Capas de color">
          {count("Capas de color", (x) => x.capas, (x, v) => void (x.capas = v), 4, 1)}
        </Row>
      </StepCard>

      <StepCard n={4} title="Efectos" hint="Cuántas uñas llevan cada efecto. Una uña puede tener varios.">
        {EFECTOS.map((e) => (
          <Row key={e.id} label={e.n} hint={e.s}>
            {count(e.n, (x) => x.ef[e.id], (x, v) => void (x.ef[e.id] = v), 10)}
          </Row>
        ))}
      </StepCard>

      <StepCard n={5} title="Nail art a mano" hint="Cuántas uñas llevan diseño en cada nivel.">
        <Row label="Sencillo" hint="Líneas, puntos, letras, figuras planas">
          {count("Nail art sencillo", (x) => x.art.n1, (x, v) => void (x.art.n1 = v), 10)}
        </Row>
        <Row label="Detallado" hint="Estrellas delineadas, lazos pintados, logos de varias piezas">
          {count("Nail art detallado", (x) => x.art.n2, (x, v) => void (x.art.n2 = v), 10)}
        </Row>
        <Row label="Ilustración" hint="Personajes o escenas pintadas a mano">
          {count("Ilustración", (x) => x.art.n3, (x, v) => void (x.art.n3 = v), 10)}
        </Row>
        {totalArt > 10 && (
          <p className="mt-1 mb-1 rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn" role="alert">
            Van {totalArt} uñas con nail art y el set tiene 10. Reviso los conteos.
          </p>
        )}
      </StepCard>

      <StepCard n={6} title="Relieve y aplicaciones" hint="Todo lo que sobresale de la uña.">
        <Row label="Figuras 3D esculpidas" hint="Lazos, personajes, gatos en relieve">
          {count("Figuras 3D", (x) => x.fig3d, (x, v) => void (x.fig3d = v), 30)}
        </Row>
        <Row label="Charms y piezas metálicas" hint="Cuento piezas, no uñas">
          {count("Charms", (x) => x.charms, (x, v) => void (x.charms = v), 60)}
        </Row>
        <Row label="Uñas con microperlas" hint="Contornos o lazos de perlitas">
          {count("Uñas con microperlas", (x) => x.perlas, (x, v) => void (x.perlas = v), 10)}
        </Row>
      </StepCard>

      <StepCard n={7} title="Acabado y kit" hint="Top coat y lo que va dentro del empaque.">
        <div className="grid grid-cols-2 gap-2">
          <Chip pressed={s.acabado === "brillo"} onClick={() => set((x) => void (x.acabado = "brillo"))}>
            Top coat brillo
          </Chip>
          <Chip pressed={s.acabado === "mate"} onClick={() => set((x) => void (x.acabado = "mate"))}>
            Top coat mate
          </Chip>
        </div>
        <p className="mt-4 mb-1 text-sm text-soft">Kit incluido</p>
        {KIT_IDS.map((id) => {
          const d = INSUMO_LIST.find((i) => i.id === id)!;
          return (
            <Row key={id} label={d.corto ?? d.n} hint={<span className="tabular">{cop(uso(data.insumos, id))} por set</span>}>
              <Switch label={d.corto ?? d.n} checked={!!s.kit[id]} onChange={(v) => set((x) => void (x.kit[id] = v))} />
            </Row>
          );
        })}
      </StepCard>
    </div>
  );
}

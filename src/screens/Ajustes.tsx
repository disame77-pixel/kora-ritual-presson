import { useRef, useState } from "react";
import { TARIFA_ATAJOS } from "../lib/defaults";
import { crearRespaldo, leerRespaldo, type Tema } from "../lib/data";
import { cop } from "../lib/format";
import { useStore } from "../store";
import { Button, Chip, NumberField, Panel, Row } from "../components/ui";

const TEMAS: { id: Tema; n: string }[] = [
  { id: "auto", n: "Automático" },
  { id: "claro", n: "Claro" },
  { id: "oscuro", n: "Oscuro" },
];

export function Ajustes() {
  const { data, update, replace, guardadoOk } = useStore();
  const aj = data.ajustes;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const exportar = async () => {
    const nombre = `kora-press-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    const texto = crearRespaldo(data);
    // En el celular abro la hoja de compartir (Archivos, Drive, WhatsApp); en computador, descarga.
    const file = new File([texto], nombre, { type: "application/json" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Respaldo KŌRA Press" });
        setMsg({ ok: true, t: "Respaldo listo." });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ ok: true, t: "Respaldo descargado. Lo guardo en Archivos, Drive o me lo envío por WhatsApp." });
  };

  const importar = async (file: File) => {
    try {
      const nuevos = leerRespaldo(await file.text());
      const n = nuevos.sets.length;
      if (!confirm(`Este respaldo trae ${n} ${n === 1 ? "set" : "sets"} con sus insumos, tiempos y ajustes. Reemplaza todo lo que tengo ahora. ¿Sigo?`)) return;
      replace(nuevos);
      setMsg({ ok: true, t: `Respaldo cargado: ${n} ${n === 1 ? "set" : "sets"}.` });
    } catch (e) {
      setMsg({ ok: false, t: e instanceof Error ? e.message : "No pude leer el archivo." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Panel title="Mi hora y mi ganancia" intro="Con estos valores empieza cada set nuevo. En cada cotización los puedo mover sin cambiar estos.">
        <p className="mt-3 mb-2 text-sm text-soft">Valor de mi hora</p>
        <div className="grid grid-cols-3 gap-2">
          {TARIFA_ATAJOS.map((v) => (
            <Chip key={v} pressed={aj.tarifa === v} onClick={() => update((d) => void (d.ajustes.tarifa = v))} className="px-2 tabular">
              {cop(v)}
            </Chip>
          ))}
        </div>
        <NumberField
          className="mt-2"
          label="Valor de mi hora"
          value={aj.tarifa}
          step={1000}
          suffix="/ hora"
          onChange={(v) => update((d) => void (d.ajustes.tarifa = v ?? 0))}
        />
        <label htmlFor="gan-def" className="mt-5 mb-1 flex justify-between text-sm text-soft">
          <span>Ganancia por defecto</span>
          <span className="tabular font-semibold text-ink">{aj.ganancia}%</span>
        </label>
        <input
          id="gan-def"
          type="range"
          min={20}
          max={150}
          step={5}
          value={aj.ganancia}
          onChange={(e) => update((d) => void (d.ajustes.ganancia = Number(e.target.value)))}
          className="h-11 w-full"
        />
        <div className="mt-2">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() =>
              update((d) => {
                d.actual.tarifa = d.ajustes.tarifa;
                d.actual.ganancia = d.ajustes.ganancia;
              })
            }
          >
            Usar estos valores en el set que estoy cotizando
          </Button>
        </div>
      </Panel>

      <Panel
        title="Respaldo"
        intro="Mis datos viven solo en este teléfono. Si borro la app o cambio de celular, se pierden. Cada vez que cambio precios o guardo sets importantes, exporto un respaldo."
      >
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button onClick={() => void exportar()}>Exportar respaldo</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            Importar respaldo
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importar(f);
          }}
        />
        {msg && (
          <p className={`mt-3 text-sm ${msg.ok ? "text-ok" : "text-warn"}`} role="status">
            {msg.t}
          </p>
        )}
        {!guardadoOk && <p className="mt-3 text-sm text-warn">El teléfono no me dejó guardar los últimos cambios. Exporto un respaldo ya.</p>}
      </Panel>

      <Panel title="Apariencia">
        <Row label="Tema">
          <div className="flex gap-1.5">
            {TEMAS.map((t) => (
              <Chip key={t.id} pressed={aj.tema === t.id} onClick={() => update((d) => void (d.ajustes.tema = t.id))} className="px-3 text-sm">
                {t.n}
              </Chip>
            ))}
          </div>
        </Row>
      </Panel>

      <p className="px-1 pt-2 text-center font-serif text-lg text-soft italic">La belleza no se aplica. Se cultiva.</p>
    </div>
  );
}

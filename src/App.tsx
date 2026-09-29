import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "./store";
import { cop, hm } from "./lib/format";
import { Summary } from "./components/Summary";
import { Sheet } from "./components/Sheet";
import { Cotizar } from "./screens/Cotizar";
import { Insumos } from "./screens/Insumos";
import { Tiempos } from "./screens/Tiempos";
import { Guardados } from "./screens/Guardados";
import { Ajustes } from "./screens/Ajustes";

type Tab = "cotizar" | "insumos" | "tiempos" | "guardados" | "ajustes";

const ico = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const TABS: { id: Tab; n: string; corto: string; icon: ReactNode }[] = [
  { id: "cotizar", n: "Cotizar set", corto: "Cotizar", icon: ico(<path d="M8 21v-9c0-3.5 1.8-8 4-9 2.2 1 4 5.5 4 9v9zM10 8.5c.3-1.3.8-2.4 1.3-3" />) },
  { id: "insumos", n: "Mis insumos", corto: "Insumos", icon: ico(<><path d="M9 3h6M10 3v3.5L6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7l-4-5.5V3" /><path d="M6 14h12" /></>) },
  { id: "tiempos", n: "Mis tiempos", corto: "Tiempos", icon: ico(<><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M10 2h4" /></>) },
  { id: "guardados", n: "Sets guardados", corto: "Guardados", icon: ico(<path d="M6 3h12v18l-6-4-6 4z" />) },
  { id: "ajustes", n: "Ajustes", corto: "Ajustes", icon: ico(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></>) },
];

const TAB_KEY = "kora-press-tab";
function tabInicial(): Tab {
  try {
    const t = localStorage.getItem(TAB_KEY) as Tab | null;
    if (t && TABS.some((x) => x.id === t)) return t;
  } catch {
    /* sin almacenamiento */
  }
  return "cotizar";
}

export default function App() {
  const { data, resultado: r } = useStore();
  const [tab, setTab] = useState<Tab>(tabInicial);
  const [sheet, setSheet] = useState(false);

  const ir = (t: Tab) => {
    setTab(t);
    setSheet(false);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      /* sin almacenamiento */
    }
    window.scrollTo({ top: 0 });
  };

  // tema
  useEffect(() => {
    const el = document.documentElement;
    const t = data.ajustes.tema;
    if (t === "auto") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", t === "oscuro" ? "dark" : "light");
    const oscuro = t === "oscuro" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", oscuro ? "#352B33" : "#EEE9EC");
  }, [data.ajustes.tema]);

  const titulo = TABS.find((t) => t.id === tab)!.n;
  const enCotizar = tab === "cotizar";

  return (
    <div className="min-h-dvh lg:flex">
      {/* menú lateral en computador */}
      <nav className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line px-4 py-8 lg:flex" aria-label="Secciones">
        <Marca />
        <ul className="mt-10 space-y-1">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => ir(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left ${tab === t.id ? "bg-card font-semibold text-pom" : "text-soft hover:bg-card/60"}`}
              >
                {t.icon}
                {t.n}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-auto font-serif text-base text-soft italic">La belleza no se aplica. Se cultiva.</p>
      </nav>

      <div className="min-w-0 flex-1">
        {/* encabezado en celular */}
        <header className="pt-safe sticky top-0 z-10 border-b border-line/70 bg-bg/90 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Marca compacta />
            <h1 className="text-sm font-medium text-soft">{titulo}</h1>
          </div>
        </header>

        <main className={`mx-auto max-w-6xl px-3 pt-3 sm:px-5 lg:px-8 lg:pt-8 ${enCotizar ? "pb-44" : "pb-28"} lg:pb-12`}>
          <h1 className="mb-5 hidden font-serif text-4xl font-medium lg:block">{titulo}</h1>
          {enCotizar ? (
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
              <div>
                <Cotizar />
                <div className="mt-3 rounded-2xl bg-bar p-5 lg:hidden">
                  <Summary />
                </div>
              </div>
              <aside className="sticky top-8 hidden max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-2xl bg-bar p-6 lg:block" aria-label="Resumen">
                <Summary />
              </aside>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              {tab === "insumos" && <Insumos />}
              {tab === "tiempos" && <Tiempos />}
              {tab === "guardados" && <Guardados onOpen={() => ir("cotizar")} />}
              {tab === "ajustes" && <Ajustes />}
            </div>
          )}
        </main>
      </div>

      {/* barra fija abajo en celular: precio + navegación */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-20 lg:hidden">
        {enCotizar && (
          <div className="mx-2 mb-1.5 flex items-center justify-between gap-3 rounded-2xl bg-bar py-2 pr-2 pl-4 text-bar-ink shadow-lg shadow-black/20">
            <div className="min-w-0" aria-live="polite">
              <p className="text-xs opacity-70">
                {r.nivel} · {hm(r.minutos)}
              </p>
              <p className="tabular font-serif text-3xl leading-none">{cop(r.precioSugerido)}</p>
            </div>
            <button type="button" onClick={() => setSheet(true)} className="min-h-11 shrink-0 rounded-full bg-bar-ink px-4 font-semibold text-bar">
              Ver desglose
            </button>
          </div>
        )}
        <nav className="border-t border-line bg-card/95 backdrop-blur" aria-label="Secciones">
          <ul className="grid grid-cols-5">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => ir(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] ${tab === t.id ? "font-semibold text-pom" : "text-soft"}`}
                >
                  {t.icon}
                  {t.corto}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} label="Desglose del precio">
        <Summary />
      </Sheet>
    </div>
  );
}

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="leading-none">
      <p className={`font-serif font-medium tracking-[0.12em] ${compacta ? "text-2xl" : "text-4xl"}`}>KŌRA</p>
      <p className={`tracking-[0.3em] text-soft uppercase ${compacta ? "mt-0.5 text-[9px]" : "mt-1.5 text-[11px]"}`}>Ritual · Press</p>
    </div>
  );
}

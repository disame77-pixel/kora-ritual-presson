import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { calcular, type Resultado } from "./lib/calc";
import { cargar, guardar, type AppData } from "./lib/data";

interface Store {
  data: AppData;
  resultado: Resultado;
  /** recibe una copia editable de los datos; lo que cambie se guarda */
  update: (fn: (d: AppData) => void) => void;
  replace: (d: AppData) => void;
  guardadoOk: boolean;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(cargar);
  const [guardadoOk, setGuardadoOk] = useState(true);

  useEffect(() => {
    setGuardadoOk(guardar(data));
  }, [data]);

  // Pide al navegador que no borre mis datos por falta de espacio.
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  const update = useCallback((fn: (d: AppData) => void) => {
    setData((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const resultado = useMemo(() => calcular(data.actual, data.insumos, data.tiempos), [data.actual, data.insumos, data.tiempos]);

  const value = useMemo(() => ({ data, resultado, update, replace: setData, guardadoOk }), [data, resultado, update, guardadoOk]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore fuera de StoreProvider");
  return s;
}

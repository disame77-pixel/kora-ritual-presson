import { useEffect, useRef, type ReactNode } from "react";

/** hoja que sube desde abajo, para el desglose en el celular */
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useRef(onClose);
  cerrar.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cerrar.current();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className="pb-safe absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-bar outline-none"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-bar px-5 pt-3 pb-1">
          <span className="mx-auto h-1.5 w-10 rounded-full bg-bar-ink/25" aria-hidden="true" />
        </div>
        <div className="flex justify-end px-3">
          <button type="button" onClick={onClose} className="min-h-11 rounded-full px-4 text-bar-ink/80">
            Cerrar
          </button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

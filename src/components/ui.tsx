import { useEffect, useState, type ReactNode } from "react";

/** onStep recibe +1 o −1; quien lo usa suma sobre el estado más reciente */
export function Stepper({
  value,
  onStep,
  min = 0,
  max = 10,
  label,
}: {
  value: number;
  onStep: (delta: 1 | -1) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const btn =
    "grid size-11 place-items-center rounded-full text-2xl leading-none text-ink transition-colors active:bg-seed/40 disabled:opacity-30 disabled:active:bg-transparent";
  return (
    <div className="flex shrink-0 items-center rounded-full border border-line bg-bg/60" role="group" aria-label={label}>
      <button type="button" className={btn} aria-label={`Menos ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onStep(-1)}>
        −
      </button>
      <output className="tabular min-w-8 text-center text-lg font-semibold" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} aria-label={`Más ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onStep(1)}>
        +
      </button>
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="grid h-11 w-16 shrink-0 place-items-center"
    >
      <span className={`relative block h-7 w-12 rounded-full transition-colors ${checked ? "bg-pom" : "bg-line"}`}>
        <span className={`absolute top-1 left-1 size-5 rounded-full bg-card shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

export function Chip({
  pressed,
  onClick,
  children,
  className = "",
  tone = "light",
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  const base = "flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-[15px] transition-colors";
  const styles =
    tone === "light"
      ? pressed
        ? "border-pom bg-pom text-white"
        : "border-line text-ink active:bg-seed/30"
      : pressed
        ? "border-bar-ink bg-bar-ink text-bar"
        : "border-bar-ink/30 text-bar-ink";
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

/** fila con etiqueta a la izquierda y control a la derecha */
export function Row({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-t border-line py-2 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="leading-snug">{label}</div>
        {hint && <div className="text-[13px] leading-snug text-soft">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

export function StepCard({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card px-4 pt-4 pb-3 sm:px-6 sm:pt-5" aria-labelledby={`paso-${n}`}>
      <header className="mb-2 flex items-baseline gap-3">
        <span className="font-serif text-3xl leading-none text-pom" aria-hidden="true">
          {n}
        </span>
        <div>
          <h2 id={`paso-${n}`} className="font-serif text-2xl leading-tight font-semibold">
            {title}
          </h2>
          {hint && <p className="mt-0.5 text-sm text-soft">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export function Panel({ title, intro, children }: { title?: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card px-4 py-4 sm:px-6">
      {title && <h2 className="font-serif text-2xl font-semibold">{title}</h2>}
      {intro && <p className="mt-1 mb-2 max-w-prose text-sm text-soft">{intro}</p>}
      {children}
    </section>
  );
}

/**
 * Campo numérico que deja escribir libremente y solo publica números válidos.
 * `empty` es lo que se publica cuando el campo queda vacío.
 */
export function NumberField({
  value,
  onChange,
  empty = 0,
  placeholder,
  label,
  className = "",
  suffix,
  tone = "light",
  step,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  empty?: number | null;
  placeholder?: string;
  label: string;
  className?: string;
  suffix?: string;
  tone?: "light" | "dark";
  step?: number;
}) {
  const shown = value == null || (value === 0 && empty === 0 && placeholder) ? "" : String(value);
  const [text, setText] = useState(shown);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(shown);
  }, [shown, focused]);

  const toneCls =
    tone === "light" ? "border-line bg-bg text-ink placeholder:text-soft/70" : "border-bar-ink/25 bg-bar-ink/10 text-bar-ink placeholder:text-bar-ink/50";
  return (
    <label className={`flex h-11 items-center rounded-xl border px-3 focus-within:border-pom ${toneCls} ${className}`}>
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        step={step}
        min={0}
        value={text}
        placeholder={placeholder}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setText(e.target.value);
          const raw = e.target.value.trim();
          if (raw === "") return onChange(empty);
          const n = Number(raw);
          if (Number.isFinite(n) && n >= 0) onChange(n);
        }}
        className="tabular w-full min-w-0 bg-transparent text-right text-base outline-none"
      />
      {suffix && <span className="ml-1.5 shrink-0 text-sm opacity-70">{suffix}</span>}
    </label>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const v = {
    primary: "bg-pom text-white active:brightness-90",
    ghost: "border border-line text-ink active:bg-seed/30",
    danger: "border border-pom/40 text-pom active:bg-pom/10",
  }[variant];
  return (
    <button type={type} onClick={onClick} className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 font-semibold ${v} ${className}`}>
      {children}
    </button>
  );
}

export function NailShape({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden="true">
      <path fill="currentColor" d={d} />
    </svg>
  );
}

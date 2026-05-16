"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, Eraser, Terminal, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import type { LogLine } from "@/lib/types";

type Props = {
  lang: Lang;
  logs: LogLine[];
  onClear: () => void;
};

export function ConsolePanel({ lang, logs, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [autoscroll, setAutoscroll] = useState(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && autoscroll && scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [logs, open, autoscroll]);

  const count = logs.length;
  const labels = {
    en: {
      open: "Terminal",
      title: "Live terminal",
      subtitle: "Streamed from the backend in real time",
      empty: "Waiting for output…",
      clear: "Clear",
      copy: "Copy",
      close: "Close",
      autoscroll: "Auto-scroll",
    },
    es: {
      open: "Terminal",
      title: "Terminal en vivo",
      subtitle: "Streaming del backend en tiempo real",
      empty: "Esperando salida…",
      clear: "Limpiar",
      copy: "Copiar",
      close: "Cerrar",
      autoscroll: "Auto-scroll",
    },
  }[lang];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 group inline-flex items-center gap-2 rounded-full bg-marine-500 text-cream-50 px-4 py-2.5 text-sm font-semibold shadow-lift hover:bg-marine-600 transition-all duration-200 hover:-translate-y-0.5"
      >
        <Terminal className="h-4 w-4" />
        {labels.open}
        {count > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-leaf-500 text-cream-50 text-[10px] font-bold px-1.5 min-w-[1.25rem] h-5">
            {count > 999 ? "999+" : count}
          </span>
        )}
      </button>

      <div
        className={[
          "fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="mx-auto max-w-6xl px-3 pb-3">
          <div className="rounded-t-2xl bg-marine-700 text-cream-100 shadow-lift ring-1 ring-marine-600/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-marine-600/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <Terminal className="h-4 w-4 text-leaf-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{labels.title}</div>
                  <div className="text-[11px] text-cream-100/55 truncate">
                    {labels.subtitle} · {count} {lang === "es" ? "líneas" : "lines"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-cream-100/70 px-2 select-none">
                  <input
                    type="checkbox"
                    checked={autoscroll}
                    onChange={(e) => setAutoscroll(e.target.checked)}
                    className="accent-leaf-500"
                  />
                  {labels.autoscroll}
                </label>
                <IconButton
                  label={labels.copy}
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      logs.map((l) => l.line).join("\n")
                    )
                  }
                >
                  <Copy className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label={labels.clear} onClick={onClear}>
                  <Eraser className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label={labels.close} onClick={() => setOpen(false)}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>

            <div
              ref={scrollerRef}
              className="h-72 md:h-80 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed"
            >
              {logs.length === 0 ? (
                <div className="text-cream-100/40 italic">{labels.empty}</div>
              ) : (
                <ol className="space-y-0.5">
                  {logs.map((l, i) => (
                    <li
                      key={i}
                      className={
                        l.stream === "stderr"
                          ? "text-red-300/90"
                          : "text-cream-100/85"
                      }
                    >
                      <span className="text-cream-100/30 select-none mr-3">
                        {String(i + 1).padStart(4, "0")}
                      </span>
                      {l.line}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click-outside scrim for mobile */}
      {open && (
        <button
          type="button"
          aria-label="close"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-transparent cursor-default"
        />
      )}
    </>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-marine-600/60 text-cream-100/80 hover:bg-marine-600 hover:text-cream-50 transition-colors duration-150"
    >
      {children}
    </button>
  );
}

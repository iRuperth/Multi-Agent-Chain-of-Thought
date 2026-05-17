"use client";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

export function Landing({
  lang,
  onEnter,
  onLangChange,
}: {
  lang: Lang;
  onEnter: () => void;
  onLangChange: (l: Lang) => void;
}) {
  const t = i18n[lang];
  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Soft background glows */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(11,46,92,0.08), transparent 50%), radial-gradient(circle at 80% 75%, rgba(31,138,59,0.08), transparent 55%)",
        }}
      />

      {/* Floating, non-invasive language toggle — top-right */}
      <div className="absolute top-5 right-5 z-10">
        <div
          role="radiogroup"
          aria-label="Language"
          className="inline-flex items-center rounded-full bg-cream-50/70 backdrop-blur p-0.5 ring-1 ring-cream-300/60 shadow-soft"
        >
          {(["en", "es"] as const).map((code) => {
            const active = lang === code;
            return (
              <button
                key={code}
                role="radio"
                aria-checked={active}
                onClick={() => onLangChange(code)}
                className={[
                  "px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all duration-200",
                  active
                    ? "bg-marine-500 text-cream-50"
                    : "text-marine-500/55 hover:text-marine-500",
                ].join(" ")}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pt-4 pb-16 text-center animate-fade-in">
        <div className="flex justify-center -mb-2">
          <img
            src="/static/Offerly.png"
            alt="Offerly"
            className="h-56 md:h-72 w-auto select-none drop-shadow-sm"
            draggable={false}
          />
        </div>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-leaf-50 text-leaf-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-leaf-200 animate-slide-up">
          <Sparkles className="h-3.5 w-3.5" />
          {t.heroEyebrow}
        </div>

        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-marine-500 leading-[1.05] animate-slide-up">
          {t.heroTitle}
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-base md:text-lg text-marine-500/70 leading-relaxed">
          {t.heroSubtitle}
        </p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-marine-500/80">
          {[t.heroBullet1, t.heroBullet2, t.heroBullet3].map((b) => (
            <li key={b} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-leaf-500" />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <button
            type="button"
            onClick={onEnter}
            className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-cream-50 bg-marine-500 hover:bg-marine-600 shadow-lift transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
          >
            <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            {t.enterCta}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <div className="mt-3 text-xs text-marine-500/45">
            {lang === "es" ? "Sin registro, sin tarjeta" : "No signup, no credit card"}
          </div>
        </div>
      </div>
    </section>
  );
}

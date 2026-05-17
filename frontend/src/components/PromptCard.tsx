"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Info, Lock, Sparkles, Wand2 } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

type Props = {
  lang: Lang;
  disabled: boolean;
  onSubmit: (text: string, demo: boolean, creative: boolean) => void;
};

export function PromptCard({ lang, disabled, onSubmit }: Props) {
  const t = i18n[lang];
  const [text, setText] = useState("");
  const [creative, setCreative] = useState(false);

  const canSubmit = text.trim().length > 8 && !disabled;

  return (
    <section className="mx-auto max-w-3xl px-6 pt-10 pb-14">
      <div className="mb-6 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-marine-500 tracking-tight">
            {t.platformTitle}
          </h2>
          <p className="mt-1.5 text-sm text-marine-500/65">
            {t.platformSubtitle}
          </p>
        </div>
        <div className="rounded-xl bg-cream-100 ring-1 ring-cream-300/70 px-3.5 py-2.5 min-w-[200px]">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-marine-500/55">
            <Clock className="h-3 w-3" />
            {t.etaLabel}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-marine-500 tabular-nums">
            {t.etaValue}
          </div>
          <div className="text-[11px] text-marine-500/55 tabular-nums">
            {t.etaDemoValue}
          </div>
        </div>
      </div>
      {/* Recommended data the merchant should include */}
      <div className="mb-5 rounded-2xl bg-leaf-50/60 ring-1 ring-leaf-200/70 p-5 md:p-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-leaf-500 text-cream-50">
            <Info className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-marine-500">
              {t.tipsTitle}
            </div>
            <p className="mt-1 text-xs text-marine-500/70 leading-relaxed">
              {t.tipsSubtitle}
            </p>
            <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {t.tipsItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-marine-500/85"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mt-[3px] text-leaf-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] italic text-marine-500/60 leading-relaxed">
              {t.tipsFooter}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-soft ring-1 ring-cream-300/70 p-6 md:p-8 transition-shadow duration-300 hover:shadow-lift animate-slide-up">
        <label
          htmlFor="merchant-input"
          className="block text-sm font-semibold text-marine-500 mb-3"
        >
          {t.promptLabel}
        </label>
        <textarea
          id="merchant-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.promptPlaceholder}
          rows={5}
          disabled={disabled}
          className="w-full resize-y rounded-xl border border-cream-300 bg-cream-50/60 px-4 py-3 text-marine-500 placeholder:text-marine-500/40 focus:border-marine-500 focus:bg-white focus:ring-2 focus:ring-marine-500/15 outline-none transition-all duration-200 disabled:opacity-60"
        />

        <div className="mt-3 flex flex-col gap-2">
          {t.examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setText(ex)}
              disabled={disabled}
              title={ex}
              className="block w-full text-left truncate whitespace-nowrap text-xs text-marine-500/70 bg-cream-100 hover:bg-cream-200 hover:text-marine-500 rounded-full px-4 py-1.5 ring-1 ring-cream-300 transition-all duration-200 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Mode toggle: strict ↔ creative */}
        <div className="mt-5 rounded-xl ring-1 ring-cream-300/70 bg-cream-50/50 p-1 grid grid-cols-2 gap-1">
          <ModeOption
            active={!creative}
            onClick={() => setCreative(false)}
            disabled={disabled}
            icon={<Lock className="h-3.5 w-3.5" />}
            label={t.modeStrictLabel}
            desc={t.modeStrictDesc}
            tone="strict"
          />
          <ModeOption
            active={creative}
            onClick={() => setCreative(true)}
            disabled={disabled}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label={t.modeCreativeLabel}
            desc={t.modeCreativeDesc}
            tone="creative"
          />
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            type="button"
            onClick={() => onSubmit(text.trim() || t.examples[0], true, creative)}
            disabled={disabled}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-marine-500 bg-cream-100 hover:bg-cream-200 ring-1 ring-cream-300 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Wand2 className="h-4 w-4 transition-transform duration-200 group-hover:rotate-[-12deg]" />
            {t.demoCta}
          </button>
          <button
            type="button"
            onClick={() => canSubmit && onSubmit(text.trim(), false, creative)}
            disabled={!canSubmit}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-cream-50 bg-marine-500 hover:bg-marine-600 shadow-soft hover:shadow-lift transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
          >
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            {t.primaryCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ModeOption({
  active,
  onClick,
  disabled,
  icon,
  label,
  desc,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  desc: string;
  tone: "strict" | "creative";
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={[
        "text-left rounded-lg p-3 transition-all duration-200",
        active
          ? tone === "strict"
            ? "bg-marine-500 text-cream-50 shadow-soft"
            : "bg-leaf-500 text-cream-50 shadow-soft"
          : "bg-transparent text-marine-500/70 hover:bg-cream-100",
        disabled && "opacity-50 cursor-not-allowed",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div
        className={[
          "mt-1 text-[11px] leading-snug",
          active ? "text-cream-50/85" : "text-marine-500/55",
        ].join(" ")}
      >
        {desc}
      </div>
    </button>
  );
}

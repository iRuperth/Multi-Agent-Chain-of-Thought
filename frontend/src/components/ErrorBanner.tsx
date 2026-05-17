"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

export function ErrorBanner({
  lang,
  detail,
  onReset,
}: {
  lang: Lang;
  detail?: string;
  onReset: () => void;
}) {
  const t = i18n[lang];
  return (
    <section className="mx-auto max-w-3xl px-6 pb-10 animate-fade-in">
      <div className="rounded-2xl bg-white ring-1 ring-red-200 shadow-soft p-6 flex gap-4 items-start">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-marine-500">{t.errorTitle}</h3>
          <p className="mt-1 text-sm text-marine-500/75 leading-relaxed">
            {t.errorBody}
          </p>
          {detail && (
            <pre className="mt-3 text-xs text-marine-500/60 bg-cream-50 rounded-lg p-3 ring-1 ring-cream-300 overflow-x-auto font-mono">
              {detail}
            </pre>
          )}
          <button
            type="button"
            onClick={onReset}
            className="group mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-cream-50 bg-marine-500 hover:bg-marine-600 transition-all duration-200 hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
            {t.retry}
          </button>
        </div>
      </div>
    </section>
  );
}

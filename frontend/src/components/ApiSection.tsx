"use client";

import { ArrowUpRight, Check, ExternalLink, Server, Sparkles, Webhook } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

const METHOD_TONE: Record<string, string> = {
  GET: "bg-leaf-100 text-leaf-700 ring-leaf-200",
  POST: "bg-marine-100 text-marine-700 ring-marine-200",
};

export function ApiSection({ lang }: { lang: Lang }) {
  const t = i18n[lang];
  return (
    <section id="api" className="bg-marine-500 text-cream-50 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-cream-50/10 text-cream-50/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-cream-50/15">
            <Sparkles className="h-3.5 w-3.5" />
            {t.api.eyebrow}
          </div>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
            {t.api.title}
          </h2>
          <p className="mt-4 text-cream-50/75 leading-relaxed">
            {t.api.subtitle}
          </p>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-leaf-500 hover:bg-leaf-400 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-all duration-200 hover:-translate-y-0.5"
          >
            <ExternalLink className="h-4 w-4" />
            {t.api.openDocs}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </header>

        <div className="mt-14 grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Endpoints */}
          <div className="rounded-2xl bg-marine-600/40 ring-1 ring-cream-50/10 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cream-50/70">
              <Webhook className="h-3.5 w-3.5" />
              {t.api.endpointsTitle}
            </div>
            <ul className="mt-4 space-y-2.5">
              {t.api.endpoints.map((e) => (
                <li
                  key={e.path}
                  className="rounded-xl bg-marine-700/50 ring-1 ring-cream-50/5 p-3 hover:ring-cream-50/15 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={[
                        "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ring-1",
                        METHOD_TONE[e.method] ?? METHOD_TONE.GET,
                      ].join(" ")}
                    >
                      {e.method}
                    </span>
                    <code className="font-mono text-sm text-cream-50">
                      {e.path}
                    </code>
                  </div>
                  <p className="mt-1.5 text-xs text-cream-50/65 leading-relaxed">
                    {e.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: runtime + schema */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-marine-600/40 ring-1 ring-cream-50/10 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cream-50/70">
                <Server className="h-3.5 w-3.5" />
                {t.api.runtimeTitle}
              </div>
              <ul className="mt-4 space-y-2">
                {t.api.runtimeItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-cream-50/85 leading-snug"
                  >
                    <Check className="h-4 w-4 mt-0.5 text-leaf-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-marine-700/60 ring-1 ring-cream-50/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-cream-50/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-cream-50/70">
                  {t.api.schemaTitle}
                </span>
                <span className="text-[10px] font-mono text-cream-50/45">
                  pydantic.BaseModel
                </span>
              </div>
              <pre className="px-4 py-3 text-[12px] font-mono leading-relaxed text-cream-50/85 overflow-x-auto">
{`class Campaign(BaseModel):
    merchant_name:  Optional[str]
    category:       Optional[str]
    title:          Optional[str]
    description:    Optional[str]
    fine_print:     list[str]
    pricing:        Pricing
    weekly_slots:   list[str]
    stock:          Optional[int]
    voucher_validity_days: Optional[int]
    simulation:     Optional[SimulationResult]`}
              </pre>
              <div className="px-4 py-2.5 border-t border-cream-50/10 text-[11px] text-cream-50/55 leading-relaxed">
                {t.api.schemaDesc}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

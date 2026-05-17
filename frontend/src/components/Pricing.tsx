"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

export function Pricing({ lang }: { lang: Lang }) {
  const t = i18n[lang];
  return (
    <section id="pricing" className="bg-cream-50/60 border-y border-cream-300/60 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <header className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-leaf-50 text-leaf-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-leaf-200">
            <Sparkles className="h-3.5 w-3.5" />
            {t.pricing.eyebrow}
          </div>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-marine-500 tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="mt-4 text-base text-marine-500/70 leading-relaxed">
            {t.pricing.subtitle}
          </p>
        </header>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {t.pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1",
                plan.featured
                  ? "bg-marine-500 text-cream-50 shadow-lift ring-2 ring-leaf-500"
                  : "bg-white text-marine-500 ring-1 ring-cream-300/70 shadow-soft hover:shadow-lift",
              ].join(" ")}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-leaf-500 text-cream-50 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  {lang === "es" ? "Más elegido" : "Most picked"}
                </span>
              )}

              <div
                className={[
                  "text-sm font-semibold",
                  plan.featured ? "text-cream-50/80" : "text-marine-500/60",
                ].join(" ")}
              >
                {plan.name}
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tabular-nums">
                  {plan.price}
                </span>
                <span
                  className={[
                    "text-xs",
                    plan.featured ? "text-cream-50/70" : "text-marine-500/60",
                  ].join(" ")}
                >
                  {plan.perWhat}
                </span>
              </div>

              <ul className="mt-6 space-y-2.5">
                {plan.bullets.map((b) => (
                  <li
                    key={b}
                    className={[
                      "flex items-start gap-2 text-sm leading-snug",
                      plan.featured ? "text-cream-50/90" : "text-marine-500/80",
                    ].join(" ")}
                  >
                    <Check
                      className={[
                        "h-4 w-4 mt-0.5 shrink-0",
                        plan.featured ? "text-leaf-300" : "text-leaf-500",
                      ].join(" ")}
                    />
                    {b}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={[
                  "group mt-7 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
                  plan.featured
                    ? "bg-leaf-500 text-cream-50 hover:bg-leaf-400"
                    : "bg-marine-500 text-cream-50 hover:bg-marine-600",
                ].join(" ")}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { AlertTriangle } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";
import type { Campaign } from "@/lib/types";

// Fields that the MERCHANT must provide (group A from our design).
// If the LLM left them null, it's because the pitch didn't include them.
const MERCHANT_REQUIRED: (keyof Campaign | "pricing.pvp_eur" | "pricing.variable_cost_eur")[] = [
  "merchant_name",
  "business_type",
  "city",
  "neighborhood",
  "category",
  "goal",
  "target_audience",
  "pricing.pvp_eur",
  "pricing.variable_cost_eur",
  "weekly_capacity",
];

function getValue(c: Campaign, key: string): unknown {
  if (key.startsWith("pricing.")) {
    const inner = key.slice("pricing.".length) as keyof Campaign["pricing"];
    return c.pricing?.[inner];
  }
  return c[key as keyof Campaign];
}

export function MissingFieldsBanner({
  lang,
  campaign,
}: {
  lang: Lang;
  campaign: Campaign;
}) {
  const t = i18n[lang];
  const missing = MERCHANT_REQUIRED.filter((key) => {
    const v = getValue(campaign, key);
    return v === null || v === undefined || v === "";
  });

  if (missing.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pt-2 pb-2 animate-fade-in">
      <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-5 md:p-6 flex gap-4 items-start">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/90 text-cream-50">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-amber-900">
            {t.missingTitle}
          </div>
          <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
            {t.missingSubtitle}
          </p>
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-5 gap-y-1.5">
            {missing.map((key) => (
              <li
                key={key}
                className="flex items-start gap-2 text-[13px] text-amber-950"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <span className="font-medium">
                    {t.missingFields[key] ?? key}
                  </span>
                  <span className="ml-1 font-mono text-[11px] text-amber-900/55">
                    {key}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] italic text-amber-900/70">
            {t.missingHint}
          </p>
        </div>
      </div>
    </section>
  );
}

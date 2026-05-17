"use client";

import {
  Banknote,
  FileText,
  Megaphone,
  Receipt,
  RotateCcw,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";
import type { Campaign } from "@/lib/types";
import {
  discountPct,
  eur,
  marginPerUnit,
  merchantRevenue,
  pct,
} from "@/lib/format";

type Props = {
  lang: Lang;
  campaign: Campaign;
  summary: string;
  onReset: () => void;
};

export function ResultPanel({ lang, campaign, summary, onReset }: Props) {
  const t = i18n[lang];
  const p = campaign.pricing;
  const disc = discountPct(p.pvp_eur, p.offerly_price_eur);
  const rev = merchantRevenue(p.offerly_price_eur, p.commission_pct);
  const margin = marginPerUnit(
    p.offerly_price_eur,
    p.commission_pct,
    p.variable_cost_eur
  );
  const sim = campaign.simulation;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 animate-slide-up">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-leaf-50 text-leaf-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-leaf-200">
            <Sparkles className="h-3.5 w-3.5" />
            {t.resultTitle}
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-marine-500 tracking-tight">
            {campaign.offer_name || campaign.title || campaign.merchant_name}
          </h2>
          <p className="mt-1 text-sm text-marine-500/70">{t.resultSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-marine-500 bg-cream-100 hover:bg-cream-200 ring-1 ring-cream-300 transition-all duration-200 hover:-translate-y-0.5"
        >
          <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
          {t.reset}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Merchant card */}
        <Card icon={Store} title={t.cardMerchant}>
          <KV k={t.cardMerchant} v={campaign.merchant_name} />
          <KV
            k={t.cardLocation}
            v={
              [campaign.neighborhood, campaign.city].filter(Boolean).join(", ") ||
              null
            }
          />
          <KV k={t.cardCategory} v={campaign.category} mono />
          <KV k={t.cardGoal} v={campaign.goal} />
          <KV k={t.cardAudience} v={campaign.target_audience} />
        </Card>

        {/* Copy card */}
        <Card icon={Megaphone} title={t.cardCopy}>
          <KV k={t.cardTitle} v={campaign.title} />
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-marine-500/60 mb-1">
              {t.cardDescription}
            </div>
            <p className="text-sm text-marine-500/85 leading-relaxed">
              {campaign.description || "—"}
            </p>
          </div>
        </Card>

        {/* Conditions card */}
        <Card icon={Receipt} title={t.cardConditions}>
          <KV
            k={t.cardValidity}
            v={
              campaign.voucher_validity_days
                ? `${campaign.voucher_validity_days} ${lang === "es" ? "días" : "days"}`
                : null
            }
          />
          <KV k={t.cardStock} v={campaign.stock} />
          <KV k={t.cardWeeklyCap} v={campaign.weekly_capacity} />
          <KV
            k={t.cardWeeklySlots}
            v={
              campaign.weekly_slots?.length
                ? campaign.weekly_slots
                    .map((s) => {
                      if (typeof s === "string") return s;
                      if (s && typeof s === "object") {
                        // Tolerate {day, hours} or {day, slot} shapes
                        const o = s as Record<string, unknown>;
                        const day = o.day ?? o.weekday ?? "";
                        const hours = o.hours ?? o.slot ?? o.time ?? "";
                        return [day, hours].filter(Boolean).join(" ");
                      }
                      return String(s);
                    })
                    .filter(Boolean)
                    .join(", ")
                : null
            }
          />
          {(() => {
            // Normalise fine_print into a string array. The LLM sometimes
            // returns a string ("• line 1\n• line 2"), an array of dicts
            // ({text: "..."}), or something else entirely. Cast to unknown
            // first so TS lets us probe the runtime shape.
            const raw = campaign.fine_print as unknown;
            let lines: string[] = [];
            if (Array.isArray(raw)) {
              lines = (raw as unknown[])
                .map((item: unknown) => {
                  if (typeof item === "string") return item;
                  if (item && typeof item === "object") {
                    const o = item as Record<string, unknown>;
                    return String(o.text ?? o.line ?? o.value ?? JSON.stringify(o));
                  }
                  return String(item);
                })
                .filter((s: string) => s.trim().length > 0);
            } else if (typeof raw === "string" && raw.trim()) {
              lines = (raw as string)
                .split(/\r?\n|•|;/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);
            }
            if (lines.length === 0) return null;
            return (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-marine-500/60 mb-1">
                  {t.cardFinePrint}
                </div>
                <ul className="text-sm text-marine-500/85 space-y-1">
                  {lines.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-marine-500/40">•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </Card>

        {/* Pricing card */}
        <Card icon={Banknote} title={t.cardPricing}>
          <KV k={t.cardRrp} v={eur(p.pvp_eur)} accent />
          <KV k={t.cardOfferlyPrice} v={eur(p.offerly_price_eur)} accent />
          <KV k={t.cardDiscount} v={disc !== null ? `${disc}%` : "—"} highlight />
          <KV k={t.cardCommission} v={`${p.commission_pct}%`} />
          <KV k={t.cardVariableCost} v={eur(p.variable_cost_eur)} />
          <KV k={t.cardMerchantRevenue} v={eur(rev)} />
          <KV k={t.cardMargin} v={eur(margin)} highlight={margin !== null && margin > 0} />
        </Card>

        {/* Simulation — full width */}
        <Card icon={TrendingUp} title={t.cardSimulation} fullWidth>
          {sim && Number.isFinite(sim.units_p50) ? (
            <div className="grid sm:grid-cols-3 gap-5">
              <Stat
                label={t.cardUnits}
                main={Number.isFinite(sim.units_p50) ? `${sim.units_p50}` : "—"}
                hint={
                  Number.isFinite(sim.units_p10) && Number.isFinite(sim.units_p90)
                    ? `${sim.units_p10} / ${sim.units_p90}`
                    : "—"
                }
              />
              <Stat
                label={t.cardProfit}
                main={Number.isFinite(sim.profit_p50_eur) ? eur(sim.profit_p50_eur) : "—"}
                hint={
                  Number.isFinite(sim.profit_p10_eur) && Number.isFinite(sim.profit_p90_eur)
                    ? `${eur(sim.profit_p10_eur)} / ${eur(sim.profit_p90_eur)}`
                    : "—"
                }
              />
              <Stat
                label={t.cardProbProfit}
                main={
                  Number.isFinite(sim.probability_profitable)
                    ? pct(sim.probability_profitable * 100)
                    : "—"
                }
                hint={
                  sim.probability_profitable >= 0.8
                    ? lang === "es"
                      ? "Saludable"
                      : "Healthy"
                    : lang === "es"
                    ? "Marginal"
                    : "Marginal"
                }
                tone={sim.probability_profitable >= 0.8 ? "good" : "warn"}
              />
            </div>
          ) : (
            <p className="text-sm text-marine-500/60">—</p>
          )}
        </Card>

        {/* Summary — full width */}
        {summary && (
          <Card icon={FileText} title={t.cardSummary} fullWidth muted>
            <pre className="whitespace-pre-wrap break-words text-sm text-marine-500/85 leading-relaxed font-sans">
              {summary}
            </pre>
          </Card>
        )}
      </div>
    </section>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  fullWidth,
  muted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl ring-1 ring-cream-300/70 p-6 transition-all duration-300 hover:-translate-y-0.5",
        muted ? "bg-cream-50" : "bg-white",
        "shadow-soft hover:shadow-lift",
        fullWidth && "md:col-span-2",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marine-500/8 text-marine-500">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-semibold text-marine-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KV({
  k,
  v,
  mono,
  accent,
  highlight,
}: {
  k: string;
  v: string | number | null | undefined;
  mono?: boolean;
  accent?: boolean;
  highlight?: boolean;
}) {
  const display = v === null || v === undefined || v === "" ? "—" : v;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-cream-200/70 last:border-b-0">
      <span className="text-xs uppercase tracking-wider text-marine-500/60 font-semibold">
        {k}
      </span>
      <span
        className={[
          "text-sm text-right",
          mono && "font-mono",
          accent && "font-semibold text-marine-500",
          highlight && "font-semibold text-leaf-700",
          !accent && !highlight && "text-marine-500/85",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {display}
      </span>
    </div>
  );
}

function Stat({
  label,
  main,
  hint,
  tone,
}: {
  label: string;
  main: string;
  hint?: string;
  tone?: "good" | "warn";
}) {
  return (
    <div className="rounded-xl bg-cream-50 ring-1 ring-cream-300/60 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-marine-500/60">
        {label}
      </div>
      <div
        className={[
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "good" && "text-leaf-700",
          tone === "warn" && "text-marine-500",
          !tone && "text-marine-500",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {main}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-marine-500/60 tabular-nums">{hint}</div>
      )}
    </div>
  );
}

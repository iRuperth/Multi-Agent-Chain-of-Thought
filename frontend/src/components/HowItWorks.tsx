"use client";

import { useState } from "react";
import {
  Archive,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Bot,
  Code2,
  Database,
  Dices,
  FileText,
  Heart,
  MessageSquareText,
  PenLine,
  Sparkles,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { AgentKey, Lang } from "@/lib/i18n";
import { AGENT_ORDER, i18n } from "@/lib/i18n";

const ICONS: Record<AgentKey, React.ComponentType<{ className?: string }>> = {
  interviewer: MessageSquareText,
  market_analyst: Bot,
  copywriter: PenLine,
  demand_simulator: Dices,
  policy_validator: ShieldCheck,
  archivist: Archive,
};

type Mode = "everyone" | "simple" | "technical";

const MODE_META: Record<
  Mode,
  { icon: React.ComponentType<{ className?: string }>; tone: string; ring: string }
> = {
  everyone: {
    icon: Heart,
    tone: "bg-rose-500 text-cream-50",
    ring: "ring-rose-300",
  },
  simple: {
    icon: BookOpen,
    tone: "bg-leaf-500 text-cream-50",
    ring: "ring-leaf-300",
  },
  technical: {
    icon: Code2,
    tone: "bg-marine-500 text-cream-50",
    ring: "ring-marine-300",
  },
};

export function HowItWorks({ lang }: { lang: Lang }) {
  const t = i18n[lang];
  const [mode, setMode] = useState<Mode>("everyone");
  const [active, setActive] = useState<AgentKey | null>("interviewer");
  const meta = MODE_META[mode];

  const stateDesc =
    mode === "everyone"
      ? t.how.stateDescEveryone
      : mode === "simple"
      ? t.how.stateDescSimple
      : t.how.stateDescTech;

  const outputDesc =
    mode === "everyone"
      ? t.how.outputDescEveryone
      : mode === "simple"
      ? t.how.outputDescSimple
      : t.how.outputDescTech;

  const tagline =
    mode === "everyone"
      ? t.how.everyoneTagline
      : mode === "simple"
      ? t.how.simpleTagline
      : t.how.technicalTagline;

  return (
    <section id="how" className="relative scroll-mt-32 bg-cream-50/40 border-y border-cream-300/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-marine-500/8 text-marine-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-marine-500/15">
            <Sparkles className="h-3.5 w-3.5" />
            {t.how.eyebrow}
          </div>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold text-marine-500 tracking-tight">
            {t.how.title}
          </h2>
          <p className="mt-4 text-base text-marine-500/70 leading-relaxed">
            {t.how.subtitle}
          </p>

          {/* 3-way mode toggle */}
          <div className="mt-7 inline-flex items-center rounded-full bg-cream-200/70 p-1 ring-1 ring-cream-300/80">
            {(["everyone", "simple", "technical"] as const).map((m) => {
              const M = MODE_META[m];
              const activeMode = mode === m;
              const label =
                m === "everyone"
                  ? t.how.everyone
                  : m === "simple"
                  ? t.how.simple
                  : t.how.technical;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200",
                    activeMode
                      ? `${M.tone} shadow-soft`
                      : "text-marine-500/55 hover:text-marine-500",
                  ].join(" ")}
                >
                  <M.icon className="h-3 w-3" />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-marine-500/55">{tagline}</p>
        </header>

        {/* Map */}
        <div className="mt-12 grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="rounded-2xl bg-white ring-1 ring-cream-300/70 shadow-soft p-6 md:p-8">
            <Endpoint
              icon={FileText}
              title={t.how.inputTitle}
              desc={t.how.inputDesc}
              tone="input"
            />
            <ConnectorDown />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {AGENT_ORDER.map((key, i) => {
                const Icon = ICONS[key];
                const isActive = active === key;
                const agent = t.agents[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActive(key)}
                    aria-pressed={isActive}
                    className={[
                      "group relative rounded-xl p-4 text-left transition-all duration-300",
                      "ring-1 hover:-translate-y-0.5",
                      isActive
                        ? `bg-cream-50 ${meta.ring} shadow-soft`
                        : "bg-cream-50/60 ring-cream-300/70 hover:ring-marine-200",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300",
                          isActive ? meta.tone : "bg-cream-200 text-marine-500/60 group-hover:bg-marine-100",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-mono text-marine-500/45">
                        0{i + 1}
                      </span>
                    </div>
                    <div className="mt-3 font-semibold text-marine-500 text-sm leading-tight">
                      {agent.name}
                    </div>
                    <div className="mt-1 text-[11px] text-marine-500/60 line-clamp-2 leading-snug">
                      {agent.role}
                    </div>

                    {i < AGENT_ORDER.length - 1 && (
                      <span
                        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center text-marine-500/30"
                        aria-hidden
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <ConnectorDown />

            <div className={`rounded-xl ring-1 p-4 transition-all duration-500 bg-cream-50 ${meta.ring}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Database className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-marine-500 text-sm">
                    {t.how.stateTitle}
                  </div>
                  <div className="text-xs text-marine-500/70 leading-relaxed">
                    {stateDesc}
                  </div>
                </div>
                {mode === "technical" && (
                  <span className="hidden md:inline font-mono text-[11px] text-marine-500/60 bg-white/70 px-2 py-1 rounded ring-1 ring-marine-500/10">
                    offerly.domain.campaign.Campaign
                  </span>
                )}
              </div>
            </div>

            <ConnectorDown />

            <Endpoint
              icon={Sparkles}
              title={t.how.outputTitle}
              desc={outputDesc}
              tone="output"
            />
          </div>

          {/* Detail panel */}
          <aside className="lg:sticky lg:top-32">
            <div className="rounded-2xl bg-white ring-1 ring-cream-300/70 shadow-soft overflow-hidden">
              {active ? (
                <AgentDetail lang={lang} agentKey={active} mode={mode} />
              ) : (
                <div className="p-6 text-sm text-marine-500/60">
                  {t.how.pickAgent}
                </div>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-marine-500/50">
              {t.how.clickHint}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ConnectorDown() {
  return (
    <div className="flex justify-center my-4" aria-hidden>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-100 ring-1 ring-cream-300 text-marine-500/40">
        <ArrowDown className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function Endpoint({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tone: "input" | "output";
}) {
  return (
    <div
      className={[
        "rounded-xl p-4 ring-1 flex items-start gap-3",
        tone === "input"
          ? "bg-cream-100 ring-cream-300"
          : "bg-leaf-50 ring-leaf-200",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tone === "input"
            ? "bg-marine-500/10 text-marine-500"
            : "bg-leaf-500 text-cream-50",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-marine-500">{title}</div>
        <div className="text-xs text-marine-500/70 leading-relaxed mt-0.5">
          {desc}
        </div>
      </div>
    </div>
  );
}

function AgentDetail({
  lang,
  agentKey,
  mode,
}: {
  lang: Lang;
  agentKey: AgentKey;
  mode: Mode;
}) {
  const t = i18n[lang];
  const agent = t.agents[agentKey];
  const Icon = ICONS[agentKey];
  const M = MODE_META[mode];

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${M.tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="font-semibold text-marine-500">{agent.name}</div>
          <div
            className={
              mode === "technical"
                ? "text-xs font-mono text-marine-500/60"
                : "text-xs text-marine-500/60"
            }
          >
            {mode === "technical" ? agentKey : agent.role}
          </div>
        </div>
      </div>

      {mode === "everyone" && (
        <EveryoneDetail
          analogy={t.how.everyoneBlurbs[agentKey].analogy}
          example={t.how.everyoneBlurbs[agentKey].example}
          lang={lang}
        />
      )}

      {mode === "simple" && (
        <SimpleDetail
          intro={t.how.simpleBlurbs[agentKey].intro}
          example={t.how.simpleBlurbs[agentKey].example}
          lang={lang}
          exampleHeading={t.how.exampleHeading}
          inputHeading={t.how.inputHeading}
          outputHeading={t.how.outputHeading}
        />
      )}

      {mode === "technical" && (
        <TechnicalDetail
          summary={t.how.technicalBlurbs[agentKey].summary}
          reads={t.how.technicalBlurbs[agentKey].reads}
          writes={t.how.technicalBlurbs[agentKey].writes}
          cot={t.how.technicalBlurbs[agentKey].cot}
          tools={agent.tools}
          prompt={t.how.technicalBlurbs[agentKey].prompt}
          promptHeading={t.how.promptHeading}
          lang={lang}
        />
      )}
    </div>
  );
}

function EveryoneDetail({
  analogy,
  example,
  lang,
}: {
  analogy: string;
  example: string;
  lang: Lang;
}) {
  return (
    <div className="mt-5 space-y-4">
      <p className="text-sm text-marine-500/85 leading-relaxed">{analogy}</p>
      <div className="rounded-lg bg-rose-50/70 ring-1 ring-rose-200/70 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 mb-1.5">
          {lang === "es" ? "Ejemplo" : "Example"}
        </div>
        <p className="text-sm text-marine-500/85 leading-relaxed">{example}</p>
      </div>
    </div>
  );
}

function SimpleDetail({
  intro,
  example,
  lang,
  exampleHeading,
  inputHeading,
  outputHeading,
}: {
  intro: string;
  example: { input: string; output: string };
  lang: Lang;
  exampleHeading: string;
  inputHeading: string;
  outputHeading: string;
}) {
  return (
    <div className="mt-5 space-y-4">
      <p className="text-sm text-marine-500/85 leading-relaxed">{intro}</p>

      <div className="rounded-lg bg-leaf-50/70 ring-1 ring-leaf-200/70 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-leaf-700 mb-3">
          {exampleHeading}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-marine-500/55 mb-1">
              {inputHeading}
            </div>
            <p className="text-sm text-marine-500/85 leading-relaxed italic">
              “{example.input}”
            </p>
          </div>
          <div className="flex justify-center text-marine-500/30">
            <ArrowDown className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-marine-500/55 mb-1">
              {outputHeading}
            </div>
            <p className="text-sm text-marine-500/85 leading-relaxed">
              {example.output}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalDetail({
  summary,
  reads,
  writes,
  cot,
  tools,
  prompt,
  promptHeading,
  lang,
}: {
  summary: string;
  reads: string;
  writes: string;
  cot: string[];
  tools: string;
  prompt?: string;
  promptHeading: string;
  lang: Lang;
}) {
  return (
    <div className="mt-5 space-y-4 text-sm">
      <p className="text-marine-500/85 leading-relaxed">{summary}</p>

      <div className="grid gap-2">
        <KV label={lang === "es" ? "Lee" : "Reads"} value={reads} mono />
        <KV label={lang === "es" ? "Escribe" : "Writes"} value={writes} mono />
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-marine-500/60 mb-2">
          {lang === "es" ? "Bucle Chain-of-Thought" : "Chain-of-Thought loop"}
        </div>
        <ol className="space-y-1.5">
          {cot.map((step, j) => (
            <li
              key={j}
              className="flex gap-2.5 text-[13px] text-marine-500/85 leading-snug"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marine-100 text-[11px] font-semibold text-marine-500 font-mono">
                {j + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg bg-cream-50 ring-1 ring-cream-300 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-marine-500/60">
          <Wrench className="h-3 w-3" />
          Tools
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {tools.split(",").map((tool) => (
            <span
              key={tool}
              className="font-mono text-[11px] bg-marine-500/5 text-marine-500 px-2 py-0.5 rounded ring-1 ring-marine-500/10"
            >
              {tool.trim()}
            </span>
          ))}
        </div>
      </div>

      {prompt && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-marine-500/60 mb-1.5">
            {promptHeading}
          </div>
          <p className="text-[13px] text-marine-500/75 leading-relaxed font-mono bg-cream-50 ring-1 ring-cream-300 p-3 rounded-lg">
            {prompt}
          </p>
        </div>
      )}
    </div>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg bg-cream-50/60 ring-1 ring-cream-200 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-marine-500/55">
        {label}
      </div>
      <div
        className={[
          "mt-0.5 text-[13px] text-marine-500/85 leading-snug",
          mono && "font-mono break-words",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

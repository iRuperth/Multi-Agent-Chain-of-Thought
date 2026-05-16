"use client";

import { useState } from "react";
import {
  Bot,
  ChevronDown,
  CircleCheck,
  Loader2,
  MessageSquareText,
  PenLine,
  Dices,
  ShieldCheck,
  Archive,
  Wrench,
} from "lucide-react";
import type { AgentKey, Lang } from "@/lib/i18n";
import { AGENT_ORDER, i18n } from "@/lib/i18n";

type Status = "pending" | "running" | "done";

const ICONS: Record<AgentKey, React.ComponentType<{ className?: string }>> = {
  interviewer: MessageSquareText,
  market_analyst: Bot,
  copywriter: PenLine,
  demand_simulator: Dices,
  policy_validator: ShieldCheck,
  archivist: Archive,
};

type Props = {
  lang: Lang;
  currentAgent: string | null;
  completed: string[];
  isDone: boolean;
  isRunning: boolean;
  lastLog?: string | null;
};

export function AgentTimeline({
  lang,
  currentAgent,
  completed,
  isDone,
  isRunning,
  lastLog,
}: Props) {
  const t = i18n[lang];
  const [expanded, setExpanded] = useState<AgentKey | null>(null);

  const stepFor = (key: AgentKey): Status => {
    if (completed.includes(key)) return "done";
    if (currentAgent === key) return "running";
    return "pending";
  };

  const doneCount = completed.length;
  const total = AGENT_ORDER.length;
  const progress = isDone ? 100 : Math.round((doneCount / total) * 100);

  if (!isRunning && !isDone) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 pb-12 animate-fade-in">
      <div className="rounded-2xl bg-white ring-1 ring-cream-300/70 shadow-soft p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-marine-500 flex items-center gap-2">
              {isDone ? (
                <CircleCheck className="h-5 w-5 text-leaf-500" />
              ) : (
                <Loader2 className="h-5 w-5 text-marine-500 animate-spin" />
              )}
              {t.workingTitle}
            </h2>
            <p className="mt-1 text-sm text-marine-500/70 max-w-xl">
              {t.workingSubtitle}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-marine-500/60">
              {t.workingProgress(Math.min(doneCount + (isDone ? 0 : 1), total), total)}
            </div>
            <div className="mt-1 text-2xl font-semibold text-marine-500 tabular-nums">
              {progress}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2 w-full rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-marine-500 via-marine-400 to-leaf-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timeline */}
        <ol className="mt-7 grid gap-3">
          {AGENT_ORDER.map((key, i) => {
            const status = stepFor(key);
            const Icon = ICONS[key];
            const agent = t.agents[key];
            const isExpanded = expanded === key;
            return (
              <li key={key}>
                <div
                  className={[
                    "group relative rounded-xl ring-1 transition-all duration-300",
                    status === "done" && "bg-leaf-50/60 ring-leaf-200",
                    status === "running" && "bg-marine-50/70 ring-marine-200 shadow-soft",
                    status === "pending" && "bg-cream-50 ring-cream-300/60",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : key)}
                    aria-expanded={isExpanded}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-xl transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {/* Step indicator */}
                    <div
                      className={[
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                        status === "done" && "bg-leaf-500 text-cream-50",
                        status === "running" && "bg-marine-500 text-cream-50",
                        status === "pending" && "bg-cream-200 text-marine-500/40",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {status === "running" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : status === "done" ? (
                        <CircleCheck className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                      {status === "running" && (
                        <span className="absolute inset-0 rounded-full ring-4 ring-marine-200 animate-pulse-soft" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-marine-500/50">
                          0{i + 1}
                        </span>
                        <span className="font-semibold text-marine-500">
                          {agent.name}
                        </span>
                        <span className="text-xs text-marine-500/60 hidden sm:inline">
                          · {agent.role}
                        </span>
                        {status === "running" && (
                          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-marine-500 bg-marine-100 px-2 py-0.5 rounded-full">
                            {lang === "es" ? "trabajando" : "working"}
                          </span>
                        )}
                        {status === "done" && (
                          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-leaf-700 bg-leaf-100 px-2 py-0.5 rounded-full">
                            {lang === "es" ? "hecho" : "done"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-marine-500/70 line-clamp-1">
                        {agent.short}
                      </p>
                      {status === "running" && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-leaf-500" />
                          </span>
                          <span className="text-xs font-mono text-marine-500/65 truncate max-w-[36ch] sm:max-w-[60ch]">
                            {lastLog ?? (lang === "es" ? "pensando…" : "thinking…")}
                          </span>
                        </div>
                      )}
                    </div>

                    <ChevronDown
                      className={[
                        "h-4 w-4 text-marine-500/50 shrink-0 transition-transform duration-300",
                        isExpanded && "rotate-180",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  </button>

                  {/* Expanded detail */}
                  <div
                    className={[
                      "grid transition-all duration-300 ease-out",
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-5 pt-1 border-t border-cream-300/60">
                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-marine-500/60 mb-1">
                              {t.detailHeading}
                            </div>
                            <p className="text-sm text-marine-500/85 leading-relaxed">
                              {agent.goal}
                            </p>

                            <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-marine-500/60 mb-2">
                              {t.agentLogicHeading}
                            </div>
                            <ol className="space-y-1.5">
                              {agent.logic.map((step, j) => (
                                <li
                                  key={j}
                                  className="flex gap-2.5 text-sm text-marine-500/85"
                                >
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marine-100 text-[11px] font-semibold text-marine-500">
                                    {j + 1}
                                  </span>
                                  <span className="leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <aside className="md:w-56">
                            <div className="rounded-lg bg-cream-50 ring-1 ring-cream-300 p-3">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-marine-500/60">
                                <Wrench className="h-3 w-3" />
                                {t.agentToolsHeading}
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {agent.tools.split(",").map((tool) => (
                                  <span
                                    key={tool}
                                    className="font-mono text-[11px] bg-marine-500/5 text-marine-500 px-2 py-0.5 rounded ring-1 ring-marine-500/10"
                                  >
                                    {tool.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </aside>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {i < AGENT_ORDER.length - 1 && (
                  <div className="ml-9 h-3 w-px bg-cream-300" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

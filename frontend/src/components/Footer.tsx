"use client";

import type { Lang } from "@/lib/i18n";

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-auto border-t border-cream-300/60">
      <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between text-xs text-marine-500/55 flex-wrap gap-3">
        <span>© {new Date().getFullYear()} Offerly · {lang === "es" ? "Onboarding multi-agente" : "Multi-agent onboarding"}</span>
        <span className="font-mono">CrewAI · Ollama · FastAPI · Next.js</span>
      </div>
    </footer>
  );
}

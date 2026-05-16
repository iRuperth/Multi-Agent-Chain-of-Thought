"use client";

import { useState } from "react";
import { AgentTimeline } from "@/components/AgentTimeline";
import { ApiSection } from "@/components/ApiSection";
import { ConsolePanel } from "@/components/Console";
import { Contact } from "@/components/Contact";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { Landing } from "@/components/Landing";
import { MissingFieldsBanner } from "@/components/MissingFieldsBanner";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { PromptCard } from "@/components/PromptCard";
import { ResultPanel } from "@/components/ResultPanel";
import { useOnboarding } from "@/lib/useOnboarding";
import type { Lang } from "@/lib/i18n";

type View = "landing" | "platform";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<View>("landing");
  const { state, submit, reset, clearLogs } = useOnboarding();

  const isRunning = state.status === "running" || state.status === "starting";
  const isDone = state.status === "done";
  const isError = state.status === "error";

  const goPlatform = () => {
    setView("platform");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goLanding = () => {
    reset();
    setView("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {view === "platform" && (
        <Navbar
          lang={lang}
          onLangChange={setLang}
          view={view}
          onGoLanding={goLanding}
          onGoPlatform={goPlatform}
        />
      )}

      <main className="flex-1">
        {view === "landing" ? (
          <>
            <Landing lang={lang} onEnter={goPlatform} onLangChange={setLang} />
            <HowItWorks lang={lang} />
            <Pricing lang={lang} />
            <ApiSection lang={lang} />
            <Contact lang={lang} />
          </>
        ) : (
          <>
            {state.status === "idle" && (
              <PromptCard
                lang={lang}
                disabled={false}
                onSubmit={(text, demo, creative) =>
                  submit(text, lang, demo, creative)
                }
              />
            )}

            {isError && (
              <ErrorBanner
                lang={lang}
                detail={state.error ?? undefined}
                onReset={reset}
              />
            )}

            {(isRunning || isDone) && (
              <AgentTimeline
                lang={lang}
                currentAgent={state.currentAgent}
                completed={state.completed}
                isDone={isDone}
                isRunning={isRunning}
                lastLog={state.lastLog}
              />
            )}

            {isDone && state.campaign && (
              <>
                <MissingFieldsBanner lang={lang} campaign={state.campaign} />
                <ResultPanel
                  lang={lang}
                  campaign={state.campaign}
                  summary={state.summary}
                  onReset={reset}
                />
              </>
            )}
          </>
        )}
      </main>

      <Footer lang={lang} />

      {view === "platform" && (
        <ConsolePanel lang={lang} logs={state.logs} onClear={clearLogs} />
      )}
    </div>
  );
}

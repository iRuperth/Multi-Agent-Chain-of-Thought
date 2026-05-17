"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Campaign, LogLine } from "./types";

type RunState = {
  jobId: string | null;
  status: "idle" | "starting" | "running" | "done" | "error";
  currentAgent: string | null;
  completed: string[];
  campaign: Campaign | null;
  summary: string;
  error: string | null;
  demo: boolean;
  logs: LogLine[];
  lastLog: string | null;
};

const initial: RunState = {
  jobId: null,
  status: "idle",
  currentAgent: null,
  completed: [],
  campaign: null,
  summary: "",
  error: null,
  demo: false,
  logs: [],
  lastLog: null,
};

const MAX_LOGS = 2000;

export function useOnboarding() {
  const [state, setState] = useState<RunState>(initial);
  const esRef = useRef<EventSource | null>(null);

  const cleanup = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState(initial);
  }, [cleanup]);

  const clearLogs = useCallback(() => {
    setState((s) => ({ ...s, logs: [], lastLog: null }));
  }, []);

  const submit = useCallback(
    async (
      merchant_input: string,
      lang: string,
      demo: boolean,
      creative: boolean = false,
    ) => {
      cleanup();
      setState({ ...initial, status: "starting", demo });

      let jobId: string;
      try {
        const r = await fetch("/api/onboard", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ merchant_input, lang, demo, creative }),
        });
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text || `HTTP ${r.status}`);
        }
        const body = (await r.json()) as { job_id: string; demo: boolean };
        jobId = body.job_id;
      } catch (e) {
        setState((s) => ({
          ...s,
          status: "error",
          error: e instanceof Error ? e.message : "Network error",
        }));
        return;
      }

      setState((s) => ({ ...s, jobId, status: "running" }));

      const es = new EventSource(`/api/stream/${jobId}`);
      esRef.current = es;

      es.addEventListener("snapshot", (ev) => {
        const data = JSON.parse((ev as MessageEvent).data);
        setState((s) => ({
          ...s,
          currentAgent: data.current_agent,
          completed: data.completed ?? [],
          demo: data.demo ?? s.demo,
        }));
      });

      es.addEventListener("status", (ev) => {
        const data = JSON.parse((ev as MessageEvent).data);
        setState((s) => ({ ...s, status: data.status, demo: data.demo ?? s.demo }));
      });

      es.addEventListener("agent_started", (ev) => {
        const data = JSON.parse((ev as MessageEvent).data);
        setState((s) => ({
          ...s,
          currentAgent: data.agent,
          completed: data.completed ?? s.completed,
        }));
      });

      es.addEventListener("agent_completed", (ev) => {
        const data = JSON.parse((ev as MessageEvent).data);
        setState((s) => ({
          ...s,
          currentAgent: null,
          completed: data.completed ?? s.completed,
        }));
      });

      es.addEventListener("log", (ev) => {
        const data = JSON.parse((ev as MessageEvent).data) as LogLine;
        setState((s) => {
          const next = s.logs.length >= MAX_LOGS ? s.logs.slice(-MAX_LOGS + 1) : s.logs;
          return { ...s, logs: [...next, data], lastLog: data.line };
        });
      });

      es.addEventListener("done", (ev) => {
        const data = JSON.parse((ev as MessageEvent).data);
        setState((s) => ({
          ...s,
          status: "done",
          currentAgent: null,
          completed: data.completed ?? s.completed,
          campaign: data.campaign,
          summary: data.summary ?? "",
        }));
        cleanup();
      });

      es.addEventListener("error", (ev) => {
        // ev for SSE errors may be empty; try data, fallback to network msg.
        let message = "Stream error";
        try {
          const data = JSON.parse((ev as MessageEvent).data);
          message = data.message || message;
        } catch {
          // ignore
        }
        setState((s) => ({ ...s, status: "error", error: message }));
        cleanup();
      });

      es.onerror = () => {
        // Generic transport-level error — only surface if we're not already done.
        setState((s) =>
          s.status === "done"
            ? s
            : { ...s, status: "error", error: s.error ?? "Connection lost" }
        );
        cleanup();
      };
    },
    [cleanup]
  );

  return { state, submit, reset, clearLogs };
}

"use client";

import { ArrowRight, CalendarClock, Mail, Sparkles } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

export function Contact({ lang }: { lang: Lang }) {
  const t = i18n[lang];
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-20">
        <div className="rounded-3xl bg-marine-500 text-cream-50 shadow-lift p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cream-50/10 text-cream-50/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-cream-50/15">
              <Sparkles className="h-3.5 w-3.5" />
              {t.contact.eyebrow}
            </div>
            <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
              {t.contact.title}
            </h2>
            <p className="mt-3 text-cream-50/80 leading-relaxed max-w-xl">
              {t.contact.subtitle}
            </p>
            <p className="mt-2 text-xs text-cream-50/55">{t.contact.note}</p>
          </div>

          <div className="flex flex-col gap-3 min-w-[220px]">
            <a
              href={`mailto:${t.contact.email}`}
              className="group inline-flex items-center justify-between gap-3 rounded-full bg-leaf-500 text-cream-50 hover:bg-leaf-400 px-5 py-3 text-sm font-semibold shadow-soft transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t.contact.emailLabel}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="group inline-flex items-center justify-between gap-3 rounded-full bg-cream-50/10 text-cream-50 hover:bg-cream-50/15 px-5 py-3 text-sm font-semibold ring-1 ring-cream-50/15 transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                {t.contact.bookLabel}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <div className="text-center text-xs text-cream-50/55 font-mono mt-1">
              {t.contact.email}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

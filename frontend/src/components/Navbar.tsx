"use client";

import type { Lang } from "@/lib/i18n";
import { i18n } from "@/lib/i18n";

type Props = {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  view: "landing" | "platform";
  onGoLanding: () => void;
  onGoPlatform: () => void;
};

export function Navbar({
  lang,
  onLangChange,
  view,
  onGoLanding,
  onGoPlatform,
}: Props) {
  const t = i18n[lang];

  const goSection = (id: string) => (e: React.MouseEvent) => {
    if (view === "platform") {
      e.preventDefault();
      onGoLanding();
      // wait a tick for the view to mount, then scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }
  };

  const leftLinks = [
    { label: t.navHome, href: "#top", id: "top" },
    { label: t.navHow, href: "#how", id: "how" },
  ];
  const rightLinks = [
    { label: t.navPricing, href: "#pricing", id: "pricing" },
    { label: t.navApi, href: "#api", id: "api" },
    { label: t.navContact, href: "#contact", id: "contact" },
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-cream-50/85 border-b border-cream-300/60">
      <div className="w-full px-5 lg:px-8 h-28 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <nav className="flex items-center gap-6 text-sm font-medium text-marine-500/80">
          {view === "landing" &&
            leftLinks.map((l) => (
              <NavLink key={l.label} href={l.href} onClick={goSection(l.id)}>
                {l.label}
              </NavLink>
            ))}
        </nav>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={view === "platform" ? onGoLanding : onGoPlatform}
            className="block transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]"
            aria-label="Offerly home"
          >
            <img
              src="/static/Offerly.png"
              alt="Offerly"
              className="h-24 md:h-28 w-auto select-none"
              draggable={false}
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-5">
          {view === "landing" && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-marine-500/80">
              {rightLinks.map((l) => (
                <NavLink key={l.label} href={l.href} onClick={goSection(l.id)}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          )}
          <LangToggle lang={lang} onChange={onLangChange} />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="relative transition-colors duration-200 hover:text-marine-500 group"
    >
      {children}
      <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-leaf-500 transition-all duration-300 group-hover:w-full" />
    </a>
  );
}

function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className="relative inline-flex items-center rounded-full bg-cream-200/70 p-1 ring-1 ring-cream-300/80"
    >
      {(["en", "es"] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(code)}
            className={[
              "relative px-3.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200",
              active
                ? "bg-marine-500 text-cream-50 shadow-soft"
                : "text-marine-500/60 hover:text-marine-500",
            ].join(" ")}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

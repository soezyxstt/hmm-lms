"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const NAV: ReadonlyArray<{ id: string; label: string }> = [
  { id: "manifesto", label: "Manifesto" },
  { id: "visi", label: "Visi" },
  { id: "editorial", label: "Spotlight" },
  { id: "pillars", label: "Pillars" },
  { id: "heritage", label: "Heritage" },
  { id: "misi", label: "Misi" },
  { id: "solidarity", label: "Solidarity" },
];

const SECTION_SCROLL_OFFSET = 88;

function computeActiveSection(): string {
  const id = [...NAV].reverse().find(({ id: sectionId }) => {
    const el = document.getElementById(sectionId);
    if (!el) return false;
    return el.getBoundingClientRect().top <= SECTION_SCROLL_OFFSET;
  })?.id;
  return id ?? NAV[0]!.id;
}

function computeScrollProgress(): number {
  const h = document.documentElement;
  const maxScroll = h.scrollHeight - h.clientHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(100, Math.max(0, (h.scrollTop / maxScroll) * 100));
}

export function HmmExternalNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(NAV[0]!.id);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setScrollProgress(computeScrollProgress());
      setActiveSection(computeActiveSection());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className="hmm-nav-sticky relative pt-[env(safe-area-inset-top,0px)]"
      data-hmm-scrolled={scrolled ? "true" : "false"}
    >
      <div className="hmm-scroll-progress-track" aria-hidden>
        <div
          className="hmm-scroll-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="hmm-nav-inner">
        <a
          href="#manifesto"
          className="group flex min-h-11 min-w-11 shrink-0 items-center gap-2 sm:min-h-0 sm:gap-3"
        >
          <Image
            src="/external/images/logos/logo-hmm.png"
            alt="HMM ITB"
            width={40}
            height={40}
            className="h-8 w-8 object-contain drop-shadow-md sm:h-9 sm:w-9"
            priority
          />
          <div className="hidden flex-col sm:flex">
            <span className="hmm-title text-sm font-bold tracking-wide text-white drop-shadow">
              HMM ITB
            </span>
            <span className="hmm-sans text-[0.6rem] font-medium tracking-[0.2em] text-white/80">
              HIMPUNAN MAHASISWA MESIN ITB
            </span>
          </div>
        </a>

        <nav
          className="hmm-sans max-w-[calc(100%-5.5rem)] min-w-0 snap-x snap-mandatory overflow-x-auto scroll-smooth [-webkit-overflow-scrolling:touch] sm:max-w-none"
          aria-label="External landing"
        >
          <ul className="flex flex-nowrap items-center justify-end gap-x-0.5 pr-1 sm:gap-x-1 sm:pr-0">
            {NAV.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="shrink-0 snap-center">
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "block min-h-11 min-w-[2.75rem] rounded-sm px-2 py-2.5 text-center text-[0.6rem] leading-tight font-semibold tracking-[0.1em] text-white/90 transition-[color,background,box-shadow] duration-200 sm:min-h-0 sm:min-w-0 sm:px-2.5 sm:py-2.5 sm:text-[0.65rem] sm:tracking-[0.12em] md:px-3 md:text-xs",
                      "hover:bg-white/10 hover:text-white",
                      "focus-visible:ring-2 focus-visible:ring-[var(--color-hmm-yellow)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_srgb,var(--color-hmm-navy-deep)_90%,black)] focus-visible:outline-none",
                      isActive && "hmm-nav-link--active",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

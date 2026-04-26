import {
  RiBriefcase4Line,
  RiHeart2Line,
  RiHomeHeartLine,
  RiLightbulbLine,
  RiLinksLine,
  RiSettings3Line,
  RiShareLine,
  RiUserStarLine,
} from "@remixicon/react";
import { misi } from "./content";
import { ExternalReveal } from "./external-reveal";

const misiIcons = [
  RiLightbulbLine,
  RiUserStarLine,
  RiBriefcase4Line,
  RiHomeHeartLine,
  RiLinksLine,
  RiHeart2Line,
  RiShareLine,
  RiSettings3Line,
] as const;

export function ExternalMisiSection() {
  return (
    <section
      id="misi"
      className="hmm-chapter-dark hmm-section-y-lg relative scroll-mt-[4.5rem] overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-[var(--color-hmm-navy-deep)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,color-mix(in_srgb,var(--color-hmm-navy)_40%,transparent),transparent_65%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-[86rem] px-4 sm:px-8">
        <div className="hmm-eyebrow-rule text-white/75">
          <p className="hmm-type-eyebrow text-[var(--color-hmm-cream)]">
            Arah kerja
          </p>
        </div>
        <h2 className="hmm-type-section mt-2 text-white">Misi</h2>
        <p className="hmm-sans mt-3 max-w-xl text-sm font-medium text-white/70 sm:text-[0.95rem]">
          Delapan fokus — baca maksudnya dalam hitungan detik, detail resmi
          sesaat lagi.
        </p>

        <ExternalReveal className="mt-10 md:mt-12">
          <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {misi.map((item, i) => {
              const Icon = misiIcons[i]!;
              const n = String(i + 1).padStart(2, "0");
              return (
                <li key={i}>
                  <div className="hmm-misi-card flex h-full min-h-0 flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="hmm-misi-card__index hmm-title text-2xl font-bold tabular-nums sm:text-[1.65rem]"
                        aria-hidden
                      >
                        {n}
                      </span>
                      <Icon
                        className="hmm-misi-card__icon h-7 w-7 shrink-0"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                    </div>
                    <h3 className="hmm-sans mt-3 text-base leading-snug font-bold text-white sm:text-lg">
                      {item.cardTitle}
                    </h3>
                    <p className="hmm-sans mt-2 text-sm leading-relaxed font-medium text-[color-mix(in_srgb,var(--color-hmm-cream)_90%,var(--color-hmm-white))] sm:text-[0.95rem]">
                      {item.oneLiner}
                    </p>
                    <details className="group/m hmm-misi-card__details">
                      <summary className="hmm-misi-card__summary flex min-h-10 cursor-pointer list-none items-center font-bold">
                        Teks resmi
                      </summary>
                      <p className="hmm-type-prose mt-2 text-sm leading-relaxed text-white/88">
                        {item.summary}
                      </p>
                      <p className="hmm-type-prose mt-3 text-sm leading-relaxed text-white/78">
                        {item.body}
                      </p>
                    </details>
                  </div>
                </li>
              );
            })}
          </ol>
        </ExternalReveal>
      </div>
    </section>
  );
}

import React from "react";
import type { AboutSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: AboutSectionConfig;
};

export function AboutSection({ section }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24" id={section.anchorId}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          {section.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">
              {section.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17352d] sm:text-4xl">
            {section.title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[#657970] whitespace-pre-line">
            {section.body}
          </div>

          {section.stats && section.stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#dce9df] pt-8 sm:grid-cols-3">
              {section.stats
                .filter((s) => s.enabled)
                .map((st) => (
                  <div key={st.id}>
                    <p className="text-3xl font-extrabold text-[#17624d]">{st.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#17352d]">
                      {st.label}
                    </p>
                    {st.helperText && (
                      <p className="mt-1 text-[11px] text-[#8ba097]">{st.helperText}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {section.imageUrl && (
          <div className="overflow-hidden rounded-3xl border border-[#cfe3d6] shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.imageUrl}
              alt={section.imageAlt || section.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}

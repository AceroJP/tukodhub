import React from "react";
import type { TestimonialsSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: TestimonialsSectionConfig;
};

export function TestimonialsSection({ section }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative py-20 lg:py-24" id={section.anchorId}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          {section.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">
              {section.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17352d] sm:text-4xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-4 text-base text-[#657970]">{section.subtitle}</p>
          )}
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {section.testimonials
            .filter((t) => t.enabled)
            .map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-3xl border border-[#dce9df] bg-white p-8 shadow-xs"
              >
                <div>
                  {t.rating && (
                    <div className="flex gap-1 text-[#e49b3f] mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  )}
                  <blockquote className="text-sm leading-relaxed text-[#526b63] italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-[#f0f4f2] pt-4">
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.avatarUrl}
                      alt={t.authorName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#17624d] text-sm font-bold text-white">
                      {t.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#17352d]">{t.authorName}</p>
                    <p className="text-[11px] text-[#8ba097]">
                      {t.authorRole} · {t.companyName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

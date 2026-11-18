import React from "react";
import { LandingCard } from "../ui/LandingCard";
import type { ServicesSectionConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  section: ServicesSectionConfig;
  interactive?: InteractivePreviewOptions;
};

export function ServicesSection({ section, interactive }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative border-t border-[#e1e9e3] bg-white py-20 lg:py-24" id={section.anchorId}>
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.cards
            .filter((c) => c.enabled)
            .map((card) => (
              <LandingCard
                key={card.id}
                card={card}
                variant="elevated"
                interactive={interactive}
                sectionId={section.id}
              />
            ))}
        </div>
      </div>
    </section>
  );
}

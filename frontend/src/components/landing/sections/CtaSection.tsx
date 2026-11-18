import React from "react";
import { LandingButton } from "../ui/LandingButton";
import type { CtaSectionConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  section: CtaSectionConfig;
  interactive?: InteractivePreviewOptions;
};

export function CtaSection({ section, interactive }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24" id={section.anchorId}>
      <div className="rounded-[2.5rem] bg-[#17352d] px-8 py-16 text-center text-white sm:px-16 sm:py-20 shadow-2xl">
        <div className="mx-auto max-w-2xl">
          {section.eyebrow && (
            <span className="inline-block rounded-full bg-[#dbeee2]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#e9bd67]">
              {section.eyebrow}
            </span>
          )}
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {section.headline}
          </h2>
          <p className="mt-6 text-base text-[#a6c2b5] leading-relaxed">
            {section.description}
          </p>

          {section.buttons && section.buttons.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {section.buttons
                .filter((b) => b.enabled)
                .map((b) => (
                  <LandingButton
                    key={b.id}
                    button={b}
                    size="lg"
                    interactive={interactive}
                    sectionId={section.id}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

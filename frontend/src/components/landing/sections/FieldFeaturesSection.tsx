import React from "react";
import { LandingIcon } from "../ui/LandingIcon";
import type { FieldFeaturesSectionConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  section: FieldFeaturesSectionConfig;
  interactive?: InteractivePreviewOptions;
};

export function FieldFeaturesSection({ section, interactive }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24" id={section.anchorId}>
      <div>
        {section.eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">
            {section.eyebrow}
          </p>
        )}
        <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight text-[#17352d] sm:text-4xl">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="mt-4 text-base text-[#657970] max-w-md">{section.subtitle}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {section.cards
          .filter((c) => c.enabled)
          .map((card) => {
            const isSelected = interactive?.selectedElementId === card.id;
            const isHovered = interactive?.hoveredElementId === card.id;

            const interactiveRing = interactive?.onSelectElement
              ? isSelected
                ? "ring-2 ring-[#e9bd67] ring-offset-2 shadow-xl bg-amber-50/30 relative z-10"
                : isHovered
                ? "ring-2 ring-[#e9bd67]/70 ring-offset-1 relative z-10"
                : "transition hover:border-[#17624d]/30"
              : "";

            return (
              <div
                key={card.id}
                onClick={(e) => {
                  if (interactive?.onSelectElement) {
                    e.stopPropagation();
                    interactive.onSelectElement(card.id, section.id);
                  }
                }}
                onMouseEnter={() => interactive?.onHoverElement?.(card.id)}
                onMouseLeave={() => interactive?.onHoverElement?.(null)}
                className={`rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs cursor-pointer ${interactiveRing}`}
              >
                {isSelected && (
                  <div className="inline-block mb-2 rounded bg-[#e9bd67] px-2 py-0.5 text-[9px] font-bold text-[#17352d]">
                    ✏ Editing Feature
                  </div>
                )}
                <div className="text-2xl text-[#17624d]">
                  {card.iconName ? <LandingIcon name={card.iconName} size={24} /> : "↗"}
                </div>
                <h3 className="mt-5 font-bold text-lg text-[#17352d]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#657970]">{card.description}</p>
              </div>
            );
          })}
      </div>
    </section>
  );
}

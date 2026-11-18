import React from "react";
import type { WorkflowSectionConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  section: WorkflowSectionConfig;
  interactive?: InteractivePreviewOptions;
};

export function WorkflowSection({ section, interactive }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative border-y border-[#e1e9e3] bg-white/55 py-20 lg:py-24" id={section.anchorId}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-xl">
          {section.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">
              {section.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17352d] sm:text-4xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-3 text-base text-[#657970]">{section.subtitle}</p>
          )}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {section.cards
            .filter((c) => c.enabled)
            .map((card, idx) => {
              const displayNum = card.badge || String(idx + 1).padStart(2, "0");
              const isSelected = interactive?.selectedElementId === card.id;
              const isHovered = interactive?.hoveredElementId === card.id;

              const interactiveRing = interactive?.onSelectElement
                ? isSelected
                  ? "ring-2 ring-[#e9bd67] ring-offset-2 bg-amber-50/40 shadow-xs relative z-10"
                  : isHovered
                  ? "ring-2 ring-[#e9bd67]/70 ring-offset-1 relative z-10"
                  : "transition hover:bg-white/70"
                : "";

              return (
                <article
                  key={card.id}
                  onClick={(e) => {
                    if (interactive?.onSelectElement) {
                      e.stopPropagation();
                      interactive.onSelectElement(card.id, section.id);
                    }
                  }}
                  onMouseEnter={() => interactive?.onHoverElement?.(card.id)}
                  onMouseLeave={() => interactive?.onHoverElement?.(null)}
                  className={`border-t-2 border-[#dce9df] pt-5 rounded-xl p-3 -m-3 cursor-pointer ${interactiveRing}`}
                >
                  {isSelected && (
                    <div className="inline-block mb-2 rounded bg-[#e9bd67] px-2 py-0.5 text-[9px] font-bold text-[#17352d]">
                      ✏ Editing Step {displayNum}
                    </div>
                  )}
                  <p className="text-sm font-bold text-[#d19a3a]">{displayNum}</p>
                  <h3 className="mt-4 text-xl font-bold text-[#17352d]">{card.title}</h3>
                  <p className="mt-3 max-w-xs leading-7 text-[#657970]">{card.description}</p>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
}

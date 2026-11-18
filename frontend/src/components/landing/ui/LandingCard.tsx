import React from "react";
import { LandingIcon } from "./LandingIcon";
import { LandingButton } from "./LandingButton";
import type { CardBlock, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  card: CardBlock;
  className?: string;
  variant?: "standard" | "minimal" | "elevated";
  interactive?: InteractivePreviewOptions;
  sectionId?: string;
};

export function LandingCard({
  card,
  className = "",
  variant = "standard",
  interactive,
  sectionId,
}: Props) {
  if (!card.enabled) return null;

  const isSelected = interactive?.selectedElementId === card.id;
  const isHovered = interactive?.hoveredElementId === card.id;

  const variantClass = {
    standard: "rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs",
    minimal: "rounded-xl border-t-2 border-[#dce9df] bg-transparent pt-5",
    elevated: "rounded-2xl border border-[#cfe3d6] bg-white p-7 shadow-lg shadow-[#17352d]/5",
  }[variant];

  const interactiveClasses = interactive?.onSelectElement
    ? isSelected
      ? "ring-2 ring-[#e9bd67] ring-offset-2 shadow-xl bg-amber-50/30 relative z-20 cursor-pointer"
      : isHovered
      ? "ring-2 ring-[#e9bd67]/70 ring-offset-1 relative z-20 cursor-pointer"
      : "relative cursor-pointer transition hover:border-[#17624d]/30"
    : "";

  return (
    <article
      onClick={(e) => {
        if (interactive?.onSelectElement) {
          e.stopPropagation();
          interactive.onSelectElement(card.id, sectionId);
        }
      }}
      onMouseEnter={() => interactive?.onHoverElement?.(card.id)}
      onMouseLeave={() => interactive?.onHoverElement?.(null)}
      className={`${variantClass} ${interactiveClasses} flex flex-col justify-between ${className}`}
    >
      {isSelected && (
        <div className="absolute -top-3 left-4 rounded-full bg-[#e9bd67] px-2.5 py-0.5 text-[10px] font-bold text-[#17352d] shadow-sm pointer-events-none">
          ✏ Editing Card
        </div>
      )}

      <div>
        {/* Top Header: Badge / Icon */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {card.iconName && (
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#dbeee2] text-[#17624d]">
              <LandingIcon name={card.iconName} size={20} />
            </div>
          )}
          {card.badge && (
            <span className="rounded-full bg-[#f3dfb2] px-2.5 py-0.5 text-[11px] font-bold text-[#b17a25]">
              {card.badge}
            </span>
          )}
        </div>

        {/* Optional Card Image */}
        {card.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageUrl}
              alt={card.imageAlt || card.title}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Title & Subtitle */}
        <h3 className="text-lg font-bold text-[#17352d] leading-snug">{card.title}</h3>
        {card.subtitle && (
          <p className="mt-1 text-xs font-semibold text-[#17624d]">{card.subtitle}</p>
        )}

        {/* Body Description */}
        <p className="mt-2.5 text-sm text-[#657970] leading-relaxed">{card.description}</p>
      </div>

      {/* Buttons */}
      {card.buttons && card.buttons.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-[#f0f4f2]">
          {card.buttons.map((b) => (
            <LandingButton
              key={b.id}
              button={b}
              size="sm"
              interactive={interactive}
              sectionId={sectionId}
            />
          ))}
        </div>
      )}
    </article>
  );
}

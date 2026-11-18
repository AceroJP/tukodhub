import React from "react";
import Link from "next/link";
import { LandingIcon } from "./LandingIcon";
import type { ButtonBlock, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  button: ButtonBlock;
  className?: string;
  size?: "sm" | "md" | "lg";
  interactive?: InteractivePreviewOptions;
  sectionId?: string;
};

export function LandingButton({
  button,
  className = "",
  size = "md",
  interactive,
  sectionId,
}: Props) {
  if (!button.enabled) return null;

  const isSelected = interactive?.selectedElementId === button.id;
  const isHovered = interactive?.hoveredElementId === button.id;

  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-4 text-sm sm:text-base",
  }[size];

  const variantClasses = {
    primary:
      "bg-[#17624d] text-white shadow-lg shadow-[#17624d]/20 hover:bg-[#104c3c] hover:-translate-y-0.5",
    secondary:
      "bg-[#17352d] text-white shadow-md hover:bg-[#112620] hover:-translate-y-0.5",
    outline:
      "border border-[#bcd3c7] bg-white/70 text-[#17624d] hover:bg-white hover:border-[#17624d]",
    ghost:
      "text-[#17624d] hover:bg-white/80",
    gold:
      "bg-[#e9bd67] text-[#17352d] font-bold shadow-md hover:bg-[#d8a84c] hover:-translate-y-0.5",
  }[button.variant];

  const interactiveRing = interactive?.onSelectElement
    ? isSelected
      ? "ring-2 ring-[#e9bd67] ring-offset-2 scale-[1.02] shadow-md relative z-20"
      : isHovered
      ? "ring-2 ring-[#e9bd67]/70 ring-offset-1 relative z-20"
      : ""
    : "";

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-150 cursor-pointer text-center";

  const isExternal = button.url.startsWith("http");

  if (interactive?.onSelectElement) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          interactive.onSelectElement?.(button.id, sectionId);
        }}
        onMouseEnter={() => interactive.onHoverElement?.(button.id)}
        onMouseLeave={() => interactive.onHoverElement?.(null)}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${interactiveRing} ${className}`}
      >
        <span>{button.label}</span>
        {button.iconName && <LandingIcon name={button.iconName} size={16} />}
      </button>
    );
  }

  if (isExternal) {
    return (
      <a
        href={button.url}
        target={button.target ?? "_blank"}
        rel="noopener noreferrer"
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      >
        <span>{button.label}</span>
        {button.iconName && <LandingIcon name={button.iconName} size={16} />}
      </a>
    );
  }

  return (
    <Link
      href={button.url}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      <span>{button.label}</span>
      {button.iconName && <LandingIcon name={button.iconName} size={16} />}
    </Link>
  );
}

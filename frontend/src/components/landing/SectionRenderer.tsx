import React from "react";
import { AnnouncementSection } from "./sections/AnnouncementSection";
import { HeroSection } from "./sections/HeroSection";
import { WorkflowSection } from "./sections/WorkflowSection";
import { FieldFeaturesSection } from "./sections/FieldFeaturesSection";
import { ServicesSection } from "./sections/ServicesSection";
import { AboutSection } from "./sections/AboutSection";
import { StatisticsSection } from "./sections/StatisticsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { PricingSection } from "./sections/PricingSection";
import { FaqSection } from "./sections/FaqSection";
import { CtaSection } from "./sections/CtaSection";
import { ContactSection } from "./sections/ContactSection";
import type { ContentSectionConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  section: ContentSectionConfig;
  interactive?: InteractivePreviewOptions;
};

export function SectionRenderer({ section, interactive }: Props) {
  if (!section.enabled && !interactive) return null;

  const isSelected = interactive?.selectedSectionId === section.id;
  const isHovered = interactive?.hoveredSectionId === section.id;

  const bgClasses = {
    white: "bg-white",
    cream: "bg-[#f7f8f5]",
    sand: "bg-[#f3edd9]/40",
    "forest-dark": "bg-[#17352d] text-white",
    "muted-green": "bg-[#dbeee2]/30",
  }[section.backgroundTone || "cream"];

  function renderInner() {
    switch (section.type) {
      case "announcement":
        return <AnnouncementSection section={section} />;
      case "hero":
        return <HeroSection section={section} interactive={interactive} />;
      case "workflow":
        return <WorkflowSection section={section} interactive={interactive} />;
      case "field_features":
        return <FieldFeaturesSection section={section} interactive={interactive} />;
      case "services":
        return <ServicesSection section={section} interactive={interactive} />;
      case "about":
        return <AboutSection section={section} />;
      case "statistics":
        return <StatisticsSection section={section} />;
      case "testimonials":
        return <TestimonialsSection section={section} />;
      case "pricing":
        return <PricingSection section={section} />;
      case "faq":
        return <FaqSection section={section} />;
      case "cta":
        return <CtaSection section={section} interactive={interactive} />;
      case "contact":
        return <ContactSection section={section} />;
      default:
        return null;
    }
  }

  if (!interactive) {
    return <div className={bgClasses}>{renderInner()}</div>;
  }

  // Interactive Builder Mode: outline highlights, click-to-select, and disabled overlay
  return (
    <div
      data-builder-section-id={section.id}
      onClick={(e) => {
        e.stopPropagation();
        interactive.onSelectSection?.(section.id);
      }}
      onMouseEnter={() => interactive.onHoverSection?.(section.id)}
      onMouseLeave={() => interactive.onHoverSection?.(null)}
      className={`relative transition-all cursor-pointer ${bgClasses} ${
        isSelected
          ? "ring-2 ring-[#17624d] ring-offset-2 shadow-md"
          : isHovered
          ? "ring-1 ring-[#17624d]/60 ring-offset-1"
          : ""
      } ${!section.enabled ? "opacity-40" : ""}`}
    >
      {/* Floating Section Tag Pill */}
      {(isSelected || isHovered) && (
        <div className="absolute top-2 left-4 z-30 flex items-center gap-1.5 rounded-full bg-[#17624d] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm pointer-events-none">
          <span className="capitalize">{section.type.replace("_", " ")}</span>
          {!section.enabled && <span className="opacity-75">(Hidden)</span>}
          {isSelected && <span>★ Active</span>}
        </div>
      )}

      {renderInner()}
    </div>
  );
}

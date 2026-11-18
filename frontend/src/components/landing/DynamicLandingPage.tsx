import React from "react";
import { NavigationHeaderSection } from "./sections/NavigationHeaderSection";
import { FooterSection } from "./sections/FooterSection";
import { SectionRenderer } from "./SectionRenderer";
import type { WebsitePageDocument, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  document: WebsitePageDocument;
  interactive?: InteractivePreviewOptions;
};

export function DynamicLandingPage({ document, interactive }: Props) {
  const { globals, header, sections, footer } = document;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f5] text-[#17352d] relative selection:bg-[#17624d] selection:text-white">
      {/* Dynamic Ambient Blur Blobs */}
      {globals?.showAmbientBlobs && (
        <>
          <div
            className="pointer-events-none absolute left-[-10rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full blur-3xl opacity-75"
            style={{ backgroundColor: "#dbeee2" }}
          />
          <div
            className="pointer-events-none absolute right-[-14rem] top-[20rem] h-[32rem] w-[32rem] rounded-full blur-3xl opacity-70"
            style={{ backgroundColor: "#f3dfb2" }}
          />
        </>
      )}

      {/* 🔒 STRUCTURALLY PINNED HEADER */}
      {interactive ? (
        <div
          data-builder-section-id="header"
          onClick={(e) => {
            e.stopPropagation();
            interactive.onSelectSection?.("header");
          }}
          onMouseEnter={() => interactive.onHoverSection?.("header")}
          onMouseLeave={() => interactive.onHoverSection?.(null)}
          className={`relative transition cursor-pointer ${
            interactive.selectedSectionId === "header"
              ? "ring-2 ring-[#17624d] ring-offset-2"
              : interactive.hoveredSectionId === "header"
              ? "ring-1 ring-[#17624d]/60"
              : ""
          }`}
        >
          {interactive.selectedSectionId === "header" && (
            <div className="absolute top-2 left-4 z-30 rounded-full bg-[#17624d] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              Navigation Header (Pinned Top)
            </div>
          )}
          <NavigationHeaderSection header={header} interactive={interactive} />
        </div>
      ) : (
        <NavigationHeaderSection header={header} />
      )}

      {/* 🔄 DYNAMIC REORDERABLE MAIN FLOW */}
      <div className="flex flex-col">
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            interactive={interactive}
          />
        ))}
      </div>

      {/* 🔒 STRUCTURALLY PINNED FOOTER */}
      {interactive ? (
        <div
          data-builder-section-id="footer"
          onClick={(e) => {
            e.stopPropagation();
            interactive.onSelectSection?.("footer");
          }}
          onMouseEnter={() => interactive.onHoverSection?.("footer")}
          onMouseLeave={() => interactive.onHoverSection?.(null)}
          className={`relative transition cursor-pointer ${
            interactive.selectedSectionId === "footer"
              ? "ring-2 ring-[#17624d] ring-offset-2"
              : interactive.hoveredSectionId === "footer"
              ? "ring-1 ring-[#17624d]/60"
              : ""
          }`}
        >
          {interactive.selectedSectionId === "footer" && (
            <div className="absolute top-2 left-4 z-30 rounded-full bg-[#17624d] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              Website Footer (Pinned Bottom)
            </div>
          )}
          <FooterSection footer={footer} />
        </div>
      ) : (
        <FooterSection footer={footer} />
      )}
    </main>
  );
}

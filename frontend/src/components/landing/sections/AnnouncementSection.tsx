import React from "react";
import type { AnnouncementSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: AnnouncementSectionConfig;
};

export function AnnouncementSection({ section }: Props) {
  if (!section.enabled) return null;

  const content = (
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
      <span className="rounded-full bg-[#e9bd67] px-2 py-0.5 text-[10px] font-bold uppercase text-[#17352d]">
        {section.badge || "Update"}
      </span>
      <span className="font-medium text-xs sm:text-sm">{section.text}</span>
    </div>
  );

  return (
    <aside className="relative z-10 border-b border-[#cfe3d6] bg-[#17624d] px-4 py-2.5 text-center text-white">
      {section.linkUrl ? (
        <a href={section.linkUrl} className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
    </aside>
  );
}

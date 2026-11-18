"use client";

import { useState } from "react";
import type { FaqSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: FaqSectionConfig;
};

export function FaqSection({ section }: Props) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    section.items.forEach((item) => {
      if (item.isDefaultOpen) init[item.id] = true;
    });
    return init;
  });

  if (!section.enabled) return null;

  function toggle(id: string) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="relative mx-auto max-w-4xl px-6 py-20 lg:py-24" id={section.anchorId}>
      <div className="text-center">
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

      <div className="mt-12 space-y-4">
        {section.items
          .filter((item) => item.enabled)
          .map((item) => {
            const isOpen = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#dce9df] bg-white transition shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center justify-between p-6 text-left text-sm font-bold text-[#17352d] hover:bg-[#f7f8f5]"
                >
                  <span>{item.question}</span>
                  <span className="ml-4 grid h-6 w-6 place-items-center rounded-full bg-[#dbeee2] text-xs text-[#17624d]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#f0f4f2] p-6 pt-4 text-xs sm:text-sm leading-relaxed text-[#657970]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
}

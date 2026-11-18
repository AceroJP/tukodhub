import React from "react";
import type { StatisticsSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: StatisticsSectionConfig;
};

export function StatisticsSection({ section }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative border-y border-[#e1e9e3] bg-[#17352d] py-16 text-white" id={section.anchorId}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {(section.eyebrow || section.title) && (
          <div className="mb-12 text-center max-w-xl mx-auto">
            {section.eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e9bd67]">
                {section.eyebrow}
              </p>
            )}
            {section.title && (
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {section.title}
              </h2>
            )}
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
          {section.stats
            .filter((s) => s.enabled)
            .map((stat) => (
              <div key={stat.id} className="rounded-2xl bg-white/5 p-6 border border-white/10">
                <p className="text-4xl font-extrabold text-[#e9bd67] tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
                {stat.helperText && (
                  <p className="mt-1 text-xs text-[#a6c2b5]">{stat.helperText}</p>
                )}
                {stat.trend && (
                  <span className="mt-3 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[#72ad84]">
                    {stat.trend}
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { LandingButton } from "../ui/LandingButton";
import type { HeroSectionConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  section: HeroSectionConfig;
  interactive?: InteractivePreviewOptions;
};

export function HeroSection({ section, interactive }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-20">
      {/* Left Column: Headlines & CTA */}
      <div>
        {section.eyebrowBadge && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe3d6] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#17624d]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: section.eyebrowBadge.dotColor || "#e49b3f" }}
            />
            {section.eyebrowBadge.text}
          </div>
        )}

        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl text-[#17352d]">
          {section.headline}
        </h1>

        <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#5b7169]">
          {section.subheadline}
        </p>

        {section.buttons && section.buttons.length > 0 && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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

        {section.footnote && (
          <p className="mt-5 text-xs font-medium text-[#71847c]">{section.footnote}</p>
        )}
      </div>

      {/* Right Column: Interactive Mockup or Custom Image */}
      <div className="relative mx-auto w-full max-w-[30rem]">
        {section.imageUrl ? (
          <div className="overflow-hidden rounded-[2rem] border border-white/80 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.imageUrl}
              alt={section.imageAlt || section.headline}
              className="w-full h-auto object-cover"
            />
          </div>
        ) : section.showOperatingRhythmWidget ? (
          <div>
            <div className="absolute -right-4 -top-8 h-24 w-24 rounded-full border-[14px] border-[#f1c978]/60" />
            <div className="relative rounded-[2rem] border border-white/80 bg-[#17352d] p-5 shadow-2xl shadow-[#17352d]/20 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-medium text-[#a6c2b5]">TukodHub workspace</p>
                  <p className="mt-1 text-lg font-bold text-white">Today&apos;s focus</p>
                </div>
                <span className="rounded-full bg-[#d6eadc] px-3 py-1 text-xs font-bold text-[#17624d]">
                  Overview
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-[#a6c2b5]">New inquiries</p>
                  <p className="mt-2 text-3xl font-bold text-white">--</p>
                  <p className="mt-1 text-xs text-[#a6c2b5]">Connect your workspace</p>
                </div>
                <div className="rounded-2xl bg-[#e9bd67] p-4 text-[#17352d]">
                  <p className="text-xs font-semibold opacity-70">Next action</p>
                  <p className="mt-2 text-lg font-bold">Record inquiry</p>
                  <p className="mt-1 text-xs opacity-70">Keep the queue moving</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#17352d]">Your operating rhythm</p>
                  <span className="text-xs font-semibold text-[#17624d]">Ready</span>
                </div>
                {["Inquiry queue", "Today's schedule", "Technician updates"].map((item, index) => (
                  <div className="mt-4 flex items-center gap-3" key={item}>
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                        index === 1
                          ? "bg-[#f7e6bd] text-[#9b6b18]"
                          : "bg-[#dcefe3] text-[#17624d]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-[#526b63]">{item}</span>
                    <span className="ml-auto h-2 w-2 rounded-full bg-[#72ad84]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

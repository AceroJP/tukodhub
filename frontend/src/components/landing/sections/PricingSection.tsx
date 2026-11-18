"use client";

import { useState } from "react";
import { LandingButton } from "../ui/LandingButton";
import type { PricingSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: PricingSectionConfig;
};

export function PricingSection({ section }: Props) {
  const [isAnnual, setIsAnnual] = useState(true);

  if (!section.enabled) return null;

  return (
    <section className="relative border-t border-[#e1e9e3] bg-[#f7f8f5] py-20 lg:py-28" id={section.anchorId}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          {section.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">
              {section.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17352d] sm:text-4xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-4 text-base text-[#657970]">{section.subtitle}</p>
          )}

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#cbded4] bg-white p-1 text-xs font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-2 transition ${
                !isAnnual ? "bg-[#17624d] text-white" : "text-[#657970]"
              }`}
            >
              {section.billingToggle.monthlyLabel || "Monthly"}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${
                isAnnual ? "bg-[#17624d] text-white" : "text-[#657970]"
              }`}
            >
              <span>{section.billingToggle.annualLabel || "Annual"}</span>
              {section.billingToggle.discountBadge && (
                <span className="rounded-full bg-[#e9bd67] px-1.5 py-0.5 text-[9px] font-bold text-[#17352d]">
                  {section.billingToggle.discountBadge}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-center">
          {section.tiers
            .filter((t) => t.enabled)
            .map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-8 transition ${
                  tier.isFeatured
                    ? "border-2 border-[#17624d] bg-white shadow-xl scale-105 z-10"
                    : "border border-[#dce9df] bg-white shadow-xs"
                }`}
              >
                {tier.isFeatured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#17624d] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {tier.featuredBadge || "Most Popular"}
                  </span>
                )}

                <h3 className="text-xl font-bold text-[#17352d]">{tier.name}</h3>
                <p className="mt-2 text-xs text-[#657970]">{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#17352d]">
                    {isAnnual ? tier.priceAnnual : tier.priceMonthly}
                  </span>
                  <span className="text-xs font-semibold text-[#8ba097]">
                    {isAnnual ? "/year" : "/month"}
                  </span>
                </div>

                <div className="mt-8 border-t border-[#f0f4f2] pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#17352d] mb-4">
                    What&apos;s included:
                  </p>
                  <ul className="space-y-3 text-xs text-[#526b63]">
                    {tier.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <span className="text-[#17624d] font-bold">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <LandingButton
                    button={tier.ctaButton}
                    size="md"
                    className="w-full text-center"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

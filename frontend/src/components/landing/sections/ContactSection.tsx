import React from "react";
import type { ContactSectionConfig } from "@/types/landingBuilder";

type Props = {
  section: ContactSectionConfig;
};

export function ContactSection({ section }: Props) {
  if (!section.enabled) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24" id={section.anchorId}>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          {section.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">
              {section.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17352d] sm:text-4xl">
            {section.title}
          </h2>
          <p className="mt-4 text-base text-[#657970] max-w-md">{section.description}</p>

          <div className="mt-8 space-y-4">
            {section.emailValue && (
              <div className="flex items-center gap-3 text-sm text-[#17352d]">
                <span className="font-semibold text-[#8ba097]">
                  {section.emailLabel || "Email"}:
                </span>
                <a href={`mailto:${section.emailValue}`} className="font-bold hover:underline">
                  {section.emailValue}
                </a>
              </div>
            )}
            {section.phoneValue && (
              <div className="flex items-center gap-3 text-sm text-[#17352d]">
                <span className="font-semibold text-[#8ba097]">
                  {section.phoneLabel || "Phone"}:
                </span>
                <a href={`tel:${section.phoneValue}`} className="font-bold hover:underline">
                  {section.phoneValue}
                </a>
              </div>
            )}
            {section.addressValue && (
              <div className="flex items-center gap-3 text-sm text-[#17352d]">
                <span className="font-semibold text-[#8ba097]">
                  {section.addressLabel || "Office"}:
                </span>
                <span>{section.addressValue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Clean Inquiry Form Mock / Interactive UI */}
        <div className="rounded-3xl border border-[#dce9df] bg-white p-8 shadow-xs">
          <h3 className="text-lg font-bold text-[#17352d]">Send us a message</h3>
          <p className="mt-1 text-xs text-[#657970]">Our operations team typically responds within 2 hours.</p>
          <form className="mt-6 space-y-4 text-xs" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block font-semibold text-[#17352d]">Your Name</label>
              <input
                className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3.5 py-2.5 outline-none focus:border-[#17624d] focus:bg-white"
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#17352d]">Business / Company Name</label>
              <input
                className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3.5 py-2.5 outline-none focus:border-[#17624d] focus:bg-white"
                placeholder="Dela Cruz Airconditioning Services"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#17352d]">Email or Mobile Number</label>
              <input
                className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3.5 py-2.5 outline-none focus:border-[#17624d] focus:bg-white"
                placeholder="juan@delacruzaircon.ph"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#17352d]">How can we help?</label>
              <textarea
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3.5 py-2.5 outline-none focus:border-[#17624d] focus:bg-white"
                placeholder="Tell us about your team size and operational needs..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#17624d] py-3 text-xs font-bold text-white shadow-md hover:bg-[#104c3c]"
            >
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

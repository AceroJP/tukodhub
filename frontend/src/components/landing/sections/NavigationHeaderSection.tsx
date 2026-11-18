"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingButton } from "../ui/LandingButton";
import type { NavigationHeaderConfig, InteractivePreviewOptions } from "@/types/landingBuilder";

type Props = {
  header: NavigationHeaderConfig;
  interactive?: InteractivePreviewOptions;
};

export function NavigationHeaderSection({ header, interactive }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!header.enabled) return null;

  return (
    <header className="relative z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label="TukodHub Home">
          {header.logoType === "image" && header.logoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={header.logoImageUrl} alt={header.brandName} className="h-9 w-auto" />
          ) : header.logoType === "badge_letter" ? (
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d] text-lg font-bold text-white shadow-lg shadow-[#17624d]/20">
              {header.badgeLetter || "T"}
            </span>
          ) : null}
          <span className="text-xl font-bold tracking-tight text-[#17352d]">{header.brandName}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-[#526b63] md:flex">
          {header.links
            .filter((l) => l.enabled)
            .map((link) => (
              <a
                key={link.id}
                href={link.url}
                onClick={(e) => {
                  if (interactive) {
                    e.preventDefault();
                    if (link.url.startsWith("#")) {
                      const el = window.document.getElementById(link.url.slice(1));
                      el?.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className="transition hover:text-[#17624d]"
              >
                {link.label}
              </a>
            ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {header.buttons
            .filter((b) => b.enabled)
            .map((b) => (
              <LandingButton
                key={b.id}
                button={b}
                size="sm"
                interactive={interactive}
                sectionId="header"
              />
            ))}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-[#cbded4] bg-white p-2 md:hidden text-[#17624d]"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mx-6 rounded-2xl border border-[#d6e5dc] bg-white p-5 shadow-xl md:hidden mb-4">
          <div className="flex flex-col gap-3 text-sm font-semibold text-[#17352d]">
            {header.links
              .filter((l) => l.enabled)
              .map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  onClick={() => setMobileOpen(false)}
                  className="py-1 hover:text-[#17624d]"
                >
                  {link.label}
                </a>
              ))}
            <div className="pt-3 border-t border-[#f0f4f2] flex flex-col gap-2">
              {header.buttons
                .filter((b) => b.enabled)
                .map((b) => (
                  <LandingButton key={b.id} button={b} size="sm" className="w-full text-center" />
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

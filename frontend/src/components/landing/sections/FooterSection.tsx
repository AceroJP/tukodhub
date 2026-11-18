import React from "react";
import type { FooterConfig } from "@/types/landingBuilder";

type Props = {
  footer: FooterConfig;
};

export function FooterSection({ footer }: Props) {
  if (!footer.enabled) return null;

  return (
    <footer className="relative border-t border-[#dce9df] px-6 py-10 lg:px-10" id="contact">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-[#71847c] sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-[#17624d]">{footer.brandName}</span>
          {footer.links && footer.links.length > 0 && (
            <div className="hidden sm:flex items-center gap-4 border-l border-[#dce9df] pl-4">
              {footer.links
                .filter((l) => l.enabled)
                .map((link) => (
                  <a key={link.id} href={link.url} className="hover:text-[#17624d] transition">
                    {link.label}
                  </a>
                ))}
            </div>
          )}
        </div>

        <p>{footer.copyrightText}</p>
      </div>

      {footer.footnote && (
        <div className="mx-auto mt-4 max-w-7xl text-center sm:text-left text-[11px] text-[#8ba097]">
          {footer.footnote}
        </div>
      )}
    </footer>
  );
}

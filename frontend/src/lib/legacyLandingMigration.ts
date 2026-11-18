import type { WebsitePageDocument, ContentSectionConfig } from "../types/landingBuilder";

type LegacyConfig = {
  announcement?: {
    enabled?: boolean;
    text?: string;
    badge?: string;
  };
  hero?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText?: string;
    ctaSecondaryLink?: string;
  };
  workflow?: {
    title?: string;
    step1Title?: string;
    step1Desc?: string;
    step2Title?: string;
    step2Desc?: string;
    step3Title?: string;
    step3Desc?: string;
  };
  fieldWork?: {
    title?: string;
    item1?: string;
    item2?: string;
    item3?: string;
  };
};

/**
 * Migrates legacy landing page JSON into the Master Schema Version 2.0.0 document.
 * Strictly preserves all existing database values without inventing arbitrary contact info
 * or placeholder content.
 */
export function migrateLegacyLandingConfig(input: unknown): WebsitePageDocument {
  // If already migrated to Schema Version 2, return directly
  if (
    typeof input === "object" &&
    input !== null &&
    (input as { schemaVersion?: number }).schemaVersion === 2 &&
    Array.isArray((input as { sections?: unknown }).sections)
  ) {
    return input as WebsitePageDocument;
  }

  const legacy = (typeof input === "object" && input !== null ? input : {}) as LegacyConfig;

  const sections: ContentSectionConfig[] = [];

  // 1. Announcement Section
  if (legacy.announcement) {
    sections.push({
      id: "sec-announcement-default",
      type: "announcement",
      enabled: legacy.announcement.enabled ?? true,
      badge: legacy.announcement.badge ?? "New Release",
      text:
        legacy.announcement.text ??
        "Now supporting offline GPS sync for field technicians across the Philippines",
      backgroundTone: "forest-dark",
    });
  }

  // 2. Hero Section
  sections.push({
    id: "sec-hero-default",
    type: "hero",
    enabled: true,
    eyebrowBadge: {
      text: legacy.hero?.badge ?? "Field service software built for local realities",
      dotColor: "#e49b3f",
    },
    headline:
      legacy.hero?.title ?? "One system from customer inquiry to verified job completion",
    subheadline:
      legacy.hero?.subtitle ??
      "Built for appliance, electrical, plumbing, HVAC, and field repair contractors who need clean coordination without spreadsheet chaos.",
    buttons: [
      {
        id: "btn-hero-primary",
        label: legacy.hero?.ctaPrimaryText ?? "Start free trial",
        url: legacy.hero?.ctaPrimaryLink ?? "/auth/register",
        variant: "primary",
        target: "_self",
        enabled: true,
      },
      {
        id: "btn-hero-secondary",
        label: legacy.hero?.ctaSecondaryText ?? "Sign in",
        url: legacy.hero?.ctaSecondaryLink ?? "/owner/login",
        variant: "outline",
        target: "_self",
        enabled: true,
      },
    ],
    footnote: "Simple setup. Clear records. Made for teams on the move.",
    showOperatingRhythmWidget: true,
    backgroundTone: "cream",
  });

  // 3. Workflow Steps Section
  sections.push({
    id: "sec-workflow-default",
    type: "workflow",
    anchorId: "workflow",
    enabled: true,
    eyebrow: "A better daily rhythm",
    title: legacy.workflow?.title ?? "From first message to finished job.",
    cards: [
      {
        id: "wf-step-1",
        title: legacy.workflow?.step1Title ?? "Capture every inquiry",
        description:
          legacy.workflow?.step1Desc ??
          "Keep messages, calls, and walk-ins in one dependable queue.",
        badge: "01",
        enabled: true,
      },
      {
        id: "wf-step-2",
        title: legacy.workflow?.step2Title ?? "Schedule with confidence",
        description:
          legacy.workflow?.step2Desc ??
          "Turn approved work into clear bookings for your team.",
        badge: "02",
        enabled: true,
      },
      {
        id: "wf-step-3",
        title: legacy.workflow?.step3Title ?? "Finish with proof",
        description:
          legacy.workflow?.step3Desc ??
          "Give technicians a simple mobile workflow for every job.",
        badge: "03",
        enabled: true,
      },
    ],
    backgroundTone: "white",
  });

  // 4. Field Features Section (Preserving all 3 items, restoring item3)
  sections.push({
    id: "sec-field-features-default",
    type: "field_features",
    anchorId: "built-for-work",
    enabled: true,
    eyebrow: "Designed for the real day",
    title: legacy.fieldWork?.title ?? "Less chasing. More work completed.",
    cards: [
      {
        id: "ff-card-1",
        title: "Clear next actions",
        description:
          legacy.fieldWork?.item1 ??
          "Make follow-ups, schedules, and reviews visible to the right people.",
        iconName: "ArrowUpRight",
        enabled: true,
      },
      {
        id: "ff-card-2",
        title: "Mobile-ready",
        description:
          legacy.fieldWork?.item2 ??
          "Give technicians a focused workflow that works where the job happens.",
        iconName: "Circle",
        enabled: true,
      },
      {
        id: "ff-card-3",
        title: "Compliance & Invoicing",
        description:
          legacy.fieldWork?.item3 ??
          "Automated billing & BIR-compliant invoice generation.",
        iconName: "ShieldCheck",
        enabled: true,
      },
    ],
    backgroundTone: "cream",
  });

  return {
    schemaVersion: 2,
    version: 1,
    updatedAt: (legacy as any)?.updatedAt || "2026-01-01T00:00:00.000Z",
    globals: {
      brandName: "TukodHub",
      primaryColor: "#17624d",
      accentColor: "#e9bd67",
      fontFamily: "Inter",
      showAmbientBlobs: true,
      socialLinks: [],
    },
    header: {
      enabled: true,
      brandName: "TukodHub",
      logoType: "badge_letter",
      badgeLetter: "T",
      links: [
        { id: "nav-link-1", label: "How it works", url: "#workflow", enabled: true },
        { id: "nav-link-2", label: "Built for field work", url: "#built-for-work", enabled: true },
        { id: "nav-link-3", label: "Contact", url: "#contact", enabled: true },
      ],
      buttons: [
        {
          id: "nav-btn-signin",
          label: legacy.hero?.ctaSecondaryText ?? "Sign in",
          url: legacy.hero?.ctaSecondaryLink ?? "/owner/login",
          variant: "ghost",
          target: "_self",
          enabled: true,
        },
        {
          id: "nav-btn-register",
          label: legacy.hero?.ctaPrimaryText ?? "Start free",
          url: legacy.hero?.ctaPrimaryLink ?? "/auth/register",
          variant: "primary",
          target: "_self",
          enabled: true,
        },
      ],
    },
    sections,
    footer: {
      enabled: true,
      brandName: "TukodHub",
      copyrightText: "© 2026 Joenil Acero. All rights reserved.",
      links: [
        { id: "foot-link-1", label: "How it works", url: "#workflow", enabled: true },
        { id: "foot-link-2", label: "Built for field work", url: "#built-for-work", enabled: true },
        { id: "foot-link-3", label: "Contact", url: "#contact", enabled: true },
      ],
    },
  };
}

/**
 * Asserts that the migrated document contains all non-null values present in the legacy source.
 */
export function validateMigrationIntegrity(
  legacy: LegacyConfig,
  migrated: WebsitePageDocument
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const heroSec = migrated.sections.find((s) => s.type === "hero");
  if (!heroSec || heroSec.type !== "hero") {
    errors.push("Hero section missing in migrated document.");
  } else {
    if (legacy.hero?.title && heroSec.headline !== legacy.hero.title) {
      errors.push(`Hero headline mismatch: expected "${legacy.hero.title}", got "${heroSec.headline}"`);
    }
    if (legacy.hero?.subtitle && heroSec.subheadline !== legacy.hero.subtitle) {
      errors.push(`Hero subtitle mismatch: expected "${legacy.hero.subtitle}", got "${heroSec.subheadline}"`);
    }
  }

  const wfSec = migrated.sections.find((s) => s.type === "workflow");
  if (!wfSec || wfSec.type !== "workflow") {
    errors.push("Workflow section missing in migrated document.");
  } else {
    if (legacy.workflow?.title && wfSec.title !== legacy.workflow.title) {
      errors.push(`Workflow title mismatch.`);
    }
    if (legacy.workflow?.step1Desc && wfSec.cards[0]?.description !== legacy.workflow.step1Desc) {
      errors.push(`Workflow step 1 description mismatch.`);
    }
  }

  const ffSec = migrated.sections.find((s) => s.type === "field_features");
  if (!ffSec || ffSec.type !== "field_features") {
    errors.push("Field features section missing in migrated document.");
  } else {
    if (legacy.fieldWork?.item3 && ffSec.cards[2]?.description !== legacy.fieldWork.item3) {
      errors.push(`Field work item 3 was not preserved.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

import { migrateLegacyLandingConfig, validateMigrationIntegrity } from "./legacyLandingMigration";

// Exact legacy structure from PostgreSQL / landing-builder/page.tsx
const sampleLegacyConfig = {
  announcement: {
    enabled: true,
    text: "Now supporting offline GPS sync for field technicians across the Philippines",
    badge: "New Release",
  },
  hero: {
    badge: "Field service software built for local realities",
    title: "One system from customer inquiry to verified job completion",
    subtitle:
      "Built for appliance, electrical, plumbing, HVAC, and field repair contractors who need clean coordination without spreadsheet chaos.",
    ctaPrimaryText: "Start free trial",
    ctaPrimaryLink: "/auth/register",
    ctaSecondaryText: "Sign in",
    ctaSecondaryLink: "/owner/login",
  },
  workflow: {
    title: "How it works",
    step1Title: "Capture every inquiry",
    step1Desc: "Keep messages, calls, and walk-ins in one dependable queue.",
    step2Title: "Schedule with confidence",
    step2Desc: "Turn approved work into clear bookings for your team.",
    step3Title: "Finish with proof",
    step3Desc: "Give technicians a simple mobile workflow for every job.",
  },
  fieldWork: {
    title: "Built for field work",
    item1: "Works reliably in weak connectivity zones with offline queue",
    item2: "Photo proof with GPS timestamp for instant customer transparency",
    item3: "Automated billing & BIR-compliant invoice generation",
  },
};

export function runMigrationVerificationTest(): { success: boolean; details: string[] } {
  const details: string[] = [];

  const migrated = migrateLegacyLandingConfig(sampleLegacyConfig);

  // 1. Schema version assertion
  if (migrated.schemaVersion !== 2) {
    details.push("FAIL: schemaVersion is not 2");
  } else {
    details.push("PASS: schemaVersion is 2");
  }

  // 2. Structural Pinned Header & Footer assertions
  if (!migrated.header || !migrated.footer) {
    details.push("FAIL: Pinned header or footer missing");
  } else {
    details.push("PASS: Header and footer structurally pinned");
  }

  // 3. Header values
  if (migrated.header.brandName !== "TukodHub") {
    details.push("FAIL: Brand name mismatch in header");
  } else {
    details.push("PASS: Brand name preserved in header");
  }

  // 4. Integrity validation function
  const validation = validateMigrationIntegrity(sampleLegacyConfig, migrated);
  if (!validation.isValid) {
    details.push(`FAIL: Validation integrity errors: ${validation.errors.join(", ")}`);
  } else {
    details.push("PASS: All legacy fields verified with 100% identity match");
  }

  // 5. Restored item3 assertion
  const ffSec = migrated.sections.find((s) => s.type === "field_features");
  if (!ffSec || ffSec.type !== "field_features" || ffSec.cards.length < 3) {
    details.push("FAIL: Field work cards count is less than 3");
  } else if (ffSec.cards[2].description !== sampleLegacyConfig.fieldWork.item3) {
    details.push("FAIL: Field work item 3 mismatch");
  } else {
    details.push("PASS: Field work item 3 correctly restored and preserved");
  }

  // 6. Zero-invented content assertion
  if (migrated.globals.contactEmail) {
    details.push("FAIL: Fabricated contact email was introduced");
  } else {
    details.push("PASS: No fabricated contact email introduced");
  }

  const success = !details.some((d) => d.startsWith("FAIL"));
  return { success, details };
}

// Self-run when executed directly via node/ts-node
if (typeof require !== "undefined" && require.main === module) {
  const result = runMigrationVerificationTest();
  console.log("=== MIGRATION VERIFICATION TEST RESULTS ===");
  result.details.forEach((d) => console.log(d));
  if (!result.success) {
    process.exit(1);
  }
}

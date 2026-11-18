"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import { ownerApiRequest } from "@/lib/ownerApi";
import { DynamicLandingPage } from "@/components/landing/DynamicLandingPage";
import { LandingIcon, CURATED_ICON_NAMES } from "@/components/landing/ui/LandingIcon";
import { migrateLegacyLandingConfig } from "@/lib/legacyLandingMigration";
import type {
  WebsitePageDocument,
  ContentSectionConfig,
  SectionType,
  BackgroundTone,
  ButtonVariant,
  ButtonBlock,
  CardBlock,
  StatBlock,
  AccordionBlock,
  PricingTierBlock,
  TestimonialBlock,
  NavLink,
  InteractivePreviewOptions,
} from "@/types/landingBuilder";

// ── Default New Section Factory ───────────────────────────────────────────────

function createNewSection(type: SectionType): ContentSectionConfig {
  const id = `sec-${type}-${Date.now().toString(36)}`;
  switch (type) {
    case "announcement":
      return {
        id,
        type: "announcement",
        enabled: true,
        badge: "Announcement",
        text: "Special update or notice for your field service customers.",
        backgroundTone: "forest-dark",
      };
    case "hero":
      return {
        id,
        type: "hero",
        enabled: true,
        eyebrowBadge: { text: "Field Service Platform", dotColor: "#e49b3f" },
        headline: "Streamline your field operations with clarity",
        subheadline: "Schedule jobs, dispatch technicians, and record verified proof in one calm, dependable system.",
        buttons: [
          { id: `btn-${Date.now()}-1`, label: "Get started free", url: "/auth/register", variant: "primary", target: "_self", enabled: true },
          { id: `btn-${Date.now()}-2`, label: "Learn more", url: "#workflow", variant: "outline", target: "_self", enabled: true },
        ],
        showOperatingRhythmWidget: true,
        backgroundTone: "cream",
      };
    case "services":
      return {
        id,
        type: "services",
        anchorId: "services",
        enabled: true,
        eyebrow: "Our Capabilities",
        title: "Comprehensive Field Service Solutions",
        subtitle: "Everything you need to manage your trade business reliably.",
        cards: [
          { id: `c-${Date.now()}-1`, title: "Airconditioning & HVAC", description: "Preventive maintenance, diagnostics, and split-type installs.", iconName: "Flame", enabled: true },
          { id: `c-${Date.now()}-2`, title: "Electrical Contracting", description: "Panel upgrades, wiring inspections, and commercial diagnostics.", iconName: "Zap", enabled: true },
          { id: `c-${Date.now()}-3`, title: "Plumbing & Piping", description: "Emergency leak repair, booster pumps, and sanitary line installs.", iconName: "Wrench", enabled: true },
        ],
        backgroundTone: "white",
      };
    case "workflow":
      return {
        id,
        type: "workflow",
        anchorId: "workflow",
        enabled: true,
        eyebrow: "Simple 3-Step Process",
        title: "How TukodHub moves your work forward",
        cards: [
          { id: `w-${Date.now()}-1`, badge: "01", title: "Inquiry to Job", description: "Capture inquiries instantly from phone, chat, or walk-ins.", enabled: true },
          { id: `w-${Date.now()}-2`, badge: "02", title: "Smart Dispatch", description: "Assign the closest certified tech with one click.", enabled: true },
          { id: `w-${Date.now()}-3`, badge: "03", title: "Proof & Invoicing", description: "Take GPS-tagged proof photos and issue official receipts.", enabled: true },
        ],
        backgroundTone: "white",
      };
    case "field_features":
      return {
        id,
        type: "field_features",
        anchorId: "features",
        enabled: true,
        eyebrow: "Built for local teams",
        title: "Designed specifically for Philippine field realities",
        cards: [
          { id: `f-${Date.now()}-1`, title: "Works 100% Offline", description: "Technicians keep working and syncing photos without signal.", iconName: "Clock", enabled: true },
          { id: `f-${Date.now()}-2`, title: "BIR-Compliant Receipts", description: "Automated official receipt and invoice calculation.", iconName: "FileText", enabled: true },
        ],
        backgroundTone: "cream",
      };
    case "about":
      return {
        id,
        type: "about",
        anchorId: "about",
        enabled: true,
        eyebrow: "About Us",
        title: "Empowering Filipino Trade Contractors",
        body: "TukodHub was created to eliminate spreadsheet chaos for growing Filipino electrical, plumbing, and HVAC businesses.",
        stats: [
          { id: `st-${Date.now()}-1`, value: "14k+", label: "Completed Jobs", enabled: true },
          { id: `st-${Date.now()}-2`, value: "99.4%", label: "On-Time Dispatch", enabled: true },
        ],
        backgroundTone: "white",
      };
    case "statistics":
      return {
        id,
        type: "statistics",
        enabled: true,
        eyebrow: "Proven Operational Impact",
        title: "Numbers that speak for our contractors",
        stats: [
          { id: `s-${Date.now()}-1`, value: "99.8%", label: "Uptime Reliability", helperText: "High-availability local cloud", enabled: true },
          { id: `s-${Date.now()}-2`, value: "2.5x", label: "Faster Billing", helperText: "Same-day customer invoicing", enabled: true },
          { id: `s-${Date.now()}-3`, value: "100%", label: "BIR Compliant", helperText: "Official receipts generated", enabled: true },
          { id: `s-${Date.now()}-4`, value: "0", label: "Lost Work Orders", helperText: "Centralized inquiry queue", enabled: true },
        ],
        backgroundTone: "forest-dark",
      };
    case "testimonials":
      return {
        id,
        type: "testimonials",
        anchorId: "testimonials",
        enabled: true,
        eyebrow: "Contractor Stories",
        title: "Trusted by top service teams in the Philippines",
        testimonials: [
          { id: `t-${Date.now()}-1`, authorName: "Reynaldo Santos", authorRole: "Operations Lead", companyName: "CoolAir Makati", quote: "TukodHub cut our missed technician appointments to zero. The offline photo proof gives our commercial clients instant peace of mind.", rating: 5, enabled: true },
          { id: `t-${Date.now()}-2`, authorName: "Engr. Joselito Cruz", authorRole: "Owner", companyName: "3J Electrical Services", quote: "No more tracking work on notebooks. We bill twice as fast and our field crews love the simple mobile interface.", rating: 5, enabled: true },
        ],
        backgroundTone: "white",
      };
    case "pricing":
      return {
        id,
        type: "pricing",
        anchorId: "pricing",
        enabled: true,
        eyebrow: "Transparent Pricing",
        title: "Predictable plans that grow with your fleet",
        billingToggle: { monthlyLabel: "Monthly", annualLabel: "Annual", discountBadge: "Save 20%" },
        tiers: [
          { id: `pr-${Date.now()}-1`, name: "Starter", priceMonthly: "₱1,499", priceAnnual: "₱14,390", description: "For solo contractors and teams with up to 3 technicians.", isFeatured: false, features: ["Up to 3 technicians", "Offline job proof", "Inquiry queue", "Basic receipts"], ctaButton: { id: "b-pr1", label: "Start Free Trial", url: "/auth/register", variant: "outline", enabled: true }, enabled: true },
          { id: `pr-${Date.now()}-2`, name: "Pro Contractor", priceMonthly: "₱3,999", priceAnnual: "₱38,390", description: "For growing service businesses with multi-branch dispatch.", isFeatured: true, featuredBadge: "Most Popular", features: ["Up to 15 technicians", "GPS breadcrumb tracking", "BIR tax compliance", "Customer SMS notifications", "Priority support"], ctaButton: { id: "b-pr2", label: "Start 14-Day Trial", url: "/auth/register", variant: "primary", enabled: true }, enabled: true },
        ],
        backgroundTone: "cream",
      };
    case "faq":
      return {
        id,
        type: "faq",
        anchorId: "faq",
        enabled: true,
        eyebrow: "Frequently Asked Questions",
        title: "Everything you need to know about TukodHub",
        items: [
          { id: `faq-${Date.now()}-1`, question: "Does TukodHub work without internet signal in basements?", answer: "Yes! The mobile technician web app stores job data, photo proof, and timestamps locally, then automatically syncs as soon as connection is restored.", isDefaultOpen: true, enabled: true },
          { id: `faq-${Date.now()}-2`, question: "Can we issue official receipts and BIR Form 2307?", answer: "Yes. TukodHub generates BIR-aligned sales invoices and tracks client withholding tax certificates.", enabled: true },
          { id: `faq-${Date.now()}-3`, question: "How long does setup take?", answer: "Most teams are up and dispatching jobs in under 15 minutes.", enabled: true },
        ],
        backgroundTone: "white",
      };
    case "cta":
      return {
        id,
        type: "cta",
        anchorId: "cta",
        enabled: true,
        eyebrow: "Ready to scale?",
        headline: "Stop spreadsheet chaos and start growing your trade business today.",
        description: "Join hundreds of Filipino contractors who rely on TukodHub for daily operations.",
        buttons: [
          { id: `btn-cta-${Date.now()}`, label: "Start your 14-day free trial", url: "/auth/register", variant: "gold", target: "_self", enabled: true },
        ],
        backgroundTone: "forest-dark",
      };
    case "contact":
      return {
        id,
        type: "contact",
        anchorId: "contact",
        enabled: true,
        eyebrow: "Get in touch",
        title: "Speak with our local operations specialists",
        description: "Have questions about fleet onboarding or custom integrations? We're here to help.",
        emailLabel: "Email",
        emailValue: "operations@tukodhub.com",
        phoneLabel: "Phone / Viber",
        phoneValue: "+63 (02) 8800-4567",
        addressLabel: "Office",
        addressValue: "Ortigas Center, Pasig City, Metro Manila",
        backgroundTone: "white",
      };
  }
}

// ── Collapsible Inspector Group ───────────────────────────────────────────────

function InspectorGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e2ece6] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2.5 text-left text-xs font-bold uppercase tracking-wider text-[#17352d] hover:text-[#17624d] transition"
      >
        <span>{title}</span>
        <span className={`text-[10px] transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}>
          ▼
        </span>
      </button>
      {isOpen && <div className="pb-3 space-y-3">{children}</div>}
    </div>
  );
}

// ── Master Component ──────────────────────────────────────────────────────────

export default function LandingPageBuilderPage() {
  const [document, setDocument] = useState<WebsitePageDocument>(() =>
    migrateLegacyLandingConfig({})
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>("sec-hero-default");
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementParentId, setSelectedElementParentId] = useState<string | undefined>(undefined);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoomMode, setZoomMode] = useState<"fit" | "50" | "75" | "100">("fit");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Canvas measurement for scaling
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(800);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setCanvasWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Load Draft on Mount ─────────────────────────────────────────────────────
  const loadDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ownerApiRequest<{ key: string; valueJson: string | null }>(
        "/api/v1/platform/landing-page/draft"
      );
      if (response.valueJson) {
        const parsed = JSON.parse(response.valueJson);
        const migrated = migrateLegacyLandingConfig(parsed);
        setDocument(migrated);
        if (migrated.sections.length > 0) {
          setSelectedSectionId(migrated.sections[0].id);
        }
      }
    } catch {
      // Retains initial grounded document
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  // ── Save Draft (PUT /api/v1/platform/landing-page/draft) ────────────────────
  async function handleSaveDraft() {
    setIsSavingDraft(true);
    try {
      await ownerApiRequest("/api/v1/platform/landing-page/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configJson: JSON.stringify(document) }),
      });
      Swal.fire({
        icon: "success",
        title: "Draft Saved",
        text: "Your workspace changes have been saved to PostgreSQL. Public site visitors are unaffected.",
        toast: true,
        timer: 3000,
        position: "top-end",
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Could not save draft. Confirm backend is listening on http://localhost:5000.",
        confirmButtonColor: "#17624d",
      });
    } finally {
      setIsSavingDraft(false);
    }
  }

  // ── Publish Live (POST /api/v1/platform/landing-page/publish) ───────────────
  async function handlePublishLive() {
    const { value: changeSummary } = await Swal.fire({
      title: "Publish Website Live?",
      html: `<p class="text-xs text-gray-600 mb-3">This will create a new immutable version snapshot, update the public landing page (<code>/</code>), and trigger cache revalidation.</p>
             <input id="summary" class="swal2-input text-xs w-full" placeholder="Brief summary of changes (e.g. Updated Pricing & FAQs)">`,
      showCancelButton: true,
      confirmButtonText: "Publish Now",
      confirmButtonColor: "#17624d",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const el = window.document.getElementById("summary") as HTMLInputElement;
        return el?.value?.trim() || "Landing page updates";
      },
    });

    if (changeSummary === undefined) return;

    setIsPublishing(true);
    try {
      const result = await ownerApiRequest<{
        versionNumber: number;
        publishedAt: string;
        revalidationStatus: string;
      }>("/api/v1/platform/landing-page/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentJson: JSON.stringify(document),
          changeSummary,
        }),
      });

      setDocument((prev) => ({ ...prev, version: result.versionNumber }));

      Swal.fire({
        icon: "success",
        title: `Published Live (v${result.versionNumber})!`,
        text: `The public website is now serving Version #${result.versionNumber}. Cache revalidation: ${result.revalidationStatus}.`,
        confirmButtonColor: "#17624d",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Publishing failed";
      Swal.fire({
        icon: "error",
        title: "Publish Failed",
        text: msg,
        confirmButtonColor: "#17624d",
      });
    } finally {
      setIsPublishing(false);
    }
  }

  // ── Section Tree Actions ───────────────────────────────────────────────────
  function handleToggleSection(id: string) {
    if (id === "header") {
      setDocument((prev) => ({
        ...prev,
        header: { ...prev.header, enabled: !prev.header.enabled },
      }));
      return;
    }
    if (id === "footer") {
      setDocument((prev) => ({
        ...prev,
        footer: { ...prev.footer, enabled: !prev.footer.enabled },
      }));
      return;
    }
    setDocument((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }));
  }

  function handleMoveSection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= document.sections.length) return;
    setDocument((prev) => {
      const next = [...prev.sections];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return { ...prev, sections: next };
    });
  }

  function handleDuplicateSection(id: string) {
    setDocument((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const original = prev.sections[idx];
      const copy = {
        ...JSON.parse(JSON.stringify(original)),
        id: `sec-${original.type}-${Date.now().toString(36)}`,
      };
      const next = [...prev.sections];
      next.splice(idx + 1, 0, copy);
      return { ...prev, sections: next };
    });
  }

  async function handleDeleteSection(id: string) {
    const result = await Swal.fire({
      title: "Delete Section?",
      text: "This section will be removed from your layout.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#c94a4a",
    });
    if (!result.isConfirmed) return;

    setDocument((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
    if (selectedSectionId === id) {
      setSelectedSectionId("header");
    }
  }

  function handleAddSection(type: SectionType) {
    const newSec = createNewSection(type);
    setDocument((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setSelectedSectionId(newSec.id);
    setSelectedElementId(null);
    setShowAddModal(false);
  }

  function handleSelectSection(id: string) {
    setSelectedSectionId(id);
    setSelectedElementId(null);
    setSelectedElementParentId(undefined);
  }

  function handleSelectElement(elementId: string | null, parentSectionId?: string) {
    if (elementId === null) {
      setSelectedElementId(null);
      setSelectedElementParentId(undefined);
    } else {
      setSelectedElementId(elementId);
      if (parentSectionId) {
        setSelectedElementParentId(parentSectionId);
        setSelectedSectionId(parentSectionId);
      }
    }
  }

  // ── Active Selection Helpers ───────────────────────────────────────────────
  const activeSection = document.sections.find((s) => s.id === selectedSectionId);

  function updateActiveSection(updater: (sec: ContentSectionConfig) => ContentSectionConfig) {
    if (!activeSection) return;
    setDocument((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === activeSection.id ? updater(s) : s)),
    }));
  }

  // ── Virtual Viewport Scaling ────────────────────────────────────────────────
  const targetWidth =
    devicePreview === "desktop" ? 1440 : devicePreview === "tablet" ? 768 : 375;

  const computedScale =
    zoomMode === "fit"
      ? Math.min(1, Math.max(0.2, (canvasWidth - 36) / targetWidth))
      : zoomMode === "50"
      ? 0.5
      : zoomMode === "75"
      ? 0.75
      : 1.0;

  // ── Interactive Preview Options ─────────────────────────────────────────────
  const interactiveOpts: InteractivePreviewOptions = {
    selectedSectionId,
    onSelectSection: handleSelectSection,
    hoveredSectionId,
    onHoverSection: setHoveredSectionId,
    selectedElementId,
    onSelectElement: handleSelectElement,
    hoveredElementId,
    onHoverElement: setHoveredElementId,
  };

  // ── Find selected element for inspector ─────────────────────────────────────
  function findSelectedElement(): { type: "card" | "button"; data: CardBlock | ButtonBlock; parentSection: ContentSectionConfig } | null {
    if (!selectedElementId || !activeSection) return null;

    // Search in cards
    if ("cards" in activeSection) {
      const card = activeSection.cards.find((c: CardBlock) => c.id === selectedElementId);
      if (card) return { type: "card", data: card, parentSection: activeSection };
    }

    // Search in buttons
    if ("buttons" in activeSection) {
      const btn = (activeSection as any).buttons.find((b: ButtonBlock) => b.id === selectedElementId);
      if (btn) return { type: "button", data: btn, parentSection: activeSection };
    }

    return null;
  }

  const selectedElement = findSelectedElement();

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#17624d] border-t-transparent" />
          <p className="text-xs text-[#657970]">Loading website builder workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-[calc(100vh-80px)] flex flex-col">
      {/* ── Top Bar: Title, Version, Actions ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#dce9df] bg-white px-4 py-2.5 shadow-xs shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Content Management</span>
            <span>•</span>
            <span>Version {document.version}</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#17352d]">Landing Page Builder</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDocument(migrateLegacyLandingConfig({}))}
            className="rounded-xl border border-[#cbded4] bg-white px-3 py-2 text-xs font-semibold text-[#17352d] hover:bg-[#f2f6f4]"
            title="Reset to canonical grounded template"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="rounded-xl border border-[#17624d] bg-white px-3.5 py-2 text-xs font-bold text-[#17624d] hover:bg-[#edf4f1] disabled:opacity-50"
          >
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="rounded-xl bg-[#17624d] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#104c3c] disabled:opacity-50"
          >
            {isPublishing ? "Publishing..." : "Publish Live"}
          </button>
        </div>
      </div>

      {/* ── 3-Panel Main Studio ────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* ── PANEL 1: Section Manager (Left) ─────────────────────────────── */}
        <aside
          className={`rounded-2xl border border-[#dce9df] bg-white shadow-xs shrink-0 flex flex-col transition-all duration-200 ease-in-out overflow-hidden ${
            isLeftCollapsed ? "w-11" : "w-[260px]"
          }`}
        >
          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            className="flex items-center justify-center p-2.5 border-b border-[#e2ece6] text-[#657970] hover:text-[#17624d] hover:bg-[#f7f8f5] transition shrink-0"
            title={isLeftCollapsed ? "Expand Sections Panel" : "Collapse Sections Panel"}
          >
            {isLeftCollapsed ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#657970]">
                  Sections
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </button>

          {!isLeftCollapsed && (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {/* Add Section Button */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full rounded-lg bg-[#17624d] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-[#104c3c] mb-2"
              >
                + Add Section
              </button>

              {/* Pinned: Navigation Header */}
              <div
                onClick={() => handleSelectSection("header")}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition ${
                  selectedSectionId === "header"
                    ? "bg-[#edf4f1] text-[#17624d] font-bold border border-[#17624d]/40"
                    : "bg-[#f7f8f5] text-[#17352d] hover:bg-[#f0f4f2]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-[#b17a25]">🔒</span>
                  <span className="truncate">Navigation Header</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleSection("header"); }}
                  className={`text-xs ${document.header.enabled ? "text-[#17624d]" : "text-[#cbded4]"}`}
                  title="Toggle Visibility"
                >
                  {document.header.enabled ? "👁" : "👁‍🗨"}
                </button>
              </div>

              {/* Body Label */}
              <div className="pt-1 pb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ba097] px-1">
                  Body ({document.sections.length})
                </span>
              </div>

              {/* Dynamic Body Sections */}
              {document.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer transition border ${
                    selectedSectionId === sec.id
                      ? "bg-[#edf4f1] text-[#17624d] font-bold border-[#17624d]/40"
                      : "bg-white text-[#17352d] border-[#e2ece6] hover:bg-[#f7f8f5]"
                  } ${!sec.enabled ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="flex flex-col text-[8px] text-[#8ba097]">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, "up"); }}
                        className="hover:text-[#17624d] disabled:opacity-20"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === document.sections.length - 1}
                        onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, "down"); }}
                        className="hover:text-[#17624d] disabled:opacity-20"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="capitalize truncate">{sec.type.replace("_", " ")}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#8ba097]">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleSection(sec.id); }}
                      className={sec.enabled ? "text-[#17624d]" : "text-gray-300"}
                      title="Toggle Visibility"
                    >
                      {sec.enabled ? "👁" : "👁‍🗨"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDuplicateSection(sec.id); }}
                      className="hover:text-[#17624d]"
                      title="Duplicate"
                    >
                      ⎘
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                      className="hover:text-red-600"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              {/* Pinned: Footer */}
              <div
                onClick={() => handleSelectSection("footer")}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition mt-2 ${
                  selectedSectionId === "footer"
                    ? "bg-[#edf4f1] text-[#17624d] font-bold border border-[#17624d]/40"
                    : "bg-[#f7f8f5] text-[#17352d] hover:bg-[#f0f4f2]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-[#b17a25]">🔒</span>
                  <span className="truncate">Website Footer</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleSection("footer"); }}
                  className={`text-xs ${document.footer.enabled ? "text-[#17624d]" : "text-[#cbded4]"}`}
                  title="Toggle Visibility"
                >
                  {document.footer.enabled ? "👁" : "👁‍🗨"}
                </button>
              </div>

              {/* Global Settings */}
              <button
                type="button"
                onClick={() => handleSelectSection("globals")}
                className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition mt-3 border ${
                  selectedSectionId === "globals"
                    ? "bg-[#edf4f1] text-[#17624d] border-[#17624d]"
                    : "bg-white text-[#657970] border-[#dce9df] hover:bg-[#f7f8f5]"
                }`}
              >
                ⚙ Global Brand & Canvas
              </button>
            </div>
          )}
        </aside>

        {/* ── PANEL 2: Live WYSIWYG Preview Canvas (Center) ───────────────── */}
        <main
          ref={canvasRef}
          className="flex-1 min-w-0 rounded-2xl border border-[#dce9df] bg-[#eef2ef] shadow-xs flex flex-col overflow-hidden"
        >
          {/* Virtual Browser Chrome Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white border-b border-[#dce9df] shrink-0 text-xs">
            {/* Left: Window Dots + URL */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#f7f8f5] rounded-full text-[11px] text-[#526b63] border border-[#cbded4]">
                <span className="text-[#17624d] font-bold">🔒</span>
                <span className="font-mono text-[#17352d]">tukodhub.com</span>
                <span className="text-[9px] text-[#8ba097] border-l border-[#cbded4] pl-1.5 ml-0.5">
                  {targetWidth}px
                </span>
              </div>
            </div>

            {/* Center: Device Switcher */}
            <div className="flex items-center gap-0.5 rounded-xl border border-[#cbded4] bg-[#f7f8f5] p-0.5 text-[11px]">
              {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevicePreview(mode)}
                  className={`rounded-lg px-2 py-1 font-semibold transition ${
                    devicePreview === mode
                      ? "bg-white text-[#17624d] shadow-2xs"
                      : "text-[#657970] hover:text-[#17352d]"
                  }`}
                >
                  {mode === "desktop" ? "🖥 Desktop" : mode === "tablet" ? "📱 Tablet" : "📲 Mobile"}
                </button>
              ))}
            </div>

            {/* Right: Zoom */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#657970] font-medium hidden sm:inline">Zoom:</span>
              <select
                value={zoomMode}
                onChange={(e) => setZoomMode(e.target.value as "fit" | "50" | "75" | "100")}
                className="rounded-lg border border-[#cbded4] bg-[#f7f8f5] px-2 py-1 text-[11px] font-semibold text-[#17352d] outline-none"
              >
                <option value="fit">Fit ({Math.round(computedScale * 100)}%)</option>
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
              </select>
            </div>
          </div>

          {/* Scrollable Viewport Canvas */}
          <div className="flex-1 overflow-auto p-3 flex justify-center items-start bg-[#e3eae5]">
            <div
              style={{
                width: Math.round(targetWidth * computedScale),
                height: "auto",
                position: "relative",
                transition: "width 0.15s ease",
              }}
              className={`shrink-0 overflow-hidden ${
                devicePreview === "mobile"
                  ? "rounded-[2.5rem] border-[8px] border-[#17352d] shadow-2xl"
                  : devicePreview === "tablet"
                  ? "rounded-2xl border-4 border-[#334b42] shadow-xl"
                  : "rounded-xl border border-[#cbded4] shadow-lg"
              }`}
            >
              <div
                style={{
                  width: `${targetWidth}px`,
                  transform: `scale(${computedScale})`,
                  transformOrigin: "top left",
                }}
              >
                <DynamicLandingPage
                  document={document}
                  interactive={interactiveOpts}
                />
              </div>
            </div>
          </div>
        </main>

        {/* ── PANEL 3: Properties Inspector (Right) ──────────────────────── */}
        <aside
          className={`rounded-2xl border border-[#dce9df] bg-white shadow-xs shrink-0 flex flex-col transition-all duration-200 ease-in-out overflow-hidden ${
            isRightCollapsed ? "w-11" : "w-[320px]"
          }`}
        >
          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            className="flex items-center justify-center p-2.5 border-b border-[#e2ece6] text-[#657970] hover:text-[#17624d] hover:bg-[#f7f8f5] transition shrink-0"
            title={isRightCollapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {isRightCollapsed ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#657970]">
                  Inspector
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </button>

          {!isRightCollapsed && (
            <div className="flex-1 overflow-y-auto p-3.5 text-xs">
              {/* ── Element-Level Inspector (Card/Button selected) ──── */}
              {selectedElement ? (
                <div className="space-y-3">
                  {/* Back breadcrumb */}
                  <button
                    type="button"
                    onClick={() => { setSelectedElementId(null); setSelectedElementParentId(undefined); }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#17624d] hover:underline"
                  >
                    <span>←</span>
                    <span>Back to {activeSection?.type.replace("_", " ")} Section</span>
                  </button>

                  <div className="border-b border-[#e2ece6] pb-2">
                    <span className="text-[10px] font-bold uppercase text-[#e9bd67]">
                      Editing {selectedElement.type === "card" ? "Card" : "Button"}
                    </span>
                    <h3 className="font-bold text-sm text-[#17352d]">
                      {selectedElement.type === "card"
                        ? (selectedElement.data as CardBlock).title
                        : (selectedElement.data as ButtonBlock).label}
                    </h3>
                  </div>

                  {selectedElement.type === "card" && (() => {
                    const card = selectedElement.data as CardBlock;
                    return (
                      <div className="space-y-3">
                        <InspectorGroup title="Content">
                          <div>
                            <label className="block font-semibold text-[#17352d]">Title</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d]"
                              value={card.title}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  cards: (s as any).cards.map((c: CardBlock) =>
                                    c.id === card.id ? { ...c, title: e.target.value } : c
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#17352d]">Description</label>
                            <textarea
                              rows={3}
                              className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d]"
                              value={card.description}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  cards: (s as any).cards.map((c: CardBlock) =>
                                    c.id === card.id ? { ...c, description: e.target.value } : c
                                  ),
                                }))
                              }
                            />
                          </div>
                          {card.badge !== undefined && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Badge</label>
                              <input
                                className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d]"
                                value={card.badge || ""}
                                onChange={(e) =>
                                  updateActiveSection((s) => ({
                                    ...s,
                                    cards: (s as any).cards.map((c: CardBlock) =>
                                      c.id === card.id ? { ...c, badge: e.target.value } : c
                                    ),
                                  }))
                                }
                              />
                            </div>
                          )}
                        </InspectorGroup>

                        <InspectorGroup title="Media & Icons">
                          <div>
                            <label className="block font-semibold text-[#17352d] mb-1">Icon</label>
                            <select
                              value={card.iconName || "Circle"}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  cards: (s as any).cards.map((c: CardBlock) =>
                                    c.id === card.id ? { ...c, iconName: e.target.value } : c
                                  ),
                                }))
                              }
                              className="w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none"
                            >
                              {CURATED_ICON_NAMES.map((name) => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </InspectorGroup>

                        <InspectorGroup title="Advanced" defaultOpen={false}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#17352d]">Visible</span>
                            <input
                              type="checkbox"
                              checked={card.enabled}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  cards: (s as any).cards.map((c: CardBlock) =>
                                    c.id === card.id ? { ...c, enabled: e.target.checked } : c
                                  ),
                                }))
                              }
                              className="h-4 w-4 accent-[#17624d]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveSection((s) => ({
                                ...s,
                                cards: (s as any).cards.filter((c: CardBlock) => c.id !== card.id),
                              }))
                            }
                            className="text-red-600 text-[11px] font-bold hover:underline"
                          >
                            Delete this card
                          </button>
                        </InspectorGroup>
                      </div>
                    );
                  })()}

                  {selectedElement.type === "button" && (() => {
                    const btn = selectedElement.data as ButtonBlock;
                    return (
                      <div className="space-y-3">
                        <InspectorGroup title="Content">
                          <div>
                            <label className="block font-semibold text-[#17352d]">Label</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d]"
                              value={btn.label}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  buttons: (s as any).buttons.map((b: ButtonBlock) =>
                                    b.id === btn.id ? { ...b, label: e.target.value } : b
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#17352d]">URL</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d]"
                              value={btn.url}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  buttons: (s as any).buttons.map((b: ButtonBlock) =>
                                    b.id === btn.id ? { ...b, url: e.target.value } : b
                                  ),
                                }))
                              }
                            />
                          </div>
                        </InspectorGroup>

                        <InspectorGroup title="Appearance">
                          <div>
                            <label className="block font-semibold text-[#17352d]">Variant</label>
                            <select
                              value={btn.variant}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  buttons: (s as any).buttons.map((b: ButtonBlock) =>
                                    b.id === btn.id ? { ...b, variant: e.target.value as ButtonVariant } : b
                                  ),
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none"
                            >
                              <option value="primary">Primary (Forest Green)</option>
                              <option value="secondary">Secondary (Dark)</option>
                              <option value="outline">Outline</option>
                              <option value="ghost">Ghost</option>
                              <option value="gold">Gold Accent</option>
                            </select>
                          </div>
                        </InspectorGroup>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <>
                  {/* ── Header Inspector ──────────────────────────────────── */}
                  {selectedSectionId === "header" && (
                    <div className="space-y-1">
                      <div className="border-b border-[#e2ece6] pb-2 mb-2">
                        <span className="text-[10px] font-bold uppercase text-[#b17a25]">Pinned Top</span>
                        <h3 className="font-bold text-sm text-[#17352d]">Navigation Header</h3>
                      </div>

                      <InspectorGroup title="Content">
                        <div>
                          <label className="block font-semibold text-[#17352d]">Brand Name</label>
                          <input
                            className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d] focus:bg-white"
                            value={document.header.brandName}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                header: { ...prev.header, brandName: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#17352d]">Logo Badge Letter</label>
                          <input
                            maxLength={2}
                            className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d] focus:bg-white"
                            value={document.header.badgeLetter || "T"}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                header: { ...prev.header, badgeLetter: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </InspectorGroup>

                      <InspectorGroup title="Navigation Links">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#17352d]">Links ({document.header.links.length})</span>
                            <button
                              type="button"
                              onClick={() =>
                                setDocument((prev) => ({
                                  ...prev,
                                  header: {
                                    ...prev.header,
                                    links: [
                                      ...prev.header.links,
                                      { id: `nl-${Date.now()}`, label: "New Link", url: "#", enabled: true },
                                    ],
                                  },
                                }))
                              }
                              className="text-[10px] font-bold text-[#17624d] hover:underline"
                            >
                              + Add
                            </button>
                          </div>
                          {document.header.links.map((link, i) => (
                            <div key={link.id} className="rounded-xl border border-[#e2ece6] p-2 space-y-1.5 bg-[#f7f8f5]">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#8ba097]">Link {i + 1}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDocument((prev) => ({
                                      ...prev,
                                      header: {
                                        ...prev.header,
                                        links: prev.header.links.filter((l) => l.id !== link.id),
                                      },
                                    }))
                                  }
                                  className="text-red-500 text-[10px] hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                              <input
                                className="w-full rounded-lg border border-[#cbded4] bg-white px-2 py-1 text-xs outline-none"
                                placeholder="Label"
                                value={link.label}
                                onChange={(e) =>
                                  setDocument((prev) => ({
                                    ...prev,
                                    header: {
                                      ...prev.header,
                                      links: prev.header.links.map((l) =>
                                        l.id === link.id ? { ...l, label: e.target.value } : l
                                      ),
                                    },
                                  }))
                                }
                              />
                              <input
                                className="w-full rounded-lg border border-[#cbded4] bg-white px-2 py-1 text-xs outline-none"
                                placeholder="URL (e.g. #workflow)"
                                value={link.url}
                                onChange={(e) =>
                                  setDocument((prev) => ({
                                    ...prev,
                                    header: {
                                      ...prev.header,
                                      links: prev.header.links.map((l) =>
                                        l.id === link.id ? { ...l, url: e.target.value } : l
                                      ),
                                    },
                                  }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </InspectorGroup>
                    </div>
                  )}

                  {/* ── Footer Inspector ──────────────────────────────────── */}
                  {selectedSectionId === "footer" && (
                    <div className="space-y-1">
                      <div className="border-b border-[#e2ece6] pb-2 mb-2">
                        <span className="text-[10px] font-bold uppercase text-[#b17a25]">Pinned Bottom</span>
                        <h3 className="font-bold text-sm text-[#17352d]">Website Footer</h3>
                      </div>

                      <InspectorGroup title="Content">
                        <div>
                          <label className="block font-semibold text-[#17352d]">Brand Name</label>
                          <input
                            className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d] focus:bg-white"
                            value={document.footer.brandName}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, brandName: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-[#17352d]">Copyright Text</label>
                          <input
                            className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d] focus:bg-white"
                            value={document.footer.copyrightText}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                footer: { ...prev.footer, copyrightText: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </InspectorGroup>
                    </div>
                  )}

                  {/* ── Globals Inspector ─────────────────────────────────── */}
                  {selectedSectionId === "globals" && (
                    <div className="space-y-1">
                      <div className="border-b border-[#e2ece6] pb-2 mb-2">
                        <span className="text-[10px] font-bold uppercase text-[#b17a25]">Site Settings</span>
                        <h3 className="font-bold text-sm text-[#17352d]">Global Branding & Canvas</h3>
                      </div>

                      <InspectorGroup title="Appearance">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#17352d]">Ambient Glow Blobs</span>
                          <input
                            type="checkbox"
                            checked={document.globals.showAmbientBlobs}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                globals: { ...prev.globals, showAmbientBlobs: e.target.checked },
                              }))
                            }
                            className="h-4 w-4 accent-[#17624d]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#17352d]">Primary Brand Color</label>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                            value={document.globals.primaryColor}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                globals: { ...prev.globals, primaryColor: e.target.value },
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#17352d]">Accent Color</label>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                            value={document.globals.accentColor}
                            onChange={(e) =>
                              setDocument((prev) => ({
                                ...prev,
                                globals: { ...prev.globals, accentColor: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </InspectorGroup>
                    </div>
                  )}

                  {/* ── Dynamic Body Section Inspector ────────────────────── */}
                  {activeSection && (
                    <div className="space-y-1">
                      <div className="border-b border-[#e2ece6] pb-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-[#17624d]">
                            {activeSection.type.replace("_", " ")}
                          </span>
                          <span className="text-[9px] font-mono text-[#8ba097]">{activeSection.id}</span>
                        </div>
                        <h3 className="font-bold text-sm text-[#17352d] capitalize">
                          {activeSection.type.replace("_", " ")} Settings
                        </h3>
                      </div>

                      {/* Layout & Appearance */}
                      <InspectorGroup title="Layout & Appearance">
                        <div>
                          <label className="block font-semibold text-[#17352d]">Background Style</label>
                          <select
                            value={activeSection.backgroundTone}
                            onChange={(e) =>
                              updateActiveSection((s) => ({
                                ...s,
                                backgroundTone: e.target.value as BackgroundTone,
                              }))
                            }
                            className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none"
                          >
                            <option value="cream">Cream (Light neutral)</option>
                            <option value="white">Clean White</option>
                            <option value="sand">Warm Sand</option>
                            <option value="forest-dark">Forest Dark (High contrast)</option>
                            <option value="muted-green">Muted Green Glow</option>
                          </select>
                        </div>
                        {"anchorId" in activeSection && (
                          <div>
                            <label className="block font-semibold text-[#17352d]">Anchor ID</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 outline-none focus:border-[#17624d]"
                              value={(activeSection as any).anchorId || ""}
                              onChange={(e) =>
                                updateActiveSection((s) => ({ ...s, anchorId: e.target.value }))
                              }
                            />
                          </div>
                        )}
                      </InspectorGroup>

                      {/* Content (Hero-specific) */}
                      {activeSection.type === "hero" && (
                        <InspectorGroup title="Content">
                          <div>
                            <label className="block font-semibold text-[#17352d]">Eyebrow Badge</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                              value={activeSection.eyebrowBadge?.text || ""}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  eyebrowBadge: { text: e.target.value, dotColor: "#e49b3f" },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#17352d]">Main Headline</label>
                            <textarea
                              rows={2}
                              className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                              value={activeSection.headline}
                              onChange={(e) =>
                                updateActiveSection((s) => ({ ...s, headline: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#17352d]">Subheadline Copy</label>
                            <textarea
                              rows={3}
                              className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                              value={activeSection.subheadline}
                              onChange={(e) =>
                                updateActiveSection((s) => ({ ...s, subheadline: e.target.value }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#17352d]">Operating Rhythm Widget</span>
                            <input
                              type="checkbox"
                              checked={activeSection.showOperatingRhythmWidget}
                              onChange={(e) =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  showOperatingRhythmWidget: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 accent-[#17624d]"
                            />
                          </div>
                        </InspectorGroup>
                      )}

                      {/* Content for sections with eyebrow/title/subtitle */}
                      {("eyebrow" in activeSection || "title" in activeSection) && (activeSection.type as string) !== "hero" && (
                        <InspectorGroup title="Content">
                          {"eyebrow" in activeSection && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Eyebrow</label>
                              <input
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).eyebrow || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, eyebrow: e.target.value }))}
                              />
                            </div>
                          )}
                          {"title" in activeSection && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Title</label>
                              <textarea
                                rows={2}
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).title || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, title: e.target.value }))}
                              />
                            </div>
                          )}
                          {"subtitle" in activeSection && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Subtitle</label>
                              <textarea
                                rows={2}
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).subtitle || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, subtitle: e.target.value }))}
                              />
                            </div>
                          )}
                          {"headline" in activeSection && (activeSection.type as string) !== "hero" && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Headline</label>
                              <textarea
                                rows={2}
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).headline || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, headline: e.target.value }))}
                              />
                            </div>
                          )}
                          {"description" in activeSection && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Description</label>
                              <textarea
                                rows={3}
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).description || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, description: e.target.value }))}
                              />
                            </div>
                          )}
                          {"body" in activeSection && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Body Text</label>
                              <textarea
                                rows={3}
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).body || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, body: e.target.value }))}
                              />
                            </div>
                          )}
                          {"text" in activeSection && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Text</label>
                              <input
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).text || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, text: e.target.value }))}
                              />
                            </div>
                          )}
                          {"badge" in activeSection && (activeSection.type as string) === "announcement" && (
                            <div>
                              <label className="block font-semibold text-[#17352d]">Badge</label>
                              <input
                                className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none"
                                value={(activeSection as any).badge || ""}
                                onChange={(e) => updateActiveSection((s) => ({ ...s, badge: e.target.value }))}
                              />
                            </div>
                          )}
                        </InspectorGroup>
                      )}

                      {/* Buttons Editor */}
                      {"buttons" in activeSection && (activeSection as any).buttons && (
                        <InspectorGroup title="Buttons & Actions">
                          <span className="font-bold text-[#17352d]">CTA Buttons ({(activeSection as any).buttons.length})</span>
                          {(activeSection as any).buttons.map((btn: ButtonBlock, i: number) => (
                            <div key={btn.id} className="rounded-xl border border-[#e2ece6] p-2 space-y-1.5 bg-[#f7f8f5]">
                              <span className="text-[10px] font-bold text-[#8ba097]">Button {i + 1}</span>
                              <input
                                className="w-full rounded-lg border border-[#cbded4] bg-white px-2 py-1 text-xs outline-none"
                                value={btn.label}
                                onChange={(e) =>
                                  updateActiveSection((s) => ({
                                    ...s,
                                    buttons: (s as any).buttons.map((b: ButtonBlock) =>
                                      b.id === btn.id ? { ...b, label: e.target.value } : b
                                    ),
                                  }))
                                }
                              />
                              <input
                                className="w-full rounded-lg border border-[#cbded4] bg-white px-2 py-1 text-xs outline-none"
                                value={btn.url}
                                onChange={(e) =>
                                  updateActiveSection((s) => ({
                                    ...s,
                                    buttons: (s as any).buttons.map((b: ButtonBlock) =>
                                      b.id === btn.id ? { ...b, url: e.target.value } : b
                                    ),
                                  }))
                                }
                              />
                            </div>
                          ))}
                        </InspectorGroup>
                      )}

                      {/* Cards Array Editor */}
                      {"cards" in activeSection && (
                        <InspectorGroup title="Cards & Items">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#17352d]">Cards ({activeSection.cards.length})</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateActiveSection((s) => ({
                                  ...s,
                                  cards: [
                                    ...(s as any).cards,
                                    {
                                      id: `c-${Date.now()}`,
                                      title: "New Item",
                                      description: "Description of the card or feature.",
                                      iconName: "ShieldCheck",
                                      enabled: true,
                                    },
                                  ],
                                }))
                              }
                              className="text-[10px] font-bold text-[#17624d] hover:underline"
                            >
                              + Add Card
                            </button>
                          </div>

                          {activeSection.cards.map((c, i) => (
                            <div
                              key={c.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectElement(c.id, activeSection.id);
                              }}
                              className={`rounded-xl border p-2.5 space-y-2 cursor-pointer transition ${
                                selectedElementId === c.id
                                  ? "border-[#e9bd67] bg-amber-50/50 shadow-sm"
                                  : "border-[#e2ece6] bg-[#f7f8f5] hover:border-[#17624d]/30"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#8ba097]">
                                  {selectedElementId === c.id ? "✏ " : ""}Card {i + 1}: {c.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActiveSection((s) => ({
                                      ...s,
                                      cards: (s as any).cards.filter((card: CardBlock) => card.id !== c.id),
                                    }));
                                  }}
                                  className="text-red-500 text-[10px] hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </InspectorGroup>
                      )}

                      {/* Advanced: Visibility Toggle */}
                      <InspectorGroup title="Advanced" defaultOpen={false}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#17352d]">Section Visible</span>
                          <input
                            type="checkbox"
                            checked={activeSection.enabled}
                            onChange={() => handleToggleSection(activeSection.id)}
                            className="h-4 w-4 accent-[#17624d]"
                          />
                        </div>
                      </InspectorGroup>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* ── Add Section Modal Picker ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e2ece6] pb-3">
              <h3 className="text-base font-bold text-[#17352d]">Add New Section</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto">
              {[
                { type: "hero", label: "Hero Section", desc: "Main headline & primary conversion actions" },
                { type: "announcement", label: "Announcement Bar", desc: "Top banner for updates and releases" },
                { type: "workflow", label: "Workflow Steps", desc: "Numbered daily operating rhythm (01, 02, 03)" },
                { type: "field_features", label: "Field Features", desc: "Key contractor capabilities & offline sync" },
                { type: "services", label: "Services Grid", desc: "Trade specializations (HVAC, Electrical, Plumbing)" },
                { type: "about", label: "About Section", desc: "Company mission and background profile" },
                { type: "statistics", label: "Statistics Tiles", desc: "High-contrast KPI metrics & impact proof" },
                { type: "testimonials", label: "Testimonials", desc: "Contractor reviews and 5-star social proof" },
                { type: "pricing", label: "Pricing Tables", desc: "Monthly & annual tiers with feature lists" },
                { type: "faq", label: "FAQ Accordion", desc: "Expandable answers to common questions" },
                { type: "cta", label: "Call to Action", desc: "High-contrast conversion banner" },
                { type: "contact", label: "Contact & Inquiry", desc: "Operations office details and lead form" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleAddSection(item.type as SectionType)}
                  className="rounded-xl border border-[#cbded4] p-3 text-left transition hover:border-[#17624d] hover:bg-[#edf4f1] group"
                >
                  <p className="font-bold text-xs text-[#17352d] group-hover:text-[#17624d]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[10px] text-[#657970] line-clamp-2">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

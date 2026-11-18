"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { IconLandingBuilder } from "@/components/owner/OwnerIcons";
import { ownerApiRequest } from "@/lib/ownerApi";

type LandingConfig = {
  announcement: {
    enabled: boolean;
    text: string;
    badge: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
  };
  workflow: {
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  fieldWork: {
    title: string;
    item1: string;
    item2: string;
    item3: string;
  };
};

const defaultConfig: LandingConfig = {
  announcement: {
    enabled: true,
    text: "Now supporting offline GPS sync for field technicians across the Philippines",
    badge: "New Release",
  },
  hero: {
    badge: "Field service software built for local realities",
    title: "One system from customer inquiry to verified job completion",
    subtitle: "Built for appliance, electrical, plumbing, HVAC, and field repair contractors who need clean coordination without spreadsheet chaos.",
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

export default function LandingPageBuilder() {
  const [config, setConfig] = useState<LandingConfig>(defaultConfig);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"hero" | "workflow" | "field" | "announcement">("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSavedConfig() {
      try {
        const response = await ownerApiRequest<{ key: string; valueJson: string | null }>("/api/v1/platform/landing-page");
        if (response.valueJson) {
          const parsed = JSON.parse(response.valueJson) as LandingConfig;
          setConfig({ ...defaultConfig, ...parsed });
        }
      } catch {
        // Fall back to defaultConfig if not yet saved in DB
      } finally {
        setIsLoading(false);
      }
    }
    void loadSavedConfig();
  }, []);

  async function handlePublish() {
    setIsSaving(true);
    try {
      await ownerApiRequest("/api/v1/platform/landing-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configJson: JSON.stringify(config) }),
      });

      await Swal.fire({
        icon: "success",
        title: "Landing Page Published!",
        text: "The main public marketing page (/) is now displaying your customized sections.",
        confirmButtonColor: "#17624d",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to publish";
      await Swal.fire({
        icon: "error",
        title: "Publishing Failed",
        text: msg,
        confirmButtonColor: "#17624d",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setConfig(defaultConfig);
    Swal.fire({
      icon: "info",
      title: "Reset to Default",
      text: "Draft restored to default template.",
      confirmButtonColor: "#17624d",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Content Management</span>
            <span>•</span>
            <span>Public Website Customizer</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Landing Page Builder</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Customize copy, hero sections, and value propositions for the main marketing landing page (<code>/</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-[#cbded4] bg-white px-3.5 py-2 text-xs font-semibold text-[#17352d] hover:bg-[#f2f6f4]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="rounded-xl bg-[#17624d] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#104c3c] disabled:opacity-60"
          >
            {isSaving ? "Publishing..." : "Publish Live"}
          </button>
        </div>
      </div>

      {/* Two-Pane Workspace: Left Inspector, Right Live Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Pane: Sections Inspector (5 Cols) */}
        <div className="space-y-4 rounded-2xl border border-[#dce9df] bg-white p-5 shadow-xs lg:col-span-5">
          <div className="flex border-b border-[#e2ece6] pb-3 text-xs font-semibold gap-2">
            {[
              { id: "hero", label: "Hero Section" },
              { id: "workflow", label: "Workflow Steps" },
              { id: "field", label: "Field Features" },
              { id: "announcement", label: "Announcement" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  activeTab === tab.id
                    ? "bg-[#17624d] text-white"
                    : "text-[#657970] hover:bg-[#f2f6f4]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Hero Section */}
          {activeTab === "hero" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#17352d]">Eyebrow Badge</label>
                <input
                  className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 text-xs text-[#17352d] outline-none focus:border-[#17624d] focus:bg-white"
                  value={config.hero.badge}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value },
                    }))
                  }
                />
              </div>

              <div>
                <label className="block font-bold text-[#17352d]">Main Headline</label>
                <textarea
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 text-xs text-[#17352d] outline-none focus:border-[#17624d] focus:bg-white"
                  value={config.hero.title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value },
                    }))
                  }
                />
              </div>

              <div>
                <label className="block font-bold text-[#17352d]">Subheadline Copy</label>
                <textarea
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 text-xs text-[#17352d] outline-none focus:border-[#17624d] focus:bg-white"
                  value={config.hero.subtitle}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17352d]">Primary Button</label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 text-xs text-[#17352d] outline-none focus:border-[#17624d]"
                    value={config.hero.ctaPrimaryText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaPrimaryText: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#17352d]">Secondary Button</label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2 text-xs text-[#17352d] outline-none focus:border-[#17624d]"
                    value={config.hero.ctaSecondaryText}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, ctaSecondaryText: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Workflow Steps */}
          {activeTab === "workflow" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#e2ece6] p-3 space-y-2">
                <p className="font-bold text-[#17624d]">Step 01</p>
                <input
                  className="w-full rounded-lg border border-[#cbded4] px-2.5 py-1.5 text-xs outline-none focus:border-[#17624d]"
                  value={config.workflow.step1Title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      workflow: { ...prev.workflow, step1Title: e.target.value },
                    }))
                  }
                />
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-[#cbded4] px-2.5 py-1.5 text-xs outline-none focus:border-[#17624d]"
                  value={config.workflow.step1Desc}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      workflow: { ...prev.workflow, step1Desc: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="rounded-xl border border-[#e2ece6] p-3 space-y-2">
                <p className="font-bold text-[#17624d]">Step 02</p>
                <input
                  className="w-full rounded-lg border border-[#cbded4] px-2.5 py-1.5 text-xs outline-none focus:border-[#17624d]"
                  value={config.workflow.step2Title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      workflow: { ...prev.workflow, step2Title: e.target.value },
                    }))
                  }
                />
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-[#cbded4] px-2.5 py-1.5 text-xs outline-none focus:border-[#17624d]"
                  value={config.workflow.step2Desc}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      workflow: { ...prev.workflow, step2Desc: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="rounded-xl border border-[#e2ece6] p-3 space-y-2">
                <p className="font-bold text-[#17624d]">Step 03</p>
                <input
                  className="w-full rounded-lg border border-[#cbded4] px-2.5 py-1.5 text-xs outline-none focus:border-[#17624d]"
                  value={config.workflow.step3Title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      workflow: { ...prev.workflow, step3Title: e.target.value },
                    }))
                  }
                />
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-[#cbded4] px-2.5 py-1.5 text-xs outline-none focus:border-[#17624d]"
                  value={config.workflow.step3Desc}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      workflow: { ...prev.workflow, step3Desc: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* Tab 3: Field Features */}
          {activeTab === "field" && (
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-[#17352d]">Key Selling Points</label>
              <input
                className="w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none focus:border-[#17624d]"
                value={config.fieldWork.item1}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    fieldWork: { ...prev.fieldWork, item1: e.target.value },
                  }))
                }
              />
              <input
                className="w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none focus:border-[#17624d]"
                value={config.fieldWork.item2}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    fieldWork: { ...prev.fieldWork, item2: e.target.value },
                  }))
                }
              />
              <input
                className="w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none focus:border-[#17624d]"
                value={config.fieldWork.item3}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    fieldWork: { ...prev.fieldWork, item3: e.target.value },
                  }))
                }
              />
            </div>
          )}

          {/* Tab 4: Announcement */}
          {activeTab === "announcement" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#17352d]">Enable Announcement Bar</span>
                <input
                  type="checkbox"
                  checked={config.announcement.enabled}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, enabled: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 accent-[#17624d]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#17352d]">Badge Text</label>
                <input
                  className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none focus:border-[#17624d]"
                  value={config.announcement.badge}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, badge: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="block font-bold text-[#17352d]">Announcement Text</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-[#cbded4] px-3 py-2 outline-none focus:border-[#17624d]"
                  value={config.announcement.text}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: { ...prev.announcement, text: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Live Device Preview (7 Cols) */}
        <div className="flex flex-col rounded-2xl border border-[#dce9df] bg-white p-5 shadow-xs lg:col-span-7">
          {/* Device Switcher */}
          <div className="flex items-center justify-between border-b border-[#e2ece6] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">
                Live Preview
              </span>
              <span className="rounded-full bg-[#dbeee2] px-2 py-0.5 text-[10px] font-semibold text-[#17624d]">
                ↕ Scroll to view full page
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-[#cbded4] bg-[#f7f8f5] p-1 text-xs">
              {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevicePreview(mode)}
                  className={`rounded-md px-2 py-0.5 capitalize transition ${
                    devicePreview === mode
                      ? "bg-white font-bold text-[#17624d] shadow-xs"
                      : "text-[#657970]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Frame with Scrollable Container */}
          <div className="mt-4 flex-1 flex justify-center bg-[#eef2ef] p-4 rounded-xl overflow-hidden">
            <div
              className={`rounded-xl border border-[#cbded4] bg-[#f7f8f5] text-[#17352d] shadow-md transition-all max-h-[640px] overflow-y-auto overscroll-contain ${
                devicePreview === "desktop"
                  ? "w-full max-w-2xl"
                  : devicePreview === "tablet"
                  ? "w-[480px]"
                  : "w-[340px]"
              }`}
            >
              <div className="p-6 space-y-6">
                {/* Announcement Bar */}
                {config.announcement.enabled && (
                  <div className="rounded-lg bg-[#dbeee2] px-3 py-1.5 text-[10px] text-[#17624d] flex items-center gap-2">
                    <span className="rounded bg-[#17624d] px-1.5 py-0.5 font-bold text-white uppercase text-[8px]">
                      {config.announcement.badge}
                    </span>
                    <span className="truncate">{config.announcement.text}</span>
                  </div>
                )}

                {/* Mini Nav */}
                <div className="flex items-center justify-between border-b border-[#cbded4]/60 pb-3">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="grid h-6 w-6 place-items-center rounded bg-[#17624d] text-[10px] text-white">T</span>
                    <span>TukodHub</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-semibold text-[#17624d]">{config.hero.ctaSecondaryText}</span>
                    <span className="rounded-full bg-[#17624d] px-2.5 py-1 font-bold text-white">
                      {config.hero.ctaPrimaryText}
                    </span>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="py-6 text-center space-y-3">
                  <span className="inline-block rounded-full border border-[#cbded4] bg-white px-3 py-1 text-[9px] font-semibold text-[#b17a25]">
                    {config.hero.badge}
                  </span>
                  <h1 className="text-xl font-extrabold tracking-tight text-[#17352d] leading-snug">
                    {config.hero.title}
                  </h1>
                  <p className="text-[11px] text-[#657970] max-w-md mx-auto leading-relaxed">
                    {config.hero.subtitle}
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <span className="rounded-full bg-[#17624d] px-4 py-2 text-xs font-bold text-white">
                      {config.hero.ctaPrimaryText}
                    </span>
                    <span className="rounded-full border border-[#cbded4] bg-white px-4 py-2 text-xs font-semibold text-[#17352d]">
                      How it works
                    </span>
                  </div>
                </div>

                {/* Workflow Steps Preview */}
                <div className="border-t border-[#cbded4]/60 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#b17a25] text-center mb-3">
                    {config.workflow.title}
                  </p>
                  <div className={`grid gap-2 text-left ${devicePreview === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                    <div className="rounded-lg bg-white p-2.5 border border-[#e2ece6]">
                      <span className="font-mono text-[9px] font-bold text-[#b17a25]">01</span>
                      <p className="font-bold text-[10px] text-[#17352d]">{config.workflow.step1Title}</p>
                      <p className="text-[8px] text-[#657970] mt-0.5">{config.workflow.step1Desc}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-[#e2ece6]">
                      <span className="font-mono text-[9px] font-bold text-[#b17a25]">02</span>
                      <p className="font-bold text-[10px] text-[#17352d]">{config.workflow.step2Title}</p>
                      <p className="text-[8px] text-[#657970] mt-0.5">{config.workflow.step2Desc}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-[#e2ece6]">
                      <span className="font-mono text-[9px] font-bold text-[#b17a25]">03</span>
                      <p className="font-bold text-[10px] text-[#17352d]">{config.workflow.step3Title}</p>
                      <p className="text-[8px] text-[#657970] mt-0.5">{config.workflow.step3Desc}</p>
                    </div>
                  </div>
                </div>

                {/* Field Work / Selling Points Preview */}
                <div className="border-t border-[#cbded4]/60 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#b17a25] text-center mb-3">
                    {config.fieldWork.title}
                  </p>
                  <div className={`grid gap-2 ${devicePreview === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                    <div className="rounded-lg bg-white p-2.5 border border-[#e2ece6]">
                      <p className="text-xs font-bold text-[#17624d]">↗ Actionable</p>
                      <p className="text-[9px] text-[#657970] mt-1">{config.fieldWork.item1}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-[#e2ece6]">
                      <p className="text-xs font-bold text-[#17624d]">◌ Field Proof</p>
                      <p className="text-[9px] text-[#657970] mt-1">{config.fieldWork.item2}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-[#e2ece6]">
                      <p className="text-xs font-bold text-[#17624d]">✓ Compliance</p>
                      <p className="text-[9px] text-[#657970] mt-1">{config.fieldWork.item3}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="border-t border-[#cbded4]/60 pt-4 pb-2">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-[#71847c]">
                    <div className="flex items-center gap-1.5 font-bold text-[#17624d]">
                      <span className="grid h-4 w-4 place-items-center rounded bg-[#17624d] text-[8px] text-white">T</span>
                      <span>TukodHub</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>How it works</span>
                      <span>•</span>
                      <span>Built for field work</span>
                      <span>•</span>
                      <span>Contact</span>
                    </div>
                    <p>© 2026 Joenil Acero. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { IconSettings } from "@/components/owner/OwnerIcons";

export default function PlatformSettingsPage() {
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportSessionMaxDuration, setSupportSessionMaxDuration] = useState("60");

  function handleSave() {
    Swal.fire({
      icon: "success",
      title: "Settings Saved",
      text: "Platform configuration updated and audited.",
      confirmButtonColor: "#17624d",
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
          <span>Configuration & Security</span>
          <span>•</span>
          <span>Global Controls</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Platform Settings</h1>
        <p className="mt-1 text-sm text-[#657970]">
          Configure security policies, support handshake defaults, and global platform operational modes.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#17352d]">Tenant Registration & Onboarding</h2>
        <div className="flex items-center justify-between border-b border-[#e2ece6] pb-4">
          <div>
            <p className="text-sm font-semibold text-[#17352d]">Allow Public Tenant Self-Registration</p>
            <p className="text-xs text-[#657970]">
              When enabled, new businesses can register via <code>/auth/register</code> and start their 14-day trial.
            </p>
          </div>
          <input
            type="checkbox"
            checked={allowRegistration}
            onChange={(e) => setAllowRegistration(e.target.checked)}
            className="h-5 w-5 accent-[#17624d]"
          />
        </div>

        <h2 className="text-base font-bold text-[#17352d] pt-2">Security & Support Access Policy</h2>
        <div className="space-y-4 border-b border-[#e2ece6] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#17352d]">Enforce Strict Tenant Privacy Boundary</p>
              <p className="text-xs text-[#657970]">
                Requires explicit tenant approval for platform super admins to view tenant records. (Locked ON per WORKFLOW.md)
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Enforced (Active)
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#17352d]">
              Default Support Session Expiration
            </label>
            <p className="text-xs text-[#657970] mb-2">
              Maximum time an approved support session token remains valid before automatic revocation.
            </p>
            <select
              value={supportSessionMaxDuration}
              onChange={(e) => setSupportSessionMaxDuration(e.target.value)}
              className="rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3.5 py-2 text-xs font-semibold text-[#17352d] outline-none focus:border-[#17624d]"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour (Recommended)</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>
        </div>

        <h2 className="text-base font-bold text-[#17352d] pt-2">Platform Maintenance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#17352d]">Global Maintenance Mode</p>
            <p className="text-xs text-[#657970]">
              Temporarily show a maintenance page to all public visitors and tenant users while keeping Control Tower accessible.
            </p>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="h-5 w-5 accent-[#17624d]"
          />
        </div>

        <div className="border-t border-[#e2ece6] pt-4 text-right">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[#17624d] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#104c3c]"
          >
            Save Platform Settings
          </button>
        </div>
      </div>
    </div>
  );
}

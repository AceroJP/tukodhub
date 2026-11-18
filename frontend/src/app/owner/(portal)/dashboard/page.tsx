"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBusinesses,
  IconSupport,
  IconLandingBuilder,
  IconActivityLogs,
  IconMonitoring,
} from "@/components/owner/OwnerIcons";

type ActivityItem = {
  id: string;
  type: "tenant" | "billing" | "security" | "support";
  title: string;
  detail: string;
  timestamp: string;
  status?: string;
};

const initialActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "support",
    title: "Support Session Requested",
    detail: "Platform support access requested for 'CoolAir Systems' (Ticket #TK-108). Awaiting tenant approval.",
    timestamp: "10 mins ago",
    status: "Pending Tenant Consent",
  },
  {
    id: "act-2",
    type: "tenant",
    title: "New Business Onboarded",
    detail: "Tenant 'Precision Electrical Services' registered under Starter Tier.",
    timestamp: "1 hour ago",
  },
  {
    id: "act-3",
    type: "billing",
    title: "Subscription Renewal Confirmed",
    detail: "Tenant 'Island Tech HVAC' renewed Monthly Pro Plan (₱2,990).",
    timestamp: "3 hours ago",
    status: "Paid",
  },
  {
    id: "act-4",
    type: "security",
    title: "Unusual Login Burst Detected",
    detail: "5 failed tenant login attempts blocked by rate limiter on tenant 'metroflow'.",
    timestamp: "5 hours ago",
    status: "Mitigated",
  },
];

export default function OwnerDashboardPage() {
  const [filter, setFilter] = useState<"all" | "tenant" | "billing" | "security" | "support">("all");

  const filteredActivities = initialActivities.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Control Tower</span>
            <span>•</span>
            <span>Live Overview</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#17352d]">Platform Overview</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Autonomous operations, tenant governance, and system-wide telemetry.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/owner/landing-builder"
            className="flex items-center gap-2 rounded-xl border border-[#cbded4] bg-white px-3.5 py-2 text-xs font-semibold text-[#17352d] shadow-xs transition hover:border-[#17624d] hover:bg-[#f2f6f4]"
          >
            <IconLandingBuilder className="h-4 w-4 text-[#17624d]" />
            <span>Edit Landing Page</span>
          </Link>
          <Link
            href="/owner/support"
            className="flex items-center gap-2 rounded-xl bg-[#17624d] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#104c3c]"
          >
            <IconSupport className="h-4 w-4 text-[#e9bd67]" />
            <span>Support Inbox (1 Pending)</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Tenants */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">Active Businesses</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#dbeee2] text-[#17624d]">
              <IconBusinesses className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17352d]">8</span>
            <span className="text-xs font-semibold text-emerald-600">+2 this month</span>
          </div>
          <p className="mt-2 text-xs text-[#8ba097]">6 Active • 2 In Trial</p>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">Platform MRR</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f9f0db] text-[#b17a25]">
              ₱
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17352d]">₱42,500</span>
            <span className="text-xs font-semibold text-emerald-600">100% collected</span>
          </div>
          <p className="mt-2 text-xs text-[#8ba097]">Next billing run in 4 days</p>
        </div>

        {/* Support Tickets */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">Support Tickets</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e2ece6] text-[#17624d]">
              <IconSupport className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#17352d]">1</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">1 Action Required</span>
          </div>
          <p className="mt-2 text-xs text-[#8ba097]">Average resolution time: 1.4 hrs</p>
        </div>

        {/* System Health */}
        <div className="relative overflow-hidden rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">System Health</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <IconMonitoring className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">99.98%</span>
            <span className="text-xs font-semibold text-emerald-600">Healthy</span>
          </div>
          <p className="mt-2 text-xs text-[#8ba097]">Avg API latency: 28ms</p>
        </div>
      </section>

      {/* Main Two-Column Layout: Feed + Security Control */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Live Activity Stream */}
        <section className="space-y-4 rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e2ece6] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#17352d]">Live Platform Activity Stream</h2>
              <p className="text-xs text-[#657970]">Audited platform events and tenant security telemetry.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {(["all", "tenant", "billing", "security", "support"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`rounded-lg px-2.5 py-1 capitalize transition ${
                    filter === type
                      ? "bg-[#17624d] text-white"
                      : "bg-[#f2f6f4] text-[#657970] hover:bg-[#e2ece6]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Timeline List */}
          <div className="divide-y divide-[#f0f4f2]">
            {filteredActivities.map((act) => (
              <div key={act.id} className="flex items-start justify-between py-3.5 first:pt-1 last:pb-1">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      act.type === "support"
                        ? "bg-amber-500"
                        : act.type === "security"
                        ? "bg-rose-500"
                        : act.type === "billing"
                        ? "bg-emerald-500"
                        : "bg-[#17624d]"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#17352d]">{act.title}</p>
                    <p className="mt-0.5 text-xs text-[#657970]">{act.detail}</p>
                    <span className="mt-1 block text-[10px] text-[#8ba097]">{act.timestamp}</span>
                  </div>
                </div>
                {act.status && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      act.status.includes("Pending")
                        ? "bg-amber-100 text-amber-800"
                        : act.status === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#f2f6f4] text-[#657970]"
                    }`}
                  >
                    {act.status}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-[#e2ece6] pt-3 text-right">
            <Link
              href="/owner/activity-logs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#17624d] hover:underline"
            >
              <span>View full audited trail in Activity Logs</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Right Col: Privacy Boundary & Authorized Sessions */}
        <div className="space-y-6">
          {/* Privacy Boundary Card */}
          <section className="rounded-2xl border border-[#cbded4] bg-[#112620] p-6 text-white shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#b17a25] text-white font-bold text-sm">
                🛡
              </span>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Privacy Boundary Guarantee</h3>
                <p className="text-[10px] uppercase tracking-wider text-[#b17a25]">WORKFLOW.md Compliance</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#cbded4]">
              Platform admins cannot browse tenant customer records, job bookings, or internal files without explicit, time-boxed authorization granted by the business owner.
            </p>
            <div className="mt-4 rounded-xl border border-[#23453a] bg-[#18362e] p-3 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#e9bd67]">
                <span>Active Support Sessions</span>
                <span className="rounded-full bg-[#2a5548] px-2 py-0.5 text-white">0 Active</span>
              </div>
              <p className="mt-1 text-[11px] text-[#93b3a5]">All current tenant data is fully isolated.</p>
            </div>
          </section>

          {/* Quick Shortcuts */}
          <section className="rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-[#17352d]">Quick Management Tools</h3>
            <div className="mt-4 space-y-2.5">
              <Link
                href="/owner/businesses"
                className="flex items-center justify-between rounded-xl border border-[#e2ece6] p-3 transition hover:border-[#17624d] hover:bg-[#f7f8f5]"
              >
                <div className="flex items-center gap-3">
                  <IconBusinesses className="h-4 w-4 text-[#17624d]" />
                  <div>
                    <p className="text-xs font-semibold text-[#17352d]">Manage Businesses</p>
                    <p className="text-[10px] text-[#8ba097]">Suspend, activate, or view tenant cockpit</p>
                  </div>
                </div>
                <span className="text-xs text-[#8ba097]">→</span>
              </Link>

              <Link
                href="/owner/landing-builder"
                className="flex items-center justify-between rounded-xl border border-[#e2ece6] p-3 transition hover:border-[#17624d] hover:bg-[#f7f8f5]"
              >
                <div className="flex items-center gap-3">
                  <IconLandingBuilder className="h-4 w-4 text-[#17624d]" />
                  <div>
                    <p className="text-xs font-semibold text-[#17352d]">Landing Page Builder</p>
                    <p className="text-[10px] text-[#8ba097]">Live customize marketing page sections</p>
                  </div>
                </div>
                <span className="text-xs text-[#8ba097]">→</span>
              </Link>

              <Link
                href="/owner/monitoring"
                className="flex items-center justify-between rounded-xl border border-[#e2ece6] p-3 transition hover:border-[#17624d] hover:bg-[#f7f8f5]"
              >
                <div className="flex items-center gap-3">
                  <IconMonitoring className="h-4 w-4 text-[#17624d]" />
                  <div>
                    <p className="text-xs font-semibold text-[#17352d]">System Monitoring</p>
                    <p className="text-[10px] text-[#8ba097]">Inspect database connections & latency</p>
                  </div>
                </div>
                <span className="text-xs text-[#8ba097]">→</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

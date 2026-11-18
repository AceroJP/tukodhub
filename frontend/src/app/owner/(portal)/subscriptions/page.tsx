"use client";

import { useState } from "react";
import { IconSubscriptions } from "@/components/owner/OwnerIcons";

type Subscription = {
  id: string;
  tenantName: string;
  slug: string;
  tier: "Starter" | "Pro" | "Enterprise";
  billingCycle: "Monthly" | "Annual";
  amount: string;
  status: "Active" | "Past Due" | "Trial";
  renewalDate: string;
};

const initialSubs: Subscription[] = [
  {
    id: "sub-1",
    tenantName: "Electrical 3J Services",
    slug: "electrical3j",
    tier: "Pro",
    billingCycle: "Monthly",
    amount: "₱2,990",
    status: "Active",
    renewalDate: "2026-12-12",
  },
  {
    id: "sub-2",
    tenantName: "CoolAir Airconditioning",
    slug: "coolair",
    tier: "Enterprise",
    billingCycle: "Annual",
    amount: "₱49,900",
    status: "Active",
    renewalDate: "2027-09-04",
  },
  {
    id: "sub-3",
    tenantName: "Precision Plumbing Co",
    slug: "precisionplumb",
    tier: "Starter",
    billingCycle: "Monthly",
    amount: "₱1,490",
    status: "Trial",
    renewalDate: "2026-11-29",
  },
  {
    id: "sub-4",
    tenantName: "MetroFlow Repairs",
    slug: "metroflow",
    tier: "Pro",
    billingCycle: "Monthly",
    amount: "₱2,990",
    status: "Active",
    renewalDate: "2026-12-28",
  },
];

export default function SubscriptionsPage() {
  const [subs] = useState<Subscription[]>(initialSubs);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
          <span>Financial Operations</span>
          <span>•</span>
          <span>Tenants Subscriptions</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Active Subscriptions</h1>
        <p className="mt-1 text-sm text-[#657970]">
          Track recurring billing schedules, plan renewals, trial maturities, and MRR contributions.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#657970]">Total ARR</p>
          <p className="mt-3 text-3xl font-extrabold text-[#17352d]">₱510,000</p>
          <p className="mt-1 text-xs text-emerald-600">Calculated across all recurring tiers</p>
        </div>
        <div className="rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#657970]">Paid Accounts</p>
          <p className="mt-3 text-3xl font-extrabold text-[#17352d]">3 Active</p>
          <p className="mt-1 text-xs text-[#8ba097]">1 Trial conversion pending</p>
        </div>
        <div className="rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#657970]">Renewal Health</p>
          <p className="mt-3 text-3xl font-extrabold text-emerald-700">100%</p>
          <p className="mt-1 text-xs text-emerald-600">Zero past-due invoices</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dce9df] bg-white shadow-xs">
        <table className="w-full text-left text-sm text-[#17352d]">
          <thead className="border-b border-[#e2ece6] bg-[#f7f8f5] text-xs font-bold uppercase tracking-wider text-[#657970]">
            <tr>
              <th className="px-6 py-3.5">Business</th>
              <th className="px-6 py-3.5">Tier & Frequency</th>
              <th className="px-6 py-3.5">Recurring Rate</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Next Renewal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f4f2]">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-[#f7f8f5] transition">
                <td className="px-6 py-4 font-bold text-[#17352d]">
                  <div>{s.tenantName}</div>
                  <div className="text-xs font-normal text-[#8ba097]">{s.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold">{s.tier}</span>
                  <span className="text-xs text-[#8ba097]"> ({s.billingCycle})</span>
                </td>
                <td className="px-6 py-4 font-bold text-[#17624d]">{s.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      s.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#657970]">{s.renewalDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

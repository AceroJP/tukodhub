"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { IconPlans } from "@/components/owner/OwnerIcons";

type Plan = {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: string;
  priceAnnual: string;
  maxBranches: string;
  maxTechs: string;
  features: string[];
  isPopular?: boolean;
};

const initialPlans: Plan[] = [
  {
    id: "plan-starter",
    name: "Starter",
    priceMonthly: "₱1,490",
    priceAnnual: "₱14,900",
    maxBranches: "1 Branch",
    maxTechs: "Up to 3 Technicians",
    features: [
      "Mobile job execution workflow",
      "Customer inquiry logging",
      "Standard email notifications",
      "Basic reporting",
    ],
  },
  {
    id: "plan-pro",
    name: "Pro Growth",
    badge: "Most Popular",
    isPopular: true,
    priceMonthly: "₱2,990",
    priceAnnual: "₱29,900",
    maxBranches: "3 Branches",
    maxTechs: "Up to 10 Technicians",
    features: [
      "Everything in Starter",
      "Multi-branch dispatching",
      "Customer proof-of-work photos",
      "SMS & in-app alerts",
      "Priority platform support",
    ],
  },
  {
    id: "plan-ent",
    name: "Enterprise",
    priceMonthly: "₱4,990",
    priceAnnual: "₱49,900",
    maxBranches: "Unlimited Branches",
    maxTechs: "Unlimited Technicians",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom SLA guarantees",
      "Automated accounting exports",
      "Audit trail export API",
    ],
  },
];

export default function PlansPage() {
  const [plans] = useState<Plan[]>(initialPlans);

  async function handleEditPlan(planName: string) {
    await Swal.fire({
      title: `Edit ${planName} Plan`,
      text: "Plan tier adjustments will take effect on subsequent billing cycles.",
      icon: "info",
      confirmButtonColor: "#17624d",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Platform Monetization</span>
            <span>•</span>
            <span>Subscription Tiers</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Subscription Plans</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Configure pricing tiers, operational limits (branches & technicians), and feature gates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => Swal.fire({ title: "New Plan Tier", text: "Create customized plan templates.", icon: "info", confirmButtonColor: "#17624d" })}
          className="rounded-xl bg-[#17624d] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#104c3c]"
        >
          + Add New Plan Tier
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-xs border transition ${
              plan.isPopular ? "border-[#17624d] ring-2 ring-[#17624d]/10" : "border-[#dce9df]"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 right-6 rounded-full bg-[#17624d] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {plan.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#17352d]">{plan.name}</h3>
                <span className="text-xs font-semibold text-[#8ba097]">{plan.maxBranches}</span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#17352d]">{plan.priceMonthly}</span>
                <span className="text-xs text-[#8ba097]">/ month</span>
              </div>
              <p className="mt-1 text-xs text-[#657970]">{plan.priceAnnual} billed annually</p>

              <div className="my-5 border-t border-[#e2ece6]" />

              <p className="text-xs font-bold uppercase tracking-wider text-[#b17a25]">{plan.maxTechs}</p>
              <ul className="mt-3 space-y-2 text-xs text-[#456157]">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-[#e2ece6] pt-4">
              <button
                type="button"
                onClick={() => handleEditPlan(plan.name)}
                className="w-full rounded-xl border border-[#cbded4] py-2 text-xs font-semibold text-[#17352d] transition hover:bg-[#f2f6f4]"
              >
                Configure Plan Rules
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

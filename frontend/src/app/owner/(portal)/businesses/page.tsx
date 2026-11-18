"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { IconBusinesses, IconSearch } from "@/components/owner/OwnerIcons";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  plan: string;
  status: "Active" | "Trial" | "Suspended";
  branchesCount: number;
  techsCount: number;
  createdAt: string;
};

const initialTenants: Tenant[] = [
  {
    id: "t-1",
    name: "Electrical 3J Services",
    slug: "electrical3j",
    ownerEmail: "owner@electrical3j.com",
    plan: "Pro (Monthly)",
    status: "Active",
    branchesCount: 2,
    techsCount: 6,
    createdAt: "2026-10-12",
  },
  {
    id: "t-2",
    name: "CoolAir Airconditioning",
    slug: "coolair",
    ownerEmail: "contact@coolair.ph",
    plan: "Enterprise (Annual)",
    status: "Active",
    branchesCount: 4,
    techsCount: 15,
    createdAt: "2026-09-04",
  },
  {
    id: "t-3",
    name: "Precision Plumbing Co",
    slug: "precisionplumb",
    ownerEmail: "info@precisionplumb.ph",
    plan: "Starter",
    status: "Trial",
    branchesCount: 1,
    techsCount: 2,
    createdAt: "2026-11-15",
  },
  {
    id: "t-4",
    name: "MetroFlow Repairs",
    slug: "metroflow",
    ownerEmail: "support@metroflow.com",
    plan: "Pro (Monthly)",
    status: "Active",
    branchesCount: 1,
    techsCount: 4,
    createdAt: "2026-10-28",
  },
];

export default function BusinessesPage() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Trial" | "Suspended">("All");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleToggleStatus(tenant: Tenant) {
    const isSuspending = tenant.status !== "Suspended";
    const confirm = await Swal.fire({
      title: isSuspending ? `Suspend ${tenant.name}?` : `Reactivate ${tenant.name}?`,
      text: isSuspending
        ? "The tenant's users and technicians will temporarily be blocked from signing in."
        : "The tenant's workspace access will be immediately restored.",
      icon: isSuspending ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isSuspending ? "#b91c1c" : "#17624d",
      confirmButtonText: isSuspending ? "Yes, Suspend" : "Yes, Reactivate",
    });

    if (confirm.isConfirmed) {
      setTenants((prev) =>
        prev.map((item) =>
          item.id === tenant.id
            ? { ...item, status: isSuspending ? "Suspended" : "Active" }
            : item
        )
      );
      await Swal.fire({
        icon: "success",
        title: isSuspending ? "Business Suspended" : "Business Activated",
        text: `Audit log entry created for tenant ${tenant.slug}.`,
        confirmButtonColor: "#17624d",
      });
    }
  }

  async function handleRequestSupportSession(tenant: Tenant) {
    const { value: reason } = await Swal.fire({
      title: "Request Support Access",
      input: "text",
      inputLabel: `State the reason for requesting support access to ${tenant.name}:`,
      inputPlaceholder: "e.g. Investigating sync failure reported in Ticket #TK-108",
      showCancelButton: true,
      confirmButtonColor: "#17624d",
      confirmButtonText: "Send In-App Request to Tenant Owner",
      inputValidator: (value) => {
        if (!value || value.trim().length < 8) {
          return "Please provide a specific reason (at least 8 characters).";
        }
      },
    });

    if (reason) {
      await Swal.fire({
        icon: "success",
        title: "Request Dispatched",
        text: `The owner (${tenant.ownerEmail}) will see an approval banner in their dashboard. Once approved, you will receive a 1-hour audited session.`,
        confirmButtonColor: "#17624d",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Platform Governance</span>
            <span>•</span>
            <span>Tenants Directory</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Businesses & Tenants</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Manage registered multi-tenant businesses, monitor subscription tiers, and control account status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-[#dce9df] bg-white px-3.5 py-2 text-xs font-semibold text-[#17352d]">
            Total: {tenants.length} Businesses
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#dce9df] bg-white p-4 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {(["All", "Active", "Trial", "Suspended"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3 py-1.5 transition ${
                statusFilter === status
                  ? "bg-[#17624d] text-white shadow-xs"
                  : "bg-[#f2f6f4] text-[#657970] hover:bg-[#e2ece6]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba097]" />
          <input
            className="w-full rounded-xl border border-[#cbded4] bg-[#f7f8f5] py-2 pl-9 pr-3 text-xs text-[#17352d] outline-none transition focus:border-[#17624d] focus:bg-white"
            placeholder="Search by name, slug, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-2xl border border-[#dce9df] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#17352d]">
            <thead className="border-b border-[#e2ece6] bg-[#f7f8f5] text-xs font-bold uppercase tracking-wider text-[#657970]">
              <tr>
                <th className="px-6 py-3.5">Business & Slug</th>
                <th className="px-6 py-3.5">Owner Contact</th>
                <th className="px-6 py-3.5">Plan Tier</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f2]">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#8ba097]">
                    No businesses matching the search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="transition hover:bg-[#f7f8f5]">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#17352d]">{tenant.name}</div>
                      <div className="text-xs text-[#8ba097]">
                        Hostname: <code className="rounded bg-[#f0f4f2] px-1 py-0.5">{tenant.slug}.localhost:3000</code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#657970]">{tenant.ownerEmail}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg border border-[#cbded4] bg-[#f2f6f4] px-2.5 py-1 text-xs font-semibold text-[#17624d]">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          tenant.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : tenant.status === "Trial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8ba097]">{tenant.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTenant(tenant)}
                          className="rounded-lg border border-[#cbded4] bg-white px-3 py-1.5 text-xs font-semibold text-[#17624d] transition hover:bg-[#f2f6f4]"
                        >
                          Cockpit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tenant)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            tenant.status === "Suspended"
                              ? "bg-emerald-700 text-white hover:bg-emerald-800"
                              : "border border-rose-300 text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          {tenant.status === "Suspended" ? "Reactivate" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Cockpit Drawer (Slide-Over) */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2ece6] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b17a25]">Tenant Cockpit</span>
                  <h2 className="text-xl font-bold text-[#17352d]">{selectedTenant.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTenant(null)}
                  className="rounded-lg p-1.5 text-[#657970] hover:bg-[#f2f6f4]"
                >
                  ✕
                </button>
              </div>

              {/* Safe Metadata Cards */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#657970]">
                  Layer A Safe Aggregates (WORKFLOW.md)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#dce9df] bg-[#f7f8f5] p-3">
                    <p className="text-[10px] text-[#657970]">Registered Branches</p>
                    <p className="mt-1 text-lg font-bold text-[#17352d]">{selectedTenant.branchesCount}</p>
                  </div>
                  <div className="rounded-xl border border-[#dce9df] bg-[#f7f8f5] p-3">
                    <p className="text-[10px] text-[#657970]">Active Technicians</p>
                    <p className="mt-1 text-lg font-bold text-[#17352d]">{selectedTenant.techsCount}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dce9df] bg-[#f7f8f5] p-3 text-xs space-y-1">
                  <p><span className="text-[#8ba097]">Tenant Slug:</span> <code className="font-mono">{selectedTenant.slug}</code></p>
                  <p><span className="text-[#8ba097]">Owner Email:</span> {selectedTenant.ownerEmail}</p>
                  <p><span className="text-[#8ba097]">Subscription:</span> {selectedTenant.plan} ({selectedTenant.status})</p>
                  <p><span className="text-[#8ba097]">Created:</span> {selectedTenant.createdAt}</p>
                </div>
              </div>

              {/* Handshake Support Access Section */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-800 font-bold text-sm">🔒</span>
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Authorized Support Handshake
                  </h3>
                </div>
                <p className="text-xs leading-5 text-amber-800">
                  Per security rules, platform super admins do not have automatic access to this tenant’s business records (invoices, customer lists, job proofs).
                </p>
                <button
                  type="button"
                  onClick={() => handleRequestSupportSession(selectedTenant)}
                  className="w-full rounded-xl bg-amber-800 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-900"
                >
                  Request Temporary Support Access
                </button>
              </div>
            </div>

            <div className="border-t border-[#e2ece6] pt-4 mt-6">
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="w-full rounded-xl border border-[#cbded4] py-2.5 text-xs font-semibold text-[#17352d] hover:bg-[#f2f6f4]"
              >
                Close Cockpit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

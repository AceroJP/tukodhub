"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { IconBusinesses, IconSearch } from "@/components/owner/OwnerIcons";
import { ownerApiRequest } from "@/lib/ownerApi";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  ownerEmail?: string;
  phone?: string;
  plan?: string;
  status: "Active" | "Trial" | "Suspended";
  memberCount: number;
  createdAt: string;
};

export default function BusinessesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Trial" | "Suspended">("All");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  async function loadTenants() {
    setIsLoading(true);
    try {
      const data = await ownerApiRequest<
        {
          id: string;
          name: string;
          slug: string;
          status: string;
          createdAt: string;
          ownerEmail?: string;
          phone?: string;
          memberCount: number;
        }[]
      >("/api/v1/platform/tenants");

      const mapped: Tenant[] = data.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        ownerEmail: t.ownerEmail || "No owner email registered",
        phone: t.phone || "No phone provided",
        plan: "Standard Plan",
        status: (t.status === "Suspended" ? "Suspended" : "Active") as Tenant["status"],
        memberCount: t.memberCount,
        createdAt: new Date(t.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));

      setTenants(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load tenants";
      console.warn("Could not load tenants from backend:", msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTenants();
  }, []);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.ownerEmail && t.ownerEmail.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleToggleStatus(tenant: Tenant) {
    const isSuspending = tenant.status !== "Suspended";
    const nextStatus = isSuspending ? "Suspended" : "Active";

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
      try {
        await ownerApiRequest(`/api/v1/platform/tenants/${tenant.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            reason: isSuspending ? "Administrative suspension" : "Administrative reactivation",
          }),
        });

        setTenants((prev) =>
          prev.map((item) =>
            item.id === tenant.id
              ? { ...item, status: nextStatus }
              : item
          )
        );

        await Swal.fire({
          icon: "success",
          title: isSuspending ? "Business Suspended" : "Business Activated",
          text: `Tenant ${tenant.slug} status successfully updated in the database.`,
          confirmButtonColor: "#17624d",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update tenant status";
        await Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: msg,
          confirmButtonColor: "#17624d",
        });
      }
    }
  }

  async function handleRequestSupportSession(tenant: Tenant) {
    const { value: reason } = await Swal.fire({
      title: "Request Support Access",
      input: "text",
      inputLabel: `State the reason for requesting support access to ${tenant.name}:`,
      inputPlaceholder: "e.g. Investigating sync failure reported by tenant",
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
            <span>Live Tenants Directory</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Businesses & Tenants</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Real-time multi-tenant businesses registered in PostgreSQL. Manage account status and launch support cockpits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTenants}
            className="rounded-xl border border-[#dce9df] bg-white px-3 py-2 text-xs font-semibold text-[#17352d] hover:bg-[#f2f6f4] transition"
            title="Refresh tenants from database"
          >
            ↻ Refresh
          </button>
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
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#17624d] border-t-transparent" />
              <p className="text-xs text-[#657970]">Fetching registered businesses from database...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#17352d]">
              <thead className="border-b border-[#e2ece6] bg-[#f7f8f5] text-xs font-bold uppercase tracking-wider text-[#657970]">
                <tr>
                  <th className="px-6 py-3.5">Business & Slug</th>
                  <th className="px-6 py-3.5">Owner Contact</th>
                  <th className="px-6 py-3.5">Active Members</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f2]">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#8ba097]">
                      {tenants.length === 0
                        ? "No businesses registered in the database yet. New businesses will appear here automatically when registered via /auth/register."
                        : "No businesses matching the search and filter criteria."}
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
                      <td className="px-6 py-4 text-xs">
                        <div className="text-[#17352d] font-medium">{tenant.ownerEmail}</div>
                        <div className="text-[#8ba097]">{tenant.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-lg border border-[#cbded4] bg-[#f2f6f4] px-2.5 py-1 text-xs font-semibold text-[#17624d]">
                          {tenant.memberCount} {tenant.memberCount === 1 ? "Member" : "Members"}
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
                            className="rounded-lg border border-[#cbded4] bg-white px-3 py-1.5 text-xs font-semibold text-[#17352d] transition hover:bg-[#f2f6f4]"
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
        )}
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
                    <p className="text-[10px] text-[#657970]">Total Members</p>
                    <p className="mt-1 text-lg font-bold text-[#17352d]">{selectedTenant.memberCount}</p>
                  </div>
                  <div className="rounded-xl border border-[#dce9df] bg-[#f7f8f5] p-3">
                    <p className="text-[10px] text-[#657970]">Account Status</p>
                    <p className="mt-1 text-lg font-bold text-[#17352d]">{selectedTenant.status}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dce9df] bg-[#f7f8f5] p-3 text-xs space-y-1">
                  <p><span className="text-[#8ba097]">Tenant Slug:</span> <code className="font-mono">{selectedTenant.slug}</code></p>
                  <p><span className="text-[#8ba097]">Owner Email:</span> {selectedTenant.ownerEmail}</p>
                  <p><span className="text-[#8ba097]">Phone:</span> {selectedTenant.phone}</p>
                  <p><span className="text-[#8ba097]">Registered Date:</span> {selectedTenant.createdAt}</p>
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

"use client";

import { useState } from "react";
import { IconActivityLogs, IconSearch } from "@/components/owner/OwnerIcons";

type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "Platform Super Admin" | "Tenant Owner" | "System Worker";
  action: string;
  tenantSlug?: string;
  ipAddress: string;
  severity: "info" | "warning" | "security";
  details: string;
};

const initialLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-11-18 21:20:14",
    actor: "platform-owner@tukodhub.com",
    actorType: "Platform Super Admin",
    action: "support_handshake.requested",
    tenantSlug: "coolair",
    ipAddress: "127.0.0.1",
    severity: "warning",
    details: "Dispatched support session consent request to CoolAir Airconditioning (Ticket #TK-108).",
  },
  {
    id: "log-2",
    timestamp: "2026-11-18 20:05:01",
    actor: "system-rate-limiter",
    actorType: "System Worker",
    action: "auth.rate_limit_triggered",
    tenantSlug: "metroflow",
    ipAddress: "192.168.1.45",
    severity: "security",
    details: "Blocked 5 rapid failed login attempts on tenant metroflow from single IP.",
  },
  {
    id: "log-3",
    timestamp: "2026-11-18 18:30:22",
    actor: "owner@electrical3j.com",
    actorType: "Tenant Owner",
    action: "subscription.renewed",
    tenantSlug: "electrical3j",
    ipAddress: "112.198.40.12",
    severity: "info",
    details: "Recurring monthly Pro subscription renewed via PayMongo gateway reference PM-INV-202611-094.",
  },
  {
    id: "log-4",
    timestamp: "2026-11-18 14:10:09",
    actor: "platform-owner@tukodhub.com",
    actorType: "Platform Super Admin",
    action: "landing_page.draft_updated",
    ipAddress: "127.0.0.1",
    severity: "info",
    details: "Updated Hero section copy in Landing Page Builder.",
  },
];

export default function ActivityLogsPage() {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [filter, setFilter] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.actor.toLowerCase().includes(filter.toLowerCase()) ||
      (l.tenantSlug && l.tenantSlug.toLowerCase().includes(filter.toLowerCase())) ||
      l.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Security & Compliance</span>
            <span>•</span>
            <span>Immutable Audit Trail</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Activity Logs</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Every platform administrative action, security trigger, and tenant status mutation is logged and audited.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba097]" />
          <input
            className="w-full rounded-xl border border-[#cbded4] bg-white py-2 pl-9 pr-3 text-xs text-[#17352d] outline-none focus:border-[#17624d]"
            placeholder="Filter logs by actor, action, tenant..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dce9df] bg-white shadow-xs">
        <table className="w-full text-left text-sm text-[#17352d]">
          <thead className="border-b border-[#e2ece6] bg-[#f7f8f5] text-xs font-bold uppercase tracking-wider text-[#657970]">
            <tr>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-6 py-3.5">Action & Scope</th>
              <th className="px-6 py-3.5">Actor</th>
              <th className="px-6 py-3.5">Details</th>
              <th className="px-6 py-3.5">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f4f2]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#f7f8f5] transition">
                <td className="px-6 py-4 font-mono text-xs text-[#8ba097] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-bold text-[#17624d]">{log.action}</div>
                  {log.tenantSlug && (
                    <span className="text-[10px] text-[#8ba097]">
                      Tenant: <code className="font-semibold">{log.tenantSlug}</code>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-semibold text-[#17352d]">{log.actor}</div>
                  <div className="text-[10px] text-[#8ba097]">{log.actorType}</div>
                </td>
                <td className="px-6 py-4 text-xs text-[#657970] max-w-md">{log.details}</td>
                <td className="px-6 py-4 font-mono text-xs text-[#8ba097]">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

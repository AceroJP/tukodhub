"use client";

import { useEffect, useState } from "react";
import { IconActivityLogs, IconSearch } from "@/components/owner/OwnerIcons";
import { ownerApiRequest } from "@/lib/ownerApi";

type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: string;
  action: string;
  tenantId?: string;
  entityName?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
};

function actionBadgeColor(action: string) {
  if (action.includes("suspended")) return "bg-red-50 text-red-700 border-red-200";
  if (action.includes("reactivated") || action.includes("resolved")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (action.includes("landing_page")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (action.includes("handshake")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (action.includes("ticket")) return "bg-teal-50 text-teal-700 border-teal-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function loadLogs() {
    setIsLoading(true);
    try {
      const data = await ownerApiRequest<
        {
          id: string;
          timestamp: string;
          actorType: string;
          actorId: string;
          actorEmail?: string;
          tenantId?: string;
          action: string;
          entityName?: string;
          entityId?: string;
          details?: string;
          ipAddress?: string;
        }[]
      >("/api/v1/platform/audit-logs");

      const mapped: AuditLog[] = data.map((l) => ({
        id: l.id,
        timestamp: new Date(l.timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        actor: l.actorEmail || l.actorId,
        actorType: l.actorType,
        action: l.action,
        tenantId: l.tenantId,
        entityName: l.entityName,
        entityId: l.entityId,
        details: l.details || "No additional metadata",
        ipAddress: l.ipAddress || "127.0.0.1",
      }));

      setLogs(mapped);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.actor.toLowerCase().includes(filter.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(filter.toLowerCase())) ||
      (l.ipAddress && l.ipAddress.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Security & Compliance</span>
            <span>•</span>
            <span>Live Audit Trail</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Activity Logs</h1>
          <p className="mt-1 text-sm text-[#657970]">
            Immutable records from PostgreSQL <code>platform_audit_logs</code> tracking all administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLogs}
            className="rounded-xl border border-[#cbded4] bg-white px-3 py-2 text-xs font-semibold text-[#17352d] hover:bg-[#f2f6f4] transition"
            title="Refresh logs from database"
          >
            ↻ Refresh
          </button>
          <div className="relative w-full sm:w-72">
            <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba097]" />
            <input
              className="w-full rounded-xl border border-[#cbded4] bg-white py-2 pl-9 pr-3 text-xs text-[#17352d] outline-none focus:border-[#17624d]"
              placeholder="Filter logs by actor, action, details..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dce9df] bg-white shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#17624d] border-t-transparent" />
              <p className="text-xs text-[#657970]">Loading audit records from database...</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-[#17352d]">
            <thead className="border-b border-[#e2ece6] bg-[#f7f8f5] text-xs font-bold uppercase tracking-wider text-[#657970]">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Action & Entity</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Event Details</th>
                <th className="px-6 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f2]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#8ba097]">
                    {logs.length === 0
                      ? "No audit events recorded yet. Actions such as changing tenant status or publishing landing page configurations will appear here."
                      : "No audit events match your filter query."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f7f8f5] transition">
                    <td className="px-6 py-4 font-mono text-xs text-[#8ba097] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${actionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      {log.entityName && (
                        <div className="mt-1 text-[10px] text-[#8ba097]">
                          Entity: <code className="font-semibold">{log.entityName}</code>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-[#17352d]">{log.actor}</div>
                      <div className="text-[10px] text-[#8ba097]">{log.actorType}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#657970] max-w-md">{log.details}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#8ba097]">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

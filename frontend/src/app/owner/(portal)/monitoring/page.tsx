"use client";

import { IconMonitoring } from "@/components/owner/OwnerIcons";

export default function SystemMonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
          <span>Operations & Telemetry</span>
          <span>•</span>
          <span>Platform Health</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">System Monitoring</h1>
        <p className="mt-1 text-sm text-[#657970]">
          Real-time service-level objectives (SLO), API response percentiles, and database connection pools.
        </p>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#dce9df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">Uptime (30d)</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-700">99.98%</p>
          <p className="mt-1 text-[11px] text-[#8ba097]">SLO Target: 99.9%</p>
        </div>

        <div className="rounded-2xl border border-[#dce9df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">API Latency (p95)</span>
            <span className="text-xs font-semibold text-emerald-600">Fast</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#17352d]">28 ms</p>
          <p className="mt-1 text-[11px] text-[#8ba097]">p99: 64 ms across regions</p>
        </div>

        <div className="rounded-2xl border border-[#dce9df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">DB Connection Pool</span>
            <span className="text-xs font-semibold text-[#17624d]">PostgreSQL</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#17352d]">4 / 20</p>
          <p className="mt-1 text-[11px] text-[#8ba097]">Active connections in pool</p>
        </div>

        <div className="rounded-2xl border border-[#dce9df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657970]">Error Rate (24h)</span>
            <span className="text-xs font-semibold text-emerald-600">Nominal</span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-700">0.01%</p>
          <p className="mt-1 text-[11px] text-[#8ba097]">2 4xx client errors, 0 5xx</p>
        </div>
      </div>

      {/* Services Health Breakdown */}
      <div className="rounded-2xl border border-[#dce9df] bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#17352d]">Infrastructure Health Breakdown</h2>
        <div className="divide-y divide-[#f0f4f2]">
          {[
            {
              service: "ASP.NET Core REST API",
              endpoint: "http://127.0.0.1:5000/health",
              status: "Operational",
              latency: "12ms",
            },
            {
              service: "PostgreSQL Database Engine",
              endpoint: "tukodhub_dev (Docker container)",
              status: "Operational",
              latency: "2ms",
            },
            {
              service: "Supabase Platform Owner Auth",
              endpoint: "https://tqtkcrquspolsnsrfwyg.supabase.co",
              status: "Operational",
              latency: "62ms",
            },
            {
              service: "Tenant Hostname Middleware",
              endpoint: "*.localhost:3000 subdomain routing",
              status: "Operational",
              latency: "<1ms",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
              <div>
                <p className="text-sm font-semibold text-[#17352d]">{item.service}</p>
                <p className="text-xs font-mono text-[#8ba097]">{item.endpoint}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[#657970]">{item.latency}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

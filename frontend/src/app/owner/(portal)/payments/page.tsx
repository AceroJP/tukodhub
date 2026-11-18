"use client";

import { useState } from "react";
import { IconPayments } from "@/components/owner/OwnerIcons";

type Payment = {
  id: string;
  reference: string;
  tenantName: string;
  amount: string;
  gateway: "PayMongo (Cards)" | "GCash / Maya" | "Bank Transfer";
  status: "Completed" | "Processing" | "Failed";
  date: string;
};

const initialPayments: Payment[] = [
  {
    id: "pay-101",
    reference: "PM-INV-202611-094",
    tenantName: "Electrical 3J Services",
    amount: "₱2,990.00",
    gateway: "PayMongo (Cards)",
    status: "Completed",
    date: "2026-11-12 14:22",
  },
  {
    id: "pay-102",
    reference: "PM-INV-202611-081",
    tenantName: "MetroFlow Repairs",
    amount: "₱2,990.00",
    gateway: "GCash / Maya",
    status: "Completed",
    date: "2026-10-28 09:15",
  },
  {
    id: "pay-103",
    reference: "PM-INV-202609-012",
    tenantName: "CoolAir Airconditioning",
    amount: "₱49,900.00",
    gateway: "Bank Transfer",
    status: "Completed",
    date: "2026-09-04 11:40",
  },
];

export default function PaymentsPage() {
  const [payments] = useState<Payment[]>(initialPayments);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
          <span>Financial Operations</span>
          <span>•</span>
          <span>Payment Gateway Transactions</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Payment Transactions</h1>
        <p className="mt-1 text-sm text-[#657970]">
          Audit raw payment webhook records, gateway receipts, and disbursement reconciliation.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#dce9df] bg-white shadow-xs">
        <table className="w-full text-left text-sm text-[#17352d]">
          <thead className="border-b border-[#e2ece6] bg-[#f7f8f5] text-xs font-bold uppercase tracking-wider text-[#657970]">
            <tr>
              <th className="px-6 py-3.5">Reference ID</th>
              <th className="px-6 py-3.5">Business</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Channel</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f4f2]">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-[#f7f8f5] transition">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-[#17624d]">{p.reference}</td>
                <td className="px-6 py-4 font-medium text-[#17352d]">{p.tenantName}</td>
                <td className="px-6 py-4 font-extrabold text-[#17352d]">{p.amount}</td>
                <td className="px-6 py-4 text-xs text-[#657970]">{p.gateway}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#8ba097]">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

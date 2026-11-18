"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconOverview,
  IconBusinesses,
  IconSubscriptions,
  IconPlans,
  IconPayments,
  IconSupport,
  IconLandingBuilder,
  IconActivityLogs,
  IconMonitoring,
  IconSettings,
  IconSearch,
} from "./OwnerIcons";

type CommandItem = {
  id: string;
  title: string;
  category: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
};

const navigationCommands: CommandItem[] = [
  {
    id: "overview",
    title: "Overview / Control Tower",
    category: "Navigation",
    href: "/owner/dashboard",
    icon: IconOverview,
    keywords: "metrics stats mrr health tenants",
  },
  {
    id: "businesses",
    title: "Businesses (Tenants)",
    category: "Management",
    href: "/owner/businesses",
    icon: IconBusinesses,
    keywords: "tenants businesses clients suspend activate cockpit",
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    category: "Billing",
    href: "/owner/subscriptions",
    icon: IconSubscriptions,
    keywords: "billing subscriptions renewal trial active",
  },
  {
    id: "plans",
    title: "Subscription Plans",
    category: "Billing",
    href: "/owner/plans",
    icon: IconPlans,
    keywords: "pricing tiers starter pro enterprise limits features",
  },
  {
    id: "payments",
    title: "Payment Transactions",
    category: "Billing",
    href: "/owner/payments",
    icon: IconPayments,
    keywords: "invoices transactions paymongo stripe revenue",
  },
  {
    id: "support",
    title: "Support Tickets & Handshake",
    category: "Communication",
    href: "/owner/support",
    icon: IconSupport,
    keywords: "tickets messages chat support access session video image",
  },
  {
    id: "landing-builder",
    title: "Landing Page Builder",
    category: "Customization",
    href: "/owner/landing-builder",
    icon: IconLandingBuilder,
    keywords: "marketing landing page builder hero preview publish sections",
  },
  {
    id: "activity-logs",
    title: "Activity Logs & Audit Trail",
    category: "Security",
    href: "/owner/activity-logs",
    icon: IconActivityLogs,
    keywords: "audit logs security trail compliance events",
  },
  {
    id: "monitoring",
    title: "System Monitoring",
    category: "Operations",
    href: "/owner/monitoring",
    icon: IconMonitoring,
    keywords: "slo latency errors health api database performance",
  },
  {
    id: "settings",
    title: "Platform Settings",
    category: "Operations",
    href: "/owner/settings",
    icon: IconSettings,
    keywords: "config security tokens webhooks owner",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function OwnerCommandPalette({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = navigationCommands.filter((item) => {
    const searchString = `${item.title} ${item.category} ${item.keywords}`.toLowerCase();
    return searchString.includes(query.toLowerCase().trim());
  });

  function handleSelect(item: CommandItem) {
    onClose();
    router.push(item.href);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm sm:pt-28">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#cbded4]/40 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-[#e2ece6] px-4 py-3">
          <IconSearch className="h-5 w-5 text-[#657970]" />
          <input
            autoFocus
            className="ml-3 flex-1 bg-transparent text-sm text-[#17352d] placeholder-[#8ba097] outline-none"
            placeholder="Type a command or jump to section..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
              } else if (e.key === "Enter" && filtered[selectedIndex]) {
                e.preventDefault();
                handleSelect(filtered[selectedIndex]);
              }
            }}
          />
          <kbd className="rounded border border-[#cbded4] bg-[#f7f8f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#657970]">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#8ba097]">No matching platform commands found.</p>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                    isSelected ? "bg-[#17624d] text-white" : "text-[#17352d] hover:bg-[#f2f6f4]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#17624d]"}`} />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-wider ${
                      isSelected ? "text-white/80" : "text-[#8ba097]"
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#e2ece6] bg-[#f7f8f5] px-4 py-2 text-xs text-[#657970]">
          <span>Navigate with <kbd className="rounded bg-white px-1 py-0.5 shadow-xs">↑</kbd> <kbd className="rounded bg-white px-1 py-0.5 shadow-xs">↓</kbd></span>
          <span>Select with <kbd className="rounded bg-white px-1 py-0.5 shadow-xs">Enter</kbd></span>
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

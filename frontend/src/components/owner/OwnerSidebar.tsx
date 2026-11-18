"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  IconSignOut,
  IconGlobe,
  IconChevronLeft,
  IconChevronRight,
} from "./OwnerIcons";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  group: "core" | "operations" | "settings";
};

export const navigationGroups: {
  id: "core" | "operations" | "settings";
  label?: string;
  items: NavItem[];
}[] = [
  {
    id: "core",
    label: "Platform Core",
    items: [
      { name: "Overview", href: "/owner/dashboard", icon: IconOverview, group: "core" },
      { name: "Businesses", href: "/owner/businesses", icon: IconBusinesses, group: "core" },
      { name: "Subscriptions", href: "/owner/subscriptions", icon: IconSubscriptions, group: "core" },
      { name: "Plans", href: "/owner/plans", icon: IconPlans, group: "core" },
      { name: "Payments", href: "/owner/payments", icon: IconPayments, group: "core" },
    ],
  },
  {
    id: "operations",
    label: "Support & Customization",
    items: [
      { name: "Support Tickets", href: "/owner/support", icon: IconSupport, badge: "1", group: "operations" },
      { name: "Landing Builder", href: "/owner/landing-builder", icon: IconLandingBuilder, group: "operations" },
      { name: "Activity Logs", href: "/owner/activity-logs", icon: IconActivityLogs, group: "operations" },
      { name: "System Monitoring", href: "/owner/monitoring", icon: IconMonitoring, group: "operations" },
    ],
  },
  {
    id: "settings",
    label: "Platform Governance",
    items: [
      { name: "Settings", href: "/owner/settings", icon: IconSettings, group: "settings" },
    ],
  },
];

type Props = {
  isCollapsed: boolean;
  onToggle: () => void;
  ownerEmail?: string;
  onSignOut: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function OwnerSidebar({
  isCollapsed,
  onToggle,
  ownerEmail,
  onSignOut,
  mobileOpen,
  onMobileClose,
}: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Fixed Non-Scrollable Sidebar (overflow-visible to prevent tooltip clipping) */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-30 flex-col justify-between border-r border-[#1e3c33] bg-[#112620] text-white select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        } overflow-visible`}
      >
        {/* Top Header Section */}
        <div className="relative">
          <div
            className={`flex h-16 items-center border-b border-[#1b3a31] transition-all duration-300 ${
              isCollapsed ? "justify-center px-2" : "justify-between px-4"
            }`}
          >
            {/* Branding / Logo */}
            <Link
              className="flex items-center gap-3 font-bold group outline-none"
              href="/owner/dashboard"
              title="TukodHub Control Tower"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9bd67] text-base font-bold text-[#17352d] shadow-md shadow-[#e9bd67]/20 transition-transform group-hover:scale-105">
                T
              </span>
              {!isCollapsed && (
                <div className="leading-tight transition-opacity duration-200">
                  <span className="block text-sm font-bold tracking-tight text-white">TukodHub</span>
                  <span className="block text-[10px] font-semibold tracking-wider text-[#b17a25] uppercase">
                    Control Tower
                  </span>
                </div>
              )}
            </Link>

            {/* Toggle Button in Expanded State */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={onToggle}
                className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b4c42] text-[#c2d7cd] hover:bg-[#18362e] hover:text-white transition focus:outline-none focus:ring-1 focus:ring-[#e9bd67]"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <IconChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Docked Edge Toggle Pill in Collapsed State (Fix 1: Perfectly separated, zero overlap with logo) */}
          {isCollapsed && (
            <button
              type="button"
              onClick={onToggle}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 grid h-7 w-7 place-items-center rounded-full border border-[#2b4c42] bg-[#17624d] text-white shadow-lg hover:bg-[#104c3c] hover:scale-110 transition focus:outline-none focus:ring-2 focus:ring-[#e9bd67]"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Navigation Items with Standardized Spacing and Logical Grouping (Fix 4) */}
          <nav className="px-2.5 py-3">
            {navigationGroups.map((group, groupIdx) => (
              <div key={group.id} className="space-y-1">
                {groupIdx > 0 && (
                  <div
                    className={`my-2 border-t border-[#1b3a31] transition-all ${
                      isCollapsed ? "mx-auto w-8" : "mx-2"
                    }`}
                  />
                )}

                {!isCollapsed && group.label && (
                  <p className="px-3 pb-1 pt-1 text-[9px] font-bold uppercase tracking-wider text-[#729285]">
                    {group.label}
                  </p>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        className={`flex items-center rounded-xl transition outline-none focus:ring-2 focus:ring-[#e9bd67] ${
                          isCollapsed
                            ? "justify-center h-10 w-10 mx-auto"
                            : "justify-between px-3.5 py-2 text-sm font-medium"
                        } ${
                          isActive
                            ? "bg-[#17624d] text-white shadow-sm ring-1 ring-[#248267]"
                            : "text-[#a2beaf] hover:bg-[#18362e] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-5 w-5 shrink-0 transition ${
                              isActive ? "text-[#e9bd67]" : "text-[#7ea393] group-hover:text-white"
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>

                        {/* Expanded Badge */}
                        {!isCollapsed && item.badge && (
                          <span className="rounded-full bg-[#b17a25]/20 px-2 py-0.5 text-[10px] font-bold text-[#e9bd67]">
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Notification Pill (Fix 3: Only shown for actual notifications, NOT for active state) */}
                        {isCollapsed && item.badge && (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b17a25] px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#112620]">
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {/* Tooltip on Hover & Keyboard Focus (Fix 2: Never clipped, outside sidebar) */}
                      {isCollapsed && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute left-[78px] top-1/2 z-50 -translate-y-1/2 opacity-0 translate-x-1.5 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-x-0"
                        >
                          <div className="flex items-center gap-2 rounded-lg border border-[#2b4c42] bg-[#0c1e18] px-3 py-1.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md whitespace-nowrap">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className="rounded bg-[#b17a25] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Utility Controls (Fix 5: Centered, uniform dimensions, descriptive tooltips) */}
        <div className="border-t border-[#1b3a31] p-3">
          {!isCollapsed ? (
            <>
              <div className="mb-2.5 rounded-xl bg-[#18362e] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7ea393]">Super Admin</p>
                <p className="truncate text-xs font-medium text-white">{ownerEmail ?? "Super Admin"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#2b4c42] py-2 text-center text-xs font-semibold text-[#c2d7cd] hover:bg-[#18362e] hover:text-white transition focus:outline-none focus:ring-1 focus:ring-[#e9bd67]"
                >
                  <IconGlobe className="h-3.5 w-3.5" />
                  <span>Public Site</span>
                </Link>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b4c42] text-[#c2d7cd] hover:border-rose-800 hover:bg-rose-950/40 hover:text-rose-300 transition focus:outline-none focus:ring-1 focus:ring-rose-500"
                  title="Sign out of platform"
                  aria-label="Sign out"
                >
                  <IconSignOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* Public Website Utility Tooltip */}
              <div className="relative group">
                <Link
                  href="/"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[#2b4c42] bg-[#142e26] text-[#c2d7cd] hover:border-[#17624d] hover:bg-[#18362e] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[#e9bd67]"
                  title="Public Website"
                  aria-label="Public Website"
                >
                  <IconGlobe className="h-4 w-4" />
                </Link>
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-[78px] top-1/2 z-50 -translate-y-1/2 opacity-0 translate-x-1.5 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-x-0"
                >
                  <div className="rounded-lg border border-[#2b4c42] bg-[#0c1e18] px-3 py-1.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md whitespace-nowrap">
                    Public Website
                  </div>
                </div>
              </div>

              {/* Sign Out Utility Tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[#2b4c42] bg-[#142e26] text-[#c2d7cd] hover:border-rose-800 hover:bg-rose-950/40 hover:text-rose-300 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <IconSignOut className="h-4 w-4" />
                </button>
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-[78px] top-1/2 z-50 -translate-y-1/2 opacity-0 translate-x-1.5 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-x-0"
                >
                  <div className="rounded-lg border border-[#2b4c42] bg-[#0c1e18] px-3 py-1.5 text-xs font-semibold text-rose-300 shadow-2xl backdrop-blur-md whitespace-nowrap">
                    Sign Out
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (Slide-Over) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 bg-[#112620] p-4 text-white flex flex-col justify-between h-full">
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-[#1b3a31] pb-4">
                <div className="flex items-center gap-2 font-bold">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9bd67] text-sm text-[#17352d]">T</span>
                  <span>TukodHub Control</span>
                </div>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="text-[#c2d7cd] hover:text-white text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1">
                {navigationGroups.flatMap((g) => g.items).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium ${
                        isActive ? "bg-[#17624d] text-white" : "text-[#c2d7cd]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-[#b17a25]/20 px-2 py-0.5 text-[10px] font-bold text-[#e9bd67]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#1b3a31] pt-4">
              <button
                type="button"
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2b4c42] py-2 text-xs font-semibold text-[#c2d7cd] hover:bg-rose-950/40 hover:text-rose-300"
              >
                <IconSignOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={onMobileClose} />
        </div>
      )}
    </>
  );
}

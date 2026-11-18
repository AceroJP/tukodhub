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
  IconChevronLeft,
  IconChevronRight,
  IconPanelLeft,
} from "./OwnerIcons";

export const navItems = [
  { name: "Overview", href: "/owner/dashboard", icon: IconOverview, shortcut: "1" },
  { name: "Businesses", href: "/owner/businesses", icon: IconBusinesses, shortcut: "2" },
  { name: "Subscriptions", href: "/owner/subscriptions", icon: IconSubscriptions, shortcut: "3" },
  { name: "Plans", href: "/owner/plans", icon: IconPlans, shortcut: "4" },
  { name: "Payments", href: "/owner/payments", icon: IconPayments, shortcut: "5" },
  { name: "Support Tickets", href: "/owner/support", icon: IconSupport, badge: "New", shortcut: "6" },
  { name: "Landing Builder", href: "/owner/landing-builder", icon: IconLandingBuilder, shortcut: "7" },
  { name: "Activity Logs", href: "/owner/activity-logs", icon: IconActivityLogs, shortcut: "8" },
  { name: "System Monitoring", href: "/owner/monitoring", icon: IconMonitoring, shortcut: "9" },
  { name: "Settings", href: "/owner/settings", icon: IconSettings, shortcut: "0" },
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
      {/* Desktop Fixed Non-Scrollable Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-30 flex-col justify-between border-r border-[#1e3c33] bg-[#112620] text-white overflow-hidden select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {/* Top Header Section */}
        <div>
          <div className="flex h-16 items-center justify-between border-b border-[#1b3a31] px-4">
            <Link
              className="flex items-center gap-3 font-bold overflow-hidden"
              href="/owner/dashboard"
              title="TukodHub Control Tower"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e9bd67] text-base font-bold text-[#17352d] shadow-md shadow-[#e9bd67]/20">
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

            {/* Toggle Collapse Button in Header */}
            <button
              type="button"
              onClick={onToggle}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b4c42] text-[#c2d7cd] hover:bg-[#18362e] hover:text-white transition"
              title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            >
              {isCollapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Items (Budgeted height, zero scrolling) */}
          <nav className="space-y-1 px-2.5 py-4">
            {!isCollapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#729285]">
                Platform Super Admin
              </p>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-xl transition ${
                      isCollapsed
                        ? "justify-center h-10 w-10 mx-auto"
                        : "justify-between px-3.5 py-2.5 text-sm font-medium"
                    } ${
                      isActive
                        ? "bg-[#17624d] text-white shadow-sm"
                        : "text-[#c2d7cd] hover:bg-[#18362e] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition ${
                          isActive ? "text-[#e9bd67]" : "text-[#7ea393] group-hover:text-white"
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="rounded-full bg-[#b17a25]/20 px-2 py-0.5 text-[10px] font-bold text-[#e9bd67]">
                        {item.badge}
                      </span>
                    )}

                    {/* Glowing active indicator dot when collapsed */}
                    {isCollapsed && isActive && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#e9bd67]" />
                    )}
                  </Link>

                  {/* Floating Glassmorphism Flyout Tooltip when Collapsed */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-[76px] top-1/2 z-50 -translate-y-1/2 opacity-0 translate-x-2 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto">
                      <div className="flex items-center gap-2 rounded-xl border border-[#2b4c42] bg-[#0d1d18] px-3 py-1.5 text-xs text-white shadow-xl whitespace-nowrap">
                        <span className="font-semibold">{item.name}</span>
                        {item.badge && (
                          <span className="rounded bg-[#b17a25] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                            {item.badge}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-[#7ea393]">[{item.shortcut}]</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Admin Identity & Actions */}
        <div className="border-t border-[#1b3a31] p-3">
          {!isCollapsed ? (
            <>
              <div className="mb-2 rounded-xl bg-[#18362e] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7ea393]">Super Admin</p>
                <p className="truncate text-xs font-medium text-white">{ownerEmail ?? "Super Admin"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="flex-1 rounded-lg border border-[#2b4c42] py-2 text-center text-xs font-semibold text-[#c2d7cd] hover:bg-[#18362e] hover:text-white transition"
                >
                  Public Site
                </Link>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[#2b4c42] text-[#c2d7cd] hover:bg-rose-950/40 hover:text-rose-300 transition"
                  title="Sign out of platform"
                >
                  <IconSignOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#2b4c42] text-[#c2d7cd] hover:bg-[#18362e] hover:text-white transition"
                title="View Public Site"
              >
                🌐
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#2b4c42] text-[#c2d7cd] hover:bg-rose-950/40 hover:text-rose-300 transition"
                title="Sign out of platform"
              >
                <IconSignOut className="h-4 w-4" />
              </button>
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
                {navItems.map((item) => {
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
                        <Icon className="h-4 w-4" />
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

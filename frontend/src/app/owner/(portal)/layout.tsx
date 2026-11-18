"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import { apiRequest, ApiError } from "@/lib/api";
import { IconSearch, IconCommand, IconPanelLeft } from "@/components/owner/OwnerIcons";
import { OwnerCommandPalette } from "@/components/owner/OwnerCommandPalette";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";

type Owner = { email?: string; userId?: string };

export default function OwnerPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved sidebar collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tukodhub_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // localStorage may fail in private browsing
    }
  }, []);

  function handleToggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tukodhub_admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Keyboard shortcut listeners (Ctrl+K / Cmd+K and Ctrl+B / Cmd+B)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleToggleCollapse();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    async function verifyOwner() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/owner/login");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/owner/login");
        return;
      }

      try {
        const platformOwner = await apiRequest<{ userId: string; email?: string }>("/api/v1/platform/me", {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });
        setOwner({ email: platformOwner.email ?? data.user.email, userId: platformOwner.userId });
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";

        if (err instanceof ApiError) {
          if (err.status === 401) {
            await Swal.fire({
              icon: "error",
              title: "Owner access is not configured",
              text: "The API could not validate the owner session. Ensure the backend is running and has SupabaseUrl configured.",
              confirmButtonColor: "#17624d",
            });
            setIsLoading(false);
            return;
          }

          if (err.status === 403) {
            await Swal.fire({
              icon: "error",
              title: "Access denied",
              text: "This account is not authorized as the TukodHub SaaS owner.",
              confirmButtonColor: "#17624d",
            });
            await supabase.auth.signOut();
            router.push("/owner/login");
            return;
          }
        }

        if (err instanceof TypeError || message.toLowerCase().includes("failed to fetch")) {
          await Swal.fire({
            icon: "error",
            title: "Backend is not reachable",
            text: "Start the backend (API) and confirm it is listening on http://localhost:5000.",
            confirmButtonColor: "#17624d",
          });
          setIsLoading(false);
          return;
        }

        await Swal.fire({
          icon: "error",
          title: "Unable to verify owner session",
          text: message || "Please check your network and backend configuration.",
          confirmButtonColor: "#17624d",
        });
        setIsLoading(false);
      }
    }

    void verifyOwner();
  }, [router]);

  async function handleSignOut() {
    const result = await Swal.fire({
      title: "Sign out of platform?",
      text: "You will need to authenticate again to access the control tower.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#17624d",
      cancelButtonColor: "#8ba097",
      confirmButtonText: "Sign out",
    });

    if (result.isConfirmed) {
      await supabase.auth.signOut();
      router.push("/owner/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8f5] text-[#17352d]">
      {/* Loading Overlay while verifying Super Admin session */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112620] text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e9bd67] border-t-transparent" />
            <p className="text-sm font-medium tracking-wide text-[#cbded4]">Connecting to TukodHub Control Tower...</p>
          </div>
        </div>
      )}

      {/* Fixed Non-Scrollable Collapsible Sidebar */}
      <OwnerSidebar
        isCollapsed={isCollapsed}
        onToggle={handleToggleCollapse}
        ownerEmail={owner?.email}
        onSignOut={handleSignOut}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (Dynamically offset from the fixed sidebar with smooth transition) */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#dce9df] bg-white/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbded4] text-[#17352d] lg:hidden"
              title="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>

            {/* Desktop Quick Toggle Sidebar Button in Header */}
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden lg:grid h-9 w-9 place-items-center rounded-lg border border-[#cbded4] text-[#657970] transition hover:border-[#17624d] hover:text-[#17624d]"
              title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            >
              <IconPanelLeft className="h-4 w-4" />
            </button>

            {/* Quick Command Palette Launcher */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3.5 py-1.5 text-xs text-[#657970] transition hover:border-[#17624d] hover:bg-white sm:w-72"
            >
              <IconSearch className="h-4 w-4 text-[#8ba097]" />
              <span className="flex-1 text-left">Search or run command...</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-[#cbded4] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#657970] sm:inline-flex">
                <IconCommand className="h-3 w-3" />K
              </kbd>
            </button>
          </div>

          {/* Right Topbar Items */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#cbded4] bg-[#f7f8f5] px-3 py-1 text-xs sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#17624d]">System Operational</span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-semibold text-[#17352d]">{owner?.email ?? "Owner"}</span>
              <span className="block text-[10px] font-bold uppercase text-[#b17a25]">Platform Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <OwnerCommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}

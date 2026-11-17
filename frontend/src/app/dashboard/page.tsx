"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { authApi, type AuthenticatedAccount } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AuthenticatedAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        const current = await authApi.me();
        setAccount(current);
      } catch {
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAccount();
  }, [router]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authApi.logout();
      await Swal.fire({
        icon: "success",
        title: "Signed out",
        confirmButtonColor: "#17624d",
      });
      router.push("/auth/login");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Sign out failed",
        text: error instanceof Error ? error.message : "Please try again.",
        confirmButtonColor: "#17624d",
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  const activeTenant = account?.activeTenant;

  return (
    <main className="min-h-screen bg-[#f7f8f5] p-6 text-[#17352d] lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d] text-lg text-white">T</span>
            TukodHub
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#dcefe3] px-4 py-2 text-sm font-semibold text-[#17624d]">Workspace overview</span>
            <button
              className="rounded-full border border-[#cbded4] bg-white px-4 py-2 text-sm font-semibold"
              disabled={isSigningOut}
              onClick={handleSignOut}
              type="button"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b17a25]">Your workspace</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{isLoading ? "Loading your workspace..." : "What needs attention today?"}</h1>
          <p className="mt-3 max-w-xl text-[#657970]">
            {account
              ? `Signed in as ${account.user.displayName}${activeTenant ? ` - ${activeTenant.tenantName} (${activeTenant.roleName})` : ""}.`
              : "Your operational dashboard will come alive as you add customers, inquiries, and jobs."}
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            "New inquiries",
            "Today's bookings",
            activeTenant ? `${activeTenant.tenantName} role: ${activeTenant.roleName}` : "Role information",
          ].map((item) => (
            <article className="rounded-2xl border border-[#dce9df] bg-white p-6" key={item}>
              <p className="text-sm font-semibold text-[#657970]">{item}</p>
              <p className="mt-4 text-4xl font-bold">--</p>
              <p className="mt-2 text-xs text-[#8ba097]">No records yet</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}


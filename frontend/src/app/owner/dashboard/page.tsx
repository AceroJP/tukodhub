"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/api";

type Owner = { email?: string };

export default function OwnerDashboardPage() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadOwner() {
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
        const platformOwner = await apiRequest<{ email?: string }>("/api/v1/platform/me", {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });
        setOwner({ email: platformOwner.email ?? data.user.email });
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Access denied",
          text: "This account is not authorized as the TukodHub SaaS owner.",
          confirmButtonColor: "#17624d",
        });
        await supabase.auth.signOut();
        router.push("/owner/login");
      }
    }

    void loadOwner();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    await Swal.fire({ icon: "success", title: "Signed out", confirmButtonColor: "#17624d" });
    router.push("/owner/login");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] p-6 text-[#17352d] lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d] text-lg text-white">T</span>
            TukodHub platform
          </Link>
          <button className="rounded-full border border-[#cbded4] px-4 py-2 text-sm font-semibold" onClick={signOut} type="button">Sign out</button>
        </header>
        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b17a25]">SaaS owner dashboard</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Platform overview</h1>
          <p className="mt-3 text-[#657970]">{owner?.email ?? "Loading owner account..."}</p>
        </section>
        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {["Active tenants", "Trial tenants", "System health"].map((item) => (
            <article className="rounded-2xl border border-[#dce9df] bg-white p-6" key={item}>
              <p className="text-sm font-semibold text-[#657970]">{item}</p>
              <p className="mt-4 text-4xl font-bold">--</p>
              <p className="mt-2 text-xs text-[#8ba097]">Connect platform data next</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

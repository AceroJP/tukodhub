"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await Swal.fire({
        icon: "error",
        title: "Owner login is not configured",
        text: "Set the Supabase URL and anon key in frontend/.env.local.",
        confirmButtonColor: "#17624d",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    setIsSubmitting(false);
    if (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to sign in",
        text: "The owner credentials could not be verified.",
        confirmButtonColor: "#17624d",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Welcome back",
      text: "Opening the platform dashboard.",
      confirmButtonColor: "#17624d",
    });
    router.push("/owner/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#17352d] px-6 py-10 text-white">
      <div className="mx-auto max-w-md">
        <Link className="flex items-center gap-3 font-bold" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9bd67] text-lg text-[#17352d]">T</span>
          TukodHub platform
        </Link>
        <section className="mt-12 rounded-3xl bg-white p-7 text-[#17352d] shadow-2xl sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b17a25]">SaaS owner</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Platform administration</h1>
          <p className="mt-3 text-sm leading-6 text-[#657970]">This portal is restricted to the TukodHub owner.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-[#315147]">Email address
              <input className="mt-2 w-full rounded-xl border border-[#cbded4] px-4 py-3 outline-none focus:border-[#17624d]" name="email" type="email" required />
            </label>
            <label className="block text-sm font-semibold text-[#315147]">Password
              <input className="mt-2 w-full rounded-xl border border-[#cbded4] px-4 py-3 outline-none focus:border-[#17624d]" name="password" type="password" required />
            </label>
            <button className="w-full rounded-xl bg-[#17624d] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Verifying..." : "Sign in as owner"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

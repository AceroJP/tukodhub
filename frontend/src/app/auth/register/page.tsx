import Link from "next/link";
import AuthForm from "../AuthForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-10 text-[#17352d]">
      <div className="mx-auto max-w-md">
        <Link className="flex items-center gap-3 font-bold" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d] text-lg text-white">T</span>
          TukodHub
        </Link>
        <section className="mt-12 rounded-3xl border border-[#dce9df] bg-white p-7 shadow-xl shadow-[#17352d]/5 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b17a25]">Start simply</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Create your workspace</h1>
          <p className="mt-3 text-sm leading-6 text-[#657970]">Set up the home base for your service business.</p>
          <AuthForm mode="register" />
          <p className="mt-6 text-center text-sm text-[#657970]">
            Already have an account?{" "}
            <Link className="font-bold text-[#17624d] hover:underline" href="/auth/login">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

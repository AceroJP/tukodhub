import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] p-6 text-[#17352d] lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d] text-lg text-white">T</span>
            TukodHub
          </Link>
          <span className="rounded-full bg-[#dcefe3] px-4 py-2 text-sm font-semibold text-[#17624d]">Workspace overview</span>
        </header>
        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b17a25]">Your workspace</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">What needs attention today?</h1>
          <p className="mt-3 max-w-xl text-[#657970]">Your operational dashboard will come alive as you add customers, inquiries, and jobs.</p>
        </section>
        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {["New inquiries", "Today’s bookings", "Jobs awaiting review"].map((item) => (
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

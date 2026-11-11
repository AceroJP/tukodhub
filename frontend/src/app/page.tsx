"use client";

import { useState } from "react";

const workflowSteps = [
  {
    number: "01",
    title: "Capture every inquiry",
    description: "Keep messages, calls, and walk-ins in one dependable queue.",
  },
  {
    number: "02",
    title: "Schedule with confidence",
    description: "Turn approved work into clear bookings for your team.",
  },
  {
    number: "03",
    title: "Finish with proof",
    description: "Give technicians a simple mobile workflow for every job.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f5] text-[#17352d]">
      <div className="absolute left-[-10rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-[#dbeee2] blur-3xl" />
      <div className="absolute right-[-14rem] top-[20rem] h-[32rem] w-[32rem] rounded-full bg-[#f3dfb2] blur-3xl" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="flex items-center gap-3" aria-label="TukodHub home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d] text-lg font-bold text-white shadow-lg shadow-[#17624d]/20">
            T
          </span>
          <span className="text-xl font-bold tracking-tight">TukodHub</span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-[#526b63] md:flex">
          <a className="transition hover:text-[#17624d]" href="#workflow">How it works</a>
          <a className="transition hover:text-[#17624d]" href="#built-for-work">Built for field work</a>
          <a className="transition hover:text-[#17624d]" href="#contact">Contact</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#17624d] transition hover:bg-white" href="/owner/login">
            Sign in
          </a>
          <a className="rounded-full bg-[#17624d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#17624d]/20 transition hover:bg-[#104c3c]" href="/auth/register">
            Start free
          </a>
        </div>

        <button
          className="rounded-lg border border-[#cbded4] bg-white p-2 md:hidden"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="block h-0.5 w-5 bg-[#17624d]" />
          <span className="mt-1.5 block h-0.5 w-5 bg-[#17624d]" />
          <span className="mt-1.5 block h-0.5 w-5 bg-[#17624d]" />
        </button>
      </nav>

      {menuOpen && (
        <div className="relative mx-6 rounded-2xl border border-[#d6e5dc] bg-white p-4 shadow-xl md:hidden">
          <div className="flex flex-col gap-3 text-sm font-semibold">
            <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#built-for-work" onClick={() => setMenuOpen(false)}>Built for field work</a>
            <a className="mt-2 rounded-full bg-[#17624d] px-4 py-3 text-center text-white" href="/auth/login">Sign in</a>
          </div>
        </div>
      )}

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe3d6] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#17624d]">
            <span className="h-2 w-2 rounded-full bg-[#e49b3f]" />
            Built for service businesses
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Keep the work moving.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#5b7169]">
            TukodHub brings inquiries, schedules, technicians, and payments into one calm, practical workspace for growing Filipino service teams.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-full bg-[#17624d] px-7 py-4 text-center text-sm font-bold text-white shadow-xl shadow-[#17624d]/20 transition hover:-translate-y-0.5 hover:bg-[#104c3c]" href="/auth/register">
              Start organizing your work
              <span className="ml-3" aria-hidden="true">-&gt;</span>
            </a>
            <a className="rounded-full border border-[#bcd3c7] bg-white/60 px-7 py-4 text-center text-sm font-bold text-[#17624d] transition hover:bg-white" href="#workflow">
              See how it works
            </a>
          </div>
          <p className="mt-5 text-xs font-medium text-[#71847c]">Simple setup. Clear records. Made for teams on the move.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[30rem]">
          <div className="absolute -right-4 -top-8 h-24 w-24 rounded-full border-[14px] border-[#f1c978]/60" />
          <div className="relative rounded-[2rem] border border-white/80 bg-[#17352d] p-5 shadow-2xl shadow-[#17352d]/20 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-medium text-[#a6c2b5]">TukodHub workspace</p>
                <p className="mt-1 text-lg font-bold text-white">Today&apos;s focus</p>
              </div>
              <span className="rounded-full bg-[#d6eadc] px-3 py-1 text-xs font-bold text-[#17624d]">Overview</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-[#a6c2b5]">New inquiries</p>
                <p className="mt-2 text-3xl font-bold text-white">--</p>
                <p className="mt-1 text-xs text-[#a6c2b5]">Connect your workspace</p>
              </div>
              <div className="rounded-2xl bg-[#e9bd67] p-4 text-[#17352d]">
                <p className="text-xs font-semibold opacity-70">Next action</p>
                <p className="mt-2 text-lg font-bold">Record inquiry</p>
                <p className="mt-1 text-xs opacity-70">Keep the queue moving</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#17352d]">Your operating rhythm</p>
                <span className="text-xs font-semibold text-[#17624d]">Ready</span>
              </div>
              {["Inquiry queue", "Today's schedule", "Technician updates"].map((item, index) => (
                <div className="mt-4 flex items-center gap-3" key={item}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${index === 1 ? "bg-[#f7e6bd] text-[#9b6b18]" : "bg-[#dcefe3] text-[#17624d]"}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[#526b63]">{item}</span>
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#72ad84]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-[#e1e9e3] bg-white/55" id="workflow">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">A better daily rhythm</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From first message to finished job.</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <article className="border-t-2 border-[#dce9df] pt-5" key={step.number}>
                <p className="text-sm font-bold text-[#d19a3a]">{step.number}</p>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 max-w-xs leading-7 text-[#657970]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10" id="built-for-work">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b17a25]">Designed for the real day</p>
          <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight sm:text-4xl">Less chasing. More work completed.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#dce9df] bg-white p-5">
            <p className="text-2xl">↗</p>
            <h3 className="mt-6 font-bold">Clear next actions</h3>
            <p className="mt-2 text-sm leading-6 text-[#657970]">Make follow-ups, schedules, and reviews visible to the right people.</p>
          </div>
          <div className="rounded-2xl border border-[#dce9df] bg-white p-5">
            <p className="text-2xl">◌</p>
            <h3 className="mt-6 font-bold">Mobile-ready</h3>
            <p className="mt-2 text-sm leading-6 text-[#657970]">Give technicians a focused workflow that works where the job happens.</p>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-[#dce9df] px-6 py-8 lg:px-10" id="contact">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[#71847c] sm:flex-row">
          <p className="font-semibold text-[#17624d]">TukodHub</p>
          <p>© 2026 Joenil Acero. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

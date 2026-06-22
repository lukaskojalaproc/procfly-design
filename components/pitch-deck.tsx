"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckSquare,
  Trophy,
  ShoppingCart,
  FileSignature,
  Network,
  Boxes,
  Settings as SettingsIcon,
  Clock,
  TrendingDown,
  ShieldCheck,
  Eye,
  Workflow,
  Layers,
  Check,
  Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Slide = {
  id: string
  render: () => React.ReactNode
}

const MODULES = [
  { icon: FileText, name: "Requests", desc: "Capture and track every purchase request with a guided intake wizard." },
  { icon: CheckSquare, name: "Approvals", desc: "Multi-step approval chains with CEO and amount thresholds." },
  { icon: Trophy, name: "Competitions", desc: "Run supplier tenders and score bids against your criteria." },
  { icon: ShoppingCart, name: "Orders", desc: "Generate purchase orders and track delivery to completion." },
  { icon: FileSignature, name: "Contracts", desc: "Renewals, expiry, and obligations — never miss a deadline." },
  { icon: Network, name: "Suppliers", desc: "One vendor base with risk, spend, and linked records." },
  { icon: Boxes, name: "Warehouse", desc: "Inventory, stock movements, and low-stock alerts." },
  { icon: SettingsIcon, name: "Settings", desc: "Org config, members, budgets, and category managers." },
]

const STEPS = [
  { n: "01", title: "Request", desc: "A team member raises a request through the guided wizard." },
  { n: "02", title: "Approve", desc: "It routes through the right approval steps automatically." },
  { n: "03", title: "Source", desc: "Run a competition or order directly from a preferred supplier." },
  { n: "04", title: "Track", desc: "Orders, contracts, and stock stay in sync — end to end." },
]

const BENEFITS = [
  { icon: Clock, stat: "70%", label: "faster request-to-order cycle", sub: "Guided intake and auto-routing remove the email back-and-forth." },
  { icon: TrendingDown, stat: "15%", label: "average savings on spend", sub: "Competitive tenders and full price visibility on every buy." },
  { icon: Eye, stat: "100%", label: "spend visibility", sub: "Every request, order, and contract linked in one record." },
  { icon: ShieldCheck, stat: "0", label: "missed renewals", sub: "Contract expiry and notice-period reminders, automated." },
]

const DIFFERENTIATORS = [
  { icon: Layers, title: "One connected system", desc: "Requests, approvals, sourcing, orders, contracts, suppliers, and warehouse share the same data — no silos, no re-keying." },
  { icon: Workflow, title: "Approvals that fit you", desc: "Configure thresholds, steps, and category managers to match how your organization actually buys." },
  { icon: ShieldCheck, title: "Built-in governance", desc: "Risk scoring, audit trails, and policy enforcement on every transaction by default." },
]

const PLANS = [
  {
    name: "Starter",
    price: "€0",
    cadence: "for small teams",
    features: ["Up to 5 users", "Requests & approvals", "Supplier directory", "Email support"],
    highlight: false,
  },
  {
    name: "Business",
    price: "€49",
    cadence: "per user / month",
    features: ["Unlimited users", "Competitions & contracts", "Warehouse & orders", "Custom approval steps", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "tailored to you",
    features: ["SSO & advanced roles", "Dedicated success manager", "Custom integrations", "SLA & onboarding"],
    highlight: false,
  },
]

function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      Proc<span className="text-primary">fly</span>
    </span>
  )
}

const slides: Slide[] = [
  // 1 — Cover
  {
    id: "cover",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <Brand className="text-2xl" />
        <h1 className="mt-8 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          Procurement, finally under one roof.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          From request to payment, Procfly connects every step of your buying process — so teams move
          faster, spend smarter, and stay in control.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Sales overview <ArrowRight className="size-4" />
          </span>
          <span className="text-sm text-muted-foreground">Procurement management platform</span>
        </div>
      </div>
    ),
  },
  // 2 — Problem
  {
    id: "problem",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>The problem</SlideLabel>
        <h2 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Buying is scattered across inboxes, spreadsheets, and tools.
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { t: "No visibility", d: "Spend is invisible until the invoice lands. Budgets blow without warning." },
            { t: "Slow approvals", d: "Requests stall in email threads. Nobody knows who is blocking what." },
            { t: "Maverick risk", d: "Off-contract buying and missed renewals quietly drain margin." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-lg font-semibold text-foreground">{c.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 3 — Solution
  {
    id: "solution",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>The solution</SlideLabel>
        <h2 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          <Brand /> is the single source of truth for procurement.
        </h2>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          One platform that takes a purchase from the first request through approval, sourcing, ordering,
          and contract — with suppliers and inventory connected to every record.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {["Request", "Approve", "Source", "Order", "Contract", "Track"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                {s}
              </span>
              {i < 5 && <ArrowRight className="size-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 4 — Platform / modules
  {
    id: "platform",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>The platform</SlideLabel>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Eight modules, one connected workflow.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <m.icon className="size-5" />
              </div>
              <div className="mt-4 font-semibold text-foreground">{m.name}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 5 — How it works
  {
    id: "how",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>How it works</SlideLabel>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          From request to delivered — in four steps.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-3xl font-bold text-primary">{s.n}</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{s.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 6 — Benefits / metrics
  {
    id: "benefits",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>The impact</SlideLabel>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Results teams feel in the first quarter.
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.label} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <b.icon className="size-5" />
              </div>
              <div className="mt-4 text-4xl font-bold tracking-tight text-foreground">{b.stat}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{b.label}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{b.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Illustrative outcomes based on typical mid-market procurement teams.</p>
      </div>
    ),
  },
  // 7 — Why Procfly
  {
    id: "why",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>Why Procfly</SlideLabel>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          More than a tool — a system of record.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {DIFFERENTIATORS.map((d) => (
            <div key={d.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <d.icon className="size-5" />
              </div>
              <div className="mt-4 text-lg font-semibold text-foreground">{d.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 8 — Pricing
  {
    id: "pricing",
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <SlideLabel>Pricing</SlideLabel>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Simple plans that scale with you.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "flex flex-col rounded-2xl border p-6",
                p.highlight ? "border-primary bg-card ring-2 ring-primary/20" : "border-border bg-card",
              )}
            >
              {p.highlight && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <div className="text-sm font-semibold text-foreground">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-foreground">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.cadence}</span>
              </div>
              <ul className="mt-5 flex flex-col gap-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 9 — CTA
  {
    id: "cta",
    render: () => (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Brand className="text-2xl" />
        <h2 className="mt-8 max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
          Ready to bring order to procurement?
        </h2>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Let&apos;s walk through Procfly with your team and map it to your buying process.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Book a demo <ArrowRight className="size-4" />
          </span>
          <span className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground">
            hello@procfly.com
          </span>
        </div>
      </div>
    ),
  },
]

function SlideLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
      {children}
    </span>
  )
}

export function PitchDeck() {
  const [index, setIndex] = useState(0)
  const total = slides.length

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault()
        next()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3 print:hidden">
        <Brand className="text-lg" />
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-mono">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Maximize2 className="size-3.5" />
            Export PDF
          </button>
        </div>
      </header>

      {/* Stage */}
      <section className="relative flex flex-1 items-stretch">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 md:px-12 md:py-16 print:max-w-none">
          <div className="flex flex-1 print:min-h-screen">{slides[index].render()}</div>
        </div>

        {/* Edge nav */}
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-opacity hover:bg-secondary disabled:pointer-events-none disabled:opacity-0 print:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          onClick={next}
          disabled={index === total - 1}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-opacity hover:bg-secondary disabled:pointer-events-none disabled:opacity-0 print:hidden"
        >
          <ArrowRight className="size-5" />
        </button>
      </section>

      {/* Progress dots */}
      <footer className="flex items-center justify-center gap-2 border-t border-border py-4 print:hidden">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40",
            )}
          />
        ))}
      </footer>
    </main>
  )
}

"use client"

import {
  Building2,
  Network,
  Star,
  ShieldAlert,
  Mail,
  Phone,
  Globe,
  User,
  Printer,
  Download,
  FileEdit,
  CreditCard,
  Receipt,
  FileText,
  FileBadge,
  ShieldCheck,
  Files,
  Trophy,
  ShoppingCart,
  FileSignature,
  ArrowRight,
  History,
  CheckCircle2,
  Hourglass,
  Ban,
  CircleDollarSign,
  Package,
  Percent,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatAmount, initials } from "@/lib/dashboard-data"
import {
  supplierPerformance,
  supplierOrders,
  supplierCompetitions,
  supplierContracts,
  supplierRequestRefs,
  requestHrefForRef,
  type Supplier,
  type SupplierStatus,
  type RiskStatus,
  type SupplierActivityKind,
  type SupplierDocStatus,
} from "@/lib/suppliers-data"
import { orderTotal } from "@/lib/orders-data"

const statusStyles: Record<SupplierStatus, { text: string; bg: string; ring: string; dot: string }> = {
  Pending: { text: "text-chart-3", bg: "bg-chart-3/10", ring: "ring-chart-3/30", dot: "bg-chart-3" },
  Active: { text: "text-chart-2", bg: "bg-chart-2/15", ring: "ring-chart-2/30", dot: "bg-chart-2" },
  Preferred: { text: "text-primary", bg: "bg-primary/10", ring: "ring-primary/30", dot: "bg-primary" },
  Blocked: { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", dot: "bg-destructive" },
  Archived: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", dot: "bg-muted-foreground" },
}

const riskStyles: Record<RiskStatus, string> = {
  "Low Risk": "bg-chart-2/15 text-chart-2",
  "Medium Risk": "bg-chart-4/15 text-chart-4",
  "High Risk": "bg-destructive/10 text-destructive",
}

const docStatusStyles: Record<SupplierDocStatus, string> = {
  Uploaded: "bg-chart-2/15 text-chart-2",
  "Pending Review": "bg-chart-3/10 text-chart-3",
  Missing: "bg-muted text-muted-foreground",
  Expired: "bg-destructive/10 text-destructive",
}

const activityIcons: Record<SupplierActivityKind, typeof CheckCircle2> = {
  created: Network,
  approved: CheckCircle2,
  updated: FileEdit,
  blocked: Ban,
  note: Hourglass,
}

const docIcon = (label: string) => {
  const l = label.toLowerCase()
  if (l.includes("nda")) return FileBadge
  if (l.includes("dpa")) return ShieldCheck
  if (l.includes("vat")) return Receipt
  if (l.includes("registration")) return FileSignature
  return FileText
}

export function SupplierDetailView({ supplier: s }: { supplier: Supplier }) {
  const st = statusStyles[s.status]
  const perf = supplierPerformance(s)
  const orders = supplierOrders(s)
  const comps = supplierCompetitions(s)
  const supContracts = supplierContracts(s)
  const requestRefs = supplierRequestRefs(s)

  return (
    <div className="flex flex-col gap-6">
      {/* Hero summary */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {initials(s.name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                    st.bg,
                    st.text,
                    st.ring,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", st.dot)} />
                  {s.status}
                </span>
                {s.preferred && s.status !== "Preferred" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <Star className="size-3 fill-primary" />
                    Preferred
                  </span>
                )}
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", riskStyles[s.risk])}>
                  <ShieldAlert className="size-3" />
                  {s.risk}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-foreground">{s.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {s.type} · {s.category} · owned by <span className="font-medium text-foreground">{s.owner}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Printer className="size-4" />
              Print
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Download className="size-4" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <FileEdit className="size-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
          <Fact icon={Building2} label="Legal name" value={s.legalName} />
          <Fact icon={MapPin} label="Country" value={s.country} />
          <Fact icon={Network} label="Supplier type" value={s.type} />
          <Fact icon={CircleDollarSign} label="Total spend" value={perf.totalSpend > 0 ? `${formatAmount(perf.totalSpend)} EUR` : "—"} accent />
        </div>
      </div>

      {/* Performance KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PerfCard icon={CircleDollarSign} label="Total spend" value={perf.totalSpend > 0 ? `${formatAmount(perf.totalSpend)}` : "0"} sub="EUR all-time" iconClass="bg-primary/10 text-primary" />
        <PerfCard icon={Package} label="Orders" value={`${perf.orderCount}`} sub="purchase orders" iconClass="bg-chart-2/15 text-chart-2" />
        <PerfCard icon={Trophy} label="Competitions" value={`${perf.competitionCount}`} sub="participated" iconClass="bg-chart-3/10 text-chart-3" />
        <PerfCard icon={Percent} label="Win rate" value={`${Math.round(perf.winRate * 100)}%`} sub="competitions won" iconClass="bg-chart-4/10 text-chart-4" />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column — Overview */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Supplier information */}
          <Section icon={Building2} title="Supplier information">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Term label="Legal name" value={s.legalName} />
              <Term label="Display name" value={s.name} />
              <Term label="Supplier type" value={s.type} />
              <Term label="Category" value={s.category} />
              <Term label="Country" value={s.country} />
              <Term label="Website" value={s.website} />
            </dl>
          </Section>

          {/* Contact information */}
          <Section icon={User} title="Contact information">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Term label="Contact name" value={s.contact.name} />
              <Term label="Role" value={s.contact.role} />
              <Term label="Email" value={s.contact.email} icon={Mail} />
              <Term label="Phone" value={s.contact.phone} icon={Phone} />
              <Term label="Website" value={s.website} icon={Globe} />
            </dl>
          </Section>

          {/* Banking information */}
          <Section icon={CreditCard} title="Banking information">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Term label="IBAN" value={s.banking.iban} mono />
              <Term label="Bank" value={s.banking.bank} />
              <Term label="SWIFT / BIC" value={s.banking.swift} mono />
              <Term label="Currency" value={s.banking.currency} />
              <Term label="Payment terms" value={s.banking.paymentTerms} />
            </dl>
          </Section>

          {/* Tax information */}
          <Section icon={Receipt} title="Tax information">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Term label="VAT number" value={s.tax.vatNumber} mono />
              <Term label="Registration number" value={s.tax.registrationNumber} mono />
              <Term label="VAT treatment" value={s.tax.vatTreatment} />
              <Term label="VAT verification" value={s.tax.vatVerificationStatus} />
            </dl>
          </Section>

          {/* Documents */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border p-5">
              <Files className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Documents</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {s.documents.length}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {s.documents.map((doc) => {
                const Icon = docIcon(doc.label)
                const available = doc.status === "Uploaded" || doc.status === "Pending Review"
                return (
                  <li key={doc.label} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.fileName}
                        {doc.uploadedOn ? ` · ${doc.uploadedOn}` : ""}
                      </p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", docStatusStyles[doc.status])}>
                      {doc.status}
                    </span>
                    {available && (
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                        <Download className="size-3.5" />
                        Download
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Linked records */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border p-5">
              <ArrowRight className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Linked procurement records</h3>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {/* Requests */}
              <LinkGroup icon={FileText} title="Requests" count={requestRefs.length}>
                {requestRefs.length === 0 ? (
                  <EmptyLinks label="No linked requests" />
                ) : (
                  requestRefs.map((ref) => (
                    <RecordLink key={ref} label={ref} sub="Request" href={requestHrefForRef(ref)} />
                  ))
                )}
              </LinkGroup>

              {/* Competitions */}
              <LinkGroup icon={Trophy} title="Competitions" count={comps.length}>
                {comps.length === 0 ? (
                  <EmptyLinks label="No competitions" />
                ) : (
                  comps.map((c) => (
                    <RecordLink
                      key={c.id}
                      label={c.ref}
                      sub={c.awardedTo === s.name ? "Won" : "Participated"}
                      won={c.awardedTo === s.name}
                      href={`/competitions/${c.id}`}
                    />
                  ))
                )}
              </LinkGroup>

              {/* Purchase orders */}
              <LinkGroup icon={ShoppingCart} title="Purchase orders" count={orders.length}>
                {orders.length === 0 ? (
                  <EmptyLinks label="No purchase orders" />
                ) : (
                  orders.map((o) => (
                    <RecordLink
                      key={o.id}
                      label={o.number}
                      sub={`${formatAmount(orderTotal(o))} EUR`}
                      href={`/orders/${o.id}`}
                    />
                  ))
                )}
              </LinkGroup>

              {/* Contracts */}
              <LinkGroup icon={FileSignature} title="Contracts" count={supContracts.length}>
                {supContracts.length === 0 ? (
                  <EmptyLinks label="No contracts" />
                ) : (
                  supContracts.map((c) => (
                    <RecordLink
                      key={c.id}
                      label={c.number}
                      sub={`${formatAmount(c.value)} ${c.currency}`}
                      href={`/contracts/${c.id}`}
                    />
                  ))
                )}
              </LinkGroup>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Owner */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <User className="size-4 text-primary" />
              Supplier owner
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {initials(s.owner)}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{s.owner}</p>
                <p className="text-xs text-muted-foreground">Procurement</p>
              </div>
            </div>
          </div>

          {/* Primary contact */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Building2 className="size-4 text-primary" />
              Primary contact
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {initials(s.contact.name)}
              </span>
              <div>
                <p className="font-semibold text-foreground">{s.contact.name}</p>
                <p className="text-xs text-muted-foreground">{s.contact.role}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <ContactRow icon={Mail} value={s.contact.email} />
              <ContactRow icon={Phone} value={s.contact.phone} />
              <ContactRow icon={Globe} value={s.website} />
            </dl>
          </div>

          {/* Activity history */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <History className="size-4 text-primary" />
              Activity
            </h3>
            <ol className="mt-5 flex flex-col">
              {s.activity.map((entry, i) => {
                const last = i === s.activity.length - 1
                const Icon = activityIcons[entry.kind]
                const danger = entry.kind === "blocked"
                return (
                  <li key={`${entry.title}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last && (
                      <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                      <p className="text-xs text-muted-foreground">{entry.when}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Building2
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className={cn("truncate text-base font-bold", accent ? "text-primary" : "text-foreground")}>{value}</span>
    </div>
  )
}

function PerfCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: typeof Building2
  label: string
  value: string
  sub: string
  iconClass: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className={cn("flex size-9 items-center justify-center rounded-lg", iconClass)}>
        <Icon className="size-4.5" />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none tracking-tight tabular-nums text-foreground">{value}</p>
        <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

function Term({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon?: typeof Mail
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 flex items-center gap-1.5 font-medium text-foreground", mono && "font-mono text-[13px]")}>
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  )
}

function LinkGroup({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: typeof FileText
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 bg-card p-5">
      <div className="flex items-center gap-1.5">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function RecordLink({
  label,
  sub,
  href,
  won,
}: {
  label: string
  sub: string
  href: string | null
  won?: boolean
}) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs font-semibold text-foreground">{label}</p>
        <p className={cn("truncate text-[11px]", won ? "font-semibold text-chart-2" : "text-muted-foreground")}>{sub}</p>
      </div>
      {href && <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />}
    </>
  )
  if (!href) {
    return <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">{inner}</div>
  }
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted"
    >
      {inner}
    </Link>
  )
}

function EmptyLinks({ label }: { label: string }) {
  return <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">{label}</p>
}

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="truncate text-foreground">{value}</span>
    </div>
  )
}

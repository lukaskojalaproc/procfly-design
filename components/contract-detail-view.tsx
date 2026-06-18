"use client"

import {
  FileSignature,
  Building2,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CreditCard,
  Repeat,
  RefreshCw,
  StickyNote,
  CheckCircle2,
  Hourglass,
  Mail,
  Phone,
  MapPin,
  User,
  Printer,
  Download,
  FileEdit,
  FileText,
  FileBadge,
  ShieldCheck,
  Files,
  Trophy,
  ShoppingCart,
  ArrowRight,
  History,
  Bell,
  AlertTriangle,
  CircleDollarSign,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatAmount, initials } from "@/lib/dashboard-data"
import {
  contractActivity,
  contractNotifications,
  contractRequestHref,
  contractCompetitionHref,
  contractOrderHref,
  noticeDeadline,
  daysUntilEnd,
  daysUntilNotice,
  isAutoRenew,
  type ContractStatus,
  type ContractDocKind,
  type Contract,
} from "@/lib/contracts-data"

const statusStyles: Record<ContractStatus, { text: string; bg: string; ring: string; dot: string }> = {
  Draft: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", dot: "bg-muted-foreground" },
  "Pending Approval": { text: "text-chart-3", bg: "bg-chart-3/10", ring: "ring-chart-3/30", dot: "bg-chart-3" },
  Active: { text: "text-chart-2", bg: "bg-chart-2/15", ring: "ring-chart-2/30", dot: "bg-chart-2" },
  "Expiring Soon": { text: "text-chart-4", bg: "bg-chart-4/10", ring: "ring-chart-4/30", dot: "bg-chart-4" },
  Expired: { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", dot: "bg-destructive" },
  Terminated: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border", dot: "bg-muted-foreground" },
}

const docIcons: Record<ContractDocKind, typeof FileText> = {
  signed: FileText,
  amendment: FileEdit,
  annex: Files,
  nda: FileBadge,
  dpa: ShieldCheck,
}

const notifStyles = {
  info: { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/30" },
  warning: { bg: "bg-chart-4/10", text: "text-chart-4", border: "border-chart-4/30" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
}

export function ContractDetailView({ contract: c }: { contract: Contract }) {
  const s = statusStyles[c.status]
  const activity = contractActivity(c)
  const notifications = contractNotifications(c)
  const notice = noticeDeadline(c)
  const endDays = daysUntilEnd(c)
  const noticeDays = daysUntilNotice(c)
  const auto = isAutoRenew(c)

  const requestHref = contractRequestHref(c)
  const competitionHref = contractCompetitionHref(c)
  const orderHref = contractOrderHref(c)

  return (
    <div className="flex flex-col gap-6">
      {/* Hero summary */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSignature className="size-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-muted-foreground">{c.number}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                    s.bg,
                    s.text,
                    s.ring,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", s.dot)} />
                  {c.status}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    auto ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <RefreshCw className="size-3" />
                  {auto ? "Auto Renew" : "Manual Renew"}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-foreground">{c.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                With <span className="font-medium text-foreground">{c.supplier.name}</span> · owned by{" "}
                <span className="font-medium text-foreground">{c.owner}</span>
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
              Export PDF
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <FileEdit className="size-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
          <Fact icon={Building2} label="Supplier" value={c.supplier.name} />
          <Fact icon={FileSignature} label="Contract type" value={c.contractType} />
          <Fact icon={User} label="Owner" value={c.owner} />
          <Fact icon={CircleDollarSign} label="Contract value" value={`${formatAmount(c.value)} ${c.currency}`} accent />
        </div>
      </div>

      {/* Renewal notifications */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Bell className="size-4 text-primary" />
            Notifications
          </span>
          {notifications.map((n) => {
            const ns = notifStyles[n.level]
            return (
              <span
                key={n.label}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                  ns.bg,
                  ns.text,
                  ns.border,
                )}
              >
                <AlertTriangle className="size-3" />
                {n.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Dates */}
          <Section icon={CalendarDays} title="Dates">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
              <DateCell icon={FileSignature} label="Signature date" value={c.signatureDate} />
              <DateCell icon={CalendarDays} label="Start date" value={c.startDate} />
              <DateCell
                icon={CalendarClock}
                label="End date"
                value={c.endDate}
                hint={endDays !== null && endDays >= 0 ? `in ${endDays} days` : endDays !== null ? "passed" : undefined}
              />
              <DateCell icon={CalendarCheck} label="Renewal date" value={c.renewalDate} />
              <DateCell icon={CalendarClock} label="Notice period" value={`${c.noticePeriodDays} days`} />
              <DateCell
                icon={CalendarClock}
                label="Notice deadline"
                value={notice ?? "—"}
                hint={noticeDays !== null && noticeDays >= 0 ? `in ${noticeDays} days` : noticeDays !== null ? "passed" : undefined}
              />
            </div>
          </Section>

          {/* Commercial terms */}
          <Section icon={CreditCard} title="Commercial terms">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-2">
              <Term label="Payment terms" value={c.paymentTerms} />
              <Term label="Billing frequency" value={c.billingFrequency} />
              <Term label="Contract value" value={`${formatAmount(c.value)} ${c.currency}`} />
              <Term label="Auto renewal" value={auto ? "Yes — renews automatically" : "No — manual renewal"} />
            </dl>
          </Section>

          {/* Renewal management */}
          <Section icon={Repeat} title="Renewal management">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
              <DateCell icon={CalendarCheck} label="Renewal date" value={c.renewalDate} />
              <DateCell
                icon={CalendarClock}
                label="Notice date"
                value={notice ?? "—"}
                hint={noticeDays !== null && noticeDays >= 0 ? `in ${noticeDays} days` : noticeDays !== null ? "passed" : undefined}
              />
              <DateCell icon={RefreshCw} label="Auto renewal" value={auto ? "Enabled" : "Disabled"} />
              <DateCell icon={AlertTriangle} label="Cancellation deadline" value={notice ?? "—"} />
            </div>
          </Section>

          {/* Documents */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border p-5">
              <Files className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Documents</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {c.documents.length}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {c.documents.map((doc) => {
                const Icon = docIcons[doc.kind]
                return (
                  <li key={`${doc.kind}-${doc.name}`} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        doc.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                      {doc.meta && <p className="truncate text-xs text-muted-foreground">{doc.meta}</p>}
                    </div>
                    {doc.available ? (
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                        <Download className="size-3.5" />
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unavailable</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {c.notes && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <StickyNote className="size-4 text-primary" />
                Notes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Linked records */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ArrowRight className="size-4 text-primary" />
              Linked records
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">Request → Competition → Purchase Order</p>
            <div className="mt-4 flex flex-col gap-3">
              <ChainLink icon={FileText} label="Request" value={c.requestRef ?? "Not linked"} href={requestHref} />
              <ChainLink
                icon={Trophy}
                label="Competition"
                value={c.competitionRef ?? "Direct — no competition"}
                href={competitionHref}
              />
              <ChainLink icon={ShoppingCart} label="Purchase order" value={c.poRef ?? "Not linked"} href={orderHref} />
            </div>
          </div>

          {/* Supplier */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Building2 className="size-4 text-primary" />
              Supplier
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {initials(c.supplier.name)}
              </span>
              <div>
                <p className="font-semibold text-foreground">{c.supplier.name}</p>
                <p className="text-xs text-muted-foreground">{c.category}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <ContactRow icon={User} value={c.supplier.contact} />
              {c.supplier.email && <ContactRow icon={Mail} value={c.supplier.email} />}
              {c.supplier.phone && <ContactRow icon={Phone} value={c.supplier.phone} />}
              <ContactRow icon={MapPin} value={c.supplier.address} />
            </dl>
          </div>

          {/* Owner */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <User className="size-4 text-primary" />
              Contract owner
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {initials(c.owner)}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{c.owner}</p>
                <p className="text-xs text-muted-foreground">Procurement</p>
              </div>
            </div>
          </div>

          {/* Activity history */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <History className="size-4 text-primary" />
              Activity history
            </h3>
            <ol className="mt-5 flex flex-col">
              {activity.map((entry, i) => {
                const last = i === activity.length - 1
                return (
                  <li key={`${entry.title}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last && (
                      <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-border" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        entry.done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {entry.done ? <CheckCircle2 className="size-4" /> : <Hourglass className="size-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
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
  icon: typeof CalendarDays
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
  icon: typeof FileSignature
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

function DateCell({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1 bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  )
}

function ChainLink({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof FileText
  label: string
  value: string
  href: string | null
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          href ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("truncate font-mono text-sm font-semibold", href ? "text-foreground" : "text-muted-foreground")}>
          {value}
        </p>
      </div>
      {href && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
    </>
  )

  if (!href) {
    return <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">{inner}</div>
  }
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted"
    >
      {inner}
    </Link>
  )
}

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-start gap-2 text-muted-foreground">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="text-foreground">{value}</span>
    </div>
  )
}

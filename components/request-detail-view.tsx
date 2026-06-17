import Link from "next/link"
import {
  Package,
  Briefcase,
  UserPlus,
  FileText,
  Box,
  ClipboardList,
  Clock,
  Check,
  X,
  Monitor,
  ShieldCheck,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  initials,
  formatAmount,
  getRequestDetail,
  type ProcurementRequest,
  type RequestKind,
  type RequestStatus,
  type ApprovalState,
} from "@/lib/dashboard-data"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
}

const statusStyles: Record<RequestStatus, string> = {
  Pending: "bg-chart-2/15 text-chart-2",
  Approved: "bg-primary/12 text-primary",
  Rejected: "bg-destructive/12 text-destructive",
}

const statusDot: Record<RequestStatus, string> = {
  Pending: "bg-chart-2",
  Approved: "bg-primary",
  Rejected: "bg-destructive",
}

const approvalBadge: Record<ApprovalState, { label: string; cls: string; icon: typeof Check }> = {
  approved: { label: "Approved", cls: "bg-primary/12 text-primary", icon: Check },
  pending: { label: "Pending", cls: "bg-chart-2/15 text-chart-2", icon: Clock },
  rejected: { label: "Rejected", cls: "bg-destructive/12 text-destructive", icon: X },
}

function SectionCard({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: typeof Package
  iconClass: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-0">
      <div className="flex items-center gap-2.5 border-b border-border p-5">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="size-4" />
        </span>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export function RequestDetailView({ request }: { request: ProcurementRequest }) {
  const detail = getRequestDetail(request)
  const Icon = kindIcon[request.kind]
  const completed = detail.approvals.filter((a) => a.state === "approved").length
  const total = detail.approvals.length
  const progressPct = Math.round((completed / total) * 100)

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <Card className="p-0">
        <div className="flex items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {request.kind}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{request.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                  {initials(request.requester)}
                </span>
                Requested by {request.requester}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                statusStyles[request.status],
              )}
            >
              <span className={cn("size-1.5 rounded-full", statusDot[request.status])} />
              {request.status}
            </span>
            <Link
              href="/requests"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-4" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-5 border-t border-border p-6 lg:grid-cols-4">
          <MetaItem
            label="Budget"
            value={request.amount > 0 ? `${formatAmount(request.amount)} ${request.currency}` : "No cost"}
          />
          <MetaItem label="Department" value={request.department} />
          <MetaItem label="Cost center" value="TEST-003 - Randominis" />
          <MetaItem label="Created" value={request.date} />
        </div>
      </Card>

      {/* Two-column body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <SectionCard icon={FileText} iconClass="bg-accent text-accent-foreground" title="Overview">
            <div className="flex flex-col gap-3.5">
              <OverviewRow label="Name" value={detail.lineItems[0]?.name ?? request.title} />
              <OverviewRow label="Description" value={detail.description} />
              <OverviewRow label="Category" value={request.kind} />
              <OverviewRow label="Supplier" value={detail.supplier} />
              <OverviewRow
                label="Needed By"
                value={detail.neededBy ?? "Not provided"}
              />
            </div>
          </SectionCard>

          {detail.software ? (
            <>
              <SectionCard icon={Monitor} iconClass="bg-chart-2/15 text-chart-2" title="License & renewal">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="License type" value={detail.software.licenseType} />
                  <MetaItem label="Billing cycle" value={detail.software.billingCycle} />
                  <MetaItem label="Renewal" value={detail.software.renewalType} />
                  <MetaItem label="Renewal date" value={detail.software.renewalDate} />
                  <MetaItem label="Users / seats" value={detail.software.users} />
                </div>
              </SectionCard>

              <SectionCard
                icon={ShieldCheck}
                iconClass="bg-destructive/12 text-destructive"
                title="Data protection (GDPR)"
              >
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="Personal data" value={detail.software.dataProcessing} />
                  <MetaItem label="Hosting region" value={detail.software.hostingRegion} />
                  <MetaItem label="DPA required" value={detail.software.dpaRequired} />
                  <MetaItem label="Internal owner" value={detail.software.owner} />
                </div>
              </SectionCard>
            </>
          ) : (
            <SectionCard icon={Box} iconClass="bg-chart-3/15 text-chart-3" title="Specifications">
              {detail.lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No line items.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {detail.lineItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-sm text-muted-foreground">Qty {item.qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard
            icon={ClipboardList}
            iconClass="bg-chart-2/15 text-chart-2"
            title="Custom Fields"
          >
            <div className="flex flex-col gap-3.5">
              {detail.customFields.map((field, i) => (
                <OverviewRow key={i} label={field.label} value={field.value} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right column — approval flow */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Approval flow</h2>
            <span className="text-sm font-medium text-muted-foreground">
              {completed} of {total} completed
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <ol className="mt-6 flex flex-col">
            {detail.approvals.map((step, i) => {
              const badge = approvalBadge[step.state]
              const BadgeIcon = badge.icon
              const isLast = i === detail.approvals.length - 1
              const done = step.state === "approved"
              return (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Timeline rail */}
                  {!isLast && (
                    <span
                      className={cn(
                        "absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5",
                        done ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                      done
                        ? "border-primary text-primary"
                        : step.state === "rejected"
                          ? "border-destructive text-destructive"
                          : "border-chart-2 text-chart-2",
                    )}
                  >
                    <BadgeIcon className="size-4" />
                  </span>

                  <div className="flex-1 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                          {initials(step.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{step.name}</p>
                          <p className="text-xs text-muted-foreground">{step.role}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          badge.cls,
                        )}
                      >
                        <BadgeIcon className="size-3" />
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {step.comment ?? "No comment yet"}
                      </span>
                      <span className="text-muted-foreground">{step.date}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      </div>
    </div>
  )
}

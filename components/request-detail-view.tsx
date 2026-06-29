"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Package,
  Briefcase,
  UserPlus,
  FileText,
  X,
  Check,
  CornerUpLeft,
  Gavel,
  ChevronRight,
  Users,
  ArrowLeft,
  MessageSquare,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  initials,
  formatAmount,
  getRequestDetail,
  statusMeta,
  type ProcurementRequest,
  type RequestKind,
  type DocumentStatus,
  type ApprovalState,
} from "@/lib/dashboard-data"
import { ApprovedRequestActions } from "@/components/convert-to-competition-dialog"
import { RequestApprovalFlow } from "@/components/request-approval-flow"
import { RequestDiscussion } from "@/components/request-discussion"
import { useRequestActivity, recordDecision } from "@/lib/request-activity-store"
import { routeDecision, type NotificationType } from "@/lib/notification-store"
import { getApprovalTasks, formatWaiting } from "@/lib/approvals-data"

// ─── Types & configs ─────────────────────────────────────────────────────────

const decisionConfig: Record<
  "approve" | "reject" | "changes",
  { state: ApprovalState; event: "approved" | "rejected" | "changes_requested" }
> = {
  approve: { state: "approved", event: "approved" },
  reject:  { state: "rejected", event: "rejected" },
  changes: { state: "pending",  event: "changes_requested" },
}

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product":       Package,
  "Buy Service":       Briefcase,
  "Add New Supplier":  UserPlus,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return (
    <p className="mb-0 mt-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground first:mt-0">
      {title}
    </p>
  )
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border/40 bg-card">
      {children}
    </div>
  )
}

function Field({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] items-start gap-6 border-b border-border/25 px-5 py-4 last:border-0">
      <span className="shrink-0 text-[12px] text-muted-foreground/55 pt-px">{label}</span>
      <span className="text-sm font-medium text-foreground">{children ?? value ?? "—"}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RequestDetailView({ request }: { request: ProcurementRequest }) {
  const detail  = getRequestDetail(request)
  const Icon    = kindIcon[request.kind]
  const status  = statusMeta[request.status]
  const activity = useRequestActivity(request.id)

  const searchParams = useSearchParams()
  const canReview = request.status === "Pending Approval"

  const reviewTask = useMemo(() => {
    if (!canReview) return null
    return (
      getApprovalTasks().find(
        (t) => t.requestId === request.id &&
               (t.taskStatus === "Awaiting Action" || t.taskStatus === "Changes Requested"),
      ) ?? null
    )
  }, [canReview, request.id])

  const assignedApprover =
    reviewTask ? detail.approvals[reviewTask.stepNumber - 1]?.name ?? "—" : "—"

  const [decisionComment, setDecisionComment] = useState("")

  function submitDecision(kind: "approve" | "reject" | "changes") {
    if (!reviewTask) return
    const cfg     = decisionConfig[kind]
    const comment = decisionComment.trim()
    recordDecision({
      requestId: request.id,
      stepIndex: reviewTask.stepNumber - 1,
      step:      reviewTask.stepRole,
      state:     cfg.state,
      event:     cfg.event,
      by:        assignedApprover,
      comment,
    })
    routeDecision({
      requestId:    request.id,
      requestRef:   request.ref,
      requestTitle: request.title,
      actor:        assignedApprover,
      type:         cfg.event as Exclude<NotificationType, "comment" | "mention">,
      text:         comment,
      requester:    request.requester,
    })
    setDecisionComment("")
  }

  const participants = useMemo(() => {
    const names = [request.requester, ...detail.approvals.map((a) => a.name)]
    return [...new Set(names)]
  }, [request.requester, detail.approvals])

  const approvers = useMemo(() => {
    return [...new Set(detail.approvals.slice(1).map((a) => a.name).filter((n) => n !== request.requester))]
  }, [detail.approvals, request.requester])

  const commentCount = activity.filter((a) => a.kind === "comment").length

  // Which "Details" sub-section exists for this request kind
  const detailsLabel = detail.product
    ? "Product Details"
    : detail.service
      ? "Service Details"
      : detail.software
        ? "Software Details"
        : detail.supplierOnboarding
          ? "Supplier Details"
          : "Details"

  const [tab, setTab] = useState<"overview" | "details" | "financial" | "documents" | "activity">("overview")

  const amountDisplay = request.currency === "EUR"
    ? `€${formatAmount(request.amount)}`
    : `${formatAmount(request.amount)} ${request.currency}`

  const estimatedTotalLabel = detail.supplierOnboarding
    ? detail.supplierOnboarding.expectedAnnualSpend
    : detail.estimatedTotal > 0
      ? `${formatAmount(detail.estimatedTotal)} ${request.currency}`
      : "No cost"

  const activityHistory = useMemo(() => {
    const items: { action: string; user: string; at: string }[] = [
      { action: "Request Created", user: request.requester, at: request.date },
    ]
    if ((request.attachments ?? 0) > 0)
      items.push({ action: "Documents Uploaded", user: request.requester, at: request.date })
    if (request.status !== "Draft")
      items.push({ action: "Submitted for Approval", user: request.requester, at: request.date })
    for (const a of activity) {
      if (a.kind === "resubmitted")
        items.push({ action: "Request Resubmitted", user: a.author, at: a.at })
    }
    if (request.status === "Cancelled")
      items.push({ action: "Request Withdrawn", user: request.requester, at: request.updated })
    if (request.updated !== request.date)
      items.push({ action: "Request Updated", user: request.requester, at: request.updated })
    return items.sort((x, y) => x.at.localeCompare(y.at))
  }, [request, activity])

  return (
    <div className={cn("flex flex-col", canReview && "pb-20")}>

      {/* ── Approval Review Bar — fixed bottom footer ─────────────────────── */}
      {canReview && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-6 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.10)] lg:left-64">
          <div className="flex items-center gap-3">
            {/* Context — minimal: step info + waiting time */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Gavel className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="text-xs font-semibold text-foreground">Approval Review</span>
              {reviewTask && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs text-muted-foreground">
                    Step {reviewTask.stepNumber} of {reviewTask.totalSteps} · {reviewTask.stepRole}
                  </span>
                  {reviewTask.deadline && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-xs text-muted-foreground/70">{reviewTask.deadline}</span>
                    </>
                  )}
                  <span className="text-muted-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Clock className="size-3" />
                    {formatWaiting(reviewTask.activatedAt)}
                  </span>
                </>
              )}
            </div>

            {/* Note input */}
            <input
              type="text"
              placeholder="Note (required to reject or request changes)"
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              className="h-8 w-60 shrink rounded-lg border border-border bg-muted/40 px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10 transition-all"
            />

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Approve — only green button */}
              <button
                type="button"
                onClick={() => submitDecision("approve")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#16a34a] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Check className="size-3.5" />
                Approve
              </button>
              {/* Request Changes — neutral outline */}
              <button
                type="button"
                onClick={() => submitDecision("changes")}
                disabled={!decisionComment.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <CornerUpLeft className="size-3.5" />
                Request Changes
              </button>
              {/* Reject — neutral outline, no red */}
              <button
                type="button"
                onClick={() => submitDecision("reject")}
                disabled={!decisionComment.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <X className="size-3.5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Back link */}
        <Link
          href="/requests"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          All requests
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            {/* Kind icon */}
            <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              <Icon className="size-5" />
            </div>

            <div className="min-w-0">
              {/* Eyebrow: ref · kind — muted, small */}
              <p className="text-[11px] text-muted-foreground/70 font-mono tracking-wide">
                {request.ref}
                <span className="mx-1.5 opacity-40">·</span>
                {request.kind}
              </p>

              {/* Primary: title + status badge */}
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-[1.375rem] font-bold leading-snug tracking-tight text-foreground text-balance">
                  {request.title}
                </h1>
                <span className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  status.badge,
                )}>
                  <span className={cn("size-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>

              {/* Secondary: requester · department · date */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#E2E8F0] text-[8px] font-bold text-[#475569]">
                    {initials(request.requester)}
                  </span>
                  {request.requester}
                </span>
                <span className="opacity-40">·</span>
                <span>{request.department}</span>
                <span className="opacity-40">·</span>
                <span>{request.date}</span>
              </div>
            </div>
          </div>

          {/* Amount — isolated right, with vertical breathing room */}
          <div className="flex shrink-0 flex-col items-end gap-1 pt-1">
            <p className="text-[11px] text-muted-foreground/70 uppercase tracking-widest">Amount</p>
            <p className="text-[1.375rem] font-bold tabular-nums text-foreground">{amountDisplay}</p>
            {request.quotes > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Users className="size-3" />
                {request.quotes} {request.quotes === 1 ? "quote" : "quotes"}
              </span>
            )}
            {/* Convert to competition etc */}
            {request.status === "Approved" && request.kind !== "Add New Supplier" && (
              <div className="mt-2">
                <ApprovedRequestActions request={request} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Approval Flow — full width ───────────────────────────────────── */}
      <RequestApprovalFlow requestId={request.id} approvals={detail.approvals} />

      {/* ── Main layout: left tabbed content + right discussion panel ────── */}
      <div className="flex min-h-0 flex-1 items-stretch gap-6 pt-6">

        {/* ── Left: tabs + tab content ─────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Tab bar */}
          <div className="flex items-center gap-0 border-b border-border">
            {([
              { id: "overview"  as const, label: "Overview" },
              { id: "details"   as const, label: detailsLabel },
              { id: "financial" as const, label: "Financial" },
              { id: "documents" as const, label: "Documents", count: detail.documents.length || null },
              { id: "activity"  as const, label: "Activity" },
            ]).map((t) => {
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative -mb-px flex items-center gap-2 whitespace-nowrap border-b-[2.5px] px-4 pb-3 pt-1 text-sm transition-all duration-150",
                    isActive
                      ? "border-foreground font-semibold text-foreground"
                      : "border-transparent font-normal text-muted-foreground/55 hover:text-muted-foreground",
                  )}
                >
                  {t.label}
                  {"count" in t && t.count ? (
                    <span className={cn(
                      "inline-flex items-center justify-center rounded-full px-1.5 py-px text-[10px] font-semibold leading-none tabular-nums transition-colors",
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted/60 text-muted-foreground/50",
                    )}>
                      {t.count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="pt-6">

            {/* ── Overview ────────────────────────────────────────────────── */}
            {tab === "overview" && (
              <div className="flex flex-col gap-6">
                {/* Key Numbers — full-width banner */}
                <div className="flex items-stretch gap-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden">

                  {/* Left: amount + budget bar */}
                  <div className="flex flex-1 items-center gap-10 px-6 py-5">
                    {/* Amount */}
                    <div className="shrink-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Requested amount</p>
                      <p className="mt-1.5 text-[2rem] font-bold tabular-nums leading-none text-foreground">{amountDisplay}</p>
                      {request.quotes > 0 && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          {request.quotes} {request.quotes === 1 ? "quote" : "quotes"}
                        </p>
                      )}
                    </div>

                    {/* Budget bar */}
                    {request.budgetTotal && (
                      <div className="flex-1 min-w-[160px] max-w-sm">
                        <div className="flex items-baseline justify-between gap-2 mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Budget used</span>
                          <span className="text-[12px] font-bold tabular-nums text-foreground">
                            {request.currency === "EUR" ? "€" : ""}{formatAmount(request.amount)}
                            <span className="mx-1 font-normal text-muted-foreground/40">/</span>
                            {request.currency === "EUR" ? "€" : ""}{formatAmount(request.budgetTotal)}
                          </span>
                        </div>
                        {(() => {
                          const pct = Math.min(100, Math.round((request.amount / request.budgetTotal!) * 100))
                          // Amber when over 90% budget used, green otherwise
                          const fillCls = pct >= 90 ? "bg-[#d97706]" : "bg-[#16a34a]"
                          return (
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn("h-full rounded-full transition-all", fillCls)}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )
                        })()}
                        <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                          {Math.min(100, Math.round((request.amount / request.budgetTotal) * 100))}% of budget
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-border/60 my-4" />

                  {/* Right: department + cost center — secondary meta */}
                  <div className="flex shrink-0 flex-col justify-center gap-3 px-6 py-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Department</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{request.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Cost center</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{detail.costCenter}</p>
                    </div>
                  </div>

                </div>

                {/* General */}
                <div>
                  <Section title="General" />
                  <FieldGroup>
                    <Field label="Description"           value={detail.description} />
                    <Field label="Procurement category"  value={request.category} />
                    <Field label="Department"            value={request.department} />
                    <Field label="Cost center"           value={detail.costCenter} />
                    <Field label="Business priority"     value={detail.businessPriority} />
                    <Field label="Currency"              value={request.currency} />
                    <Field label="Created"               value={request.date} />
                    <Field label="Last updated"          value={request.updated} />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* ── Details ─────────────────────────────────────────────────── */}
            {tab === "details" && (
              <div className="flex flex-col gap-6">
                {detail.product && (
                  <div>
                    <Section title="Product Details" />
                    <FieldGroup>
                      <Field label="Procurement category" value={detail.product.procurementCategory} />
                      <Field label="Preferred supplier"   value={detail.product.preferredSupplier} />
                      <Field label="Needed by"            value={detail.product.neededBy} />
                      <Field label="Delivery location"    value={detail.product.deliveryLocation} />
                      <Field label="Purchase type"        value={detail.product.purchaseType} />
                    </FieldGroup>
                  </div>
                )}

                {detail.service && (
                  <div>
                    <Section title="Service Details" />
                    <FieldGroup>
                      <Field label="Procurement category" value={detail.service.procurementCategory} />
                      <Field label="Preferred supplier"   value={detail.service.preferredSupplier} />
                      <Field label="Service start"        value={detail.service.serviceStartDate} />
                      <Field label="Service end"          value={detail.service.serviceEndDate} />
                      <Field label="Business owner"       value={detail.service.businessOwner} />
                      <Field label="Contract required"    value={detail.service.contractRequired} />
                      <Field label="Service type"         value={detail.service.serviceType} />
                    </FieldGroup>
                  </div>
                )}

                {detail.software && (
                  <>
                    <div>
                      <Section title="Software Details" />
                      <FieldGroup>
                        <Field label="Software name"      value={detail.software.softwareName} />
                        <Field label="Preferred supplier" value={detail.software.preferredSupplier} />
                        <Field label="Business owner"     value={detail.software.businessOwner} />
                        <Field label="IT owner"           value={detail.software.itOwner} />
                        <Field label="Number of users"    value={detail.software.users} />
                        <Field label="Billing cycle"      value={detail.software.billingCycle} />
                        <Field label="Subscription start" value={detail.software.subscriptionStart} />
                        <Field label="Subscription end"   value={detail.software.subscriptionEnd} />
                        <Field label="Contract duration"  value={detail.software.contractDuration} />
                        <Field label="License type"       value={detail.software.licenseType} />
                        <Field label="Auto renewal"       value={detail.software.autoRenewal} />
                      </FieldGroup>
                    </div>
                    <div>
                      <Section title="Data Protection" />
                      <FieldGroup>
                        <Field label="Personal data processed" value={detail.software.dataProcessing} />
                        {detail.software.dataProcessing !== "No" && (
                          <>
                            <Field label="Data hosting region" value={detail.software.hostingRegion} />
                            <Field label="DPA required"        value={detail.software.dpaRequired} />
                          </>
                        )}
                      </FieldGroup>
                    </div>
                  </>
                )}

                {detail.supplierOnboarding && (
                  <>
                    <div>
                      <Section title="Supplier Information" />
                      <FieldGroup>
                        <Field label="Legal entity name"     value={detail.supplierOnboarding.legalName} />
                        <Field label="Country"               value={detail.supplierOnboarding.country} />
                        <Field label="Registration number"   value={detail.supplierOnboarding.registrationNumber} />
                        <Field label="VAT number"            value={detail.supplierOnboarding.vatNumber} />
                        <Field label="Website"               value={detail.supplierOnboarding.website} />
                        <Field label="Contact name"          value={detail.supplierOnboarding.contactName} />
                        <Field label="Contact email"         value={detail.supplierOnboarding.contactEmail} />
                        <Field label="Supplier category"     value={detail.supplierOnboarding.supplierCategory} />
                        <Field label="Expected annual spend" value={detail.supplierOnboarding.expectedAnnualSpend} />
                      </FieldGroup>
                    </div>
                    <div>
                      <Section title="Compliance" />
                      <FieldGroup>
                        <Field label="VAT verification status" value={detail.supplierOnboarding.vatVerificationStatus} />
                        <Field label="Risk status"             value={detail.supplierOnboarding.riskStatus} />
                      </FieldGroup>
                    </div>
                  </>
                )}

                {!detail.product && !detail.service && !detail.software && !detail.supplierOnboarding && (
                  <p className="text-sm text-muted-foreground">No additional details for this request.</p>
                )}
              </div>
            )}

            {/* ── Financial ──────────────────────────────────────────���────── */}
            {tab === "financial" && (
              <div className="flex flex-col gap-6">
                <div>
                  <Section title="Financial Information" />
                  <FieldGroup>
                    {detail.supplierOnboarding ? (
                      <>
                        <Field label="Expected annual spend" value={detail.supplierOnboarding.expectedAnnualSpend} />
                        <Field label="Payment terms"          value={detail.supplierOnboarding.paymentTerms} />
                        <Field label="Invoicing email"        value={detail.supplierOnboarding.invoicingEmail} />
                        <Field label="Currency"               value={request.currency} />
                      </>
                    ) : detail.software ? (
                      <>
                        <Field label="Recurring cost"  value={estimatedTotalLabel} />
                        <Field label="Annual cost"     value={estimatedTotalLabel} />
                        <Field label="Estimated total" value={estimatedTotalLabel} />
                        <Field label="Currency"        value={request.currency} />
                      </>
                    ) : detail.product ? (
                      <>
                        <Field label="Quantity"
                          value={String(detail.lineItems.reduce((s, i) => s + i.qty, 0) || "—")} />
                        <Field label="Unit price"
                          value={detail.lineItems[0]
                            ? `${formatAmount(detail.lineItems[0].unitPrice)} ${request.currency}`
                            : "—"} />
                        <Field label="Estimated total" value={estimatedTotalLabel} />
                        <Field label="Currency"        value={request.currency} />
                      </>
                    ) : (
                      <>
                        <Field label="Estimated total" value={estimatedTotalLabel} />
                        <Field label="Currency"        value={request.currency} />
                      </>
                    )}
                  </FieldGroup>
                </div>

                {!detail.supplierOnboarding && detail.lineItems.length > 0 && (
                  <div>
                    <Section title="Line Items" />
                    <div className="mt-3 overflow-hidden rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                              {detail.service ? "Deliverable" : detail.software ? "License / Plan" : "Item"}
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                              {detail.software ? "Seats" : "Qty"}
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                              {detail.service ? "Rate" : detail.software ? "Price / Seat" : "Unit Price"}
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {detail.lineItems.map((item, i) => (
                            <tr key={i} className="bg-card">
                              <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{item.qty}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">
                                {formatAmount(item.unitPrice)} {request.currency}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-foreground">
                                {formatAmount(item.qty * item.unitPrice)} {request.currency}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Documents ───���───────────────────────────────────────────── */}
            {tab === "documents" && (
              detail.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
                  {detail.documents.map((doc, i) => {
                    const attached = doc.fileName !== "Awaiting upload"
                    const docStatus: DocumentStatus = doc.status ?? (attached ? "Uploaded" : "Missing")
                    const statusCls =
                      docStatus === "Uploaded"
                        // Green — complete / success
                        ? "bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                        : docStatus === "Pending Review"
                          // Grey — neutral waiting, not amber (no action needed from viewer)
                          ? "bg-[#f9fafb] text-[#6b7280] border border-[#d1d5db]"
                          // Dark grey — missing / blocked (not red — document absence is not an error state)
                          : "bg-[#f3f4f6] text-[#374151] border border-[#d1d5db]"
                    return (
                      <div key={i} className="flex items-center justify-between gap-4 bg-card px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {doc.label}
                              {doc.required && <span className="ml-0.5 text-destructive">*</span>}
                            </p>
                            <p className={cn("text-xs", attached ? "text-muted-foreground" : "text-destructive")}>
                              {attached
                                ? `${doc.fileName}${doc.uploadedBy ? ` · ${doc.uploadedBy}` : ""}${doc.uploadDate ? ` · ${doc.uploadDate}` : ""}`
                                : "Awaiting upload"}
                            </p>
                          </div>
                        </div>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", statusCls)}>
                          {docStatus}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* ── Activity ────────────────────────────────────────────────── */}
            {tab === "activity" && (
              <ol className="flex flex-col">
                {activityHistory.map((item, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i !== activityHistory.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-[calc(100%-0.75rem)] w-px bg-border" />
                    )}
                    <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col pt-0.5">
                      <span className="text-sm font-medium text-foreground">{item.action}</span>
                      <span className="text-xs text-muted-foreground">{item.user} · {item.at}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* ── Right: Chat / Discussion panel ───────────────────────────────── */}
        <div className="hidden w-[320px] shrink-0 lg:flex lg:flex-col">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Panel header */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Discussion</span>
              {commentCount > 0 && (
                <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {commentCount}
                </span>
              )}
            </div>
            {/* Discussion content */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <RequestDiscussion
                requestId={request.id}
                currentUser={request.requester}
                participants={participants}
                requestRef={request.ref}
                requestTitle={request.title}
                requester={request.requester}
                approvers={approvers}
              />
            </div>
          </div>
        </div>

      </div>{/* end main layout */}
    </div>
  )
}

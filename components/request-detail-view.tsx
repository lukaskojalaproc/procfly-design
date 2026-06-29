"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Package,
  Briefcase,
  UserPlus,
  FileText,
  Box,
  X,
  Monitor,
  ShieldCheck,
  Building2,
  Landmark,
  Wallet,
  History,
  ListChecks,
  MessageSquare,
  Check,
  CornerUpLeft,
  Gavel,
  ChevronRight,
  Users,
} from "lucide-react"
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

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border pb-3 pt-6">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h2>
    </div>
  )
}

function FieldRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-border/50 py-2.5 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children ?? value ?? "—"}</span>
    </div>
  )
}

type RequestTab = "details" | "discussion"

export function RequestDetailView({ request }: { request: ProcurementRequest }) {
  const detail     = getRequestDetail(request)
  const Icon       = kindIcon[request.kind]
  const [tab, setTab] = useState<RequestTab>("details")
  const activity   = useRequestActivity(request.id)

  const searchParams = useSearchParams()
  const canReview = searchParams.get("review") === "1" && request.status === "Pending Approval"

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
    const stepIndex = reviewTask.stepNumber - 1
    const cfg     = decisionConfig[kind]
    const comment = decisionComment.trim()
    recordDecision({
      requestId: request.id,
      stepIndex,
      step:  reviewTask.stepRole,
      state: cfg.state,
      event: cfg.event,
      by:    assignedApprover,
      comment,
    })
    routeDecision({
      requestId:     request.id,
      requestRef:    request.ref,
      requestTitle:  request.title,
      actor:         assignedApprover,
      type:          cfg.event as Exclude<NotificationType, "comment" | "mention">,
      text:          comment,
      requester:     request.requester,
    })
    setDecisionComment("")
  }

  const participants = useMemo(() => {
    const names = [request.requester, ...detail.approvals.map((a) => a.name)]
    return [...new Set(names)]
  }, [request.requester, detail.approvals])

  const approvers = useMemo(() => {
    const names = detail.approvals.slice(1).map((a) => a.name).filter((n) => n !== request.requester)
    return [...new Set(names)]
  }, [detail.approvals, request.requester])

  const commentCount = activity.filter((a) => a.kind === "comment").length

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

  const tabs = [
    { key: "details"    as const, label: "Details",    icon: ListChecks },
    { key: "discussion" as const, label: "Discussion",  icon: MessageSquare, count: commentCount },
  ]

  const status = statusMeta[request.status]

  return (
    <div className="flex flex-col">

      {/* ── Top sticky Approval Review action bar ─────────────────────── */}
      {canReview && (
        <div className="sticky top-0 z-40 -mx-6 border-b border-border bg-background/95 px-6 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            {/* Left: context */}
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Gavel className="size-3.5" />
              </span>
              <span className="text-sm font-semibold text-foreground">Approval Review</span>
              {reviewTask && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    Step {reviewTask.stepNumber} of {reviewTask.totalSteps} · {reviewTask.stepRole}
                  </span>
                  {reviewTask.deadline && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{reviewTask.deadline}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatWaiting(reviewTask.activatedAt)} waiting</span>
                </>
              )}
            </div>

            {/* Middle: comment input */}
            <input
              type="text"
              placeholder="Add a note (required to reject or request changes)"
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              className="h-8 w-64 shrink rounded-lg border border-border bg-muted px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40 focus:ring-0"
            />

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => submitDecision("approve")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#15803D] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Check className="size-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => submitDecision("changes")}
                disabled={!decisionComment.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CornerUpLeft className="size-3.5" />
                Request Changes
              </button>
              <button
                type="button"
                onClick={() => submitDecision("reject")}
                disabled={!decisionComment.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="size-3.5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header (no Card) ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pt-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">{request.ref}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{request.kind}</span>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                status.badge,
              )}>
                <span className={cn("size-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground text-balance">
              {request.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#E2E8F0] text-[9px] font-semibold text-[#475569]">
                  {initials(request.requester)}
                </span>
                <span className="font-medium text-foreground">{request.requester}</span>
              </span>
              <span>{request.department}</span>
              <span>{request.date}</span>
              <span className="font-semibold text-foreground">{estimatedTotalLabel}</span>
              {request.quotes > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3" />
                  {request.quotes} {request.quotes === 1 ? "quote" : "quotes"}
                </span>
              )}
            </div>
          </div>
        </div>

        {request.status === "Approved" && request.kind !== "Add New Supplier" && (
          <ApprovedRequestActions request={request} />
        )}
      </div>

      <div className="mt-5 h-px bg-border" />

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((t) => {
          const TabIcon = t.icon
          const active  = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <TabIcon className="size-4" />
              {t.label}
              {"count" in t && t.count ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {t.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* ── Discussion tab ────────────────────────────────────────────── */}
      {tab === "discussion" && (
        <div className="pt-6">
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
      )}

      {/* ── Details tab — sticky 2-column layout ─────────────────────── */}
      {tab === "details" && (
        <div className="grid grid-cols-1 gap-8 pt-2 lg:grid-cols-[1fr_300px]">

          {/* Left: scrollable sections separated by dividers */}
          <div>
            {/* ── General ── */}
            <SectionHeader title="General" />
            <div className="py-2">
              <FieldRow label="Description"          value={detail.description} />
              <FieldRow label="Procurement category" value={request.category} />
              <FieldRow label="Department"           value={request.department} />
              <FieldRow label="Cost center"          value={detail.costCenter} />
              <FieldRow label="Business priority"    value={detail.businessPriority} />
              <FieldRow label="Currency"             value={request.currency} />
              <FieldRow label="Created"              value={request.date} />
              <FieldRow label="Last updated"         value={request.updated} />
            </div>

            {/* ── Product Details ── */}
            {detail.product && (
              <>
                <SectionHeader title="Product Details" />
                <div className="py-2">
                  <FieldRow label="Procurement category" value={detail.product.procurementCategory} />
                  <FieldRow label="Preferred supplier"  value={detail.product.preferredSupplier} />
                  <FieldRow label="Needed by"           value={detail.product.neededBy} />
                  <FieldRow label="Delivery location"   value={detail.product.deliveryLocation} />
                  <FieldRow label="Purchase type"       value={detail.product.purchaseType} />
                </div>
              </>
            )}

            {/* ── Service Details ── */}
            {detail.service && (
              <>
                <SectionHeader title="Service Details" />
                <div className="py-2">
                  <FieldRow label="Procurement category" value={detail.service.procurementCategory} />
                  <FieldRow label="Preferred supplier"  value={detail.service.preferredSupplier} />
                  <FieldRow label="Service start"       value={detail.service.serviceStartDate} />
                  <FieldRow label="Service end"         value={detail.service.serviceEndDate} />
                  <FieldRow label="Business owner"      value={detail.service.businessOwner} />
                  <FieldRow label="Contract required"   value={detail.service.contractRequired} />
                  <FieldRow label="Service type"        value={detail.service.serviceType} />
                </div>
              </>
            )}

            {/* ── Software Details ── */}
            {detail.software && (
              <>
                <SectionHeader title="Software Details" />
                <div className="py-2">
                  <FieldRow label="Software name"       value={detail.software.softwareName} />
                  <FieldRow label="Preferred supplier"  value={detail.software.preferredSupplier} />
                  <FieldRow label="Business owner"      value={detail.software.businessOwner} />
                  <FieldRow label="IT owner"            value={detail.software.itOwner} />
                  <FieldRow label="Number of users"     value={detail.software.users} />
                  <FieldRow label="Billing cycle"       value={detail.software.billingCycle} />
                  <FieldRow label="Subscription start"  value={detail.software.subscriptionStart} />
                  <FieldRow label="Subscription end"    value={detail.software.subscriptionEnd} />
                  <FieldRow label="Contract duration"   value={detail.software.contractDuration} />
                  <FieldRow label="License type"        value={detail.software.licenseType} />
                  <FieldRow label="Auto renewal"        value={detail.software.autoRenewal} />
                </div>

                <SectionHeader title="Data Protection" />
                <div className="py-2">
                  <FieldRow label="Personal data processed" value={detail.software.dataProcessing} />
                  {detail.software.dataProcessing !== "No" && (
                    <>
                      <FieldRow label="Data hosting region" value={detail.software.hostingRegion} />
                      <FieldRow label="DPA required"        value={detail.software.dpaRequired} />
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── Supplier Onboarding ── */}
            {detail.supplierOnboarding && (
              <>
                <SectionHeader title="Supplier Information" />
                <div className="py-2">
                  <FieldRow label="Legal entity name"    value={detail.supplierOnboarding.legalName} />
                  <FieldRow label="Country"              value={detail.supplierOnboarding.country} />
                  <FieldRow label="Registration number"  value={detail.supplierOnboarding.registrationNumber} />
                  <FieldRow label="VAT number"           value={detail.supplierOnboarding.vatNumber} />
                  <FieldRow label="Website"              value={detail.supplierOnboarding.website} />
                  <FieldRow label="Contact name"         value={detail.supplierOnboarding.contactName} />
                  <FieldRow label="Contact email"        value={detail.supplierOnboarding.contactEmail} />
                  <FieldRow label="Supplier category"    value={detail.supplierOnboarding.supplierCategory} />
                  <FieldRow label="Expected annual spend" value={detail.supplierOnboarding.expectedAnnualSpend} />
                </div>

                <SectionHeader title="Finance" />
                <div className="py-2">
                  <FieldRow label="Payment terms"   value={detail.supplierOnboarding.paymentTerms} />
                  <FieldRow label="Invoicing email" value={detail.supplierOnboarding.invoicingEmail} />
                </div>

                <SectionHeader title="Compliance" />
                <div className="py-2">
                  <FieldRow label="VAT verification status" value={detail.supplierOnboarding.vatVerificationStatus} />
                  <FieldRow label="Risk status"             value={detail.supplierOnboarding.riskStatus} />
                </div>
              </>
            )}

            {/* ── Financial ── */}
            <SectionHeader title="Financial Information" />
            <div className="py-2">
              {detail.supplierOnboarding ? (
                <>
                  <FieldRow label="Expected annual spend" value={detail.supplierOnboarding.expectedAnnualSpend} />
                  <FieldRow label="Currency"              value={request.currency} />
                </>
              ) : detail.software ? (
                <>
                  <FieldRow label="Recurring cost"   value={estimatedTotalLabel} />
                  <FieldRow label="Annual cost"       value={estimatedTotalLabel} />
                  <FieldRow label="Estimated total"   value={estimatedTotalLabel} />
                  <FieldRow label="Currency"          value={request.currency} />
                </>
              ) : detail.product ? (
                <>
                  <FieldRow label="Quantity"
                    value={String(detail.lineItems.reduce((s, i) => s + i.qty, 0) || "—")} />
                  <FieldRow label="Unit price"
                    value={detail.lineItems[0]
                      ? `${formatAmount(detail.lineItems[0].unitPrice)} ${request.currency}`
                      : "—"} />
                  <FieldRow label="Estimated total" value={estimatedTotalLabel} />
                  <FieldRow label="Currency"        value={request.currency} />
                </>
              ) : (
                <>
                  <FieldRow label="Estimated total" value={estimatedTotalLabel} />
                  <FieldRow label="Currency"        value={request.currency} />
                </>
              )}
            </div>

            {/* ── Line Items ── */}
            {!detail.supplierOnboarding && detail.lineItems.length > 0 && (
              <>
                <SectionHeader title="Line Items" />
                <div className="py-4">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>{detail.service ? "Deliverable" : detail.software ? "License / Plan" : "Item"}</span>
                    <span className="text-right">{detail.software ? "Seats" : "Qty"}</span>
                    <span className="text-right">{detail.service ? "Rate" : detail.software ? "Price / Seat" : "Unit Price"}</span>
                    <span className="text-right">Total</span>
                  </div>
                  {detail.lineItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border py-3 text-sm last:border-b-0">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-right text-muted-foreground">{item.qty}</span>
                      <span className="text-right text-muted-foreground">
                        {formatAmount(item.unitPrice)} {request.currency}
                      </span>
                      <span className="text-right font-semibold text-foreground">
                        {formatAmount(item.qty * item.unitPrice)} {request.currency}
                      </span>
                    </div>
                  ))}
                  {detail.software && (
                    <p className="pt-3 text-xs text-muted-foreground">
                      Billing cycle: {detail.software.billingCycle}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ── Documents ── */}
            <SectionHeader title="Documents" />
            <div className="py-4">
              {detail.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {detail.documents.map((doc, i) => {
                    const attached = doc.fileName !== "Awaiting upload"
                    const docStatus: DocumentStatus = doc.status ?? (attached ? "Uploaded" : "Missing")
                    const statusClass =
                      docStatus === "Uploaded"
                        ? "bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0]"
                        : docStatus === "Pending Review"
                          ? "bg-[#FEF6E8] text-[#B54708] border border-[#F1E4B5]"
                          : "bg-[#FEF3F2] text-[#B42318] border border-[#F3D6D2]"
                    return (
                      <li key={i} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {doc.label}
                              {doc.required && <span className="ml-1 text-destructive">*</span>}
                            </p>
                            <p className={cn("truncate text-xs", attached ? "text-muted-foreground" : "text-destructive")}>
                              {attached
                                ? `${doc.fileName}${doc.uploadedBy ? ` · ${doc.uploadedBy}` : ""}${doc.uploadDate ? ` · ${doc.uploadDate}` : ""}`
                                : doc.fileName}
                            </p>
                          </div>
                        </div>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", statusClass)}>
                          {docStatus}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* ── Activity History ── */}
            <SectionHeader title="Activity History" />
            <div className="py-4">
              <ol className="flex flex-col">
                {activityHistory.map((item, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i !== activityHistory.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-border" />
                    )}
                    <span className="relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="size-1.5 rounded-full bg-foreground/60" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">{item.action}</span>
                      <span className="text-xs text-muted-foreground">{item.user} · {item.at}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: sticky sidebar */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-16 lg:self-start">

            {/* Key Numbers card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Key Numbers
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">Requested amount</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                    {request.currency === "EUR"
                      ? `€${formatAmount(request.amount)}`
                      : `${formatAmount(request.amount)} ${request.currency}`}
                  </p>
                </div>
                {request.budgetTotal && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Budget used</span>
                      <span>
                        {request.currency === "EUR" ? "€" : ""}{formatAmount(request.amount)}{" "}
                        / {request.currency === "EUR" ? "€" : ""}{formatAmount(request.budgetTotal)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/60 transition-all"
                        style={{ width: `${Math.min(100, Math.round((request.amount / request.budgetTotal) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
                {request.quotes > 0 && (
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Supplier quotes</span>
                    <span className="font-semibold text-foreground">{request.quotes}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-semibold text-foreground">{request.department}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost center</span>
                  <span className="font-semibold text-foreground">{detail.costCenter}</span>
                </div>
              </div>
            </div>

            {/* Approval Flow */}
            <RequestApprovalFlow requestId={request.id} approvals={detail.approvals} />
          </div>
        </div>
      )}
    </div>
  )
}

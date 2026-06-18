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
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  initials,
  formatAmount,
  getRequestDetail,
  statusMeta,
  type ProcurementRequest,
  type RequestKind,
  type DocumentStatus,
} from "@/lib/dashboard-data"
import { ApprovedRequestActions } from "@/components/convert-to-competition-dialog"
import { RequestApprovalFlow } from "@/components/request-approval-flow"
import { RequestDiscussion } from "@/components/request-discussion"
import { useRequestActivity } from "@/lib/request-activity-store"
import { getApprovalTasks, formatWaiting } from "@/lib/approvals-data"

const kindIcon: Record<RequestKind, typeof Package> = {
  "Buy Product": Package,
  "Buy Service": Briefcase,
  "Add New Supplier": UserPlus,
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

function BannerItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
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

type RequestTab = "details" | "discussion"

export function RequestDetailView({ request }: { request: ProcurementRequest }) {
  const detail = getRequestDetail(request)
  const Icon = kindIcon[request.kind]
  const [tab, setTab] = useState<RequestTab>("details")
  const activity = useRequestActivity(request.id)

  // Approval Review Mode: entered from the Approvals page ("Review" action),
  // which links here with ?review=1. Decisions are only possible in this mode
  // and only while the request is still pending approval.
  const searchParams = useSearchParams()
  const canReview = searchParams.get("review") === "1" && request.status === "Pending Approval"
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "changes" | null>(null)

  // The live approval task that this request is currently sitting on. Drives the
  // Review banner context (step, assigned approver, due date, waiting time).
  const reviewTask = useMemo(() => {
    if (!canReview) return null
    return (
      getApprovalTasks().find(
        (t) => t.requestId === request.id && (t.taskStatus === "Awaiting Action" || t.taskStatus === "Changes Requested"),
      ) ?? null
    )
  }, [canReview, request.id])

  // Approver assigned to the current step (from the approval flow).
  const assignedApprover = reviewTask ? detail.approvals[reviewTask.stepNumber - 1]?.name ?? "—" : "—"

  // Everyone who can be @mentioned: the requester plus each named approver.
  const participants = useMemo(() => {
    const names = [request.requester, ...detail.approvals.map((a) => a.name)]
    return [...new Set(names)]
  }, [request.requester, detail.approvals])

  // Distinct approver names above the requester (skip step 1 / creator).
  const approvers = useMemo(() => {
    const names = detail.approvals.slice(1).map((a) => a.name).filter((n) => n !== request.requester)
    return [...new Set(names)]
  }, [detail.approvals, request.requester])

  const commentCount = activity.filter((a) => a.kind === "comment").length

  // Estimated total label, reused in the header and Financial Information.
  const estimatedTotalLabel = detail.supplierOnboarding
    ? detail.supplierOnboarding.expectedAnnualSpend
    : detail.estimatedTotal > 0
      ? `${formatAmount(detail.estimatedTotal)} ${request.currency}`
      : "No cost"

  // Request-only activity history (NOT comments, NOT approval decisions —
  // those live in the Discussion tab and Approval flow respectively).
  const activityHistory = useMemo(() => {
    const items: { action: string; user: string; at: string }[] = [
      { action: "Request Created", user: request.requester, at: request.date },
    ]
    if ((request.attachments ?? 0) > 0) {
      items.push({ action: "Documents Uploaded", user: request.requester, at: request.date })
    }
    if (request.status !== "Draft") {
      items.push({ action: "Submitted for Approval", user: request.requester, at: request.date })
    }
    // Resubmissions recorded in the activity store.
    for (const a of activity) {
      if (a.kind === "resubmitted") {
        items.push({ action: "Request Resubmitted", user: a.author, at: a.at })
      }
    }
    if (request.status === "Cancelled") {
      items.push({ action: "Request Withdrawn", user: request.requester, at: request.updated })
    }
    if (request.updated !== request.date) {
      items.push({ action: "Request Updated", user: request.requester, at: request.updated })
    }
    return items.sort((x, y) => x.at.localeCompare(y.at))
  }, [request, activity])

  const tabs = [
    { key: "details" as const, label: "Details", icon: ListChecks },
    { key: "discussion" as const, label: "Discussion", icon: MessageSquare, count: commentCount },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Approval Review Mode banner */}
      {canReview && (
        <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Gavel className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Approval Review</p>
                <p className="text-xs text-muted-foreground">
                  Make a decision below. Your action applies to the current approval step.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewAction("approve")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Check className="size-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewAction("changes")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <CornerUpLeft className="size-3.5" />
                Request changes
              </button>
              <button
                type="button"
                onClick={() => setReviewAction("reject")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
              >
                <X className="size-3.5" />
                Reject
              </button>
            </div>
          </div>

          {/* Approval context — the only approval-specific info shown here */}
          <div className="grid grid-cols-2 gap-4 border-t border-primary/20 pt-3 sm:grid-cols-4">
            <BannerItem
              label="Current Approval Step"
              value={
                reviewTask ? `Step ${reviewTask.stepNumber} of ${reviewTask.totalSteps} · ${reviewTask.stepRole}` : "—"
              }
            />
            <BannerItem label="Assigned Approver" value={assignedApprover} />
            <BannerItem label="Due Date" value={reviewTask?.deadline ?? "No due date"} />
            <BannerItem
              label="Waiting Time"
              value={reviewTask ? formatWaiting(reviewTask.activatedAt) : "—"}
            />
          </div>
        </div>
      )}

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
                statusMeta[request.status].badge,
              )}
            >
              <span className={cn("size-1.5 rounded-full", statusMeta[request.status].dot)} />
              {statusMeta[request.status].label}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-5 border-t border-border p-6 lg:grid-cols-3">
          <MetaItem label="Request ID" value={request.ref} />
          <MetaItem label="Department" value={request.department} />
          <MetaItem label="Cost center" value={detail.costCenter} />
          <MetaItem label="Business priority" value={detail.businessPriority} />
          <MetaItem label="Estimated total" value={estimatedTotalLabel} />
          {detail.product && <MetaItem label="Needed by" value={detail.product.neededBy} />}
          {detail.service && (
            <MetaItem
              label="Service dates"
              value={`${detail.service.serviceStartDate} → ${detail.service.serviceEndDate}`}
            />
          )}
          <MetaItem label="Created" value={request.date} />
          <MetaItem label="Last updated" value={request.updated} />
        </div>

        {request.status === "Approved" && request.kind !== "Add New Supplier" && (
          <ApprovedRequestActions request={request} />
        )}
      </Card>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((t) => {
          const TabIcon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
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

      {/* Discussion tab */}
      {tab === "discussion" && (
        <Card className="p-0">
          <div className="flex items-center gap-2.5 border-b border-border p-5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <MessageSquare className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Discussion</h2>
              <p className="text-xs text-muted-foreground">
                Internal thread for everyone on this request — comments, decisions, and @mentions.
              </p>
            </div>
          </div>
          <RequestDiscussion
            requestId={request.id}
            currentUser={request.requester}
            participants={participants}
            requestRef={request.ref}
            requestTitle={request.title}
            requester={request.requester}
            approvers={approvers}
          />
        </Card>
      )}

      {/* Two-column body */}
      {tab === "details" && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* General information — shown for every request type */}
          <SectionCard icon={FileText} iconClass="bg-accent text-accent-foreground" title="General Information">
            <div className="flex flex-col gap-3.5">
              <OverviewRow label="Description" value={detail.description} />
              <OverviewRow label="Procurement Category" value={request.category} />
              <OverviewRow label="Department" value={request.department} />
              <OverviewRow label="Cost Center" value={detail.costCenter} />
              <OverviewRow label="Business Priority" value={detail.businessPriority} />
              <OverviewRow label="Currency" value={request.currency} />
            </div>
          </SectionCard>

          {/* Type-specific information */}
          {detail.product && (
            <SectionCard icon={Package} iconClass="bg-chart-3/15 text-chart-3" title="Product Details">
              <div className="grid grid-cols-2 gap-y-4">
                <MetaItem label="Procurement Category" value={detail.product.procurementCategory} />
                <MetaItem label="Preferred Supplier" value={detail.product.preferredSupplier} />
                <MetaItem label="Needed By" value={detail.product.neededBy} />
                <MetaItem label="Delivery Location" value={detail.product.deliveryLocation} />
                <MetaItem label="Purchase Type" value={detail.product.purchaseType} />
              </div>
            </SectionCard>
          )}

          {detail.service && (
            <SectionCard icon={Briefcase} iconClass="bg-chart-1/15 text-chart-1" title="Service Details">
              <div className="grid grid-cols-2 gap-y-4">
                <MetaItem label="Procurement Category" value={detail.service.procurementCategory} />
                <MetaItem label="Preferred Supplier" value={detail.service.preferredSupplier} />
                <MetaItem label="Service Start Date" value={detail.service.serviceStartDate} />
                <MetaItem label="Service End Date" value={detail.service.serviceEndDate} />
                <MetaItem label="Business Owner" value={detail.service.businessOwner} />
                <MetaItem label="Contract Required" value={detail.service.contractRequired} />
                <MetaItem label="Service Type" value={detail.service.serviceType} />
              </div>
            </SectionCard>
          )}

          {detail.software && (
            <SectionCard icon={Monitor} iconClass="bg-chart-2/15 text-chart-2" title="Software Details">
              <div className="grid grid-cols-2 gap-y-4">
                <MetaItem label="Procurement Category" value={detail.software.procurementCategory} />
                <MetaItem label="Software Name" value={detail.software.softwareName} />
                <MetaItem label="Preferred Supplier" value={detail.software.preferredSupplier} />
                <MetaItem label="Business Owner" value={detail.software.businessOwner} />
                <MetaItem label="IT Owner" value={detail.software.itOwner} />
                <MetaItem label="Number of Users" value={detail.software.users} />
                <MetaItem label="Billing Cycle" value={detail.software.billingCycle} />
                <MetaItem label="Subscription Start" value={detail.software.subscriptionStart} />
                <MetaItem label="Subscription End" value={detail.software.subscriptionEnd} />
                <MetaItem label="Contract Duration" value={detail.software.contractDuration} />
                <MetaItem label="License Type" value={detail.software.licenseType} />
                <MetaItem label="Auto Renewal" value={detail.software.autoRenewal} />
              </div>
            </SectionCard>
          )}

          {detail.supplierOnboarding && (
            <>
              <SectionCard icon={Building2} iconClass="bg-chart-1/15 text-chart-1" title="Supplier Information">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="Legal Entity Name" value={detail.supplierOnboarding.legalName} />
                  <MetaItem label="Country" value={detail.supplierOnboarding.country} />
                  <MetaItem label="Registration Number" value={detail.supplierOnboarding.registrationNumber} />
                  <MetaItem label="VAT Number" value={detail.supplierOnboarding.vatNumber} />
                  <MetaItem label="Website" value={detail.supplierOnboarding.website} />
                  <MetaItem label="Contact Name" value={detail.supplierOnboarding.contactName} />
                  <MetaItem label="Contact Email" value={detail.supplierOnboarding.contactEmail} />
                  <MetaItem label="Supplier Category" value={detail.supplierOnboarding.supplierCategory} />
                  <MetaItem label="Expected Annual Spend" value={detail.supplierOnboarding.expectedAnnualSpend} />
                </div>
              </SectionCard>

              <SectionCard icon={Landmark} iconClass="bg-chart-2/15 text-chart-2" title="Finance">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="Payment Terms" value={detail.supplierOnboarding.paymentTerms} />
                  <MetaItem label="Invoicing Email" value={detail.supplierOnboarding.invoicingEmail} />
                </div>
              </SectionCard>

              <SectionCard icon={ShieldCheck} iconClass="bg-destructive/12 text-destructive" title="Compliance">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="VAT Verification Status" value={detail.supplierOnboarding.vatVerificationStatus} />
                  <MetaItem label="Risk Status" value={detail.supplierOnboarding.riskStatus} />
                </div>
              </SectionCard>
            </>
          )}

          {/* Data Protection — software only, conditional on personal data */}
          {detail.software && (
            <SectionCard
              icon={ShieldCheck}
              iconClass="bg-destructive/12 text-destructive"
              title="Data Protection"
            >
              <div className="grid grid-cols-2 gap-y-4">
                <MetaItem label="Personal Data Processed" value={detail.software.dataProcessing} />
                {detail.software.dataProcessing !== "No" && (
                  <>
                    <MetaItem label="Data Hosting Region" value={detail.software.hostingRegion} />
                    <MetaItem label="DPA Required" value={detail.software.dpaRequired} />
                  </>
                )}
              </div>
            </SectionCard>
          )}

          {/* Financial Information */}
          <SectionCard icon={Wallet} iconClass="bg-primary/12 text-primary" title="Financial Information">
            <div className="grid grid-cols-2 gap-y-4">
              {detail.supplierOnboarding ? (
                <>
                  <MetaItem label="Expected Annual Spend" value={detail.supplierOnboarding.expectedAnnualSpend} />
                  <MetaItem label="Currency" value={request.currency} />
                </>
              ) : detail.software ? (
                <>
                  <MetaItem label="One-Time Cost" value={`${formatAmount(0)} ${request.currency}`} />
                  <MetaItem label="Recurring Cost" value={estimatedTotalLabel} />
                  <MetaItem label="Annual Cost" value={estimatedTotalLabel} />
                  <MetaItem label="Currency" value={request.currency} />
                  <MetaItem label="Estimated Total" value={estimatedTotalLabel} />
                </>
              ) : detail.product ? (
                <>
                  <MetaItem label="Quantity" value={String(detail.lineItems.reduce((s, i) => s + i.qty, 0) || "—")} />
                  <MetaItem
                    label="Unit Price"
                    value={detail.lineItems[0] ? `${formatAmount(detail.lineItems[0].unitPrice)} ${request.currency}` : "—"}
                  />
                  <MetaItem label="Currency" value={request.currency} />
                  <MetaItem label="Estimated Total" value={estimatedTotalLabel} />
                </>
              ) : (
                <>
                  <MetaItem label="Currency" value={request.currency} />
                  <MetaItem label="Estimated Total" value={estimatedTotalLabel} />
                </>
              )}
            </div>
          </SectionCard>

          {/* Line Items — never for supplier onboarding */}
          {!detail.supplierOnboarding && detail.lineItems.length > 0 && (
            <SectionCard icon={Box} iconClass="bg-chart-3/15 text-chart-3" title="Line Items">
              <div className="flex flex-col">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{detail.service ? "Deliverable" : detail.software ? "License / Plan" : "Item"}</span>
                  <span className="text-right">{detail.software ? "Seats" : "Qty"}</span>
                  <span className="text-right">
                    {detail.service ? "Rate" : detail.software ? "Price / Seat" : "Unit Price"}
                  </span>
                  <span className="text-right">Line Total</span>
                </div>
                {detail.lineItems.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border py-3 text-sm last:border-b-0"
                  >
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
                  <p className="pt-2 text-xs text-muted-foreground">
                    Billing cycle: {detail.software.billingCycle}
                  </p>
                )}
              </div>
            </SectionCard>
          )}

          {/* Documents */}
          <SectionCard icon={FileText} iconClass="bg-chart-4/15 text-chart-4" title="Documents">
            {detail.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents attached.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {detail.documents.map((doc, i) => {
                  const attached = doc.fileName !== "Awaiting upload"
                  const status: DocumentStatus = doc.status ?? (attached ? "Uploaded" : "Missing")
                  const statusClass =
                    status === "Uploaded"
                      ? "bg-primary/10 text-primary"
                      : status === "Pending Review"
                        ? "bg-chart-2/15 text-chart-2"
                        : "bg-destructive/10 text-destructive"
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {doc.label}
                            {doc.required && <span className="ml-1 text-destructive">*</span>}
                          </p>
                          <p className={`truncate text-xs ${attached ? "text-muted-foreground" : "text-destructive"}`}>
                            {attached
                              ? `${doc.fileName}${doc.uploadedBy ? ` · ${doc.uploadedBy}` : ""}${doc.uploadDate ? ` · ${doc.uploadDate}` : ""}`
                              : doc.fileName}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                        {status}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>

          {/* Activity History — request lifecycle events only */}
          <SectionCard icon={History} iconClass="bg-secondary text-secondary-foreground" title="Activity History">
            <ol className="flex flex-col">
              {activityHistory.map((item, i) => (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i !== activityHistory.length - 1 && (
                    <span className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-border" />
                  )}
                  <span className="relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-foreground/60" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{item.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.user} · {item.at}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        {/* Right column — approval flow */}
        <RequestApprovalFlow
          requestId={request.id}
          approvals={detail.approvals}
          requestRef={request.ref}
          requestTitle={request.title}
          reviewMode={canReview}
          requestedAction={reviewAction}
          onActionHandled={() => setReviewAction(null)}
        />
      </div>
      )}
    </div>
  )
}

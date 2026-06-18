"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Package,
  Briefcase,
  UserPlus,
  FileText,
  Box,
  ClipboardList,
  X,
  Monitor,
  ShieldCheck,
  Building2,
  Landmark,
  Receipt,
  ListChecks,
  MessageSquare,
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
} from "@/lib/dashboard-data"
import { ApprovedRequestActions } from "@/components/convert-to-competition-dialog"
import { RequestApprovalFlow } from "@/components/request-approval-flow"
import { RequestDiscussion } from "@/components/request-discussion"
import { useRequestActivity } from "@/lib/request-activity-store"

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

type RequestTab = "details" | "discussion"

export function RequestDetailView({ request }: { request: ProcurementRequest }) {
  const detail = getRequestDetail(request)
  const Icon = kindIcon[request.kind]
  const [tab, setTab] = useState<RequestTab>("details")
  const activity = useRequestActivity(request.id)

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

  const tabs = [
    { key: "details" as const, label: "Details", icon: ListChecks },
    { key: "discussion" as const, label: "Discussion", icon: MessageSquare, count: commentCount },
  ]

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
          ) : detail.supplierOnboarding ? (
            <>
              <SectionCard icon={Building2} iconClass="bg-chart-1/15 text-chart-1" title="Company details">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="Legal name" value={detail.supplierOnboarding.legalName} />
                  <MetaItem label="Country" value={detail.supplierOnboarding.country} />
                  <MetaItem label="Registration no." value={detail.supplierOnboarding.registrationNumber} />
                  <MetaItem label="VAT number" value={detail.supplierOnboarding.vatNumber} />
                  <MetaItem label="Contact email" value={detail.supplierOnboarding.contactEmail} />
                </div>
              </SectionCard>

              <SectionCard icon={Landmark} iconClass="bg-chart-2/15 text-chart-2" title="Bank & payment">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="IBAN" value={detail.supplierOnboarding.iban} />
                  <MetaItem label="Payment terms" value={detail.supplierOnboarding.paymentTerms} />
                </div>
              </SectionCard>

              <SectionCard icon={Receipt} iconClass="bg-chart-4/15 text-chart-4" title="Tax & accounting">
                <div className="grid grid-cols-2 gap-y-4">
                  <MetaItem label="VAT treatment" value={detail.supplierOnboarding.vatTreatment} />
                  <MetaItem label="Supplier type" value={detail.supplierOnboarding.supplierType} />
                  <MetaItem label="Invoicing email" value={detail.supplierOnboarding.invoicingEmail} />
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

          <SectionCard icon={FileText} iconClass="bg-chart-4/15 text-chart-4" title="Documents">
            {detail.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents attached.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {detail.documents.map((doc, i) => {
                  const attached = doc.fileName !== "Awaiting upload"
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
                          <p
                            className={`truncate text-xs ${attached ? "text-muted-foreground" : "text-destructive"}`}
                          >
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          attached
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {attached ? "Attached" : "Missing"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Right column — approval flow */}
        <RequestApprovalFlow
          requestId={request.id}
          approvals={detail.approvals}
          requestRef={request.ref}
          requestTitle={request.title}
        />
      </div>
      )}
    </div>
  )
}

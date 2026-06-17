import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { CompetitionDetailView } from "@/components/competition-detail-view"
import { requestToCompetition, type CompetitionTerms } from "@/lib/competitions-data"
import { requests } from "@/lib/dashboard-data"

export function generateStaticParams() {
  // Only approved requests can be turned into a competition.
  return requests
    .filter((r) => r.status === "Approved")
    .map((r) => ({ rid: r.id }))
}

export default async function ConvertedCompetitionPage({
  params,
  searchParams,
}: {
  params: Promise<{ rid: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { rid } = await params
  const sp = await searchParams
  const request = requests.find((r) => r.id === rid && r.status === "Approved")
  if (!request) notFound()

  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const num = (v: string | string[] | undefined) => {
    const n = Number(str(v))
    return Number.isFinite(n) ? n : undefined
  }
  const terms: CompetitionTerms = {
    title: str(sp.title),
    category: str(sp.category),
    description: str(sp.description),
    requirements: str(sp.requirements),
    baseline: num(sp.baseline),
    deadlineInHours: num(sp.deadline) ?? null,
    invitedSuppliers: num(sp.invited),
  }

  const competition = requestToCompetition(request, terms)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[
              { label: "Competitions", href: "/competitions" },
              { label: competition.ref },
            ]}
            title={competition.title}
            description="New sourcing event — pre-filled from the approved request. Invite suppliers to start bidding."
          />

          {/* Auto-fill banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Converted from approved request {request.ref}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created from your competition terms and the approved budget. Suppliers can now start bidding.
                </p>
              </div>
            </div>
            <Link
              href={`/requests/${request.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              Back to request
            </Link>
          </div>

          <CompetitionDetailView competition={competition} />
        </main>
      </div>
    </div>
  )
}

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { CompetitionDetailView } from "@/components/competition-detail-view"
import { requestToCompetition } from "@/lib/competitions-data"
import { requests } from "@/lib/dashboard-data"

export function generateStaticParams() {
  // Only approved requests can be turned into a competition.
  return requests
    .filter((r) => r.status === "Approved")
    .map((r) => ({ rid: r.id }))
}

export default async function ConvertedCompetitionPage({
  params,
}: {
  params: Promise<{ rid: string }>
}) {
  const { rid } = await params
  const request = requests.find((r) => r.id === rid && r.status === "Approved")
  if (!request) notFound()

  const competition = requestToCompetition(request)

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
                  Title, category, owner, and approved budget were filled in automatically. Invite suppliers to begin collecting bids.
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

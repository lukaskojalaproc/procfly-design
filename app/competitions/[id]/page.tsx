import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { CompetitionDetailView } from "@/components/competition-detail-view"
import { OptionsMenu } from "@/components/options-menu"
import { competitions } from "@/lib/competitions-data"

export function generateStaticParams() {
  return competitions.map((c) => ({ id: c.id }))
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const competition = competitions.find((c) => c.id === id)
  if (!competition) notFound()

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
            description="Live sourcing event — track suppliers, proposals, and savings in real time."
            actions={<OptionsMenu />}
          />
          <CompetitionDetailView competition={competition} />
        </main>
      </div>
    </div>
  )
}

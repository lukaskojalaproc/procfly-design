import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { CompetitionsExplorer } from "@/components/competitions-explorer"
import { StartCompetitionButton } from "@/components/start-competition-button"
import { OptionsMenu } from "@/components/options-menu"

export default function CompetitionsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Competitions"
            title="Competitions"
            description="Run supplier competitions for approved requests and drive measurable savings."
            actions={
              <>
                <StartCompetitionButton />
                <OptionsMenu />
              </>
            }
          />
          <CompetitionsExplorer />
        </main>
      </div>
    </div>
  )
}

import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { ApprovalsExplorer } from "@/components/approvals-explorer"

export default function ApprovalsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Approvals"
            title="Approvals"
            description="Review and action approval steps assigned to you."
          />
          <ApprovalsExplorer />
        </main>
      </div>
    </div>
  )
}

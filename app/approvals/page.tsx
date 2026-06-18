import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { ApprovalsExplorer } from "@/components/approvals-explorer"
import { ApprovalsMenu } from "@/components/approvals-menu"

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
            description="Review and decide approval tasks assigned to you."
            actions={<ApprovalsMenu />}
          />
          <ApprovalsExplorer />
        </main>
      </div>
    </div>
  )
}

import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { RequestsExplorer } from "@/components/requests-explorer"

export default function RequestsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Requests"
            title="Requests"
            description="View, track, and manage purchase requests across your workspace."
          />
          <RequestsExplorer />
        </main>
      </div>
    </div>
  )
}

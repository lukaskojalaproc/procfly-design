import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { RequestList } from "@/components/request-list"
import { SideColumn } from "@/components/side-column"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader />
          <AnalyticsOverview />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RequestList />
            </div>
            <div className="xl:col-span-1">
              <SideColumn />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

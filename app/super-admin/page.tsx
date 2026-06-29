import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { SuperAdminView } from "@/components/super-admin-view"

export default function SuperAdminPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Super Admin"
            title="Super Admin"
            description="Manage companies, access, and public API keys."
          />
          <SuperAdminView />
        </main>
      </div>
    </div>
  )
}

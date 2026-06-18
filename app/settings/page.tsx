import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { SettingsView } from "@/components/settings-view"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Settings"
            title="Settings"
            description="Manage your organization settings, users, and procurement configuration."
          />
          <SettingsView />
        </main>
      </div>
    </div>
  )
}

import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { WarehouseExplorer } from "@/components/warehouse-explorer"
import { CreateItemButton } from "@/components/create-item-button"

export default function WarehousePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Warehouse"
            title="Warehouse"
            description="Browse, search, and manage your company's inventory."
            actions={<CreateItemButton />}
          />
          <WarehouseExplorer />
        </main>
      </div>
    </div>
  )
}

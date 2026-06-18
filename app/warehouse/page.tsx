import { Plus } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { WarehouseExplorer } from "@/components/warehouse-explorer"

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
            actions={
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                <Plus className="size-4" />
                Add Item
              </button>
            }
          />
          <WarehouseExplorer />
        </main>
      </div>
    </div>
  )
}

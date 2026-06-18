import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { SuppliersExplorer } from "@/components/suppliers-explorer"
import { CreateSupplierButton } from "@/components/create-supplier-button"

export default function SuppliersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Suppliers"
            title="Suppliers"
            description="Your supplier base — onboarding, risk, spend, and linked procurement records."
            actions={<CreateSupplierButton />}
          />
          <SuppliersExplorer />
        </main>
      </div>
    </div>
  )
}

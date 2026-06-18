import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { OrdersExplorer } from "@/components/orders-explorer"
import { CreatePurchaseOrderButton } from "@/components/create-purchase-order-button"

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Orders"
            title="Purchase orders"
            description="Issued orders to your suppliers — track drafts, deliveries, and spend."
            actions={<CreatePurchaseOrderButton />}
          />
          <OrdersExplorer />
        </main>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { OrdersExplorer } from "@/components/orders-explorer"

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
            actions={
              <Link
                href="/requests"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="size-4" />
                Create Purchase Order
              </Link>
            }
          />
          <OrdersExplorer />
        </main>
      </div>
    </div>
  )
}

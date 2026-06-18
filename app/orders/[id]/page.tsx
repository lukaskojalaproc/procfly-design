import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { OrderDetailView } from "@/components/order-detail-view"
import { OptionsMenu } from "@/components/options-menu"
import { purchaseOrders, getOrderById } from "@/lib/orders-data"

export function generateStaticParams() {
  return purchaseOrders.map((o) => ({ id: o.id }))
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = getOrderById(id)
  if (!order) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[{ label: "Orders", href: "/orders" }, { label: order.number }]}
            title={order.number}
            description="Purchase order detail — supplier, line items, delivery, and status."
            actions={<OptionsMenu />}
          />
          <OrderDetailView po={order} />
        </main>
      </div>
    </div>
  )
}

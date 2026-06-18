import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { ItemDetailView } from "@/components/item-detail-view"
import { OptionsMenu } from "@/components/options-menu"
import { inventoryItems, getItemById } from "@/lib/warehouse-data"

export function generateStaticParams() {
  return inventoryItems.map((i) => ({ id: i.id }))
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = getItemById(id)
  if (!item) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[{ label: "Warehouse", href: "/warehouse" }, { label: item.name }]}
            title={item.name}
            description="Item detail — overview, stock levels, supplier, financials, and movement history."
            actions={<OptionsMenu />}
          />
          <ItemDetailView item={item} />
        </main>
      </div>
    </div>
  )
}

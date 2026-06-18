import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { SupplierDetailView } from "@/components/supplier-detail-view"
import { OptionsMenu } from "@/components/options-menu"
import { suppliers, getSupplierById } from "@/lib/suppliers-data"

export function generateStaticParams() {
  return suppliers.map((s) => ({ id: s.id }))
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supplier = getSupplierById(id)
  if (!supplier) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[{ label: "Suppliers", href: "/suppliers" }, { label: supplier.name }]}
            title={supplier.name}
            description="Supplier detail — overview, performance, documents, and linked procurement records."
            actions={<OptionsMenu />}
          />
          <SupplierDetailView supplier={supplier} />
        </main>
      </div>
    </div>
  )
}

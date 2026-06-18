import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { ContractDetailView } from "@/components/contract-detail-view"
import { OptionsMenu } from "@/components/options-menu"
import { contracts, getContractById } from "@/lib/contracts-data"

export function generateStaticParams() {
  return contracts.map((c) => ({ id: c.id }))
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contract = getContractById(id)
  if (!contract) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[{ label: "Contracts", href: "/contracts" }, { label: contract.number }]}
            title={contract.name}
            description="Contract detail — terms, dates, renewal, linked records, and documents."
            actions={<OptionsMenu />}
          />
          <ContractDetailView contract={contract} />
        </main>
      </div>
    </div>
  )
}

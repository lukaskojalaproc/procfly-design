import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { ContractsExplorer } from "@/components/contracts-explorer"
import { CreateContractButton } from "@/components/create-contract-button"

export default function ContractsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumb="Contracts"
            title="Contracts"
            description="Signed supplier agreements — track renewals, expiry, and obligations."
            actions={<CreateContractButton />}
          />
          <ContractsExplorer />
        </main>
      </div>
    </div>
  )
}

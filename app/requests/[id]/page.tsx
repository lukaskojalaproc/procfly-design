import { notFound } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { RequestDetailView } from "@/components/request-detail-view"
import { getRequestById } from "@/lib/dashboard-data"

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const request = getRequestById(id)

  if (!request) {
    notFound()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[{ label: "Requests", href: "/requests" }, { label: "Details" }]}
            title="Request Details"
            description="View the full details and approval progress of this request."
            actions={<></>}
          />
          <RequestDetailView request={request} />
        </main>
      </div>
    </div>
  )
}

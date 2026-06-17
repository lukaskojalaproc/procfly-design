import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { TopBar, PageHeader } from "@/components/top-bar"
import { OrderDetailView } from "@/components/order-detail-view"
import { competitions } from "@/lib/competitions-data"
import { competitionToPurchaseOrder } from "@/lib/orders-data"

export function generateStaticParams() {
  return competitions.map((c) => ({ cid: c.id }))
}

export default async function ConvertedOrderPage({
  params,
}: {
  params: Promise<{ cid: string }>
}) {
  const { cid } = await params
  const competition = competitions.find((c) => c.id === cid)
  if (!competition) notFound()

  const order = competitionToPurchaseOrder(competition)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <PageHeader
            crumbs={[{ label: "Orders", href: "/orders" }, { label: order.number }]}
            title={order.number}
            description="Auto-generated purchase order — pre-filled from the awarded competition."
          />

          {/* Auto-fill banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Converted from competition {competition.ref}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supplier, line items, and pricing were filled in automatically. Review, then send to the supplier.
                </p>
              </div>
            </div>
            <Link
              href={`/competitions/${competition.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              Back to competition
            </Link>
          </div>

          <OrderDetailView po={order} />
        </main>
      </div>
    </div>
  )
}

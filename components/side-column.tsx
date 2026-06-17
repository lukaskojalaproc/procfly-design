import { Inbox } from "lucide-react"
import { Card } from "@/components/ui/card"
import { recentActivity } from "@/lib/dashboard-data"

export function SideColumn() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Needs Attention</h2>
          <button className="text-sm font-semibold text-primary hover:underline">View all</button>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">No approvals waiting for you</p>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold text-foreground">Recent Activity</h2>
        <ol className="flex flex-col gap-4">
          {recentActivity.map((item, i) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
                {i < recentActivity.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-1">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}

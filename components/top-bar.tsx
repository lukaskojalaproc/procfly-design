import { Search, Globe, LogOut, ChevronRight } from "lucide-react"
import Link from "next/link"
import { NewRequestDialog } from "@/components/new-request-dialog"
import { NotificationBell } from "@/components/notification-bell"
import { OptionsMenu } from "@/components/options-menu"
import { cn } from "@/lib/utils"

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search requests, suppliers, approvals..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <button className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted">
        <Globe className="size-4" />
        English
      </button>
      <NotificationBell />
      <button
        className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
        aria-label="Log out"
      >
        <LogOut className="size-4" />
      </button>
    </header>
  )
}

export function PageHeader({
  crumb = "Overview",
  crumbs,
  title = "Overview",
  description = "Manage procurement requests, approvals, and suppliers in one place.",
  actions,
}: {
  crumb?: string
  crumbs?: { label: string; href?: string }[]
  title?: string
  description?: string
  /** Overrides the default header actions (New Request + options menu). */
  actions?: React.ReactNode
}) {
  const trail = crumbs ?? [{ label: crumb }]
  return (
    <div className="flex flex-col gap-4">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1
          return (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" />
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && "font-medium text-foreground")}>{item.label}</span>
              )}
            </span>
          )
        })}
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions ?? (
            <>
              <NewRequestDialog />
              <OptionsMenu />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

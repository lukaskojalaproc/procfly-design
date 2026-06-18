"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { NewRequestDialog } from "@/components/new-request-dialog"
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  CheckSquare,
  Trophy,
  ShoppingCart,
  FileSignature,
  Network,
  Warehouse,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const primaryNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Requests", icon: FileText, href: "/requests" },
]

const secondaryNav = [
  { label: "Approvals", icon: CheckSquare, href: "/approvals" },
  { label: "Competitions", icon: Trophy, href: "/competitions" },
  { label: "Orders", icon: ShoppingCart, href: "/orders" },
]

const tertiaryNav = [
  { label: "Contracts", icon: FileSignature, href: "/contracts" },
  { label: "Suppliers", icon: Network, href: "/requests" },
  { label: "Warehouse", icon: Warehouse, href: "/requests" },
]

function NavItem({
  label,
  icon: Icon,
  href,
  active,
}: {
  label: string
  icon: typeof LayoutDashboard
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="text-2xl font-bold tracking-tight text-sidebar-foreground">
          Procfly
        </span>
        <Menu className="size-5 text-sidebar-foreground/80" />
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
        <div className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <NavItem key={item.label} {...item} active={isActive(item.href)} />
          ))}
          <button
            type="button"
            onClick={() => setNewRequestOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <FilePlus2 className="size-5 shrink-0" />
            <span>New Request</span>
          </button>
          <NewRequestDialog open={newRequestOpen} onOpenChange={setNewRequestOpen} hideTrigger />
        </div>
        <div className="flex flex-col gap-1">
          {secondaryNav.map((item) => (
            <NavItem key={item.label} {...item} active={isActive(item.href)} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {tertiaryNav.map((item) => (
            <NavItem key={item.label} {...item} active={isActive(item.href)} />
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <NavItem label="Settings" icon={Settings} href="/requests" />
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent">
          <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
            PF
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              ProcFly Demo Workspace
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">Select Workspace</p>
          </div>
          <ChevronDown className="size-4 text-sidebar-foreground/70" />
        </button>
      </div>
    </aside>
  )
}

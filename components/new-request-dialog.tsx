"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Briefcase,
  Monitor,
  UserPlus,
  FileText,
  ClipboardCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CategoryId = "product" | "service" | "software" | "supplier"

const categories: {
  id: CategoryId
  title: string
  subtitle: string
  icon: typeof Package
  iconClass: string
}[] = [
  {
    id: "product",
    title: "Buy Product",
    subtitle: "Physical goods or hardware",
    icon: Package,
    iconClass: "bg-primary/12 text-primary",
  },
  {
    id: "service",
    title: "Buy Service",
    subtitle: "Consulting or service",
    icon: Briefcase,
    iconClass: "bg-chart-3/12 text-chart-3",
  },
  {
    id: "software",
    title: "Buy Software",
    subtitle: "SaaS or License",
    icon: Monitor,
    iconClass: "bg-chart-2/15 text-chart-2",
  },
  {
    id: "supplier",
    title: "Add New Supplier",
    subtitle: "Onboard a new vendor",
    icon: UserPlus,
    iconClass: "bg-destructive/12 text-destructive",
  },
]

const steps = [
  { id: "category", label: "Category", icon: Check },
  { id: "details", label: "Details", icon: FileText },
  { id: "review", label: "Review", icon: ClipboardCheck },
] as const

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i < current
        const active = i === current
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors",
                  done || active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function NewRequestDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [department, setDepartment] = useState("")
  const [description, setDescription] = useState("")

  const selectedCategory = categories.find((c) => c.id === category)

  function reset() {
    setStep(0)
    setCategory(null)
    setTitle("")
    setAmount("")
    setDepartment("")
    setDescription("")
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  const canContinue =
    (step === 0 && category !== null) ||
    (step === 1 && title.trim() !== "") ||
    step === 2

  function next() {
    if (step < 2) setStep((s) => s + 1)
    else handleOpenChange(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Plus className="size-4" />
        New Request
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-lg font-bold">
              {step === 0 && "What would you like to request?"}
              {step === 1 && "Tell us the details"}
              {step === 2 && "Review your request"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5">
            <Stepper current={step} />
          </div>

          <div className="px-6 pb-2">
            {step === 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((c) => {
                  const Icon = c.icon
                  const selected = category === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-lg",
                          c.iconClass,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">{c.title}</span>
                        <span className="block text-sm text-muted-foreground">{c.subtitle}</span>
                      </span>
                      {selected && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="req-title">Request title</Label>
                  <input
                    id="req-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Standing desks for new hires"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="req-amount">Estimated amount (EUR)</Label>
                    <input
                      id="req-amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      inputMode="numeric"
                      placeholder="0"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="req-dept">Department</Label>
                    <input
                      id="req-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. IT, Marketing"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="req-desc">Description</Label>
                  <Textarea
                    id="req-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any details to help approvers decide..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <ReviewRow label="Category" value={selectedCategory?.title ?? "—"} />
                <ReviewRow label="Title" value={title || "—"} />
                <ReviewRow
                  label="Estimated amount"
                  value={amount ? `${Number(amount).toLocaleString("en-US")} EUR` : "No cost"}
                />
                <ReviewRow label="Department" value={department || "—"} />
                <ReviewRow label="Description" value={description || "—"} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              onClick={() => (step === 0 ? handleOpenChange(false) : setStep((s) => s - 1))}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={next}
              disabled={!canContinue}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === 2 ? "Submit request" : "Next"}
              {step !== 2 && <ChevronRight className="size-4" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

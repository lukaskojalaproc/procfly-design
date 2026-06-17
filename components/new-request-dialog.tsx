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
  Layers,
  Settings2,
  ListChecks,
  Trash2,
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
  { id: "category", label: "Category", icon: Package },
  { id: "details", label: "Details", icon: FileText },
  { id: "review", label: "Review", icon: ClipboardCheck },
] as const

const departments = ["IT", "Operations", "Marketing", "Finance", "Facilities", "Legal"]
const costCenters = ["CC-100 · Headquarters", "CC-200 · Sales", "CC-300 · R&D", "CC-400 · Logistics"]
const suppliers = ["ProcFly Logistics", "Office Supplies Baltics", "TechWare Solutions", "Nordic Consulting"]
const priorities = ["Low", "Medium", "High", "Critical"]

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"

interface LineItem {
  id: number
  name: string
  qty: string
  price: string
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i < current
        const active = i === current
        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold transition-colors",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-all duration-300",
                    done ? "w-full" : "w-0",
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Section({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  children,
}: {
  icon: typeof Package
  iconClass: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  )
}

export function NewRequestDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState<CategoryId | null>(null)

  // General
  const [department, setDepartment] = useState("")
  const [costCenter, setCostCenter] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("EUR")

  // Specific
  const [supplier, setSupplier] = useState("")
  const [neededBy, setNeededBy] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")

  // Custom
  const [productName, setProductName] = useState("")
  const [priority, setPriority] = useState("Medium")

  // Line items
  const [lines, setLines] = useState<LineItem[]>([{ id: 1, name: "", qty: "", price: "" }])

  const selectedCategory = categories.find((c) => c.id === category)

  const filledLines = lines.filter((l) => l.name.trim() !== "")
  const lineItemsTotal = filledLines.reduce(
    (sum, l) => sum + (Number(l.qty) || 0) * (Number(l.price) || 0),
    0,
  )
  const reviewTotal = Number(amount) || lineItemsTotal
  const fmt = (n: number) => n.toLocaleString("en-US")

  function reset() {
    setStep(0)
    setCategory(null)
    setDepartment("")
    setCostCenter("")
    setDescription("")
    setAmount("")
    setCurrency("EUR")
    setSupplier("")
    setNeededBy("")
    setDeliveryAddress("")
    setProductName("")
    setPriority("Medium")
    setLines([{ id: 1, name: "", qty: "", price: "" }])
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  function updateLine(id: number, key: keyof LineItem, value: string) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, { id: Date.now(), name: "", qty: "", price: "" }])
  }
  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev))
  }

  const canContinue =
    (step === 0 && category !== null) ||
    (step === 1 && department.trim() !== "" && description.trim() !== "") ||
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
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 px-6 pb-5 pt-6">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {step === 0 && "What would you like to request?"}
              {step === 1 && "Create a purchase request"}
              {step === 2 && "Review Request"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {step === 0 && "Choose a category to get started. Three quick steps to send for approval."}
              {step === 1 && "Fill in the details below. Required fields are marked with an asterisk."}
              {step === 2 && "Make sure everything looks right before submitting."}
            </p>
          </DialogHeader>

          <div className="shrink-0 bg-muted/40 px-6 py-5">
            <Stepper current={step} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
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
                        "group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
                          c.iconClass,
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1 pr-5">
                        <span className="block font-semibold text-foreground">{c.title}</span>
                        <span className="block text-sm leading-snug text-muted-foreground">
                          {c.subtitle}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full transition-all duration-200",
                          selected
                            ? "scale-100 bg-primary text-primary-foreground opacity-100"
                            : "scale-75 opacity-0",
                        )}
                      >
                        <Check className="size-3.5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <Section
                  icon={Layers}
                  iconClass="bg-primary/12 text-primary"
                  title="General"
                  subtitle="Department, cost center, and the basics of your request."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Department" required>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose department...</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cost center" required>
                      <select
                        value={costCenter}
                        onChange={(e) => setCostCenter(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose cost center...</option>
                        {costCenters.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <input
                        readOnly
                        value={selectedCategory?.title ?? ""}
                        className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
                      />
                    </Field>
                    <Field label="Description" required>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a short description"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Total amount">
                      <div className="relative">
                        <input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          inputMode="numeric"
                          placeholder="20.000"
                          className={cn(fieldClass, "pr-12")}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          {currency}
                        </span>
                      </div>
                    </Field>
                    <Field label="Currency">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={fieldClass}
                      >
                        {["EUR", "USD", "GBP", "PLN"].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Section>

                <Section
                  icon={Package}
                  iconClass="bg-chart-2/15 text-chart-2"
                  title="Specific"
                  subtitle="Details specific to this request category."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Supplier" required>
                      <select
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className={fieldClass}
                      >
                        <option value="">Choose supplier...</option>
                        {suppliers.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Needed by">
                      <input
                        type="date"
                        value={neededBy}
                        onChange={(e) => setNeededBy(e.target.value)}
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Delivery address">
                      <input
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="42077 Main Road, New Braunfels 66853-8101"
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section
                  icon={Settings2}
                  iconClass="bg-chart-3/12 text-chart-3"
                  title="Custom Fields"
                  subtitle="Additional information required for this request type."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Product Name" required>
                      <input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="iPhone 15 Pro"
                        className={fieldClass}
                      />
                    </Field>
                    <Field label="Business Priority" required>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className={fieldClass}
                      >
                        {priorities.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Section>

                <Section
                  icon={ListChecks}
                  iconClass="bg-primary/12 text-primary"
                  title="Line-items"
                  subtitle="Add one line for each item. Filled line items will be sent to the backend."
                >
                  <div className="flex flex-col gap-3">
                    <div className="hidden grid-cols-[1fr_90px_120px_40px] gap-3 px-1 text-xs font-medium text-muted-foreground sm:grid">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Unit price</span>
                      <span className="sr-only">Remove</span>
                    </div>
                    {lines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_90px_120px_40px] sm:items-center"
                      >
                        <input
                          value={line.name}
                          onChange={(e) => updateLine(line.id, "name", e.target.value)}
                          placeholder="Item description"
                          className={fieldClass}
                        />
                        <input
                          value={line.qty}
                          onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                          inputMode="numeric"
                          placeholder="1"
                          className={fieldClass}
                        />
                        <input
                          value={line.price}
                          onChange={(e) => updateLine(line.id, "price", e.target.value)}
                          inputMode="numeric"
                          placeholder="0.00"
                          className={fieldClass}
                        />
                        <button
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length === 1}
                          aria-label="Remove line"
                          className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addLine}
                      className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <Plus className="size-4" />
                      Add Line
                    </button>
                  </div>
                </Section>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                {/* Summary card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                    <div className="flex items-center gap-3">
                      {selectedCategory && (
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-lg",
                            selectedCategory.iconClass,
                          )}
                        >
                          <selectedCategory.icon className="size-5" />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {selectedCategory?.title ?? "Request"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Amount
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 p-5 sm:grid-cols-4">
                    <MetaCell label="Department" value={department || "Not provided"} />
                    <MetaCell label="Cost center" value={costCenter || "Not provided"} />
                    <MetaCell label="Supplier" value={supplier || "Not provided"} />
                    <MetaCell
                      label="Needed by"
                      value={neededBy ? new Date(neededBy).toLocaleDateString("en-GB") : "Not provided"}
                    />
                  </div>
                </div>

                {/* Line items card */}
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="border-b border-border p-5">
                    <h3 className="font-semibold text-foreground">Supplier, Budget &amp; Specifications</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 text-left font-semibold">Product name</th>
                          <th className="px-5 py-3 text-center font-semibold">Quantity</th>
                          <th className="px-5 py-3 text-right font-semibold">Unit price</th>
                          <th className="px-5 py-3 text-right font-semibold">Total price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filledLines.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                              No line items added.
                            </td>
                          </tr>
                        ) : (
                          filledLines.map((l) => {
                            const qty = Number(l.qty) || 0
                            const price = Number(l.price) || 0
                            return (
                              <tr key={l.id}>
                                <td className="px-5 py-3 font-medium text-foreground">{l.name}</td>
                                <td className="px-5 py-3 text-center text-muted-foreground">{qty || "—"}</td>
                                <td className="px-5 py-3 text-right text-muted-foreground">
                                  {price ? `${fmt(price)} ${currency}` : "—"}
                                </td>
                                <td className="px-5 py-3 text-right font-semibold text-foreground">
                                  {qty && price ? `${fmt(qty * price)} ${currency}` : "—"}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/40">
                          <td
                            colSpan={3}
                            className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Amount
                          </td>
                          <td className="px-5 py-3 text-right text-base font-bold text-foreground">
                            {reviewTotal ? `${fmt(reviewTotal)} ${currency}` : "No cost"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
            {step === 2 ? (
              <button
                onClick={() => handleOpenChange(false)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <FileText className="size-4" />
                Save draft
              </button>
            ) : (
              <button
                onClick={() => (step === 0 ? handleOpenChange(false) : setStep((s) => s - 1))}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
                {step === 0 ? "Cancel" : "Back"}
              </button>
            )}
            <div className="flex items-center gap-3">
              {step === 2 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
              ) : (
                <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                  Step {step + 1} of {steps.length}
                </span>
              )}
              <button
                onClick={next}
                disabled={!canContinue}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === 2 ? "Create" : "Next"}
                {step !== 2 && <ChevronRight className="size-4" />}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

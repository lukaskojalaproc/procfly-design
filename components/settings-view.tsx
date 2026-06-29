"use client"

import { useState } from "react"
import { Plus, X, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  settingsTabs,
  generalConfig,
  settingsBadgeClass,
  currencies,
  countries,
  timeZones,
  months,
  people,
  type GeneralConfig,
  type TabConfig,
  type ColumnDef,
  type SettingsRow,
} from "@/lib/settings-data"
const ALL_TABS = [
  { id: "general", label: "General" },
  ...settingsTabs.map((t) => ({ id: t.id, label: t.label })),
]

export function SettingsView() {
  const [active, setActive] = useState("general")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tab navigation */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border">
        {ALL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative px-3 py-2.5 text-sm font-medium transition-colors",
              active === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {active === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {active === "general" ? (
        <GeneralTab />
      ) : (
        <TableTab config={settingsTabs.find((t) => t.id === active)!} key={active} />
      )}

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <Check className="size-4" /> All changes saved
          </span>
        )}
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Save
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// General tab — organization configuration form
// ---------------------------------------------------------------------------

function GeneralTab() {
  const [cfg, setCfg] = useState<GeneralConfig>(generalConfig)
  const set = <K extends keyof GeneralConfig>(key: K, value: GeneralConfig[K]) =>
    setCfg((c) => ({ ...c, [key]: value }))

  return (
    <div className="flex flex-col gap-5">
      <Card title="Organization" description="Company identity and registration details.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <TextField label="Company Name" value={cfg.companyName} onChange={(v) => set("companyName", v)} />
          <TextField
            label="Company Registration Number"
            value={cfg.registrationNumber}
            onChange={(v) => set("registrationNumber", v)}
          />
          <TextField label="VAT Number" value={cfg.vatNumber} onChange={(v) => set("vatNumber", v)} />
          <SelectField label="Country" value={cfg.country} options={countries} onChange={(v) => set("country", v)} />
          <SelectField
            label="Default Currency"
            value={cfg.defaultCurrency}
            options={currencies}
            onChange={(v) => set("defaultCurrency", v)}
          />
          <SelectField label="Time Zone" value={cfg.timeZone} options={timeZones} onChange={(v) => set("timeZone", v)} />
          <SelectField
            label="Fiscal Year Start"
            value={cfg.fiscalYearStart}
            options={months}
            onChange={(v) => set("fiscalYearStart", v)}
          />
          <SelectField label="CEO" value={cfg.ceo} options={people} onChange={(v) => set("ceo", v)} />
        </div>
      </Card>

      <Card title="Approval thresholds" description="Spend limits that drive approvals, competitions, and contracts.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <NumberField
            label="CEO Approval Threshold"
            required
            value={cfg.ceoApprovalThreshold}
            onChange={(v) => set("ceoApprovalThreshold", v)}
          />
          <NumberField
            label="High Value Threshold"
            value={cfg.highValueThreshold}
            onChange={(v) => set("highValueThreshold", v)}
          />
          <NumberField
            label="Competition Required Threshold"
            value={cfg.competitionRequiredThreshold}
            onChange={(v) => set("competitionRequiredThreshold", v)}
          />
          <NumberField
            label="Contract Required Threshold"
            value={cfg.contractRequiredThreshold}
            onChange={(v) => set("contractRequiredThreshold", v)}
          />
          <NumberField
            label="Minimum Supplier Count for Competition"
            value={cfg.minimumSupplierCount}
            onChange={(v) => set("minimumSupplierCount", v)}
          />
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Generic table tab — list of records with inline add form
// ---------------------------------------------------------------------------

function TableTab({ config }: { config: TabConfig }) {
  const [rows, setRows] = useState<SettingsRow[]>(config.rows)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<SettingsRow>(emptyDraft(config.columns))

  function addRow() {
    setRows((r) => [...r, draft])
    setDraft(emptyDraft(config.columns))
    setAdding(false)
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index))
  }

  return (
    <Card
      title={config.title}
      description={config.description}
      action={
        !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Add {config.entity}
          </button>
        )
      }
    >
      {/* Inline add form */}
      {adding && (
        <div className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold capitalize text-foreground">New {config.entity}</h3>
            <button
              onClick={() => setAdding(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cancel"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.columns.map((col) => (
              <DraftField
                key={col.key}
                col={col}
                value={draft[col.key]}
                onChange={(v) => setDraft((d) => ({ ...d, [col.key]: v }))}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Add {config.entity}
            </button>
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                {config.columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-3 py-3 text-foreground">
                    {col.badge ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          settingsBadgeClass(String(row[col.key])),
                        )}
                      >
                        {row[col.key]}
                      </span>
                    ) : (
                      formatCell(row[col.key], col)
                    )}
                  </td>
                ))}
                <td className="px-3 py-3">
                  <button
                    onClick={() => removeRow(i)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No {config.entity}s yet. Use the button above to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function Card({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel label={label} />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="po-input" />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  required?: boolean
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="po-input"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="po-input appearance-none">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function DraftField({
  col,
  value,
  onChange,
}: {
  col: ColumnDef
  value: string | number
  onChange: (v: string | number) => void
}) {
  if (col.type === "select") {
    return (
      <div>
        <FieldLabel label={col.label} />
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="po-input appearance-none"
        >
          <option value="">Select…</option>
          {(col.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    )
  }
  const isNum = col.type === "number" || col.type === "currency"
  return (
    <div>
      <FieldLabel label={col.label} />
      <input
        type={isNum ? "number" : "text"}
        value={value === "" ? "" : value}
        placeholder={col.placeholder}
        onChange={(e) => onChange(isNum ? Number(e.target.value) : e.target.value)}
        className="po-input"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyDraft(columns: ColumnDef[]): SettingsRow {
  const d: SettingsRow = {}
  for (const c of columns) d[c.key] = c.type === "number" || c.type === "currency" ? 0 : ""
  return d
}

function formatCell(value: string | number, col: ColumnDef): string {
  if (value === "" || value === undefined || value === null) return "—"
  if (col.type === "currency") {
    return Number(value).toLocaleString("en-US")
  }
  if (col.suffix) return `${value} ${col.suffix}`
  return String(value)
}

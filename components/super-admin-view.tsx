"use client"

import { useState } from "react"
import { Search, RefreshCw, Key, Trash2, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CompanyStatus = "Active" | "Suspended" | "Trial" | "Inactive"
type AccessRole = "SuperAdmin" | "Admin" | "Member" | "Viewer"

interface Company {
  id: string
  name: string
  prefix: string
  registrationCode: string
  status: CompanyStatus
  yourAccess: AccessRole | null
}

interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string[]
  expiresAt: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_COMPANIES: Company[] = [
  { id: "c1", name: "Procfly DEMO",          prefix: "PFCDE", registrationCode: "123123",           status: "Active",    yourAccess: null },
  { id: "c2", name: "ProcFly Demo Workspace", prefix: "PRC",   registrationCode: "PROCFLOW-DEMO-001", status: "Active",    yourAccess: "SuperAdmin" },
  { id: "c3", name: "Baltics Logistics UAB",  prefix: "BLU",   registrationCode: "303145211",         status: "Trial",     yourAccess: null },
  { id: "c4", name: "TechFlow Solutions",      prefix: "TFS",   registrationCode: "401882934",         status: "Suspended", yourAccess: "Admin" },
]

const MOCK_KEYS: ApiKey[] = [
  { id: "k1", name: "Production Integration", prefix: "pk_live_xxxx", scopes: ["items:read", "items:write"], expiresAt: "2027-06-30", createdAt: "2026-01-15" },
  { id: "k2", name: "Read-only Reporting",     prefix: "pk_live_yyyy", scopes: ["items:read"],                expiresAt: null,          createdAt: "2026-03-01" },
]

const pill = "inline-flex w-fit items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold"
const STATUS_PILL: Record<CompanyStatus, string> = {
  Active:    `${pill} text-[#166534]`,
  Trial:     `${pill} text-[#92400e]`,
  Suspended: `${pill} text-[#dc2626]`,
  Inactive:  `${pill} text-[#64748B]`,
}

const SCOPES = ["items:read", "items:write", "suppliers:read", "suppliers:write", "contracts:read", "approvals:read"]

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function SuperAdminView() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_KEYS)
  const [selectedId, setSelectedId] = useState<string>("c1")
  const [search, setSearch] = useState("")

  // Create company form
  const [newCo, setNewCo] = useState({ name: "", prefix: "", currency: "EUR", timezone: "Europe/Vilnius", regCode: "", vat: "" })

  // Selected company panels
  const [statusDraft, setStatusDraft] = useState<CompanyStatus>("Active")
  const [roleDraft, setRoleDraft] = useState<AccessRole>("SuperAdmin")

  // API key form
  const [keyName, setKeyName] = useState("")
  const [keyExpiry, setKeyExpiry] = useState("")
  const [keyScopes, setKeyScopes] = useState<string[]>(["items:read", "items:write"])
  const [copied, setCopied] = useState<string | null>(null)

  const selected = companies.find((c) => c.id === selectedId) ?? companies[0]
  const filtered = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.prefix.toLowerCase().includes(search.toLowerCase()),
  )

  function createCompany() {
    if (!newCo.name || !newCo.prefix) return
    const company: Company = {
      id: `c${Date.now()}`,
      name: newCo.name,
      prefix: newCo.prefix.toUpperCase(),
      registrationCode: newCo.regCode || "—",
      status: "Trial",
      yourAccess: null,
    }
    setCompanies((c) => [...c, company])
    setNewCo({ name: "", prefix: "", currency: "EUR", timezone: "Europe/Vilnius", regCode: "", vat: "" })
  }

  function grantAccess() {
    setCompanies((cs) =>
      cs.map((c) => (c.id === selectedId ? { ...c, yourAccess: roleDraft } : c)),
    )
  }

  function updateStatus() {
    setCompanies((cs) =>
      cs.map((c) => (c.id === selectedId ? { ...c, status: statusDraft } : c)),
    )
  }

  function generateKey() {
    if (!keyName) return
    const key: ApiKey = {
      id: `k${Date.now()}`,
      name: keyName,
      prefix: `pk_live_${Math.random().toString(36).slice(2, 8)}`,
      scopes: [...keyScopes],
      expiresAt: keyExpiry || null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setApiKeys((k) => [...k, key])
    setKeyName("")
    setKeyExpiry("")
    setKeyScopes(["items:read", "items:write"])
  }

  function revokeKey(id: string) {
    setApiKeys((k) => k.filter((key) => key.id !== id))
  }

  function copyKey(prefix: string) {
    setCopied(prefix)
    setTimeout(() => setCopied(null), 1800)
  }

  function toggleScope(scope: string) {
    setKeyScopes((s) => (s.includes(scope) ? s.filter((x) => x !== scope) : [...s, scope]))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Row 1: Create + Selected ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Create company */}
        <Card title="Create company" description="Add a new company and seed the default setup automatically.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Company name">
              <input className="po-input" value={newCo.name} onChange={(e) => setNewCo({ ...newCo, name: e.target.value })} placeholder="Acme Corp" />
            </FormField>
            <FormField label="Company prefix">
              <input className="po-input uppercase" value={newCo.prefix} onChange={(e) => setNewCo({ ...newCo, prefix: e.target.value })} placeholder="ACM" />
            </FormField>
            <FormField label="Default currency">
              <select className="po-input appearance-none" value={newCo.currency} onChange={(e) => setNewCo({ ...newCo, currency: e.target.value })}>
                {["EUR", "USD", "GBP", "PLN", "SEK"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Timezone">
              <select className="po-input appearance-none" value={newCo.timezone} onChange={(e) => setNewCo({ ...newCo, timezone: e.target.value })}>
                {["Europe/Vilnius", "Europe/Warsaw", "Europe/London", "UTC", "America/New_York"].map((tz) => <option key={tz}>{tz}</option>)}
              </select>
            </FormField>
            <FormField label="Registration code">
              <input className="po-input" value={newCo.regCode} onChange={(e) => setNewCo({ ...newCo, regCode: e.target.value })} placeholder="123456789" />
            </FormField>
            <FormField label="VAT code">
              <input className="po-input" value={newCo.vat} onChange={(e) => setNewCo({ ...newCo, vat: e.target.value })} placeholder="LT123456789" />
            </FormField>
          </div>
          <div className="mt-5 flex justify-end">
            <PrimaryBtn onClick={createCompany}>Create company</PrimaryBtn>
          </div>
        </Card>

        {/* Selected company */}
        <Card title="Selected company">
          {/* Company info strip */}
          <div className="mb-4 rounded-xl border-l-4 border-l-primary border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-foreground">{selected.name}</span>
              <span className={STATUS_PILL[selected.status]}>{selected.status}</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-y-1 text-[13px]">
              <p className="text-muted-foreground">
                <span className="font-semibold text-[#475569]">Prefix: </span>{selected.prefix}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-[#475569]">Reg. code: </span>{selected.registrationCode}
              </p>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-semibold text-[#475569]">Your access: </span>
                {selected.yourAccess ? (
                  <span className={`${pill} text-[#166534]`}>{selected.yourAccess} · enabled</span>
                ) : (
                  <span className={`${pill} text-[#94A3B8]`}>No access yet</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <FormField label="Company status">
              <div className="flex gap-2">
                <select className="po-input flex-1 appearance-none" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as CompanyStatus)}>
                  {(["Active", "Trial", "Suspended", "Inactive"] as CompanyStatus[]).map((s) => <option key={s}>{s}</option>)}
                </select>
                <OutlineBtn onClick={updateStatus}>Update status</OutlineBtn>
              </div>
            </FormField>

            <FormField label="Grant self access as">
              <div className="flex gap-2">
                <select className="po-input flex-1 appearance-none" value={roleDraft} onChange={(e) => setRoleDraft(e.target.value as AccessRole)}>
                  {(["SuperAdmin", "Admin", "Member", "Viewer"] as AccessRole[]).map((r) => <option key={r}>{r}</option>)}
                </select>
                <PrimaryBtn onClick={grantAccess}>Grant self access</PrimaryBtn>
              </div>
            </FormField>
          </div>

          {!selected.yourAccess && (
            <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-[12px] leading-relaxed text-[#475569]">
              You do not have membership in this company yet. Grant yourself access before managing company-scoped actions.
            </p>
          )}
        </Card>
      </div>

      {/* ── Row 2: Companies table ─────────────────────────────────────────── */}
      <Card
        title="Companies"
        description="Search and select a company, then manage its access and API keys."
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search companies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Company name", "Company prefix", "Registration code", "Company status", "Your access", "Action"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((co) => (
                <tr
                  key={co.id}
                  className={cn(
                    "border-b border-border/60 transition-colors hover:bg-muted/40",
                    co.id === selectedId && "bg-primary/5",
                  )}
                >
                  <td className="px-3 py-3 font-medium text-foreground">{co.name}</td>
                  <td className="px-3 py-3 text-[#475569]">{co.prefix}</td>
                  <td className="px-3 py-3 text-[#475569]">{co.registrationCode}</td>
                  <td className="px-3 py-3">
                    <span className={STATUS_PILL[co.status]}>{co.status}</span>
                  </td>
                  <td className="px-3 py-3">
                    {co.yourAccess ? (
                      <span className={`${pill} text-[#166534]`}>{co.yourAccess} · enabled</span>
                    ) : (
                      <span className={`${pill} text-[#94A3B8]`}>No access yet</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {co.id === selectedId ? (
                      <span className={`${pill} text-[#0F172A]`}>Selected</span>
                    ) : (
                      <OutlineBtn onClick={() => { setSelectedId(co.id); setStatusDraft(co.status) }}>
                        Manage
                      </OutlineBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Row 3: API keys ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Generate */}
        <Card title="Generate API key" description="Create a company API key for public integrations.">
          <div className="flex flex-col gap-4">
            <FormField label="Key name">
              <input className="po-input" value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Production Integration" />
            </FormField>
            <FormField label="Expires at">
              <input type="date" className="po-input" value={keyExpiry} onChange={(e) => setKeyExpiry(e.target.value)} />
            </FormField>
            <FormField label="Scopes">
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
                {SCOPES.map((scope) => (
                  <label key={scope} className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={keyScopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="size-4 rounded border-border accent-primary"
                    />
                    {scope}
                  </label>
                ))}
              </div>
            </FormField>
          </div>
          <div className="mt-5 flex justify-end">
            <PrimaryBtn onClick={generateKey}>
              <Key className="size-4" />
              Generate API key
            </PrimaryBtn>
          </div>
        </Card>

        {/* Existing */}
        <Card title="Existing API keys" description="Review existing keys, see their usage, and revoke them when needed.">
          {apiKeys.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No API keys created for this company yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{key.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <code className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-mono text-[#475569]">
                          {key.prefix}…
                        </code>
                        <button
                          onClick={() => copyKey(key.prefix)}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Copy"
                        >
                          {copied === key.prefix ? <Check className="size-3.5 text-[#16a34a]" /> : <Copy className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => revokeKey(key.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Revoke"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {key.scopes.map((s) => (
                      <span key={s} className="inline-flex rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#475569]">{s}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
                    <span>Created: {key.createdAt}</span>
                    <span>Expires: {key.expiresAt ?? "Never"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
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

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
    >
      {children}
    </button>
  )
}

function OutlineBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </button>
  )
}

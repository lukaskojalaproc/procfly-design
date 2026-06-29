"use client"

// ─────────────────────────────────────────────────────────────
//  Procfly Design System Reference
//  /design-system  —  read-only spec page for designers
// ─────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background px-10 py-12 font-sans">
      <header className="mb-12 border-b border-border pb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Procfly</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Design System</h1>
        <p className="mt-2 text-sm text-muted-foreground">Spalvos, tipografija, statusų ženkleliai — visa medžiaga dizaineriui.</p>
      </header>

      {/* ── 1. BRAND COLOURS ────────────────────────────────────── */}
      <Section title="1. Brand spalvos">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Swatch hex="#1F5A43" name="Brand Green" desc="Sidebar, approval footer, primary CTA" token="--sidebar / --hero" />
          <Swatch hex="#163D2D" name="Brand Green Dark" desc="Sidebar hover, hero accent" token="--hero-accent" />
          <Swatch hex="#0F172A" name="Ink" desc="Pagrindinis tekstas, heading" token="--foreground / --primary" />
          <Swatch hex="#FFFFFF" name="White" desc="Kortelės, modalai, popover" token="--card / --background (cards)" />
          <Swatch hex="#F8FAFC" name="Page BG" desc="Pagrindinis puslapio fonas" token="--background" />
          <Swatch hex="#F1F5F9" name="Surface" desc="Muted fonas, antriniai mygtukai" token="--secondary / --muted / --accent" />
          <Swatch hex="#E2E8F0" name="Border" desc="Rėmeliai, input rėmeliai, divideriai" token="--border / --input" />
          <Swatch hex="#64748B" name="Muted text" desc="Label tekstas, placeholder, metainfo" token="--muted-foreground / --ring" />
        </div>
      </Section>

      {/* ── 2. STATUS SEMANTICS ─────────────────────────────────── */}
      <Section title="2. Statusų spalvų sistema">
        <p className="mb-6 text-sm text-muted-foreground">
          Visi statusų ženkleliai — <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">rounded-full px-2.5 py-1 text-xs font-semibold</code> — pilkas taškas + spalvotas tekstas.
          Jie naudoja tris semantines grupes: žalia (sėkmė), geltona/oranžinė (dėmesio reikia), raudona (klaida/pavojus), pilka (neutrali/archyvas).
        </p>

        <div className="flex flex-col gap-10">

          {/* Green */}
          <StatusGroup title="Zalia — sekmė / aktyvumas">
            <StatusRow
              dot="#16a34a" text="#166534" border="#bbf7d0" bg="#f0fdf4"
              label="Active / Approved / In Stock / Awarded"
              usedIn="Requests, Contracts, Suppliers, Warehouse, Competitions"
            />
            <StatusRow
              dot="#15803D" text="#15803D" border="#BBF7D0" bg="#ECFDF3"
              label="Delivered / Approval step: Approved"
              usedIn="Orders, Approval Flow"
            />
          </StatusGroup>

          {/* Amber / Orange */}
          <StatusGroup title="Geltona / Oranzine — laukiama / isspejimas">
            <StatusRow
              dot="#d97706" text="#92400e" border="#fde68a" bg="#fffbeb"
              label="Pending Approval / Expiring Soon / Low Stock / Pending (supplier)"
              usedIn="Requests, Contracts, Warehouse, Suppliers"
            />
            <StatusRow
              dot="#B54708" text="#B54708" border="#F1E4B5" bg="#FEF6E8"
              label="Awaiting Delivery / Partially Delivered / Evaluation / Approval step: In Progress"
              usedIn="Orders, Competitions, Approval Flow"
            />
          </StatusGroup>

          {/* Red */}
          <StatusGroup title="Raudona — klaida / atmetimas / pavojus">
            <StatusRow
              dot="#dc2626" text="#991b1b" border="#fecaca" bg="#fef2f2"
              label="Rejected / Cancelled / Expired / Blocked / Out of Stock (old palette)"
              usedIn="Requests, Contracts, Suppliers, Warehouse"
            />
            <StatusRow
              dot="#B42318" text="#B42318" border="#F3D6D2" bg="#FEF3F2"
              label="Cancelled / Approval step: Rejected / Document: Missing"
              usedIn="Orders, Competitions, Approval Flow, Documents"
            />
          </StatusGroup>

          {/* Gray */}
          <StatusGroup title="Pilka — neutralu / juodraštis / archyvas">
            <StatusRow
              dot="#9ca3af" text="#6b7280" border="#e5e7eb" bg="#f9fafb"
              label="Draft / Terminated / Preferred / Archived"
              usedIn="Requests, Contracts, Suppliers, Warehouse"
            />
            <StatusRow
              dot="#475467" text="#475467" border="#E2E8F0" bg="#F8FAFC"
              label="Draft / Sent / Closed (orders) — šiek tiek tamsesnis pilkas"
              usedIn="Orders, Competitions"
            />
          </StatusGroup>

          {/* Special */}
          <StatusGroup title="Speciali — black fill">
            <StatusRow
              dot="#FFFFFF" text="#FFFFFF" border="#0F172A" bg="#0F172A"
              label="Ready to Start — baltas taškas + baltasdtekstas ant juodo fono"
              usedIn="Competitions"
            />
          </StatusGroup>

        </div>
      </Section>

      {/* ── 3. DOCUMENT STATUSES ────────────────────────────────── */}
      <Section title="3. Dokumentų statusai">
        <div className="flex flex-wrap gap-3">
          <DocStatus label="Uploaded" dot="#15803D" text="#15803D" border="#BBF7D0" bg="#ECFDF3" />
          <DocStatus label="Pending Review" dot="#B54708" text="#B54708" border="#F1E4B5" bg="#FEF6E8" />
          <DocStatus label="Missing" dot="#B42318" text="#B42318" border="#F3D6D2" bg="#FEF3F2" />
        </div>
      </Section>

      {/* ── 4. APPROVAL FLOW CARD STATES ────────────────────────── */}
      <Section title="4. Approval Flow korteliu busenos">
        <div className="flex flex-wrap gap-4">
          <ApprovalCard state="Approved"    dot="#15803D" ring="#BBF7D0"  labelText="#15803D"  labelBg="#ECFDF3"  labelBorder="#BBF7D0"  cardBorder="#E2E8F0" ring2="" />
          <ApprovalCard state="In Progress" dot="#B54708" ring="#F1E4B5"  labelText="#B54708"  labelBg="#FEF6E8"  labelBorder="#F1E4B5"  cardBorder="#0F172A" ring2="ring-1 ring-foreground" />
          <ApprovalCard state="Not Started" dot="#E2E8F0" ring="#E2E8F0"  labelText="#64748B"  labelBg="#F1F5F9"  labelBorder="#E2E8F0"  cardBorder="#E2E8F0" ring2="" />
          <ApprovalCard state="Rejected"    dot="#B42318" ring="#F3D6D2"  labelText="#B42318"  labelBg="#FEF3F2"  labelBorder="#F3D6D2"  cardBorder="#F3D6D2" ring2="" />
        </div>
      </Section>

      {/* ── 5. TYPOGRAPHY ───────────────────────────────────────── */}
      <Section title="5. Tipografija">
        <div className="rounded-xl border border-border bg-card p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="pb-3 pr-8">Elementas</th>
                <th className="pb-3 pr-8">Klasė / reikšmė</th>
                <th className="pb-3 pr-8">Naudojimas</th>
                <th className="pb-3">Pavyzdys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { el: "Page heading",       cls: "text-[1.375rem] font-bold leading-snug tracking-tight", use: "Užklausos pavadinimas",        sample: "Replacement laptops (x6)" },
                { el: "Section heading",    cls: "text-[11px] font-bold uppercase tracking-widest",       use: "GENERAL, PRODUCT DETAILS...",    sample: "GENERAL" },
                { el: "Tab label",          cls: "text-sm font-semibold",                                  use: "Overview, Financial...",         sample: "Overview" },
                { el: "Table header",       cls: "text-[11px] font-bold uppercase tracking-widest",       use: "Lentelių antraštės",              sample: "ITEM" },
                { el: "Field label",        cls: "text-sm text-muted-foreground",                         use: "Description, Department...",     sample: "Department" },
                { el: "Field value",        cls: "text-sm font-medium text-foreground",                   use: "Lauko reikšmė",                  sample: "IT" },
                { el: "Amount (large)",     cls: "text-3xl font-bold tabular-nums",                       use: "Key Numbers suma",               sample: "€12,400" },
                { el: "Amount (table)",     cls: "text-[15px] font-bold tabular-nums",                    use: "Sąrašo eilutė (critical)",       sample: "€45,000" },
                { el: "Meta / label chip",  cls: "text-[11px] font-medium text-muted-foreground",         use: "REQ-1048, Buy Product",          sample: "REQ-1048" },
                { el: "Status badge",       cls: "text-xs font-semibold",                                 use: "Visi statusai",                  sample: "Approved" },
                { el: "Button (primary)",   cls: "text-xs font-semibold",                                 use: "Approve, Send...",               sample: "Approve" },
                { el: "Body / description", cls: "text-sm leading-relaxed",                               use: "Ilgesni tekstai",                sample: "Discuss this request..." },
                { el: "Caption / hint",     cls: "text-[10px] text-muted-foreground",                     use: "Data kortelėse, timestamps",     sample: "2026-06-17 09:10" },
                { el: "Mono chip",          cls: "font-mono text-[11px] font-medium",                     use: "Kodo reikšmės (REQ-xxx, CC-xxx)",sample: "CC-IT-001" },
              ].map((row) => (
                <tr key={row.el}>
                  <td className="py-3 pr-8 text-sm font-medium text-foreground">{row.el}</td>
                  <td className="py-3 pr-8 font-mono text-[11px] text-muted-foreground">{row.cls}</td>
                  <td className="py-3 pr-8 text-sm text-muted-foreground">{row.use}</td>
                  <td className="py-3 text-sm text-foreground">{row.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Fontai</p>
          <div className="flex gap-8 text-sm">
            <div>
              <span className="font-semibold text-foreground">Heading ir Body:</span>
              <span className="ml-2 text-muted-foreground">Geist Sans (Google / Vercel)</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Kodo reikšmės:</span>
              <span className="ml-2 font-mono text-muted-foreground">Geist Mono</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 6. SPACING & RADIUS ─────────────────────────────────── */}
      <Section title="6. Erdvė ir kampų radiusas">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <RadiusCard name="sm" value="~8px (0.6×)" use="Mažos žymos, mini badge" />
          <RadiusCard name="md" value="~11px (0.8×)" use="Input laukai, mygtukai" />
          <RadiusCard name="lg / base" value="14px (0.875rem)" use="Kortelės pagrindinė" />
          <RadiusCard name="xl" value="~20px (1.4×)" use="Kortelės (rounded-xl)" />
          <RadiusCard name="2xl" value="~25px (1.8×)" use="Modalai, large surfaces" />
          <RadiusCard name="full" value="9999px" use="Statusų ženkleliai, avatarų apskritimai" />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Spacing sistema</p>
          <p className="text-sm text-muted-foreground">
            Naudojamas Tailwind 4-unit spacing scale (1 unit = 4px). Dažniausios reikšmės:
            <span className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">gap-4 (16px)</span>
            <span className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">gap-6 (24px)</span>
            <span className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">p-4 (16px)</span>
            <span className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">p-5 (20px)</span>
            <span className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">p-6 (24px)</span>
            <span className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">px-4 py-3</span> (lentelių eilutės)
          </p>
        </div>
      </Section>

      {/* ── 7. SHADOWS & BORDERS ────────────────────────────────── */}
      <Section title="7. Seseliai ir rėmeliai">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ShadowCard
            name="card-shadow"
            value="0 1px 2px rgba(0,0,0,3%) + 0 2px 8px rgba(0,0,0,4%) + 1px solid #E2E8F0"
            use="Visos kortelės (card-shadow utility)"
          />
          <ShadowCard
            name="shadow-sm"
            value="0 1px 2px rgba(0,0,0,5%)"
            use="Key Numbers kortelė, kai kurie paneliai"
          />
          <ShadowCard
            name="Approval footer"
            value="0 -4px 16px rgba(0,0,0,12%) — šešėlis į viršų"
            use="Fixed bottom approval bar"
          />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Rėmeliai</p>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span><code className="rounded bg-muted px-1.5 font-mono text-[11px]">#E2E8F0</code> — standartinis rėmelis (border-border)</span>
            <span><code className="rounded bg-muted px-1.5 font-mono text-[11px]">1px solid</code> — visada 1px storis</span>
            <span><code className="rounded bg-muted px-1.5 font-mono text-[11px]">divide-border</code> — lentelių / sąrašo dalikliai</span>
          </div>
        </div>
      </Section>

      {/* ── 8. LAYOUT ───────────────────────────────────────────── */}
      <Section title="8. Layout sistema">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3">Zona</th>
                <th className="px-5 py-3">Plotis</th>
                <th className="px-5 py-3">Spalva</th>
                <th className="px-5 py-3">Pastaba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { zone: "Sidebar",            width: "256px (w-64)",      color: "#1F5A43 (Brand Green)",  note: "Fixed left, full height" },
                { zone: "Main content",        width: "flex-1 (likusis)",  color: "#F8FAFC (Page BG)",      note: "Scrollable" },
                { zone: "Discussion panel",    width: "360px (shrink-0)",  color: "#FFFFFF (Card)",         note: "Sticky, full height minus header/footer" },
                { zone: "Approval footer",     width: "100% minus sidebar",color: "#1F5A43 (Brand Green)",  note: "Fixed bottom, z-40, lg:left-64" },
                { zone: "Top nav / topbar",    width: "100% minus sidebar",color: "#FFFFFF",                note: "h-14, border-bottom" },
                { zone: "Page max width",      width: "none (full width)", color: "—",                      note: "Nėra max-width ribos" },
              ].map((row) => (
                <tr key={row.zone}>
                  <td className="px-5 py-3 font-medium text-foreground">{row.zone}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{row.width}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{row.color}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 9. INTERACTIVE STATES ───────────────────────────────── */}
      <Section title="9. Interaktyvios busenos">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Mygtukai</p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div><span className="font-semibold text-foreground">Primary (Approve):</span> Baltas bg (#FFFFFF), žalias tekstas (#1a3d2a), hover: opacity 90%</div>
              <div><span className="font-semibold text-foreground">Secondary (Request Changes):</span> bg-white/10, baltas tekstas, border white/25, hover: bg-white/20</div>
              <div><span className="font-semibold text-foreground">Destructive (Reject):</span> bg-red-500/20, border red-400/40, text-red-200, hover: bg-red-500/30</div>
              <div><span className="font-semibold text-foreground">Default outline:</span> border-border bg-card, hover: border-foreground/30 bg-muted</div>
              <div><span className="font-semibold text-foreground">Table row "Open":</span> border-border bg-background, hover: bg-foreground text-background (inversija)</div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Input laukai</p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div><span className="font-semibold text-foreground">Default:</span> border #E2E8F0, bg background, text-sm, rounded-lg</div>
              <div><span className="font-semibold text-foreground">Focus:</span> border-primary (#0F172A), ring-2 ring-primary/20</div>
              <div><span className="font-semibold text-foreground">Disabled:</span> opacity-40, cursor-not-allowed</div>
              <div><span className="font-semibold text-foreground">Placeholder:</span> text-muted-foreground (#64748B)</div>
            </div>
          </div>
        </div>
      </Section>

    </main>
  )
}

// ── Helper components ────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="mb-6 text-lg font-bold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Swatch({ hex, name, desc, token }: { hex: string; name: string; desc: string; token: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="h-16 w-full" style={{ background: hex }} />
      <div className="p-3">
        <p className="text-[13px] font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{hex}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">{token}</p>
      </div>
    </div>
  )
}

function StatusGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function StatusRow({
  dot, text, border, bg, label, usedIn,
}: { dot: string; text: string; border: string; bg: string; label: string; usedIn: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
      {/* Live badge preview */}
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ background: bg, border: `1px solid ${border}`, color: text }}
      >
        <span className="size-1.5 rounded-full" style={{ background: dot }} />
        {label.split(" / ")[0]}
      </span>
      {/* Colour values */}
      <div className="flex flex-wrap gap-6 text-[11px]">
        <ColVal label="Dot"    hex={dot} />
        <ColVal label="Text"   hex={text} />
        <ColVal label="Border" hex={border} />
        <ColVal label="BG"     hex={bg} />
      </div>
      {/* Status names */}
      <div className="ml-auto text-right">
        <p className="text-[11px] font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{usedIn}</p>
      </div>
    </div>
  )
}

function ColVal({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-3 rounded" style={{ background: hex, border: "1px solid #E2E8F0" }} />
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-mono font-medium text-foreground">{hex}</span>
    </div>
  )
}

function DocStatus({ label, dot, text, border, bg }: { label: string; dot: string; text: string; border: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: bg, border: `1px solid ${border}`, color: text }}
    >
      <span className="size-1.5 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  )
}

function ApprovalCard({
  state, dot, ring, labelText, labelBg, labelBorder, cardBorder,
}: {
  state: string; dot: string; ring: string; labelText: string; labelBg: string; labelBorder: string; cardBorder: string; ring2: string;
}) {
  return (
    <div
      className="w-[220px] rounded-xl border p-4"
      style={{ borderColor: cardBorder, background: "#FFFFFF" }}
    >
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground ring-1 ring-border">
          DS
        </span>
        <div>
          <p className="text-[13px] font-semibold text-foreground">Dragan Stojchevski</p>
          <p className="text-[11px] text-muted-foreground">Step 2 · Manager</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: labelBg, border: `1px solid ${labelBorder}`, color: labelText }}
        >
          {state}
        </span>
        <span className="size-2.5 rounded-full ring-2" style={{ background: dot, ringColor: ring }} />
      </div>
      <div className="mt-3 border-t border-border pt-2">
        <p className="text-[10px] text-muted-foreground">Card border: <span className="font-mono">{cardBorder}</span></p>
        <p className="text-[10px] text-muted-foreground">Dot: <span className="font-mono">{dot}</span></p>
        <p className="text-[10px] text-muted-foreground">Label bg: <span className="font-mono">{labelBg}</span></p>
      </div>
    </div>
  )
}

function RadiusCard({ name, value, use }: { name: string; value: string; use: string }) {
  const r = name === "full" ? "9999px" : name === "lg / base" ? "14px" : name === "xl" ? "20px" : name === "2xl" ? "25px" : name === "md" ? "11px" : "8px"
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div
        className="size-12 shrink-0 border-2 border-foreground/20 bg-muted"
        style={{ borderRadius: r }}
      />
      <div>
        <p className="text-sm font-semibold text-foreground">radius-{name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{value}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{use}</p>
      </div>
    </div>
  )
}

function ShadowCard({ name, value, use }: { name: string; value: string; use: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{value}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">{use}</p>
    </div>
  )
}

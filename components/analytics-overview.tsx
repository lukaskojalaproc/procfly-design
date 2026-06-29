"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Timer,
  Clock,
  Gavel,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import {
  getKpis,
  getSpendSeries,
  getSpendByCategory,
  periodLabels,
  periodCompare,
  formatCompact,
  type Period,
  type Kpi,
} from "@/lib/dashboard-data"

const PERIODS: Period[] = ["month", "quarter", "year"]

const kpiIcon: Record<Kpi["key"], typeof TrendingUp> = {
  spend: TrendingUp,
  savings: PiggyBank,
  approval: Timer,
  pending: Clock,
  competitions: Gavel,
}

const spendChartConfig: ChartConfig = {
  spend: { label: "Spend", color: "var(--chart-1)" },
  budget: { label: "Budget", color: "var(--chart-3)" },
}

const categoryChartConfig: ChartConfig = {
  spend: { label: "Spend", color: "var(--chart-1)" },
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpiIcon[kpi.key]
  const isGood = kpi.trend === kpi.goodWhen
  const DeltaIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight
  const deltaText =
    kpi.key === "pending" || kpi.key === "competitions"
      ? `${kpi.trend === "up" ? "+" : "-"}${kpi.delta}`
      : `${kpi.trend === "up" ? "+" : "-"}${kpi.delta}%`

  // Only "savings" gets a coloured number — everything else stays foreground (black).
  const valueColour = kpi.key === "savings" ? "text-primary" : "text-foreground"

  // Delta pill: muted tones — not vivid green/red.
  const deltaCls = isGood
    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
    : "bg-red-50 text-red-500 border border-red-100"

  // Only savings icon is green; all others are neutral muted.
  const iconCls = kpi.key === "savings"
    ? "bg-primary/[0.08] text-primary"
    : "bg-muted text-muted-foreground"

  return (
    <Card className="card-shadow flex flex-col gap-5 px-6 py-7">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-9 items-center justify-center rounded-lg", iconCls)}>
          <Icon className="size-4.5" />
        </span>
        <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium", deltaCls)}>
          <DeltaIcon className="size-3" />
          {deltaText}
        </span>
      </div>
      <div>
        <p className={cn("text-[1.75rem] font-bold leading-none tabular-nums", valueColour)}>{kpi.value}</p>
        <p className="mt-2.5 text-sm font-medium text-foreground">{kpi.label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
      </div>
    </Card>
  )
}

export function AnalyticsOverview() {
  const [period, setPeriod] = useState<Period>("month")
  const kpis = getKpis(period)
  const spend = getSpendSeries(period)
  const categories = getSpendByCategory()
  const compare = periodCompare[period]

  return (
    <section className="flex flex-col gap-4">
      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* Title: font-bold (700) */}
          <h2 className="text-lg font-bold text-foreground">This month</h2>
          <p className="text-sm text-muted-foreground">
            {periodLabels[period]} · all figures {compare}
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Spend over time */}
        <Card className="card-shadow p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {/* Section title: font-semibold (600) */}
              <h3 className="font-semibold text-foreground">Spend over time</h3>
              <p className="text-xs text-muted-foreground">Committed spend vs allocated budget</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 rounded-full bg-chart-1" /> Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-5 rounded-full border-t-2 border-dashed border-chart-3" /> Budget
              </span>
            </div>
          </div>
          <ChartContainer config={spendChartConfig} className="h-[240px] w-full">
            <AreaChart data={spend} margin={{ left: 4, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-spend)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-spend)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) => formatCompact(v as number)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="capitalize text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatCompact(value as number)} EUR
                        </span>
                      </span>
                    )}
                  />
                }
              />
              <Area
                dataKey="budget"
                type="monotone"
                stroke="var(--color-budget)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
              <Area
                dataKey="spend"
                type="monotone"
                stroke="var(--color-spend)"
                strokeWidth={2}
                fill="url(#fillSpend)"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Spend by category — first bar green, rest light gray */}
        <Card className="card-shadow p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Spend by category</h3>
            <p className="text-xs text-muted-foreground">Top categories this workspace</p>
          </div>
          <ChartContainer config={categoryChartConfig} className="h-[240px] w-full">
            <BarChart data={categories} layout="vertical" margin={{ left: 4, right: 12 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                width={88}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {formatCompact(value as number)} EUR
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="spend" radius={4} barSize={18}>
                {categories.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "var(--chart-1)" : "oklch(0.88 0.004 240)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </section>
  )
}

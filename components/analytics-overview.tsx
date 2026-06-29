"use client"

import { useState } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
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
  periodSubtitles,
  formatCompact,
  type Period,
  type Kpi,
} from "@/lib/dashboard-data"

const PERIODS: Period[] = ["month", "quarter", "year"]


const spendChartConfig: ChartConfig = {
  spend: { label: "Spend", color: "var(--chart-1)" },
  budget: { label: "Budget", color: "var(--chart-3)" },
}

const categoryChartConfig: ChartConfig = {
  spend: { label: "Spend", color: "var(--chart-1)" },
}

function KpiStat({ kpi, isLast }: { kpi: Kpi; isLast: boolean }) {
  const isUp = kpi.trend === "up"
  const DeltaIcon = isUp ? ArrowUp : ArrowDown
  const deltaColor = isUp ? "#0A7A70" : "#B91C1C"
  const sign = isUp ? "+" : "−"
  const deltaText =
    kpi.key === "pending" || kpi.key === "competitions"
      ? `${sign}${kpi.delta}`
      : `${sign}${kpi.delta}%`

  // Split "€1.1M" → prefix "€", body "1.1", suffix "M"
  // Split "2.4d"  → prefix "",  body "2.4", suffix "d"
  // Split "84K"   → prefix "",  body "84",  suffix "K"
  // Split "6"     → prefix "",  body "6",   suffix ""
  const match = kpi.value.match(/^([€$£]?)([0-9.,]+)([A-Za-z]*)$/)
  const prefix  = match?.[1] ?? ""
  const body    = match?.[2] ?? kpi.value
  const suffix  = match?.[3] ?? ""

  return (
    <div className={cn(
      "flex min-w-0 flex-1 flex-col gap-2 px-5 py-4",
      !isLast && "border-r border-border",
    )}>
      {/* Top: label + delta — ZipHQ keeps these on one line, small caps */}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10.5px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
          {kpi.label}
        </p>
        <span
          className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold tabular-nums"
          style={{ color: deltaColor }}
        >
          <DeltaIcon className="size-[9px]" />
          {deltaText}
        </span>
      </div>

      {/* Value — prefix same color as body (ZipHQ style), suffix smaller */}
      <div className="flex items-baseline gap-[1px] tabular-nums leading-none">
        {prefix && (
          <span className="text-[1.25rem] font-bold text-foreground">{prefix}</span>
        )}
        <span className="text-[2.25rem] font-black tracking-tight text-foreground">{body}</span>
        {suffix && (
          <span className="ml-0.5 text-[1.25rem] font-bold text-muted-foreground">{suffix}</span>
        )}
      </div>

      <p className="truncate text-[11px] text-muted-foreground">{kpi.sub}</p>
    </div>
  )
}

export function AnalyticsOverview() {
  const [period, setPeriod] = useState<Period>("month")
  const kpis = getKpis(period)
  const spend = getSpendSeries(period)
  const categories = getSpendByCategory()

  return (
    <section className="flex flex-col gap-4">
      {/* Header + period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">{periodLabels[period]}</h2>
          {/* 4. Tighter gap between heading and subtitle */}
          <p className="mt-px text-sm text-[#475569]">{periodSubtitles[period]}</p>
        </div>
        {/* 1. Period filter — borderless track, light pill active state */}
        <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-2.5 py-0.5 text-sm transition-colors",
                period === p
                  ? "bg-white/90 font-medium text-foreground/80 shadow-none"
                  : "font-normal text-muted-foreground/70 hover:text-foreground",
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip — Gong-style: no cards, dividers between stats */}
      <div className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {kpis.map((kpi, i) => (
          <KpiStat key={kpi.key} kpi={kpi} isLast={i === kpis.length - 1} />
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
                {/* Item 6: fill much weaker — line stays visible, area fades away */}
                <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-spend)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--color-spend)" stopOpacity={0} />
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
                    fill={index === 0 ? "#0AAFA0" : "#E5E9EA"}
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

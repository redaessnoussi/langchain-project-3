import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  RiFileListLine,
  RiAlarmWarningLine,
  RiCheckboxCircleLine,
  RiDatabase2Line,
  RiArrowRightSLine,
} from "@remixicon/react"
import { fetchTickets, fetchCollectionStats, fetchDashboardStats } from "@/services/api"
import type { Ticket, CollectionStats, DashboardStats } from "@/services/api"

// -- Badge helpers (mirrored from Tickets.tsx) --

function TypeBadge({ value }: { value: string }) {
  const cls =
    value.toLowerCase() === "incident"
      ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
      : value.toLowerCase() === "request"
      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
      : "bg-muted text-muted-foreground"
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{value || "—"}</span>
}

const CAT_PALETTE: Record<string, string> = {
  software: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
  hardware: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  network:  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  account:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  security: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  email:    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  printer:  "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
}

function CategoryBadge({ value }: { value: string }) {
  if (!value) return null
  const cls = CAT_PALETTE[value.toLowerCase()] ?? "bg-muted text-muted-foreground"
  const label = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

// Map Tailwind class names (returned by API) to hex colors for inline styles
const BAR_COLORS: Record<string, string> = {
  "bg-violet-500":  "#8b5cf6",
  "bg-orange-500":  "#f97316",
  "bg-blue-500":    "#3b82f6",
  "bg-emerald-500": "#10b981",
  "bg-rose-500":    "#f43f5e",
  "bg-amber-500":   "#f59e0b",
  "bg-teal-500":    "#14b8a6",
  "bg-cyan-500":    "#06b6d4",
  "bg-pink-500":    "#ec4899",
}

function barColor(cls: string): string {
  return BAR_COLORS[cls] ?? "#6b7280"
}

// -- Component --

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, ticketsRes, statsRes] = await Promise.allSettled([
          fetchDashboardStats(),
          fetchTickets(0, 5),
          fetchCollectionStats(),
        ])
        if (dashRes.status === "fulfilled") setDashboard(dashRes.value)
        if (ticketsRes.status === "fulfilled") setRecentTickets(ticketsRes.value.tickets)
        if (statsRes.status === "fulfilled") setStats(statsRes.value)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  const totalStr = dashboard ? dashboard.total.toLocaleString() : loadingData ? "..." : "—"

  const STAT_CARDS = [
    {
      label: "Total Tickets",
      value: totalStr,
      icon: RiFileListLine,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Open",
      value: dashboard ? dashboard.open.toLocaleString() : loadingData ? "..." : "—",
      icon: RiAlarmWarningLine,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Resolved",
      value: dashboard ? dashboard.resolved.toLocaleString() : loadingData ? "..." : "—",
      icon: RiCheckboxCircleLine,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Indexed Vectors",
      value: stats != null ? stats.total_vectors.toLocaleString() : loadingData ? "..." : "—",
      icon: RiDatabase2Line,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  const categories = dashboard?.categories ?? []

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          IT helpdesk performance at a glance — powered by {totalStr} indexed tickets.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className={`inline-flex size-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <h2 className="font-medium">Tickets by Category</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution across main IT domains</p>
          </div>
          {loadingData ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No data available</p>
          ) : (
            <div className="space-y-4">
              {categories.map(({ label, count, pct, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">
                      {count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: barColor(color) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <h2 className="font-medium">Recent Tickets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest activity in the dataset</p>
          </div>

          {loadingData ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : recentTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No tickets loaded — is the backend running?</p>
          ) : (
            <div className="divide-y divide-border">
              {recentTickets.map((t) => (
                <div key={t.row_idx} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{t.number || `#${t.row_idx}`}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {t.type && <TypeBadge value={t.type} />}
                      {t.category && <CategoryBadge value={t.category} />}
                    </div>
                  </div>
                  <p className="text-sm truncate">{t.short_description || "—"}</p>
                  {t.resolution_time != null && (
                    <p className="text-xs text-muted-foreground">{t.resolution_time.toFixed(1)}h resolution</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link
            to="/tickets"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all tickets <RiArrowRightSLine className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

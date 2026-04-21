import {
  RiFileListLine,
  RiAlarmWarningLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiArrowRightSLine,
} from "@remixicon/react"

const STATS = [
  {
    label: "Total Tickets",
    value: "27,602",
    icon: RiFileListLine,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Open",
    value: "3,241",
    icon: RiAlarmWarningLine,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Resolved",
    value: "24,361",
    icon: RiCheckboxCircleLine,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    label: "Avg Resolution",
    value: "4.2h",
    icon: RiTimeLine,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
]

const CATEGORIES = [
  { label: "Software", count: 9651, pct: 35, color: "bg-blue-500" },
  { label: "Hardware", count: 7729, pct: 28, color: "bg-orange-500" },
  { label: "Network", count: 6072, pct: 22, color: "bg-purple-500" },
  { label: "Access / Auth", count: 4150, pct: 15, color: "bg-green-500" },
]

const RECENT_TICKETS = [
  {
    id: "INC019842",
    category: "Network",
    description: "VPN keeps disconnecting every 30 minutes during remote work",
    status: "Resolved",
    time: "2.5h",
  },
  {
    id: "INC019835",
    category: "Software",
    description: "SAP login fails after latest Windows security update",
    status: "Resolved",
    time: "1.8h",
  },
  {
    id: "INC019830",
    category: "Hardware",
    description: "Laptop screen flickering and randomly going black",
    status: "Open",
    time: "—",
  },
  {
    id: "INC019827",
    category: "Access",
    description: "User locked out of Active Directory after password reset",
    status: "Resolved",
    time: "0.5h",
  },
  {
    id: "INC019821",
    category: "Software",
    description: "Outlook not syncing calendar with Teams meetings",
    status: "Resolved",
    time: "3.1h",
  },
]

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          IT helpdesk performance at a glance — powered by 27,602 indexed tickets.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
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
        {/* Category breakdown */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <h2 className="font-medium">Tickets by Category</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution across main IT domains</p>
          </div>
          <div className="space-y-4">
            {CATEGORIES.map(({ label, count, pct, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">
                    {count.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tickets */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <h2 className="font-medium">Recent Tickets</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest activity in the system</p>
          </div>
          <div className="divide-y divide-border">
            {RECENT_TICKETS.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-sm truncate">{t.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-xs font-medium ${
                      t.status === "Resolved" ? "text-green-500" : "text-amber-500"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/tickets"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all tickets <RiArrowRightSLine className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

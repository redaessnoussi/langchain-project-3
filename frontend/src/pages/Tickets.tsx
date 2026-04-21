import { useState, useEffect, useCallback } from "react"
import { RiCloseLine, RiTimeLine, RiUserLine, RiFilterLine, RiArrowLeftSLine, RiArrowRightSLine, RiLoader4Line, RiComputerLine } from "@remixicon/react"
import { fetchTickets, fetchTicketFilters } from "@/services/api"
import type { Ticket } from "@/services/api"

const PAGE_SIZE = 50

// ── Badge colour helpers ─────────────────────────────────────────────────────

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
  software:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
  hardware:  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  network:   "bg-blue-500/10  text-blue-600  dark:text-blue-400  border border-blue-500/20",
  account:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  security:  "bg-red-500/10   text-red-600   dark:text-red-400   border border-red-500/20",
  email:     "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  printer:   "bg-teal-500/10  text-teal-600  dark:text-teal-400  border border-teal-500/20",
}

function catStyle(cat: string) {
  return CAT_PALETTE[cat.toLowerCase()] ?? "bg-muted text-muted-foreground"
}

function CategoryBadge({ value }: { value: string }) {
  if (!value) return null
  const label = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${catStyle(value)}`}>{label}</span>
}

function SubcategoryBadge({ value }: { value: string }) {
  if (!value) return null
  const label = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  return (
    <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  )
}

function SystemBadge({ value }: { value: string }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-xs text-muted-foreground">
      <RiComputerLine className="size-3" />
      {value}
    </span>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [categories, setCategories] = useState<string[]>(["All"])
  const [types, setTypes] = useState<string[]>(["All"])

  useEffect(() => {
    fetchTicketFilters()
      .then((f) => {
        setCategories(["All", ...f.categories])
        setTypes(["All", ...f.types])
      })
      .catch(() => {
        setCategories(["All", "Software", "Hardware", "Network", "Account", "Security", "Email", "Printer"])
        setTypes(["All", "Incident", "Request"])
      })
  }, [])

  const load = useCallback(async (pageIndex: number, cat: string, type: string) => {
    setLoading(true)
    setError(null)
    setSelected(null)
    try {
      const data = await fetchTickets(
        pageIndex * PAGE_SIZE,
        PAGE_SIZE,
        cat !== "All" ? cat : undefined,
        type !== "All" ? type : undefined,
      )
      setTickets(data.tickets)
      setTotal(data.total)
    } catch {
      setError("Could not load tickets. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, categoryFilter, typeFilter)
  }, [page, categoryFilter, typeFilter, load])

  const handleFilterChange = (cat: string, type: string) => {
    setPage(0)
    setCategoryFilter(cat)
    setTypeFilter(type)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live IT support tickets from the HuggingFace dataset — {total.toLocaleString()} total.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <RiFilterLine className="size-4 text-muted-foreground" />
        <FilterGroup label="Category" options={categories} value={categoryFilter} onChange={(v) => handleFilterChange(v, typeFilter)} />
        <FilterGroup label="Type" options={types} value={typeFilter} onChange={(v) => handleFilterChange(categoryFilter, v)} />
      </div>

      <div className="flex gap-6">
        <div className={`min-w-0 overflow-x-auto rounded-xl border border-border transition-all ${selected ? "w-[55%] shrink-0" : "w-full"}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-sm text-muted-foreground">
              <RiLoader4Line className="size-4 animate-spin" />
              Loading tickets…
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Ticket</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Subcategory</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Time (h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.row_idx}
                    onClick={() => setSelected(ticket.row_idx === selected?.row_idx ? null : ticket)}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selected?.row_idx === ticket.row_idx ? "bg-muted/60" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {ticket.number || `#${ticket.row_idx}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TypeBadge value={ticket.type} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <CategoryBadge value={ticket.category} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SubcategoryBadge value={ticket.subcategory} />
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <p className="truncate">{ticket.short_description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {ticket.resolution_time != null ? ticket.resolution_time.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>Page {page + 1} of {totalPages.toLocaleString()} · {total.toLocaleString()} tickets</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-md p-1.5 hover:bg-muted disabled:opacity-40 transition-colors">
                  <RiArrowLeftSLine className="size-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-md p-1.5 hover:bg-muted disabled:opacity-40 transition-colors">
                  <RiArrowRightSLine className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="flex-1 rounded-xl border border-border bg-card p-6 space-y-5 overflow-y-auto max-h-[680px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{selected.number}</p>
                <h2 className="mt-1 font-semibold leading-snug">{selected.short_description}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <RiCloseLine className="size-4" />
              </button>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <TypeBadge value={selected.type} />
              <CategoryBadge value={selected.category} />
              {selected.subcategory && <SubcategoryBadge value={selected.subcategory} />}
              {selected.system && <SystemBadge value={selected.system} />}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {selected.agent && (
                <span className="flex items-center gap-1.5">
                  <RiUserLine className="size-3.5" />
                  {selected.agent}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <RiTimeLine className="size-3.5" />
                {selected.resolution_time != null ? `${selected.resolution_time.toFixed(1)}h` : "Pending"}
              </span>
              {selected.date && (
                <span>{selected.date.slice(0, 10)}</span>
              )}
            </div>

            {selected.issue_type && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Issue</p>
                <p className="text-sm">{selected.issue_type}</p>
              </div>
            )}

            <hr className="border-border" />

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Description</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.content || selected.short_description}</p>
            </div>

            {selected.close_notes && (
              <div className="rounded-lg bg-green-500/8 border border-green-500/20 p-4">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Resolution</p>
                <p className="text-sm leading-relaxed">{selected.close_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1 gap-0.5">
      <span className="px-2 text-xs text-muted-foreground font-medium">{label}:</span>
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} className={`rounded-md px-3 py-1 text-xs transition-colors ${value === opt ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

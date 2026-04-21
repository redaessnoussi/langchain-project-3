import { useState } from "react"
import { RiCloseLine, RiTimeLine, RiUserLine, RiFilterLine } from "@remixicon/react"

interface Ticket {
  id: string
  type: "Incident" | "Request"
  category: string
  subcategory: string
  system: string
  description: string
  content: string
  agent: string
  status: "Resolved" | "Open" | "In Progress"
  resolutionTime: string
  resolution: string
  date: string
}

const TICKETS: Ticket[] = [
  {
    id: "INC019842",
    type: "Incident",
    category: "Network",
    subcategory: "VPN",
    system: "Cisco AnyConnect",
    description: "VPN keeps disconnecting every 30 minutes during remote work",
    content:
      "User reports that Cisco AnyConnect VPN disconnects repeatedly after approximately 30 minutes of use. The issue started after the latest OS update. User is working remotely and unable to access internal tools.",
    agent: "Maria Santos",
    status: "Resolved",
    resolutionTime: "2.5h",
    resolution:
      "Updated Cisco AnyConnect to version 4.10. Reconfigured split-tunneling policy in the VPN profile. Disabled the Windows power saving setting for the network adapter. Issue resolved — user confirmed stable connection over 4 hours.",
    date: "2024-08-15",
  },
  {
    id: "INC019835",
    type: "Incident",
    category: "Software",
    subcategory: "ERP",
    system: "SAP",
    description: "SAP login fails after latest Windows security update",
    content:
      "Multiple users in the Finance department are unable to log into SAP after applying the KB5034441 Windows security patch. They receive an 'authentication error' when entering credentials.",
    agent: "James Okonkwo",
    status: "Resolved",
    resolutionTime: "1.8h",
    resolution:
      "The Windows patch changed the TLS settings on the machine. Re-enabled TLS 1.2 via registry and cleared the SAP GUI credential store. Restarted the SAP logon pad. All affected users confirmed login works again.",
    date: "2024-08-15",
  },
  {
    id: "INC019830",
    type: "Incident",
    category: "Hardware",
    subcategory: "Display",
    system: "Dell Latitude 5520",
    description: "Laptop screen flickering and randomly going black",
    content:
      "User's Dell Latitude 5520 screen flickers intermittently and occasionally goes completely black for 2–5 seconds. This happens both on battery and when plugged in. An external monitor works fine.",
    agent: "Laura Pham",
    status: "Open",
    resolutionTime: "—",
    resolution: "Under investigation. GPU driver reinstall pending user availability.",
    date: "2024-08-14",
  },
  {
    id: "INC019827",
    type: "Incident",
    category: "Access",
    subcategory: "Active Directory",
    system: "Windows AD",
    description: "User locked out of Active Directory after password reset attempt",
    content:
      "User attempted a self-service password reset via the company portal but was locked out instead. Account shows 'Locked' in Active Directory. User cannot authenticate to any corporate system.",
    agent: "Carlos Hernandez",
    status: "Resolved",
    resolutionTime: "0.5h",
    resolution:
      "Unlocked the AD account via ADUC console. Reset the password manually and verified that multiple old devices still cached the old credentials — instructed user to sign out on all devices. No further lockouts reported.",
    date: "2024-08-14",
  },
  {
    id: "INC019821",
    type: "Incident",
    category: "Software",
    subcategory: "Email & Collaboration",
    system: "Microsoft Outlook / Teams",
    description: "Outlook not syncing calendar with Teams meetings",
    content:
      "User reports that Teams meeting invites sent by colleagues do not appear in their Outlook calendar. Creating a meeting from Teams does not reflect in Outlook either. Both apps are on the latest version.",
    agent: "Sophie Müller",
    status: "Resolved",
    resolutionTime: "3.1h",
    resolution:
      "Removed and re-added the Microsoft Teams Meeting add-in in Outlook. Cleared the Outlook calendar cache and rebuilt the OST file. Signed out and back into Teams. Calendar sync restored within 15 minutes.",
    date: "2024-08-13",
  },
  {
    id: "REQ019810",
    type: "Request",
    category: "Access",
    subcategory: "Software License",
    system: "Adobe Creative Cloud",
    description: "Request for Adobe Illustrator license for new design hire",
    content:
      "Manager requests an Adobe Illustrator license for a new employee joining the design team. Employee start date is 2024-08-20. Manager approval attached.",
    agent: "Daniel Eto",
    status: "Resolved",
    resolutionTime: "6.0h",
    resolution:
      "License provisioned through the Adobe Admin Console. User account created and invitation sent to employee's corporate email. License will be active on their start date.",
    date: "2024-08-13",
  },
  {
    id: "INC019804",
    type: "Incident",
    category: "Network",
    subcategory: "Wi-Fi",
    system: "Aruba WLAN",
    description: "Conference room Wi-Fi unreachable on floor 3",
    content:
      "Multiple employees report that the corporate Wi-Fi is not visible or unreachable in conference rooms C301, C302, and C303 on floor 3. Personal hotspots work fine.",
    agent: "Nina Kowalski",
    status: "In Progress",
    resolutionTime: "—",
    resolution: "Access point C3-AP-07 identified as non-responsive. Replacement AP dispatched.",
    date: "2024-08-12",
  },
  {
    id: "INC019798",
    type: "Incident",
    category: "Hardware",
    subcategory: "Printer",
    system: "HP LaserJet M404",
    description: "Printer on 2nd floor offline — print jobs queuing",
    content:
      "All users on floor 2 report the shared HP LaserJet M404 is showing as offline. Print jobs are queuing but not printing. Printer shows a paper jam indicator but no paper jam found.",
    agent: "Ahmed Benali",
    status: "Resolved",
    resolutionTime: "1.2h",
    resolution:
      "Cleared the phantom paper jam by opening all access panels and removing residual paper fragments near the fuser. Reset the printer to factory network settings and reassigned its static IP. Printer back online — all queued jobs printed.",
    date: "2024-08-12",
  },
  {
    id: "REQ019791",
    type: "Request",
    category: "Software",
    subcategory: "Installation",
    system: "Python / VS Code",
    description: "Install Python 3.12 and VS Code on developer's new workstation",
    content:
      "New developer joining the backend team needs Python 3.12, VS Code, and Git installed on their workstation. Device has been provisioned but lacks dev tools.",
    agent: "Tom Bradley",
    status: "Resolved",
    resolutionTime: "0.8h",
    resolution:
      "Installed Python 3.12 from python.org, VS Code from the Microsoft Store, and Git 2.45. Configured VS Code with recommended extensions (Pylance, GitLens). Verified all tools functional from the terminal.",
    date: "2024-08-11",
  },
  {
    id: "INC019785",
    type: "Incident",
    category: "Software",
    subcategory: "Browser",
    system: "Google Chrome",
    description: "Chrome crashing on startup after group policy update",
    content:
      "Several users report Chrome crashing immediately on launch following the weekend group policy update. Error message references a DLL conflict. Firefox is unaffected.",
    agent: "Elena Rossi",
    status: "Resolved",
    resolutionTime: "4.5h",
    resolution:
      "Identified that the new GPO disabled a Chrome extension required by the company SSO. Rolled back the extension policy for the affected OU and re-pushed the correct configuration. Chrome stable on all machines after 1 hour.",
    date: "2024-08-11",
  },
]

const CATEGORIES = ["All", "Network", "Software", "Hardware", "Access"]
const TYPES = ["All", "Incident", "Request"]
const STATUSES = ["All", "Open", "In Progress", "Resolved"]

const STATUS_STYLES: Record<string, string> = {
  Resolved: "bg-green-500/10 text-green-600 dark:text-green-400",
  Open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}

const TYPE_STYLES: Record<string, string> = {
  Incident: "bg-red-500/10 text-red-600 dark:text-red-400",
  Request: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
}

export default function Tickets() {
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  const filtered = TICKETS.filter(
    (t) =>
      (categoryFilter === "All" || t.category === categoryFilter) &&
      (typeFilter === "All" || t.type === typeFilter) &&
      (statusFilter === "All" || t.status === statusFilter)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and explore IT support tickets from the knowledge base.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <RiFilterLine className="size-4 text-muted-foreground" />
        <FilterGroup label="Category" options={CATEGORIES} value={categoryFilter} onChange={setCategoryFilter} />
        <FilterGroup label="Type" options={TYPES} value={typeFilter} onChange={setTypeFilter} />
        <FilterGroup label="Status" options={STATUSES} value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Table + side panel */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`overflow-x-auto rounded-xl border border-border transition-all ${selected ? "w-[55%] shrink-0" : "w-full"}`}>
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ticket</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelected(ticket.id === selected?.id ? null : ticket)}
                  className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                    selected?.id === ticket.id ? "bg-muted/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {ticket.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[ticket.type]}`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="truncate">{ticket.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {ticket.resolutionTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No tickets match the selected filters.
            </p>
          )}
        </div>

        {/* Side panel */}
        {selected && (
          <div className="flex-1 rounded-xl border border-border bg-card p-6 space-y-5 overflow-y-auto max-h-[620px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{selected.id}</p>
                <h2 className="mt-1 font-semibold leading-snug">{selected.description}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <RiCloseLine className="size-4" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[selected.type]}`}>
                {selected.type}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[selected.status]}`}>
                {selected.status}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {selected.category} › {selected.subcategory}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {selected.system}
              </span>
            </div>

            {/* Meta */}
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <RiUserLine className="size-3.5" />
                {selected.agent}
              </span>
              <span className="flex items-center gap-1">
                <RiTimeLine className="size-3.5" />
                {selected.resolutionTime}
              </span>
              <span>{selected.date}</span>
            </div>

            <hr className="border-border" />

            {/* Content */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm leading-relaxed">{selected.content}</p>
            </div>

            {/* Resolution */}
            <div className="rounded-lg bg-green-500/8 border border-green-500/20 p-4">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                Resolution
              </p>
              <p className="text-sm leading-relaxed">{selected.resolution}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterGroup({
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${
            value === opt
              ? "bg-background text-foreground shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

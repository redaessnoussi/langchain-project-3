import { NavLink } from "react-router-dom"
import { RiRobot2Line, RiSunLine, RiMoonLine } from "@remixicon/react"
import { useTheme } from "@/components/theme-provider"

const LINKS = [
  { to: "/", label: "Overview", end: true },
  { to: "/tickets", label: "Tickets", end: false },
  { to: "/knowledge", label: "Knowledge", end: false },
  { to: "/users", label: "Users", end: false },
]

export default function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <RiRobot2Line className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">IT Helpdesk AI</span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <RiSunLine className="size-4" />
          ) : (
            <RiMoonLine className="size-4" />
          )}
        </button>
      </div>
    </header>
  )
}

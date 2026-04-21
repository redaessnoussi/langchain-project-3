import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { RiUserLine, RiEditLine, RiCheckLine, RiCloseLine, RiLogoutBoxLine } from "@remixicon/react"
import { updateUser } from "@/services/api"
import { useAuth } from "@/context/AuthContext"

const FIELDS = [
  { key: "name",    label: "Full Name",     type: "text"  },
  { key: "email",   label: "Email",         type: "email" },
  { key: "phone",   label: "Phone",         type: "tel"   },
  { key: "address", label: "Address",       type: "text"  },
] as const

export default function Profile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", address: user?.address ?? "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!user) {
    navigate("/login")
    return null
  }

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const updated = await updateUser(user.id, form)
      login(updated)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email, phone: user.phone, address: user.address })
    setEditing(false)
    setError(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and update your account information</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RiLogoutBoxLine className="size-4" />
          Sign out
        </button>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RiUserLine className="size-8" />
        </div>
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">User ID: #{user.id}</p>
        </div>
      </div>

      {/* Details card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Account Details</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RiEditLine className="size-3.5" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                <RiCheckLine className="size-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RiCloseLine className="size-3.5" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            Profile updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FIELDS.map(({ key, label, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
              {editing ? (
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
                />
              ) : (
                <p className="text-sm">{user[key] || <span className="text-muted-foreground italic">Not set</span>}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-2">
        <h2 className="font-medium">Need help?</h2>
        <p className="text-sm text-muted-foreground">
          You can ask the AI assistant in the <strong>Knowledge</strong> section to update your information —
          just say something like <em>"Please update my phone number to +1 555 0100"</em> and the agent will handle it.
        </p>
      </div>
    </div>
  )
}

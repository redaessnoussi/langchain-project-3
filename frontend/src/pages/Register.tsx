import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { RiRobot2Line } from "@remixicon/react"
import { useAuth } from "@/context/AuthContext"

const BASE_URL = "http://127.0.0.1:8000"

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail ?? "Registration failed. Please try again.")
        return
      }
      const newUser = await res.json()
      login(newUser)
      navigate("/profile")
    } catch {
      setError("Could not connect to the server. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <RiRobot2Line className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">Create an account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Register to manage your IT helpdesk profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {(["name", "email", "phone", "address"] as const).map((field) => (
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium capitalize">{field}</label>
              <input
                type={field === "email" ? "email" : "text"}
                required={field === "name" || field === "email"}
                value={form[field]}
                onChange={set(field)}
                placeholder={field === "email" ? "you@example.com" : `Your ${field}`}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

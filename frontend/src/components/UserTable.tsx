import { useState, useEffect } from "react"
import { fetchUsers, deleteUser } from "@/services/api"
import type { User } from "@/services/api"

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchUsers()
      setUsers(data)
    } catch {
      setError("Could not load users. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return
    await deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  if (loading)
    return <p className="text-sm text-muted-foreground">Loading users...</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (users.length === 0)
    return <p className="text-sm text-muted-foreground">No users found.</p>

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-left font-medium">Address</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr
              key={user.id}
              className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
            >
              <td className="px-4 py-3 text-muted-foreground">{user.id}</td>
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.phone}</td>
              <td className="px-4 py-3">{user.address}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

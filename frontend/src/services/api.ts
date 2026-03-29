const BASE_URL = "http://127.0.0.1:8000"

export interface User {
  id: number
  name: string
  email: string
  phone: string
  address: string
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users/`)
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete user")
}

// Placeholder — will be wired to the LangChain agent later
export async function sendChatMessage(message: string): Promise<string> {
  return Promise.resolve(
    "AI agent is not yet connected. Your message: " + message
  )
}

const BASE_URL = "http://127.0.0.1:8000"

export interface User {
  id: number
  name: string
  email: string
  phone: string
  address: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
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

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error("Failed to reach AI agent")
  const data = await res.json()
  return data.reply
}

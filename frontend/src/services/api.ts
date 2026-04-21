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

export interface Ticket {
  row_idx: number
  number: string
  type: string
  category: string
  subcategory: string
  short_description: string
  content: string
  close_notes: string
  system: string
  issue_type: string
  agent: string
  resolution_time: number | null
  date: string
}

export interface TicketsResponse {
  tickets: Ticket[]
  total: number
  offset: number
  length: number
}

export interface CollectionStats {
  collection: string
  total_vectors: number
}

export interface FiltersResponse {
  categories: string[]
  types: string[]
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

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error("Failed to reach AI agent")
  const data = await res.json()
  return data.reply
}

export async function fetchTickets(
  offset = 0,
  length = 50,
  category?: string,
  ticketType?: string,
): Promise<TicketsResponse> {
  const params = new URLSearchParams({
    offset: String(offset),
    length: String(length),
  })
  if (category) params.set("category", category)
  if (ticketType) params.set("type", ticketType)
  const res = await fetch(`${BASE_URL}/tickets/?${params}`)
  if (!res.ok) throw new Error("Failed to fetch tickets")
  return res.json()
}

export async function fetchCollectionStats(): Promise<CollectionStats> {
  const res = await fetch(`${BASE_URL}/documents/stats`)
  if (!res.ok) throw new Error("Failed to fetch collection stats")
  return res.json()
}

export async function fetchTicketFilters(): Promise<FiltersResponse> {
  const res = await fetch(`${BASE_URL}/tickets/filters`)
  if (!res.ok) throw new Error("Failed to fetch ticket filters")
  return res.json()
}

export interface CategoryStat {
  label: string
  count: number
  pct: number
  color: string
}

export interface DashboardStats {
  total: number
  open: number
  resolved: number
  categories: CategoryStat[]
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE_URL}/tickets/dashboard`)
  if (!res.ok) throw new Error("Failed to fetch dashboard stats")
  return res.json()
}


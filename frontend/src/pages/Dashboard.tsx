import UserTable from "@/components/UserTable"
import ChatPanel from "@/components/ChatPanel"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your users and chat with the AI agent.
          </p>
        </div>

        {/* Users section */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Users</h2>
          <UserTable />
        </section>

        {/* AI Chat section */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-medium">AI Agent</h2>
            <p className="text-sm text-muted-foreground">
              Chat with the LangChain agent — backend integration coming soon.
            </p>
          </div>
          <ChatPanel />
        </section>
      </div>
    </div>
  )
}

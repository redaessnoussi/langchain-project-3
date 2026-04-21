import UserTable from "@/components/UserTable"

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage user records — you can also update or delete users via the AI chat.
        </p>
      </div>
      <UserTable />
    </div>
  )
}

import { redirect } from "next/navigation"
import { requireSession } from "@/app/actions/auth"
import { listUsers } from "@/lib/data"
import { canAccess, ROLE_LABELS } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { UserDialog } from "@/components/user-dialog"
import { DeleteButton } from "@/components/delete-button"
import { deleteUserAction } from "@/app/actions/users"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { Users, ShieldCheck, UserIcon } from "lucide-react"

export default async function UsersPage() {
  const session = await requireSession()
  if (!canAccess(session.role, "users")) redirect("/dashboard")

  const users = await listUsers()

  const adminCount = users.filter(u => u.role === "admin").length
  const userCount = users.filter(u => u.role === "user").length

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Create and manage system users and their access roles."
        action={<UserDialog />}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Users" value={String(users.length)} icon={Users} accent="primary" />
        <StatCard title="Admin Users" value={String(adminCount)} icon={ShieldCheck} accent="primary" />
        <StatCard title="Standard Users" value={String(userCount)} icon={UserIcon} accent="primary" />
      </div>

      {/* User List Table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            All Users
            <Badge variant="secondary" className="ml-1">{users.length}</Badge>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No users yet. Create the first user to get started.
            </p>
            <UserDialog />
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b bg-muted/30 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>User</span>
              <span className="w-20 text-center">Role</span>
              <span className="w-28 text-right">Joined</span>
              <span className="w-16 text-right">Actions</span>
            </div>

            {/* Table rows */}
            <div className="divide-y">
              {users.map((user, i) => (
                <div
                  key={`${user.id}-${i}`}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          {user.id === session.userId && (
                            <Badge variant="outline" className="text-[10px] py-0 h-4 shrink-0">You</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {/* Role for mobile */}
                    <div className="sm:hidden shrink-0">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="flex items-center gap-1 justify-center">
                        {user.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </div>
                  </div>

                  {/* Role (Desktop) */}
                  <div className="hidden sm:block w-20 text-center">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="flex items-center gap-1 justify-center"
                    >
                      {user.role === "admin"
                        ? <ShieldCheck className="h-3 w-3" />
                        : <UserIcon className="h-3 w-3" />}
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between sm:contents mt-2 sm:mt-0">
                    {/* Joined date */}
                    <div className="sm:w-28 sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        <span className="sm:hidden font-semibold mr-1">Joined:</span>
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="sm:w-16 flex items-center justify-end gap-0.5">
                      {user.id !== session.userId ? (
                        <>
                          <UserDialog user={user} />
                          <DeleteButton
                            id={user.id}
                            action={deleteUserAction}
                            title="Delete user?"
                            description={`This will permanently remove ${user.name} from the system.`}
                            successMessage="User deleted"
                          />
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground pr-1">—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

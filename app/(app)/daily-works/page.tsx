import { requireSession } from "@/app/actions/auth"
import { listOffices, listDailyWorks, listUsers, listTasks } from "@/lib/data"
import { deleteDailyWorkAction } from "@/app/actions/dailyworks"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DailyWorkDialog } from "@/components/daily-work-dialog"
import { DailyWorkStatusControl } from "@/components/daily-work-status-control"
import { DeleteButton } from "@/components/delete-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ClipboardList,
  CircleCheck,
  Clock,
  UserCheck,
} from "lucide-react"
import type { DailyWork } from "@/lib/types"

export default async function DailyWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string }>
}) {
  const session = await requireSession()
  const { office: officeParam } = await searchParams
  const officeId = officeParam && officeParam !== "all" ? officeParam : undefined

  const isAdmin = session.role === "admin"
  
  // If not admin, restrict to their own works
  const options = isAdmin ? { officeId } : { officeId, userId: session.userId }

  const [offices, works, users, tasks] = await Promise.all([
    listOffices(),
    listDailyWorks(options),
    isAdmin ? listUsers() : Promise.resolve([]),
    listTasks(officeId),
  ])

  // Filter tasks: if not admin, maybe restrict, but user can see all tasks for their office or assigned to them
  // Or just pass all and let the dialog filter.
  const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled")

  const officeName = (id: string) => offices.find((o) => o.id === id)?.name ?? "Unknown"

  // Basic stats
  const totalWorks = works.length
  const completedWorks = works.filter((w) => w.status === "done").length
  const inProgressWorks = works.filter((w) => w.status === "in_progress").length
  const pendingWorks = works.filter((w) => w.status === "pending").length
  const totalHours = works.reduce((sum, w) => sum + (w.hoursSpent || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Daily Works"
        description="Track daily operational tasks, hours spent, and team progress."
        action={<DailyWorkDialog offices={offices} users={users} tasks={activeTasks} defaultOfficeId={officeId} isAdmin={isAdmin} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Works logged" value={String(totalWorks)} icon={ClipboardList} accent="primary" />
        <StatCard title="Completed" value={String(completedWorks)} icon={CircleCheck} accent="success" />
        <StatCard title="In Progress" value={String(inProgressWorks)} icon={Clock} accent="warning" />
        <StatCard title="Total Hours" value={`${totalHours}h`} icon={Clock} accent="primary" />
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Title</TableHead>
              {isAdmin && <TableHead>Assignee</TableHead>}
              <TableHead>Office</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="py-10 text-center text-muted-foreground">
                  No daily works logged.
                </TableCell>
              </TableRow>
            ) : (
              works.map((w) => {
                return (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="font-medium">{w.title}</div>
                      {w.description && (
                        <div className="max-w-60 truncate text-xs text-muted-foreground">
                          {w.description}
                        </div>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{users.find(u => u.id === w.userId)?.name || w.userName}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {officeName(w.officeId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {w.date}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {w.hoursSpent ? `${w.hoursSpent}h` : "—"}
                    </TableCell>
                    <TableCell>
                      <DailyWorkStatusControl id={w.id} status={w.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <DailyWorkDialog offices={offices} users={users} tasks={activeTasks} work={w} isAdmin={isAdmin} />
                        {(isAdmin || w.userId === session.userId) && (
                          <DeleteButton
                            id={w.id}
                            action={deleteDailyWorkAction}
                            title="Delete work?"
                            description="This will permanently remove this work log."
                            successMessage="Work deleted"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

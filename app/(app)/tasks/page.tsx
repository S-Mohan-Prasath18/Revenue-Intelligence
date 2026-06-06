import { requireSession } from "@/app/actions/auth"
import { listOffices, listTasks } from "@/lib/data"
import { taskStats } from "@/lib/analytics"
import { deadlineInfo } from "@/lib/format"
import { deleteTaskAction } from "@/app/actions/tasks"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { TaskDialog } from "@/components/task-dialog"
import { TaskStatusControl } from "@/components/task-status-control"
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
  ListChecks,
  CircleCheck,
  Clock,
  AlertTriangle,
  CalendarClock,
} from "lucide-react"
import type { Task, TaskPriority } from "@/lib/types"

const priorityStyles: Record<TaskPriority, string> = {
  high: "border-destructive/40 text-destructive",
  medium: "border-[var(--warning)]/40 text-[var(--warning)]",
  low: "border-border text-muted-foreground",
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string }>
}) {
  await requireSession()
  const { office: officeParam } = await searchParams
  const officeId = officeParam && officeParam !== "all" ? officeParam : undefined

  const [offices, tasks] = await Promise.all([
    listOffices(),
    listTasks(officeId),
  ])
  const stats = taskStats(tasks)
  const officeName = (id: string) => offices.find((o) => o.id === id)?.name ?? "Unknown"

  // Deadline alert matrix
  const overdue = tasks.filter((t) => t.status !== "completed" && deadlineInfo(t.deadline).level === "overdue")
  const dueToday = tasks.filter((t) => t.status !== "completed" && deadlineInfo(t.deadline).level === "today")
  const upcoming = tasks.filter((t) => t.status !== "completed" && deadlineInfo(t.deadline).level === "upcoming")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pending Works"
        description="Track operational tasks, deadlines, and progress."
        action={<TaskDialog offices={offices} defaultOfficeId={officeId} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Tasks" value={String(stats.total)} icon={ListChecks} accent="primary" />
        <StatCard title="Completed" value={String(stats.completed)} icon={CircleCheck} accent="success" />
        <StatCard title="In Progress" value={String(stats.inProgress + stats.pending)} icon={Clock} accent="warning" />
        <StatCard title="Overdue" value={String(stats.overdue)} icon={AlertTriangle} accent="destructive" />
      </div>

      {/* Deadline alert matrix */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AlertColumn
          title="Overdue"
          icon={AlertTriangle}
          tone="destructive"
          tasks={overdue}
          officeName={officeName}
          emptyText="Nothing overdue. Great job!"
        />
        <AlertColumn
          title="Due Today"
          icon={CalendarClock}
          tone="warning"
          tasks={dueToday}
          officeName={officeName}
          emptyText="No deadlines today."
        />
        <AlertColumn
          title="Upcoming (≤3 days)"
          icon={Clock}
          tone="primary"
          tasks={upcoming}
          officeName={officeName}
          emptyText="No upcoming deadlines."
        />
      </div>

      {/* Full task table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No tasks yet. Create your first pending work item.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((t) => {
                const info = deadlineInfo(t.deadline, t.status === "completed")
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-medium">{t.title}</div>
                      {t.description && (
                        <div className="max-w-60 truncate text-xs text-muted-foreground">
                          {t.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {officeName(t.officeId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{t.assignee}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityStyles[t.priority]}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={
                          info.level === "overdue"
                            ? "text-destructive"
                            : info.level === "today"
                              ? "text-[var(--warning)]"
                              : "text-muted-foreground"
                        }
                      >
                        {t.status === "completed" ? "Completed" : info.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TaskStatusControl id={t.id} status={t.status} />
                    </TableCell>
                    <TableCell>
                      <DeleteButton
                        id={t.id}
                        action={deleteTaskAction}
                        title="Delete task?"
                        description="This will permanently remove this task."
                        successMessage="Task deleted"
                      />
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

function AlertColumn({
  title,
  icon: Icon,
  tone,
  tasks,
  officeName,
  emptyText,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  tone: "destructive" | "warning" | "primary"
  tasks: Task[]
  officeName: (id: string) => string
  emptyText: string
}) {
  const toneClass =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : "text-primary"
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-sm ${toneClass}`}>
          <Icon className="h-4 w-4" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          tasks.slice(0, 5).map((t) => (
            <div key={t.id} className="rounded-lg border bg-muted/30 p-2.5">
              <p className="text-sm font-medium leading-tight">{t.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{officeName(t.officeId)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

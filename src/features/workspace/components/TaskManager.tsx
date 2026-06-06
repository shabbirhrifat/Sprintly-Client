import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { daysUntil, formatDate, titleCase } from "@/lib/format";
import { Paginated, Project, Task, TaskPriority, TaskStatus, User } from "../types";

type TaskManagerProps = {
  tasks: Paginated<Task>;
  projects: Project[];
  users: User[];
  filters: Record<string, string | undefined>;
  canManage: boolean;
  onFiltersChange: (filters: Record<string, string | undefined>) => void;
  onCreate: (body: {
    title: string;
    description: string;
    project: string;
    assignedMember: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
  }) => Promise<void>;
  onUpdate: (id: string, body: Partial<{ title: string; status: TaskStatus; priority: TaskPriority; assignedMember: string; dueDate: string }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onComment: (id: string, message: string) => Promise<void>;
  onAttach: (id: string, body: { filename: string; url: string; mimeType?: string }) => Promise<void>;
};

const emptyTask = {
  title: "",
  description: "",
  project: "",
  assignedMember: "",
  dueDate: "",
  priority: "medium" as TaskPriority,
  status: "todo" as TaskStatus,
};

export function TaskManager({
  tasks,
  projects,
  users,
  filters,
  canManage,
  onFiltersChange,
  onCreate,
  onUpdate,
  onDelete,
  onComment,
  onAttach,
}: TaskManagerProps) {
  const [form, setForm] = useState(emptyTask);
  const [selectedTask, setSelectedTask] = useState("");
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState({ filename: "", url: "", mimeType: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    await onCreate(form);
    setForm(emptyTask);
    setBusy(false);
  };

  const projectName = (task: Task) => (typeof task.project === "string" ? "Project" : task.project.name);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      {canManage && (
        <Panel>
          <h3 className="text-lg font-bold">Create Task</h3>
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <Field label="Task Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            <Select label="Project" value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value })} required>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <Select label="Assigned Member" value={form.assignedMember} onChange={(event) => setForm({ ...form, assignedMember: event.target.value })} required>
              <option value="">Select member</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Due Date" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
              <Select label="Priority" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TaskStatus })}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </Panel>
      )}

      <Panel className={canManage ? "" : "xl:col-span-2"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Tasks</h3>
          <Badge>{tasks.meta.total} total</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Field label="Search" value={filters.search || ""} onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })} />
          <Select label="Project" value={filters.projectId || ""} onChange={(event) => onFiltersChange({ ...filters, projectId: event.target.value })}>
            <option value="">All</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select label="Status" value={filters.status || ""} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}>
            <option value="">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
          <Select label="Priority" value={filters.priority || ""} onChange={(event) => onFiltersChange({ ...filters, priority: event.target.value })}>
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select
            label="Deadline"
            value={filters.deadlineStatus || ""}
            onChange={(event) => onFiltersChange({ ...filters, deadlineStatus: event.target.value })}
          >
            <option value="">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Select label="Sort" value={filters.sort || "latest"} onChange={(event) => onFiltersChange({ ...filters, sort: event.target.value })}>
            <option value="latest">Latest Created</option>
            <option value="nearest-deadline">Nearest Deadline</option>
            <option value="highest-priority">Highest Priority</option>
            <option value="recently-updated">Recently Updated</option>
          </Select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[840px] border-separate border-spacing-y-3 text-left text-sm">
            <thead className="text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-3">Task</th>
                <th className="px-3">Project</th>
                <th className="px-3">Owner</th>
                <th className="px-3">Due</th>
                <th className="px-3">Priority</th>
                <th className="px-3">Status</th>
                <th className="px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.items.map((task) => (
                <tr key={task._id} className="bg-[var(--surface-muted)]">
                  <td className="rounded-l-[14px] px-3 py-4">
                    <p className="font-bold">{task.title}</p>
                    <p className="mt-1 line-clamp-2 max-w-xs text-xs text-[var(--muted)]">{task.description}</p>
                  </td>
                  <td className="px-3 py-4">{projectName(task)}</td>
                  <td className="px-3 py-4">{task.assignedMember?.name || "Unassigned"}</td>
                  <td className="px-3 py-4">
                    <p className="font-semibold">{daysUntil(task.dueDate)}</p>
                    <p className="text-xs text-[var(--muted)]">{formatDate(task.dueDate)}</p>
                  </td>
                  <td className="px-3 py-4">
                    <Badge tone={task.priority === "high" ? "solid" : "soft"}>{titleCase(task.priority)}</Badge>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      label="Status"
                      className="min-w-36"
                      value={task.status}
                      onChange={(event) => onUpdate(task._id, { status: event.target.value as TaskStatus })}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Select>
                  </td>
                  <td className="rounded-r-[14px] px-3 py-4">
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => setSelectedTask(selectedTask === task._id ? "" : task._id)}>
                        Details
                      </Button>
                      {canManage && (
                        <Button type="button" variant="ghost" onClick={() => onDelete(task._id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.items.length === 0 && <p className="rounded-[16px] border border-[var(--border)] p-5 text-sm text-[var(--muted)]">No tasks found.</p>}
        </div>

        {selectedTask && (
          <div className="mt-5 grid gap-4 rounded-[16px] border border-[var(--border)] p-4 md:grid-cols-2">
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await onComment(selectedTask, comment);
                setComment("");
              }}
            >
              <Textarea label="Comment" value={comment} onChange={(event) => setComment(event.target.value)} required />
              <Button type="submit" variant="secondary">
                Add Comment
              </Button>
            </form>
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                await onAttach(selectedTask, attachment);
                setAttachment({ filename: "", url: "", mimeType: "" });
              }}
            >
              <Field label="Attachment Name" value={attachment.filename} onChange={(event) => setAttachment({ ...attachment, filename: event.target.value })} required />
              <Field label="Attachment URL" value={attachment.url} onChange={(event) => setAttachment({ ...attachment, url: event.target.value })} required />
              <Field label="Mime Type" value={attachment.mimeType} onChange={(event) => setAttachment({ ...attachment, mimeType: event.target.value })} />
              <Button type="submit" variant="secondary">
                Add Attachment
              </Button>
            </form>
          </div>
        )}
      </Panel>
    </div>
  );
}

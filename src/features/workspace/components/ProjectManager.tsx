import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { daysUntil, formatDate, titleCase } from "@/lib/format";
import { Paginated, Project, ProjectStatus, User } from "../types";

type ProjectManagerProps = {
  projects: Paginated<Project>;
  users: User[];
  filters: Record<string, string | undefined>;
  canManage: boolean;
  onFiltersChange: (filters: Record<string, string | undefined>) => void;
  onCreate: (body: {
    name: string;
    description: string;
    deadline: string;
    status: ProjectStatus;
    teamMembers: string[];
  }) => Promise<void>;
  onUpdate: (id: string, body: Partial<{ status: ProjectStatus }>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const emptyProject = {
  name: "",
  description: "",
  deadline: "",
  status: "active" as ProjectStatus,
  teamMembers: [] as string[],
};

export function ProjectManager({
  projects,
  users,
  filters,
  canManage,
  onFiltersChange,
  onCreate,
  onUpdate,
  onDelete,
}: ProjectManagerProps) {
  const [form, setForm] = useState(emptyProject);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    await onCreate(form);
    setForm(emptyProject);
    setBusy(false);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      {canManage && (
        <Panel>
          <h3 className="text-lg font-bold">Create Project</h3>
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <Field label="Project Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Deadline" type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} required />
              <Select label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </Select>
            </div>
            <Select
              label="Add Member"
              value=""
              onChange={(event) => {
                if (event.target.value && !form.teamMembers.includes(event.target.value)) {
                  setForm({ ...form, teamMembers: [...form.teamMembers, event.target.value] });
                }
              }}
            >
              <option value="">Select member</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <div className="flex flex-wrap gap-2">
              {form.teamMembers.map((memberId) => {
                const member = users.find((user) => user._id === memberId);
                return (
                  <button
                    key={memberId}
                    type="button"
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                    onClick={() => setForm({ ...form, teamMembers: form.teamMembers.filter((id) => id !== memberId) })}
                  >
                    {member?.name || "Member"} remove
                  </button>
                );
              })}
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </Panel>
      )}

      <Panel className={canManage ? "" : "xl:col-span-2"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Projects</h3>
          <Badge>{projects.meta.total} total</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Field label="Search" value={filters.search || ""} onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })} />
          <Select label="Status" value={filters.status || ""} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
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
            <option value="recently-updated">Recently Updated</option>
          </Select>
        </div>

        <div className="mt-5 grid gap-4">
          {projects.items.map((project) => {
            const progress = project.status === "completed" ? 100 : project.status === "on-hold" ? 35 : 60;
            return (
              <article key={project._id} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold">{project.name}</h4>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">{project.description}</p>
                  </div>
                  <Badge tone={project.status === "completed" ? "solid" : "soft"}>{titleCase(project.status)}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <p className="text-sm font-semibold">{daysUntil(project.deadline)}</p>
                  <p className="text-sm text-[var(--muted)]">{formatDate(project.deadline)}</p>
                  <p className="text-sm text-[var(--muted)]">{project.teamMembers?.length || 0} members</p>
                </div>
                <div className="mt-4">
                  <ProgressBar value={progress} />
                </div>
                {canManage && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["active", "completed", "on-hold"] as ProjectStatus[]).map((status) => (
                      <Button key={status} type="button" variant="secondary" onClick={() => onUpdate(project._id, { status })}>
                        {titleCase(status)}
                      </Button>
                    ))}
                    <Button type="button" variant="ghost" onClick={() => onDelete(project._id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
          {projects.items.length === 0 && <p className="rounded-[16px] border border-[var(--border)] p-5 text-sm text-[var(--muted)]">No projects found.</p>}
        </div>
      </Panel>
    </div>
  );
}

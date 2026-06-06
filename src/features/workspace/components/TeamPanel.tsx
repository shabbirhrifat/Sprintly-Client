import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { titleCase } from "@/lib/format";
import { User, WorkloadItem } from "../types";

type TeamPanelProps = {
  users: User[];
  workload: WorkloadItem[];
};

export function TeamPanel({ users, workload }: TeamPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Team Members</h3>
          <Badge>{users.length}</Badge>
        </div>
        <div className="mt-5 grid gap-3">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--border)] p-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-[var(--foreground)] text-sm font-bold text-[var(--background)]">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-[var(--muted)]">{user.email}</p>
                </div>
              </div>
              <Badge>{titleCase(user.role)}</Badge>
            </div>
          ))}
          {users.length === 0 && <p className="text-sm text-[var(--muted)]">No members found.</p>}
        </div>
      </Panel>
      <Panel>
        <h3 className="text-lg font-bold">Member Workload Summary</h3>
        <div className="mt-5 grid gap-4">
          {workload.map((item) => {
            const progress = item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100);
            return (
              <article key={item._id} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold">{item.member.name}</h4>
                    <p className="text-sm text-[var(--muted)]">
                      {item.total} total · {item.completed} completed · {item.pending} pending
                    </p>
                  </div>
                  <Badge tone="solid">{progress}%</Badge>
                </div>
                <div className="mt-4">
                  <ProgressBar value={progress} />
                </div>
              </article>
            );
          })}
          {workload.length === 0 && <p className="text-sm text-[var(--muted)]">Assign tasks to see workload.</p>}
        </div>
      </Panel>
    </div>
  );
}

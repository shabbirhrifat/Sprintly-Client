import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDate, titleCase } from "@/lib/format";
import { DashboardData } from "../types";

type AnalyticsPanelProps = {
  dashboard: DashboardData;
};

function Distribution({ title, items }: { title: string; items: { _id: string; count: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <Panel>
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-5 grid gap-4">
        {items.length === 0 && <p className="text-sm text-[var(--muted)]">No data yet.</p>}
        {items.map((item) => (
          <div key={item._id} className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{titleCase(item._id)}</span>
              <span className="text-[var(--muted)]">{item.count}</span>
            </div>
            <ProgressBar value={(item.count / total) * 100} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function AnalyticsPanel({ dashboard }: AnalyticsPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        <Distribution title="Task Status Distribution" items={dashboard.charts.tasksByStatus} />
        <Distribution title="Tasks by Priority" items={dashboard.charts.tasksByPriority} />
      </div>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Project Progress Trend</h3>
          <Badge>{dashboard.projectSummaries.length} projects</Badge>
        </div>
        <div className="mt-5 grid gap-4">
          {dashboard.projectSummaries.length === 0 && <p className="text-sm text-[var(--muted)]">Create a project to start tracking progress.</p>}
          {dashboard.projectSummaries.map((project) => (
            <article key={project._id} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold">{project.name}</h4>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {project.pendingTasks} tasks pending · {formatDate(project.deadline)}
                  </p>
                </div>
                <Badge tone="solid">{project.progress}%</Badge>
              </div>
              <div className="mt-4">
                <ProgressBar value={project.progress} />
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

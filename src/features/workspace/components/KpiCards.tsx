import { Panel } from "@/components/ui/Panel";
import { DashboardData } from "../types";

type KpiCardsProps = {
  kpis: DashboardData["kpis"];
};

export function KpiCards({ kpis }: KpiCardsProps) {
  const items = [
    ["Total Projects", kpis.totalProjects],
    ["Total Tasks", kpis.totalTasks],
    ["Completed Tasks", kpis.completedTasks],
    ["Pending Tasks", kpis.pendingTasks],
    ["Overdue Tasks", kpis.overdueTasks],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(([label, value]) => (
        <Panel key={label} className="p-4">
          <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-3xl font-bold">{value}</p>
        </Panel>
      ))}
    </div>
  );
}

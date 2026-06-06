"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { daysUntil, formatDate, titleCase } from "@/lib/format";
import { api } from "../services/api";
import { DashboardData, Notification, Paginated, Project, Task, User } from "../types";
import { ActivityPanel } from "./ActivityPanel";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { KpiCards } from "./KpiCards";
import { ProjectManager } from "./ProjectManager";
import { TaskManager } from "./TaskManager";
import { TeamPanel } from "./TeamPanel";

type View = "dashboard" | "projects" | "tasks" | "team" | "activity";

const emptyDashboard: DashboardData = {
  kpis: { totalProjects: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 },
  charts: { tasksByStatus: [], tasksByPriority: [], teamProductivity: [], projectProgressTrend: [] },
  projectSummaries: [],
  recentActivities: [],
  upcomingDeadlines: [],
  highPriorityTasks: [],
  workload: [],
};

const emptyProjects: Paginated<Project> = {
  items: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

const emptyTasks: Paginated<Task> = {
  items: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

export function WorkspaceShell() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [projects, setProjects] = useState<Paginated<Project>>(emptyProjects);
  const [tasks, setTasks] = useState<Paginated<Task>>(emptyTasks);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [projectFilters, setProjectFilters] = useState<Record<string, string | undefined>>({ sort: "latest" });
  const [taskFilters, setTaskFilters] = useState<Record<string, string | undefined>>({ sort: "latest" });

  const canManage = user?.role === "admin" || user?.role === "project-manager";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const loadWorkspace = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    setError("");

    try {
      const [dashboardData, projectData, taskData, notificationData] = await Promise.all([
        api.dashboard(),
        api.projects(projectFilters),
        api.tasks(taskFilters),
        api.notifications(),
      ]);
      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      setNotifications(notificationData);

      if (canManage) {
        setUsers(await api.users());
      } else {
        setUsers([user]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load workspace data.");
    } finally {
      setBusy(false);
    }
  }, [canManage, projectFilters, taskFilters, user]);

  useEffect(() => {
    api
      .me()
      .then((currentUser) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkspace();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  const runAction = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await action();
      setNotice(success);
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const projectItems = projects.items;
  const unreadCount = notifications.filter((item) => !item.readAt).length;
  const navItems: { id: View; label: string }[] = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard" },
      { id: "projects", label: "Projects" },
      { id: "tasks", label: "Tasks" },
      { id: "team", label: "Team" },
      { id: "activity", label: "Activity" },
    ],
    []
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--background)] text-[var(--foreground)]">
        <Panel className="w-full max-w-sm text-center">
          <p className="text-sm font-semibold text-[var(--muted)]">Loading workspace</p>
          <h1 className="mt-2 text-2xl font-bold">CollabPilot</h1>
        </Panel>
      </main>
    );
  }

  if (!user) {
    return <AuthPanel onAuthenticated={setUser} />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--border)] bg-[var(--surface)] p-5 lg:block">
        <div className="text-xl font-bold">CollabPilot</div>
        <div className="mt-8 grid gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`rounded-[14px] px-4 py-3 text-left text-sm font-semibold transition ${
                view === item.id ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-[16px] bg-[var(--surface-muted)] p-4">
          <p className="text-sm font-bold">{user.name}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{titleCase(user.role)}</p>
        </div>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">{titleCase(view)}</p>
              <h1 className="text-2xl font-bold md:text-4xl">Team Collaboration Dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{unreadCount} unread</Badge>
              <Button type="button" variant="secondary" onClick={() => setDark((current) => !current)}>
                {dark ? "Light" : "Dark"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  runAction(async () => {
                    await api.logout();
                    setUser(null);
                  }, "Logged out.")
                }
              >
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <Button key={item.id} type="button" variant={view === item.id ? "primary" : "secondary"} onClick={() => setView(item.id)}>
                {item.label}
              </Button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 px-4 py-5 lg:px-8">
          {(error || notice) && (
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold shadow-[var(--shadow-tight)]">
              {error || notice}
            </div>
          )}
          {busy && <p className="text-sm font-semibold text-[var(--muted)]">Syncing workspace...</p>}

          {view === "dashboard" && (
            <>
              <KpiCards kpis={dashboard.kpis} />
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">Upcoming Deadlines</h3>
                    <Badge>{dashboard.upcomingDeadlines.length}</Badge>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {dashboard.upcomingDeadlines.map((task) => (
                      <div key={task._id} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                        <p className="font-bold">{task.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {daysUntil(task.dueDate)} · {formatDate(task.dueDate)}
                        </p>
                      </div>
                    ))}
                    {dashboard.upcomingDeadlines.length === 0 && <p className="text-sm text-[var(--muted)]">No upcoming deadlines.</p>}
                  </div>
                </Panel>
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">High Priority Tasks</h3>
                    <Badge tone="solid">{dashboard.highPriorityTasks.length}</Badge>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {dashboard.highPriorityTasks.map((task) => (
                      <div key={task._id} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                        <p className="font-bold">{task.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{task.assignedMember?.name || "Unassigned"}</p>
                      </div>
                    ))}
                    {dashboard.highPriorityTasks.length === 0 && <p className="text-sm text-[var(--muted)]">No high-priority open tasks.</p>}
                  </div>
                </Panel>
              </div>
              <AnalyticsPanel dashboard={dashboard} />
              <ActivityPanel
                activities={dashboard.recentActivities}
                notifications={notifications}
                onReadNotification={(id) => runAction(() => api.readNotification(id).then(() => undefined), "Notification marked read.")}
              />
            </>
          )}

          {view === "projects" && (
            <ProjectManager
              projects={projects}
              users={users}
              filters={projectFilters}
              canManage={Boolean(canManage)}
              onFiltersChange={setProjectFilters}
              onCreate={(body) => runAction(() => api.createProject(body).then(() => undefined), "Project created.")}
              onUpdate={(id, body) => runAction(() => api.updateProject(id, body).then(() => undefined), "Project updated.")}
              onDelete={(id) => runAction(() => api.deleteProject(id).then(() => undefined), "Project deleted.")}
            />
          )}

          {view === "tasks" && (
            <TaskManager
              tasks={tasks}
              projects={projectItems}
              users={users}
              filters={taskFilters}
              canManage={Boolean(canManage)}
              onFiltersChange={setTaskFilters}
              onCreate={(body) => runAction(() => api.createTask(body).then(() => undefined), "Task created.")}
              onUpdate={(id, body) => runAction(() => api.updateTask(id, body).then(() => undefined), "Task updated.")}
              onDelete={(id) => runAction(() => api.deleteTask(id).then(() => undefined), "Task deleted.")}
              onComment={(id, message) => runAction(() => api.addComment(id, message).then(() => undefined), "Comment added.")}
              onAttach={(id, body) => runAction(() => api.addAttachment(id, body).then(() => undefined), "Attachment added.")}
            />
          )}

          {view === "team" && <TeamPanel users={users} workload={dashboard.workload} />}

          {view === "activity" && (
            <ActivityPanel
              activities={dashboard.recentActivities}
              notifications={notifications}
              onReadNotification={(id) => runAction(() => api.readNotification(id).then(() => undefined), "Notification marked read.")}
            />
          )}
        </div>
      </section>
    </main>
  );
}

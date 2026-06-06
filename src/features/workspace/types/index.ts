export type UserRole = "admin" | "project-manager" | "team-member";
export type ProjectStatus = "active" | "completed" | "on-hold";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "high" | "medium" | "low";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive?: boolean;
};

export type Project = {
  _id: string;
  name: string;
  description: string;
  deadline: string;
  status: ProjectStatus;
  teamMembers: User[];
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
};

export type Task = {
  _id: string;
  title: string;
  description: string;
  project: Project | string;
  assignedMember: User;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  comments?: { _id?: string; author: User; message: string; createdAt: string }[];
  attachments?: { _id?: string; filename: string; url: string; mimeType?: string; size?: number }[];
  createdAt?: string;
  updatedAt?: string;
};

export type Activity = {
  _id: string;
  message: string;
  entityType: "project" | "task" | "comment" | "member" | "auth";
  actor?: User;
  createdAt: string;
};

export type Notification = {
  _id: string;
  message: string;
  readAt?: string;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DashboardData = {
  kpis: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  charts: {
    tasksByStatus: { _id: TaskStatus; count: number }[];
    tasksByPriority: { _id: TaskPriority; count: number }[];
    teamProductivity: WorkloadItem[];
    projectProgressTrend: ProjectSummary[];
  };
  projectSummaries: ProjectSummary[];
  recentActivities: Activity[];
  upcomingDeadlines: Task[];
  highPriorityTasks: Task[];
  workload: WorkloadItem[];
};

export type ProjectSummary = {
  _id: string;
  name: string;
  deadline: string;
  status: ProjectStatus;
  pendingTasks: number;
  completedTasks: number;
  progress: number;
};

export type WorkloadItem = {
  _id: string;
  member: User;
  total: number;
  completed: number;
  pending: number;
};

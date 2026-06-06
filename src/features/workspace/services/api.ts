import {
  DashboardData,
  Notification,
  Paginated,
  Project,
  ProjectStatus,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  UserRole,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Request failed.");
  }

  return payload.data;
};

const toQuery = (params: Record<string, string | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export const api = {
  signup: (body: { name: string; email: string; password: string; role: UserRole }) =>
    request<{ user: User; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  demoLogin: () =>
    request<{ user: User; token: string }>("/auth/demo-login", {
      method: "POST",
    }),
  me: () => request<User>("/auth/me"),
  logout: () =>
    request<null>("/auth/logout", {
      method: "POST",
    }),
  dashboard: () => request<DashboardData>("/dashboard"),
  users: (search?: string) => request<User[]>(`/users${toQuery({ search })}`),
  projects: (params: Record<string, string | undefined>) =>
    request<Paginated<Project>>(`/projects${toQuery(params)}`),
  createProject: (body: {
    name: string;
    description: string;
    deadline: string;
    status: ProjectStatus;
    teamMembers: string[];
  }) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProject: (id: string, body: Partial<{ name: string; description: string; deadline: string; status: ProjectStatus }>) =>
    request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteProject: (id: string) =>
    request<{ deleted: boolean }>(`/projects/${id}`, {
      method: "DELETE",
    }),
  tasks: (params: Record<string, string | undefined>) => request<Paginated<Task>>(`/tasks${toQuery(params)}`),
  createTask: (body: {
    title: string;
    description: string;
    project: string;
    assignedMember: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
  }) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateTask: (id: string, body: Partial<{ title: string; status: TaskStatus; priority: TaskPriority; assignedMember: string; dueDate: string }>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteTask: (id: string) =>
    request<{ deleted: boolean }>(`/tasks/${id}`, {
      method: "DELETE",
    }),
  addComment: (id: string, message: string) =>
    request<Task>(`/tasks/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  addAttachment: (id: string, body: { filename: string; url: string; mimeType?: string }) =>
    request<Task>(`/tasks/${id}/attachments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  notifications: () => request<Notification[]>("/notifications"),
  readNotification: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
};

"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { Panel } from "@/components/ui/Panel";
import { api } from "@/features/workspace/services/api";
import { User, UserRole } from "@/features/workspace/types";

type AuthPanelProps = {
  onAuthenticated: (user: User) => void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "demo@collabpilot.com",
    password: "DemoPass123",
    role: "team-member" as UserRole,
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.signup(form);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    setError("");
    setForm((current) => ({ ...current, email: "demo@collabpilot.com", password: "DemoPass123" }));

    try {
      const result = await api.demoLogin();
      onAuthenticated(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
      <section className="flex flex-col justify-between rounded-[18px] bg-[var(--dark)] p-6 text-white shadow-[var(--shadow-soft)] lg:p-10">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">CollabPilot</div>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
            Smart Work OS
          </span>
        </div>
        <div className="my-16 max-w-2xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-white/60">Project command center</p>
          <h1 className="text-4xl font-bold leading-tight lg:text-6xl">
            Projects, tasks, workload, and progress in one focused workspace.
          </h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Role-aware workflows", "Conflict validation", "Live productivity view"].map((item) => (
              <div key={item} className="rounded-[16px] border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="max-w-xl text-sm leading-6 text-white/60">
          Demo credentials are pre-filled: demo@collabpilot.com / DemoPass123. The demo login also seeds the account on the API.
        </p>
      </section>

      <section className="flex items-center justify-center py-8 lg:pl-10">
        <Panel className="w-full max-w-xl p-6 lg:p-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--muted)]">{mode === "login" ? "Welcome back" : "Create account"}</p>
              <h2 className="mt-1 text-3xl font-bold">{mode === "login" ? "Login to Dashboard" : "Start collaborating"}</h2>
            </div>
            <Button type="button" variant="secondary" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Signup" : "Login"}
            </Button>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            {mode === "signup" && (
              <>
                <Field label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                <Select label="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                  <option value="admin">Admin</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="team-member">Team Member</option>
                </Select>
              </>
            )}
            <Field label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            {error && (
              <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                {error}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Working..." : mode === "login" ? "Login" : "Create Account"}
              </Button>
              <Button type="button" variant="secondary" onClick={demoLogin} disabled={loading}>
                Demo Login
              </Button>
            </div>
          </form>
        </Panel>
      </section>
    </main>
  );
}

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Field({ label, className = "", ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-normal text-[var(--muted)]">
      {label}
      <input
        className={`min-h-10 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm normal-case text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)] ${className}`}
        {...props}
      />
    </label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-normal text-[var(--muted)]">
      {label}
      <textarea
        className={`min-h-24 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm normal-case text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)] ${className}`}
        {...props}
      />
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ label, className = "", children, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-normal text-[var(--muted)]">
      {label}
      <select
        className={`min-h-10 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm normal-case text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)] ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

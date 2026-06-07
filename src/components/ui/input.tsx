import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex min-h-10 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] shadow-none outline-none transition",
        "placeholder:text-[var(--muted)] focus:border-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--border)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

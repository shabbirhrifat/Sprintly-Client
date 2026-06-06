import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "solid" | "soft";
};

export function Badge({ className = "", tone = "soft", ...props }: BadgeProps) {
  const styles =
    tone === "solid"
      ? "bg-[var(--foreground)] text-[var(--background)]"
      : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles} ${className}`} {...props} />;
}

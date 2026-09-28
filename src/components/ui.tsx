import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------ Button ------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
};

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={cn(buttonVariants[variant], className)} {...props} />;
}

/* ------------------------------- Card ------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}

/* ------------------------------ Fields ------------------------------ */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/* ------------------------------ Badge ------------------------------- */

type BadgeTone = "neutral" | "acid" | "flame" | "azure" | "viola";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "badge",
  acid: "badge-acid",
  flame: "badge border-flame/30 bg-flame/10 text-flame",
  azure: "badge border-azure/30 bg-azure/10 text-azure",
  viola: "badge border-viola/30 bg-viola/10 text-viola",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(badgeTones[tone], className)}>{children}</span>;
}

/* ---------------------------- Empty state --------------------------- */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg"
      >
        ✦
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="max-w-md text-sm text-zinc-400">{description}</p>}
      {action}
    </div>
  );
}

/* ----------------------------- Spinner ------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Yükleniyor"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-acid",
        className,
      )}
    />
  );
}

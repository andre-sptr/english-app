import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonStyles = {
  primary: "bg-ink text-white shadow-soft hover:bg-brand-900",
  brand: "bg-brand-600 text-white shadow-soft hover:bg-brand-700",
  secondary: "border border-line bg-white text-ink shadow-soft hover:border-brand-200 hover:bg-brand-50",
  ghost: "text-secondary hover:bg-white hover:text-ink",
  danger: "bg-red-600 text-white shadow-soft hover:bg-red-700",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all duration-200 premium-focus active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        buttonStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof buttonStyles;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all duration-200 premium-focus active:scale-[0.98]",
        buttonStyles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-white p-5 shadow-card",
        interactive && "transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-premium",
        className
      )}
    >
      {children}
    </div>
  );
}

const pillStyles = {
  neutral: "border-line bg-surface-2 text-secondary",
  brand: "border-brand-100 bg-brand-50 text-brand-700",
  teal: "border-teal-100 bg-teal-50 text-teal-600",
  gold: "border-gold-100 bg-gold-50 text-gold-600",
  red: "border-red-100 bg-red-50 text-red-700",
  green: "border-green-100 bg-green-50 text-green-700",
  purple: "border-purple-100 bg-purple-50 text-purple-700",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof pillStyles;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold", pillStyles[tone], className)}>
      {children}
    </span>
  );
}

export function IconTile({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: "brand" | "teal" | "gold" | "ink" | "purple";
  className?: string;
}) {
  const styles = {
    brand: "border-brand-100 bg-brand-50 text-brand-600",
    teal: "border-teal-100 bg-teal-50 text-teal-600",
    gold: "border-gold-100 bg-gold-50 text-gold-600",
    ink: "border-ink/10 bg-ink text-white",
    purple: "border-purple-100 bg-purple-50 text-purple-700",
  };
  return (
    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", styles[tone], className)}>
      {children}
    </div>
  );
}

export function MetricCard({
  value,
  label,
  helper,
  tone = "brand",
}: {
  value: ReactNode;
  label: string;
  helper?: string;
  tone?: "brand" | "teal" | "gold" | "ink";
}) {
  const valueStyles = {
    brand: "text-brand-700",
    teal: "text-teal-600",
    gold: "text-gold-600",
    ink: "text-ink",
  };
  return (
    <div className="rounded-3xl border border-line bg-white p-4 shadow-soft">
      <p className={cn("font-display text-4xl leading-none", valueStyles[tone])}>{value}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      {helper && <p className="mt-1 text-xs leading-relaxed text-secondary">{helper}</p>}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-2xl border border-line bg-white p-1 shadow-soft", className)}>
      {items.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "min-h-[38px] rounded-xl px-4 text-xs font-extrabold transition-all duration-200 premium-focus",
            value === key ? "bg-ink text-white shadow-soft" : "text-secondary hover:bg-surface-2 hover:text-ink"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  backHref,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  backHref?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-muted shadow-soft transition-colors hover:text-ink premium-focus"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div>
          {eyebrow && <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>}
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center">
      {icon && <IconTile tone="brand" className="h-14 w-14">{icon}</IconTile>}
      <div>
        <p className="text-lg font-extrabold text-ink">{title}</p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-secondary">{description}</p>
      </div>
      {action}
    </Card>
  );
}

export function StatusNote({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: "gold" | "brand" | "green" | "red";
  className?: string;
}) {
  const styles = {
    gold: "border-gold-100 bg-gold-50 text-gold-600",
    brand: "border-brand-100 bg-brand-50 text-brand-700",
    green: "border-green-100 bg-green-50 text-green-700",
    red: "border-red-100 bg-red-50 text-red-700",
  };
  return <div className={cn("rounded-2xl border p-4 text-sm font-semibold leading-relaxed", styles[tone], className)}>{children}</div>;
}

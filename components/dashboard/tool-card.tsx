import Link from "next/link";

export function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  soon,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  soon?: boolean;
}) {
  if (soon) {
    return (
      <div className="group relative rounded-xl border border-dashed border-border bg-bg-main p-5 opacity-60">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
          <Icon className="h-4 w-4 text-brand-primary" />
        </div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        <span className="absolute right-3 top-3 rounded-full bg-bg-section px-2 py-0.5 text-[10px] font-medium text-text-secondary">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-bg-main p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 transition-colors group-hover:bg-brand-primary/20">
        <Icon className="h-4 w-4 text-brand-primary" />
      </div>
      <p className="text-sm font-semibold text-text-primary group-hover:text-brand-primary">
        {title}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
    </Link>
  );
}

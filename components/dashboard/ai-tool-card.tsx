import Link from "next/link";

export function AIToolCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-bg-main p-5 shadow-sm transition-all hover:border-brand-primary/40 hover:shadow-md"
    >
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 transition-colors group-hover:bg-brand-primary/20">
        <Icon className="h-4 w-4 text-brand-primary" />
      </div>
      <p className="text-sm font-semibold text-text-primary group-hover:text-brand-primary">
        {title}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-primary/8 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
        ✦ AI · 3 Energy
      </span>
    </Link>
  );
}

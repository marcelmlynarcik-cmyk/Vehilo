import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-[rgba(8,17,23,0.56)] p-5 shadow-[var(--shadow-card)] backdrop-blur-[18px] md:flex-row md:items-start md:justify-between md:p-6">
      <div className="max-w-3xl">
        <h1 className="text-[clamp(2rem,7vw,3.25rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-balance text-white md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">{actions}</div> : null}
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl space-y-2">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <div>
          <h1 className="arena-title">{title}</h1>
          {description ? <p className="arena-subtitle">{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="arena-badge bg-slate-100 text-slate-600">{children}</span>;
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "slate" | "blue" | "amber";

const toneStyles: Record<Tone, string> = {
  emerald: "border-emerald-200 bg-emerald-50",
  slate: "border-slate-200 bg-white",
  blue: "border-blue-200 bg-blue-50",
  amber: "border-amber-200 bg-amber-50",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: string;
  tone?: Tone;
  className?: string;
}

export function StatCard({ label, value, description, tone = "slate", className }: StatCardProps) {
  return (
    <div className={cn("arena-card flex h-full flex-col p-6", toneStyles[tone], className)}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold leading-none text-slate-900">{value}</div>
      {description ? <p className="mt-auto pt-5 text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}

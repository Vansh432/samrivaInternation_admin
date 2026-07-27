import React from "react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  icon,
  tint = "emerald",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tint?: "emerald" | "gold" | "slate" | "red";
}) {
  const tintClasses: Record<string, string> = {
    emerald: "bg-emerald/10 text-emerald",
    gold: "bg-gold/10 text-gold-dark",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="flex items-center gap-4">
      {icon && <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tintClasses[tint]}`}>{icon}</div>}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-800">{value}</p>
      </div>
    </Card>
  );
}

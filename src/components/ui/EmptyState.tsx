import React from "react";
import { Construction } from "lucide-react";
import { Card } from "./Card";

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon ?? <Construction size={22} />}
      </div>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
    </Card>
  );
}

export function ModulePendingState({ moduleName }: { moduleName: string }) {
  return (
    <EmptyState
      title={`${moduleName} backend module not implemented yet`}
      description={`No API or data model exists for ${moduleName.toLowerCase()} in the backend yet. This screen is wired into the sidebar so the workflow is ready — connect it to real endpoints once that module is built.`}
    />
  );
}

import { PageHeader } from "@/components/ui/PageHeader";
import { ModulePendingState } from "@/components/ui/EmptyState";

export default function Team() {
  return (
    <div>
      <PageHeader
        title="Team & Genealogy"
        description="Full sponsorship tree, direct/team business volume, and downline activity per user."
      />
      <ModulePendingState moduleName="Team & Genealogy" />
    </div>
  );
}

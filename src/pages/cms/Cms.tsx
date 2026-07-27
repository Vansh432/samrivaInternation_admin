import { PageHeader } from "@/components/ui/PageHeader";
import { ModulePendingState } from "@/components/ui/EmptyState";

export default function Cms() {
  return (
    <div>
      <PageHeader
        title="Content Management"
        description="Onboarding carousel copy, support FAQ content, and terms & conditions shown in the mobile app."
      />
      <ModulePendingState moduleName="CMS" />
    </div>
  );
}

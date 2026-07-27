import { PageHeader } from "@/components/ui/PageHeader";
import { ModulePendingState } from "@/components/ui/EmptyState";

export default function Reports() {
  return (
    <div>
      <PageHeader
        title="Reports & Documents"
        description="Investment, commission, ROI, withdrawal, TDS, and maturity reports; debenture certificate documents."
      />
      <ModulePendingState moduleName="Reports" />
    </div>
  );
}

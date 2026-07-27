import { PageHeader } from "@/components/ui/PageHeader";
import { ModulePendingState } from "@/components/ui/EmptyState";

export default function Withdrawals() {
  return (
    <div>
      <PageHeader
        title="Withdrawals"
        description="Payout queue for pending withdrawal requests — approve or reject with TDS already calculated."
      />
      <ModulePendingState moduleName="Withdrawals" />
    </div>
  );
}

import { PageHeader } from "@/components/ui/PageHeader";
import { ModulePendingState } from "@/components/ui/EmptyState";

export default function Wallets() {
  return (
    <div>
      <PageHeader
        title="Wallets & Transactions"
        description="Commission, ROI, and Reward wallet balances and transaction history across all users."
      />
      <ModulePendingState moduleName="Wallets" />
    </div>
  );
}

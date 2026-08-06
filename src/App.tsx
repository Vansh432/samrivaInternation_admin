import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UsersList from "@/pages/users/UsersList";
import UserDetail from "@/pages/users/UserDetail";
import KycQueue from "@/pages/kyc/KycQueue";
import Investments from "@/pages/investments/Investments";
import InvestmentApprovals from "@/pages/investments/InvestmentApprovals";
import AllInvestments from "@/pages/investments/AllInvestments";
import Wallets from "@/pages/wallets/Wallets";
import TransferRequests from "@/pages/wallets/TransferRequests";
import Withdrawals from "@/pages/withdrawals/Withdrawals";
import Team from "@/pages/team/Team";
import Ranks from "@/pages/team/Ranks";
import Bonuses from "@/pages/bonuses/Bonuses";
import Reports from "@/pages/reports/Reports";
import Cms from "@/pages/cms/Cms";
import ActivityLogs from "@/pages/logs/ActivityLogs";
import Settings from "@/pages/settings/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/kyc-queue" element={<KycQueue />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/investments/all" element={<AllInvestments />} />
        <Route path="/investment-approvals" element={<InvestmentApprovals />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/wallet-transfer-requests" element={<TransferRequests />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/team" element={<Team />} />
        <Route path="/ranks" element={<Ranks />} />
        <Route path="/bonuses" element={<Bonuses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/cms" element={<Cms />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

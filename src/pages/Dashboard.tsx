import { useEffect, useState } from "react";
import { Users, UserCheck, ShieldCheck, Crown, Clock, CheckCircle2, XCircle, UserX } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PageLoader } from "@/components/ui/Spinner";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data.data.stats);
      } catch (e: any) {
        toast.show(e?.response?.data?.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live snapshot of users, KYC pipeline, and access levels across the platform."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={<Users size={20} />} tint="emerald" />
        <StatCard label="Investors" value={stats.totalInvestors} icon={<UserCheck size={20} />} tint="slate" />
        <StatCard label="Wealth Partners" value={stats.totalWealthPartners} icon={<Crown size={20} />} tint="gold" />
        <StatCard label="Admins" value={stats.totalAdmins} icon={<ShieldCheck size={20} />} tint="slate" />
      </div>

      <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">KYC Pipeline</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={stats.pendingKyc} icon={<Clock size={20} />} tint="slate" />
        <StatCard label="Submitted (in queue)" value={stats.submittedKyc} icon={<Clock size={20} />} tint="gold" />
        <StatCard label="Approved" value={stats.approvedKyc} icon={<CheckCircle2 size={20} />} tint="emerald" />
        <StatCard label="Rejected" value={stats.rejectedKyc} icon={<XCircle size={20} />} tint="red" />
      </div>

      <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">Account Status</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active" value={stats.activeUsers} icon={<CheckCircle2 size={20} />} tint="emerald" />
        <StatCard label="Suspended" value={stats.suspendedUsers} icon={<UserX size={20} />} tint="red" />
      </div>
    </div>
  );
}

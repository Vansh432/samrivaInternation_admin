import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { KycBadge, RoleBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/types";

const ROLES = ["investor", "wealth_partner", "franchise", "employee", "admin", "super_admin"];
const STATUSES = ["active", "inactive", "suspended", "blocked"];

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value ?? "—"}</p>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { user: currentAdmin } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextRole, setNextRole] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      const u: AdminUser = res.data.data.user;
      setUser(u);
      setNextRole(u.role);
      setNextStatus(u.status);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load user", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveRole = async () => {
    if (!user) return;
    setSavingRole(true);
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role: nextRole });
      toast.show("Role updated", "success");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to update role", "error");
    } finally {
      setSavingRole(false);
    }
  };

  const saveStatus = async () => {
    if (!user) return;
    setSavingStatus(true);
    try {
      await api.patch(`/admin/users/${user.id}/status`, { status: nextStatus });
      toast.show("Status updated", "success");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to update status", "error");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!user) return null;

  const isSelf = currentAdmin?.id === user.id;

  return (
    <div>
      <Link to="/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back to Users
      </Link>

      <PageHeader
        title={user.fullName || user.mobile}
        description={user.mobile}
        actions={
          <div className="flex gap-2">
            <RoleBadge role={user.role} />
            <KycBadge status={user.kyc?.status ?? "pending"} />
            <StatusBadge status={user.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">Profile</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={user.fullName} />
            <Field label="Email" value={user.email} />
            <Field label="Mobile" value={user.mobile} />
            <Field label="Referral Code" value={user.referralCode} />
            <Field label="Rank" value={user.rank?.current} />
            <Field label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : undefined} />
          </div>

          <p className="mb-4 mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">KYC</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status" value={<KycBadge status={user.kyc?.status ?? "pending"} />} />
            <Field label="PAN" value={user.kyc?.pan} />
            <Field label="Aadhaar" value={user.kyc?.aadhaar} />
            <Field label="Bank Account" value={user.kyc?.bank?.accountNumber} />
            <Field label="IFSC" value={user.kyc?.bank?.ifsc} />
            <Field label="Account Holder" value={user.kyc?.bank?.holderName} />
            <Field
              label="Nominee"
              value={user.kyc?.nominee?.name ? `${user.kyc.nominee.name} (${user.kyc.nominee.relation || "—"})` : undefined}
            />
            <Field
              label="Submitted"
              value={user.kyc?.submittedAt ? new Date(user.kyc.submittedAt).toLocaleString() : undefined}
            />
            <Field
              label="Reviewed"
              value={user.kyc?.reviewedAt ? new Date(user.kyc.reviewedAt).toLocaleString() : undefined}
            />
            {(user.kyc?.status === "rejected" || user.kyc?.status === "hold") && (
              <Field
                label={user.kyc?.status === "rejected" ? "Rejection Reason" : "Hold Reason"}
                value={user.kyc?.rejectionReason}
              />
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Account Status</p>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              disabled={isSelf}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button onClick={saveStatus} disabled={isSelf || savingStatus || nextStatus === user.status} className="w-full">
              {savingStatus ? "Saving..." : "Update Status"}
            </Button>
            {isSelf && <p className="mt-2 text-xs text-slate-400">You cannot change your own status.</p>}
          </Card>

          <Card>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Role (Super Admin only)</p>
            <select
              value={nextRole}
              onChange={(e) => setNextRole(e.target.value)}
              disabled={isSelf || currentAdmin?.role !== "super_admin"}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald disabled:bg-slate-50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
            <Button
              onClick={saveRole}
              disabled={isSelf || currentAdmin?.role !== "super_admin" || savingRole || nextRole === user.role}
              variant="secondary"
              className="w-full"
            >
              {savingRole ? "Saving..." : "Update Role"}
            </Button>
            {currentAdmin?.role !== "super_admin" && (
              <p className="mt-2 text-xs text-slate-400">Only Super Admin can change roles.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

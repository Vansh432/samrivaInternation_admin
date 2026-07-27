import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, X, PauseCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/types";

type PendingAction = { userId: string; kind: "reject" | "hold" } | null;

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

function FileValue({ value }: { value?: string }) {
  if (!value) return <span>—</span>;
  const isLink = /^https?:\/\//.test(value);
  return isLink ? (
    <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald hover:underline">
      View file <ExternalLink size={12} />
    </a>
  ) : (
    <span className="break-all font-mono text-xs">{value}</span>
  );
}

export default function KycQueue() {
  const toast = useToast();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/kyc-queue");
      setItems(res.data.data.items);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load KYC queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (userId: string) => {
    setBusyId(userId);
    try {
      await api.post(`/admin/kyc/${userId}/approve`, {});
      toast.show("KYC approved", "success");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to approve", "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    if (!reason.trim()) {
      toast.show("Enter a reason first — the user will see this message", "error");
      return;
    }
    const { userId, kind } = pendingAction;
    setBusyId(userId);
    try {
      await api.post(`/admin/kyc/${userId}/${kind}`, { reason: reason.trim() });
      toast.show(kind === "reject" ? "KYC rejected" : "KYC put on hold", "success");
      setPendingAction(null);
      setReason("");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="KYC Queue"
        description="Full submission details for every user awaiting review. Rejecting or holding requires a message — the user sees it in the app and can re-upload."
      />

      {items.length === 0 ? (
        <EmptyState title="No KYC submissions pending" description="All caught up 🎉" icon={<ShieldCheck size={22} />} />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((u) => {
            const isPendingHere = pendingAction?.userId === u.id;
            return (
              <Card key={u.id}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <Link to={`/users/${u.id}`} className="font-bold text-slate-800 hover:underline">
                      {u.fullName || u.mobile}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {u.mobile} · {u.role.replace("_", " ")}
                      {u.kyc?.submittedAt && <> · Submitted {new Date(u.kyc.submittedAt).toLocaleString()}</>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" disabled={busyId === u.id} onClick={() => approve(u.id)} className="!bg-emerald">
                      <Check size={15} /> Approve
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busyId === u.id}
                      onClick={() => {
                        setPendingAction(isPendingHere && pendingAction?.kind === "hold" ? null : { userId: u.id, kind: "hold" });
                        setReason("");
                      }}
                    >
                      <PauseCircle size={15} /> Hold
                    </Button>
                    <Button
                      variant="danger"
                      disabled={busyId === u.id}
                      onClick={() => {
                        setPendingAction(isPendingHere && pendingAction?.kind === "reject" ? null : { userId: u.id, kind: "reject" });
                        setReason("");
                      }}
                    >
                      <X size={15} /> Reject
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                  <Detail label="Date of Birth" value={u.dob ? new Date(u.dob).toLocaleDateString() : undefined} />
                  <Detail
                    label="Address"
                    value={
                      u.address
                        ? [u.address.line1, u.address.city, u.address.state, u.address.pincode].filter(Boolean).join(", ")
                        : undefined
                    }
                  />
                  <Detail label="PAN" value={u.kyc?.pan} />
                  <Detail label="Aadhaar" value={u.kyc?.aadhaar} />
                  <Detail label="Bank Account" value={u.kyc?.bank?.accountNumber} />
                  <Detail label="IFSC" value={u.kyc?.bank?.ifsc} />
                  <Detail label="Account Holder" value={u.kyc?.bank?.holderName} />
                  <Detail
                    label="Nominee"
                    value={u.kyc?.nominee?.name ? `${u.kyc.nominee.name} (${u.kyc.nominee.relation || "—"})` : undefined}
                  />
                  <Detail label="Address Proof" value={<FileValue value={u.kyc?.addressProofUrl} />} />
                  <Detail label="Selfie" value={<FileValue value={u.kyc?.selfieUrl} />} />
                  <Detail
                    label="Terms Accepted"
                    value={u.kyc?.termsAcceptedAt ? new Date(u.kyc.termsAcceptedAt).toLocaleString() : undefined}
                  />
                </div>

                {isPendingHere && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <input
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={
                        pendingAction?.kind === "reject"
                          ? "Why is this KYC being rejected? (shown to the user)"
                          : "Why is this KYC on hold? (shown to the user)"
                      }
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
                    />
                    <Button variant={pendingAction?.kind === "reject" ? "danger" : "secondary"} disabled={busyId === u.id} onClick={confirmAction}>
                      Confirm {pendingAction?.kind === "reject" ? "Reject" : "Hold"}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

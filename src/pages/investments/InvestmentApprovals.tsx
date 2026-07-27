import { useEffect, useState, type ReactNode } from "react";
import { Check, X, Landmark } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AdminInvestment } from "@/lib/types";

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{value ?? "—"}</p>
    </div>
  );
}

const fmtInr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function InvestmentApprovals() {
  const toast = useToast();
  const [items, setItems] = useState<AdminInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/investments/pending");
      setItems(res.data.data.items);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load pending investments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      await api.post(`/admin/investments/${id}/approve`, {});
      toast.show("Investment approved — tenure has started", "success");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to approve", "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectingId) return;
    if (!reason.trim()) {
      toast.show("Enter a reason first — the investor will see this message", "error");
      return;
    }
    setBusyId(rejectingId);
    try {
      await api.post(`/admin/investments/${rejectingId}/reject`, { reason: reason.trim() });
      toast.show("Investment rejected", "success");
      setRejectingId(null);
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
        title="Investment Approvals"
        description="Verify the reported payment (transaction ID + screenshot) before an investment goes active — the tenure only starts once approved here."
      />

      {items.length === 0 ? (
        <EmptyState title="No investments pending verification" description="All caught up 🎉" icon={<Landmark size={22} />} />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((inv) => {
            const investorName = typeof inv.user === "object" ? inv.user.fullName || inv.user.mobile : inv.user;
            const isRejectingHere = rejectingId === inv.id;
            return (
              <Card key={inv.id}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-bold text-slate-800">{investorName}</p>
                    <p className="text-xs text-slate-500">
                      {inv.certificateNumber} · Submitted {new Date(inv.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" disabled={busyId === inv.id} onClick={() => approve(inv.id)} className="!bg-emerald">
                      <Check size={15} /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      disabled={busyId === inv.id}
                      onClick={() => {
                        setRejectingId(isRejectingHere ? null : inv.id);
                        setReason("");
                      }}
                    >
                      <X size={15} /> Reject
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                  <Detail
                    label="Plan"
                    value={
                      <Badge tone={inv.planType === "compounding" ? "gold" : "success"}>
                        {inv.planType === "compounding" ? "Compounding" : "Monthly Income"}
                      </Badge>
                    }
                  />
                  <Detail label="Units" value={inv.units} />
                  <Detail label="Tenure" value={`${inv.tenureMonths} months`} />
                  <Detail label="Rate" value={`${inv.ratePercent}%`} />
                  <Detail label="Principal" value={fmtInr(inv.principal)} />
                  <Detail label="Amount Paid" value={fmtInr(inv.amountPaid)} />
                  <Detail label="Payment Mode" value={inv.paymentMode?.toUpperCase()} />
                  <Detail label="Transaction ID" value={<span className="break-all font-mono text-xs">{inv.transactionId}</span>} />
                </div>

                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment Proof</p>
                  {inv.paymentProofUrl ? (
                    <a href={inv.paymentProofUrl} target="_blank" rel="noreferrer">
                      <img
                        src={inv.paymentProofUrl}
                        alt="Payment proof screenshot"
                        className="h-28 w-28 rounded-lg border border-slate-200 object-cover transition hover:opacity-80"
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">No screenshot (cash payment)</p>
                  )}
                </div>

                {isRejectingHere && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <input
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Why is this investment being rejected? (shown to the investor)"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
                    />
                    <Button variant="danger" disabled={busyId === inv.id} onClick={confirmReject}>
                      Confirm Reject
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

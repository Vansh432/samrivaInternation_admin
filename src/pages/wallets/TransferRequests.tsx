import { useEffect, useState } from "react";
import { Check, X, ArrowRightLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Paginated, WalletTransferRequestAdmin, TransferRequestStatus } from "@/lib/types";

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const statusTone = (s: TransferRequestStatus): "success" | "danger" | "warning" =>
  s === "approved" ? "success" : s === "rejected" ? "danger" : "warning";

export default function TransferRequests() {
  const toast = useToast();
  const [data, setData] = useState<Paginated<WalletTransferRequestAdmin> | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TransferRequestStatus | "">("pending");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/wallet-transfer-requests", {
        params: { status: status || undefined, page, limit: 20 },
      });
      setData(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load transfer requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      await api.post(`/admin/wallet-transfer-requests/${id}/approve`, {});
      toast.show("Transfer approved — net amount credited to Main wallet", "success");
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
      toast.show("Enter a reason first — the user will see this message", "error");
      return;
    }
    setBusyId(rejectingId);
    try {
      await api.post(`/admin/wallet-transfer-requests/${rejectingId}/reject`, { reason: reason.trim() });
      toast.show("Transfer request rejected — amount refunded to source wallet", "success");
      setRejectingId(null);
      setReason("");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Wallet Transfer Requests"
        description="Users requesting to move Bonus/Reward/Commission balance into Main Wallet — approving credits the net amount (after TDS); rejecting refunds the full held amount back."
        actions={
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as TransferRequestStatus | "");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        }
      />

      {loading ? (
        <PageLoader />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No transfer requests" description="Nothing matches this filter." icon={<ArrowRightLeft size={22} />} />
      ) : (
        <div className="flex flex-col gap-4">
          {data.items.map((r) => {
            const userName = typeof r.user === "object" ? r.user.fullName || r.user.mobile : r.user;
            const isRejectingHere = rejectingId === r.id;
            return (
              <Card key={r.id}>
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-bold text-slate-800">{userName}</p>
                    <p className="text-xs text-slate-500">
                      From <span className="capitalize">{r.fromWalletType}</span> wallet · Requested{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="primary" disabled={busyId === r.id} onClick={() => approve(r.id)} className="!bg-emerald">
                          <Check size={15} /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          disabled={busyId === r.id}
                          onClick={() => {
                            setRejectingId(isRejectingHere ? null : r.id);
                            setReason("");
                          }}
                        >
                          <X size={15} /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Requested</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">{formatINR(r.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">TDS</p>
                    <p className="mt-0.5 text-sm font-medium text-red-600">
                      -{formatINR(r.tdsAmount)} ({r.tdsMode === "percentage" ? `${r.tdsValue}%` : "fixed"})
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Admin Charge</p>
                    <p className="mt-0.5 text-sm font-medium text-red-600">
                      -{formatINR(r.adminChargeAmount)} ({r.adminChargePercent}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Net (to Main)</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald">{formatINR(r.netAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reviewed</p>
                    <p className="mt-0.5 text-sm font-medium text-slate-700">
                      {r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>

                {r.status === "rejected" && r.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Reason: {r.rejectionReason}</p>
                )}

                {isRejectingHere && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <input
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Why is this request being rejected? (shown to the user)"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
                    />
                    <Button variant="danger" disabled={busyId === r.id} onClick={confirmReject}>
                      Confirm Reject
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} requests
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

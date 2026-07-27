import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import type { AdminInvestment, Paginated } from "@/lib/types";

const STATUSES = ["pending_verification", "active", "matured", "rejected", "cancelled"];
const PLAN_TYPES = ["compounding", "monthly_income"];

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "gold"> = {
  pending_verification: "warning",
  active: "success",
  matured: "gold",
  rejected: "danger",
  cancelled: "neutral",
};

const fmtInr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function AllInvestments() {
  const toast = useToast();
  const [data, setData] = useState<Paginated<AdminInvestment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [planType, setPlanType] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/investments", {
        params: { search: search || undefined, status: status || undefined, planType: planType || undefined, page, limit: 20 },
      });
      setData(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load investments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, planType, page]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div>
      <PageHeader title="All Investments" description="Every debenture purchased across all users — search by investor, certificate, or transaction ID." />

      <Card className="mb-4">
        <form onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by investor mobile/name, certificate no., transaction ID..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20"
            />
          </div>
          <select
            value={planType}
            onChange={(e) => {
              setPage(1);
              setPlanType(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">All plan types</option>
            {PLAN_TYPES.map((p) => (
              <option key={p} value={p}>
                {p === "compounding" ? "Compounding" : "Monthly Income"}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </form>
      </Card>

      {loading ? (
        <PageLoader />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Investor</th>
                <th className="px-4 py-3">Certificate</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Principal</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Proof</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No investments match these filters.
                  </td>
                </tr>
              )}
              {data?.items.map((inv) => {
                const investor = typeof inv.user === "object" ? inv.user.fullName || inv.user.mobile : inv.user;
                return (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{investor}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{inv.certificateNumber}</td>
                    <td className="px-4 py-3">
                      <Badge tone={inv.planType === "compounding" ? "gold" : "success"}>
                        {inv.planType === "compounding" ? "Compounding" : "Monthly Income"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inv.units}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{fmtInr(inv.principal)}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.ratePercent}%</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[inv.status] ?? "neutral"}>{inv.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {inv.paymentProofUrl ? (
                        <a href={inv.paymentProofUrl} target="_blank" rel="noreferrer">
                          <img
                            src={inv.paymentProofUrl}
                            alt="Payment proof"
                            className="h-10 w-10 rounded-md border border-slate-200 object-cover transition hover:opacity-80"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} investments
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
        </Card>
      )}
    </div>
  );
}

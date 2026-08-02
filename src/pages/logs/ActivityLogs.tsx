import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityLog, Paginated } from "@/lib/types";

const TYPES = ["auth", "user", "admin", "investment", "wallet", "bonus", "cron"];
const LEVELS = ["info", "warn", "error"] as const;

const levelTone = (level: string): "success" | "warning" | "danger" | "neutral" =>
  level === "error" ? "danger" : level === "warn" ? "warning" : "neutral";

const who = (v: ActivityLog["user"]) => {
  if (!v) return "—";
  if (typeof v === "string") return v;
  return v.fullName || v.mobile;
};

export default function ActivityLogs() {
  const toast = useToast();
  const [data, setData] = useState<Paginated<ActivityLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/logs", {
        params: {
          search: search || undefined,
          type: type || undefined,
          level: level || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          limit: 20,
        },
      });
      setData(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load activity logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, level, dateFrom, dateTo, page]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Every logged mutation and auth event across the platform — logins, KYC decisions, admin config changes, credits/debits, and more."
      />

      <Card className="mb-4">
        <form onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by message, action, or user/actor..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20"
            />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPage(1);
              setDateFrom(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPage(1);
              setDateTo(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          />
        </form>
      </Card>

      {loading ? (
        <PageLoader />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No log entries match these filters" description="Try widening the date range or clearing a filter." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 capitalize text-slate-600">{l.type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{l.action}</td>
                  <td className="px-4 py-3">
                    <Badge tone={levelTone(l.level)}>{l.level}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{l.message}</td>
                  <td className="px-4 py-3 text-slate-600">{who(l.user)}</td>
                  <td className="px-4 py-3 text-slate-600">{who(l.actor)}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} entries
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

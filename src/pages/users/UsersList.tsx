import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { KycBadge, RoleBadge, StatusBadge } from "@/components/ui/Badge";
import type { AdminUser, Paginated } from "@/lib/types";

const ROLES = ["investor", "wealth_partner", "franchise", "employee", "admin", "super_admin"];
const STATUSES = ["active", "inactive", "suspended", "blocked"];

export default function UsersList() {
  const toast = useToast();
  const [data, setData] = useState<Paginated<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { search: search || undefined, role: role || undefined, status: status || undefined, page, limit: 20 },
      });
      setData(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status, page]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div>
      <PageHeader title="All Users" description="Every investor, Wealth Partner, and staff account on the platform." />

      <Card className="mb-4">
        <form onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mobile, name, email, referral code..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20"
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
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
                {s}
              </option>
            ))}
          </select>
        </form>
      </Card>

      {loading ? (
        <PageLoader />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Referral Code</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {data?.items.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{u.fullName || "—"}</p>
                    <p className="text-xs text-slate-500">{u.mobile}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <KycBadge status={u.kyc?.status ?? "pending"} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.referralCode || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/users/${u.id}`} className="text-sm font-semibold text-emerald hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} users
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

import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Clock, Percent } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Paginated, WalletTransactionAdmin, CommissionSettlementConfig, TdsConfig, AdminChargeConfig } from "@/lib/types";

const WALLET_TYPES = ["main", "reward", "bonus", "commission"];
const PERIOD_LABELS = ["1st period", "2nd period", "3rd period", "4th period"];

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function Wallets() {
  const toast = useToast();
  const [data, setData] = useState<Paginated<WalletTransactionAdmin> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [walletType, setWalletType] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [configLoading, setConfigLoading] = useState(true);
  const [configForm, setConfigForm] = useState<{ startDay: string; endDay: string; closingDay: string }[]>([]);
  const [configSaving, setConfigSaving] = useState(false);

  const [tdsLoading, setTdsLoading] = useState(true);
  const [tdsForm, setTdsForm] = useState<{ mode: "fixed" | "percentage"; value: string }>({ mode: "percentage", value: "5" });
  const [tdsSaving, setTdsSaving] = useState(false);
  const [adminChargeLoading, setAdminChargeLoading] = useState(true);
  const [adminChargePercentage, setAdminChargePercentage] = useState("0");
  const [adminChargeSaving, setAdminChargeSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/wallets/transactions", {
        params: {
          search: search || undefined,
          walletType: walletType || undefined,
          type: type || undefined,
          status: status || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          limit: 20,
        },
      });
      setData(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load wallet transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await api.get("/wallet/commission-settlement-config");
      const cfg: CommissionSettlementConfig = res.data.data.config;
      setConfigForm(
        [...cfg.periods]
          .sort((a, b) => a.order - b.order)
          .map((p) => ({
            startDay: String(p.startDay),
            endDay: p.endDay === null ? "" : String(p.endDay),
            closingDay: String(p.closingDay),
          }))
      );
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load commission settlement periods", "error");
    } finally {
      setConfigLoading(false);
    }
  };

  const loadTds = async () => {
    setTdsLoading(true);
    try {
      const res = await api.get("/wallet/tds-config");
      const cfg: TdsConfig = res.data.data.config;
      setTdsForm({ mode: cfg.mode, value: String(cfg.value) });
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load TDS config", "error");
    } finally {
      setTdsLoading(false);
    }
  };

  const loadAdminCharge = async () => {
    setAdminChargeLoading(true);
    try {
      const res = await api.get("/wallet/admin-charge-config");
      const cfg: AdminChargeConfig = res.data.data.config;
      setAdminChargePercentage(String(cfg.percentage));
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load admin charge", "error");
    } finally {
      setAdminChargeLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadTds();
    loadAdminCharge();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletType, type, status, dateFrom, dateTo, page]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const dayValid = (v: string, allowEmpty = false) => {
    if (v.trim() === "") return allowEmpty;
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 31;
  };
  const configFormValid = configForm.every(
    (p, i) => dayValid(p.startDay) && dayValid(p.endDay, i === configForm.length - 1) && dayValid(p.closingDay)
  );

  const saveConfig = async () => {
    if (!configFormValid) {
      toast.show("Please enter valid days (1-31) for every period", "error");
      return;
    }
    setConfigSaving(true);
    try {
      const periods = configForm.map((p, i) => ({
        order: i + 1,
        startDay: Number(p.startDay),
        endDay: p.endDay.trim() === "" ? null : Number(p.endDay),
        closingDay: Number(p.closingDay),
      }));
      await api.patch("/wallet/commission-settlement-config", { periods });
      toast.show("Commission settlement periods updated", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save commission settlement periods", "error");
    } finally {
      setConfigSaving(false);
    }
  };

  const tdsValueNum = Number(tdsForm.value);
  const tdsValueValid =
    tdsForm.value.trim() !== "" &&
    tdsValueNum >= 0 &&
    (tdsForm.mode === "fixed" || tdsValueNum <= 100);

  const saveTds = async () => {
    if (!tdsValueValid) {
      toast.show("Enter a valid TDS value", "error");
      return;
    }
    setTdsSaving(true);
    try {
      await api.patch("/wallet/tds-config", { mode: tdsForm.mode, value: tdsValueNum });
      toast.show("TDS config updated", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save TDS config", "error");
    } finally {
      setTdsSaving(false);
    }
  };

  const adminChargeValue = Number(adminChargePercentage);
  const adminChargeValid =
    adminChargePercentage.trim() !== "" && Number.isFinite(adminChargeValue) && adminChargeValue >= 0 && adminChargeValue <= 100;

  const saveAdminCharge = async () => {
    if (!adminChargeValid) {
      toast.show("Enter an admin charge between 0% and 100%", "error");
      return;
    }
    setAdminChargeSaving(true);
    try {
      await api.patch("/wallet/admin-charge-config", { percentage: adminChargeValue });
      toast.show("Admin charge updated", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save admin charge", "error");
    } finally {
      setAdminChargeSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Wallets & Transactions"
        description="Every credit and debit across Main, Reward, Bonus, and Commission wallets, platform-wide."
      />

      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-800">Commission Settlement Periods</p>
            <p className="text-sm text-slate-500">
              Commission earned (Rank Income, Direct Acquisition Bonus) shows as "pending" and only lands in the
              Commission wallet balance on the period's closing day of the following month.
            </p>
          </div>
        </div>

        {configLoading ? (
          <PageLoader />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2">Period</th>
                    <th className="px-3 py-2">Start Day</th>
                    <th className="px-3 py-2">End Day</th>
                    <th className="px-3 py-2">Closing Day (next month)</th>
                  </tr>
                </thead>
                <tbody>
                  {configForm.map((p, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 font-semibold text-slate-800">{PERIOD_LABELS[i]}</td>
                      <td className="px-3 py-2">
                        <input
                          value={p.startDay}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setConfigForm((f) => f.map((row, ri) => (ri === i ? { ...row, startDay: v } : row)));
                          }}
                          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={p.endDay}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setConfigForm((f) => f.map((row, ri) => (ri === i ? { ...row, endDay: v } : row)));
                          }}
                          placeholder={i === configForm.length - 1 ? "end of month" : ""}
                          className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={p.closingDay}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setConfigForm((f) => f.map((row, ri) => (ri === i ? { ...row, closingDay: v } : row)));
                          }}
                          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Button onClick={saveConfig} disabled={configSaving || !configFormValid}>
                {configSaving ? "Saving…" : "Save Periods"}
              </Button>
            </div>
          </>
        )}
      </Card>

      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Percent size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-800">Admin Charge on Wallet Transfers</p>
            <p className="text-sm text-slate-500">A percentage deducted from Bonus, Reward, and Commission transfers into Main Wallet.</p>
          </div>
        </div>
        {adminChargeLoading ? <PageLoader /> : (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Charge (%)</label>
              <input
                value={adminChargePercentage}
                onChange={(e) => setAdminChargePercentage(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 2"
                className={`w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${!adminChargeValid ? "border-red-400" : "border-slate-300"}`}
              />
            </div>
            <Button onClick={saveAdminCharge} disabled={adminChargeSaving || !adminChargeValid}>
              {adminChargeSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Percent size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-800">TDS on Wallet Transfers</p>
            <p className="text-sm text-slate-500">
              Deducted when an admin approves a user's request to transfer Bonus/Reward/Commission balance into
              Main Wallet. Locked in per-request at the moment it's submitted.
            </p>
          </div>
        </div>

        {tdsLoading ? (
          <PageLoader />
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Mode</label>
              <select
                value={tdsForm.mode}
                onChange={(e) => setTdsForm((f) => ({ ...f, mode: e.target.value as "fixed" | "percentage" }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                {tdsForm.mode === "percentage" ? "Percent (%)" : "Amount (₹)"}
              </label>
              <input
                value={tdsForm.value}
                onChange={(e) => setTdsForm((f) => ({ ...f, value: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder={tdsForm.mode === "percentage" ? "e.g. 5" : "e.g. 100"}
                className={`w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  !tdsValueValid ? "border-red-400" : "border-slate-300"
                }`}
              />
            </div>
            <Button onClick={saveTds} disabled={tdsSaving || !tdsValueValid}>
              {tdsSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <form onSubmit={onSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user mobile or name..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20"
            />
          </div>
          <select
            value={walletType}
            onChange={(e) => {
              setPage(1);
              setWalletType(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">All wallets</option>
            {WALLET_TYPES.map((w) => (
              <option key={w} value={w}>
                {w.charAt(0).toUpperCase() + w.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">Credit & Debit</option>
            <option value="credit">Credit only</option>
            <option value="debit">Debit only</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="">Pending & Settled</option>
            <option value="pending">Pending only</option>
            <option value="settled">Settled only</option>
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
        <EmptyState title="No transactions match these filters" description="Try widening the date range or clearing a filter." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Admin Charge</th>
                <th className="px-4 py-3">Balance After</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">
                      {typeof t.user === "string" ? t.user : t.user.fullName || t.user.mobile}
                    </p>
                    {typeof t.user !== "string" && <p className="text-xs text-slate-500">{t.user.mobile}</p>}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{t.walletType}</td>
                  <td className="px-4 py-3">
                    <Badge tone={t.type === "credit" ? "success" : "danger"}>{t.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {t.status ? <Badge tone={t.status === "pending" ? "warning" : "success"}>{t.status}</Badge> : "—"}
                  </td>
                  <td className={`px-4 py-3 font-bold ${t.type === "credit" ? "text-emerald" : "text-red-600"}`}>
                    {t.type === "credit" ? "+" : "-"}
                    {formatINR(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    {t.adminChargeAmount ? `-${formatINR(t.adminChargeAmount)} (${t.adminChargePercent ?? 0}%)` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.balanceAfter != null ? formatINR(t.balanceAfter) : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{t.description || t.source}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} transactions
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

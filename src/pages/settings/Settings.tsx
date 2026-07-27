import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";

const ROLE_ACCESS = [
  { role: "investor", access: "Mobile app only — invest, view portfolio, wallets, KYC, referrals." },
  { role: "wealth_partner", access: "Everything an investor has, plus team/genealogy, ranks, and the Bonus Center." },
  { role: "franchise", access: "Reserved role — no dedicated screens implemented yet in mobile or admin." },
  { role: "employee", access: "Reserved role — no dedicated screens implemented yet in mobile or admin." },
  { role: "admin", access: "Full admin panel access: dashboard, users, KYC queue, and all sidebar modules." },
  { role: "super_admin", access: "Everything admin has, plus the ability to change any user's role." },
];

export default function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const [unitValueInr, setUnitValueInr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  // Guards against out-of-order responses (e.g. React StrictMode's double-mount in dev, or a
  // slow GET resolving after a save) clobbering fresher state with stale data.
  const latestRequestId = useRef(0);

  const load = async () => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (requestId !== latestRequestId.current) return;
      setUnitValueInr(String(res.data.data.settings.unitValueInr));
    } catch (e: any) {
      if (requestId !== latestRequestId.current) return;
      toast.show(e?.response?.data?.message || "Failed to load platform settings", "error");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unitValueNum = Number(unitValueInr);
  const unitValueValid = unitValueInr.trim() !== "" && Number.isFinite(unitValueNum) && unitValueNum >= 1;

  const saveUnitValue = async () => {
    setTouched(true);
    if (!unitValueValid) {
      toast.show("Enter a valid unit value in rupees", "error");
      return;
    }
    setSaving(true);
    latestRequestId.current += 1; // invalidate any in-flight load() so it can't overwrite this save
    try {
      const res = await api.patch("/settings", { unitValueInr: unitValueNum });
      setUnitValueInr(String(res.data.data.settings.unitValueInr));
      toast.show("Unit value updated", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not update unit value", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Settings" description="Your account, platform-wide values, and the role-based access model enforced by the backend." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Signed in as</p>
          <p className="text-sm font-semibold text-slate-800">{user?.fullName || user?.mobile}</p>
          <p className="text-xs text-slate-500">{user?.mobile}</p>
          <div className="mt-2">{user && <RoleBadge role={user.role} />}</div>
        </Card>

        <Card>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Roles & Permissions</p>
          <div className="flex flex-col gap-3">
            {ROLE_ACCESS.map((r) => (
              <div key={r.role} className="flex items-start gap-3">
                <RoleBadge role={r.role} />
                <p className="text-xs text-slate-500">{r.access}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Unit Value</p>
          <p className="mb-3 text-xs text-slate-500">
            The rupee value of 1 investment unit, used across the mobile app for every new investment calculation. Existing
            investments keep the unit price they were made at.
          </p>
          <div className="flex max-w-xs items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">1 Unit = ₹</label>
              <input
                value={unitValueInr}
                onChange={(e) => setUnitValueInr(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 25000"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !unitValueValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !unitValueValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid positive amount</p>}
            </div>
            <Button onClick={saveUnitValue} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

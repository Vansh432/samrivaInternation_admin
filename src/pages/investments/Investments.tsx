import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Landmark } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import type { RateSlab } from "@/lib/types";

const TENURE_OPTIONS = [6, 12, 18, 24, 30, 36];

const emptyForm = {
  minUnits: "",
  maxUnits: "",
  tenureMonths: [] as number[],
  compoundingRatePercent: "",
  monthlyIncomeRatePercent: "",
  isActive: true,
};

export default function Investments() {
  const toast = useToast();
  const [slabs, setSlabs] = useState<RateSlab[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/plans");
      setSlabs(res.data.data.slabs);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load rate plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTouched(false);
    setModalOpen(true);
  };

  const openEdit = (slab: RateSlab) => {
    setEditingId(slab.id);
    setForm({
      minUnits: String(slab.minUnits),
      maxUnits: slab.maxUnits === null ? "" : String(slab.maxUnits),
      tenureMonths: slab.tenureMonths,
      compoundingRatePercent: String(slab.compoundingRatePercent),
      monthlyIncomeRatePercent: String(slab.monthlyIncomeRatePercent),
      isActive: slab.isActive,
    });
    setTouched(false);
    setModalOpen(true);
  };

  const toggleTenure = (t: number) => {
    setForm((f) => ({
      ...f,
      tenureMonths: f.tenureMonths.includes(t) ? f.tenureMonths.filter((x) => x !== t) : [...f.tenureMonths, t].sort((a, b) => a - b),
    }));
  };

  const minUnitsNum = Number(form.minUnits);
  const maxUnitsNum = form.maxUnits.trim() === "" ? null : Number(form.maxUnits);
  const growthNum = Number(form.compoundingRatePercent);
  const incomeNum = Number(form.monthlyIncomeRatePercent);

  const minUnitsValid = Number.isInteger(minUnitsNum) && minUnitsNum >= 1;
  const maxUnitsValid = maxUnitsNum === null || (Number.isInteger(maxUnitsNum) && maxUnitsNum >= (minUnitsValid ? minUnitsNum : 1));
  const tenureValid = form.tenureMonths.length > 0;
  const growthValid = form.compoundingRatePercent.trim() !== "" && growthNum >= 0 && growthNum <= 100;
  const incomeValid = form.monthlyIncomeRatePercent.trim() !== "" && incomeNum >= 0 && incomeNum <= 100;
  const formValid = minUnitsValid && maxUnitsValid && tenureValid && growthValid && incomeValid;

  const save = async () => {
    setTouched(true);
    if (!formValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        minUnits: minUnitsNum,
        maxUnits: maxUnitsNum,
        tenureMonths: form.tenureMonths,
        compoundingRatePercent: growthNum,
        monthlyIncomeRatePercent: incomeNum,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/plans/${editingId}`, payload);
        toast.show("Rate slab updated", "success");
      } else {
        await api.post("/plans", payload);
        toast.show("Rate slab created", "success");
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save rate slab", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slab: RateSlab) => {
    const confirmed = window.confirm(
      `Delete the slab for units ${slab.minUnits}-${slab.maxUnits ?? "above"}, tenure ${slab.tenureMonths.join("/")}M?`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/plans/${slab.id}`);
      toast.show("Rate slab deleted", "success");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete rate slab", "error");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Investment Rate Plans"
        description="The ROI slabs used to calculate returns when investors buy debenture units — by unit range, tenure, and plan type (Compounding Growth / Monthly Income)."
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Rate Slab
          </Button>
        }
      />

      {slabs.length === 0 ? (
        <EmptyState
          title="No rate slabs configured yet"
          description="Add a rate slab to define the ROI investors earn for a given unit range and tenure."
          icon={<Landmark size={22} />}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Unit Range</th>
                <th className="px-5 py-3">Tenure</th>
                <th className="px-5 py-3">Growth % (Compounding)</th>
                <th className="px-5 py-3">Income % (Monthly)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slabs.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {s.minUnits}
                    {s.maxUnits !== null ? `-${s.maxUnits}` : "+"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.tenureMonths.join(" / ")}M</td>
                  <td className="px-5 py-3 font-bold text-emerald">{s.compoundingRatePercent}%</td>
                  <td className="px-5 py-3 font-bold text-gold-dark">{s.monthlyIncomeRatePercent}%</td>
                  <td className="px-5 py-3">
                    <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "active" : "inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(s)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Rate Slab" : "Add Rate Slab"}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Min Units *</label>
              <input
                value={form.minUnits}
                onChange={(e) => setForm((f) => ({ ...f, minUnits: e.target.value.replace(/\D/g, "") }))}
                placeholder="e.g. 1"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !minUnitsValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !minUnitsValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid minimum units</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Max Units</label>
              <input
                value={form.maxUnits}
                onChange={(e) => setForm((f) => ({ ...f, maxUnits: e.target.value.replace(/\D/g, "") }))}
                placeholder="blank = no upper limit"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !maxUnitsValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !maxUnitsValid && <p className="mt-1 text-xs font-semibold text-red-500">Must be &gt;= min units</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Tenure (months) *</label>
            <div className="flex flex-wrap gap-2">
              {TENURE_OPTIONS.map((t) => {
                const active = form.tenureMonths.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTenure(t)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                      active ? "border-emerald bg-emerald text-white" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t}M
                  </button>
                );
              })}
            </div>
            {touched && !tenureValid && <p className="mt-1 text-xs font-semibold text-red-500">Select at least one tenure</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Growth % (Compounding) *</label>
              <input
                value={form.compoundingRatePercent}
                onChange={(e) => setForm((f) => ({ ...f, compoundingRatePercent: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="e.g. 5.5"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !growthValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !growthValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter 0-100</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Income % (Monthly) *</label>
              <input
                value={form.monthlyIncomeRatePercent}
                onChange={(e) => setForm((f) => ({ ...f, monthlyIncomeRatePercent: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="e.g. 4.5"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !incomeValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !incomeValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter 0-100</p>}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
            />
            Active
          </label>

          <div className="mt-2 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Slab"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

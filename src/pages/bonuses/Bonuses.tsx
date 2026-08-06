import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Zap, Repeat, Users, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import type {
  FastStartBonusSlab,
  FastStartBonusAward,
  RetentionBonusSlab,
  LeadershipOverrideSlab,
  DirectAcquisitionBonusConfig,
  Paginated,
} from "@/lib/types";

const OTHER_PROGRAMS = [
  {
    name: "Rank Advancement Bonus",
    detail: "One-time cash reward on hitting each new rank (see Ranks & Leadership page for the full table).",
  },
  {
    name: "Leadership Pool",
    detail: "Monthly pool for eligible senior leaders. Qualification rules and slab table not yet published by the client.",
  },
];

const emptyForm = { unitsThreshold: "", bonusAmount: "", isActive: true };
const emptyOverrideForm = { generation: "1", percent: "", isActive: true };

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function Bonuses() {
  const toast = useToast();
  const [slabs, setSlabs] = useState<FastStartBonusSlab[]>([]);
  const [slabsLoading, setSlabsLoading] = useState(true);

  const [awards, setAwards] = useState<Paginated<FastStartBonusAward> | null>(null);
  const [awardsLoading, setAwardsLoading] = useState(true);
  const [awardsPage, setAwardsPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [retentionSlabs, setRetentionSlabs] = useState<RetentionBonusSlab[]>([]);
  const [retentionSlabsLoading, setRetentionSlabsLoading] = useState(true);
  const [retentionAwards, setRetentionAwards] = useState<Paginated<FastStartBonusAward> | null>(null);
  const [retentionAwardsLoading, setRetentionAwardsLoading] = useState(true);
  const [retentionAwardsPage, setRetentionAwardsPage] = useState(1);
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);
  const [editingRetentionId, setEditingRetentionId] = useState<string | null>(null);
  const [retentionForm, setRetentionForm] = useState(emptyForm);
  const [retentionTouched, setRetentionTouched] = useState(false);
  const [retentionSaving, setRetentionSaving] = useState(false);

  const [overrideSlabs, setOverrideSlabs] = useState<LeadershipOverrideSlab[]>([]);
  const [overrideSlabsLoading, setOverrideSlabsLoading] = useState(true);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const [overrideForm, setOverrideForm] = useState(emptyOverrideForm);
  const [overrideTouched, setOverrideTouched] = useState(false);
  const [overrideSaving, setOverrideSaving] = useState(false);

  const [directConfig, setDirectConfig] = useState<DirectAcquisitionBonusConfig | null>(null);
  const [directConfigLoading, setDirectConfigLoading] = useState(true);
  const [directForm, setDirectForm] = useState({ compoundingPercent: "", monthlyIncomePercent: "", isActive: true });
  const [directTouched, setDirectTouched] = useState(false);
  const [directSaving, setDirectSaving] = useState(false);

  const loadSlabs = async () => {
    setSlabsLoading(true);
    try {
      const res = await api.get("/bonuses/fast-start/slabs");
      setSlabs(res.data.data.slabs);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load Fast Start Bonus slabs", "error");
    } finally {
      setSlabsLoading(false);
    }
  };

  const loadAwards = async (page: number) => {
    setAwardsLoading(true);
    try {
      const res = await api.get("/bonuses/fast-start/awards", { params: { page, limit: 10 } });
      setAwards(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load Fast Start Bonus awards", "error");
    } finally {
      setAwardsLoading(false);
    }
  };

  const loadRetentionSlabs = async () => {
    setRetentionSlabsLoading(true);
    try {
      const res = await api.get("/bonuses/retention/slabs");
      setRetentionSlabs(res.data.data.slabs);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load Retention Bonus slabs", "error");
    } finally {
      setRetentionSlabsLoading(false);
    }
  };

  const loadRetentionAwards = async (page: number) => {
    setRetentionAwardsLoading(true);
    try {
      const res = await api.get("/bonuses/retention/awards", { params: { page, limit: 10 } });
      setRetentionAwards(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load Retention Bonus awards", "error");
    } finally {
      setRetentionAwardsLoading(false);
    }
  };

  const loadOverrideSlabs = async () => {
    setOverrideSlabsLoading(true);
    try {
      const res = await api.get("/overrides/slabs");
      setOverrideSlabs(res.data.data.slabs);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load Leadership Override slabs", "error");
    } finally {
      setOverrideSlabsLoading(false);
    }
  };

  const loadDirectConfig = async () => {
    setDirectConfigLoading(true);
    try {
      const res = await api.get("/bonuses/direct-acquisition");
      const config: DirectAcquisitionBonusConfig = res.data.data.config;
      setDirectConfig(config);
      setDirectForm({
        compoundingPercent: String(config.compoundingPercent),
        monthlyIncomePercent: String(config.monthlyIncomePercent),
        isActive: config.isActive,
      });
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load Direct Acquisition Bonus config", "error");
    } finally {
      setDirectConfigLoading(false);
    }
  };

  useEffect(() => {
    loadSlabs();
    loadRetentionSlabs();
    loadOverrideSlabs();
    loadDirectConfig();
  }, []);

  useEffect(() => {
    loadAwards(awardsPage);
  }, [awardsPage]);

  useEffect(() => {
    loadRetentionAwards(retentionAwardsPage);
  }, [retentionAwardsPage]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTouched(false);
    setModalOpen(true);
  };

  const openEdit = (slab: FastStartBonusSlab) => {
    setEditingId(slab.id);
    setForm({ unitsThreshold: String(slab.unitsThreshold), bonusAmount: String(slab.bonusAmount), isActive: slab.isActive });
    setTouched(false);
    setModalOpen(true);
  };

  const unitsNum = Number(form.unitsThreshold);
  const bonusNum = Number(form.bonusAmount);
  const unitsValid = Number.isInteger(unitsNum) && unitsNum >= 1;
  const bonusValid = form.bonusAmount.trim() !== "" && bonusNum >= 0;
  const formValid = unitsValid && bonusValid;

  const save = async () => {
    setTouched(true);
    if (!formValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { unitsThreshold: unitsNum, bonusAmount: bonusNum, isActive: form.isActive };
      if (editingId) {
        await api.patch(`/bonuses/fast-start/slabs/${editingId}`, payload);
        toast.show("Slab updated", "success");
      } else {
        await api.post("/bonuses/fast-start/slabs", payload);
        toast.show("Slab created", "success");
      }
      setModalOpen(false);
      loadSlabs();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save slab", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slab: FastStartBonusSlab) => {
    const confirmed = window.confirm(`Delete the ${slab.unitsThreshold}-unit slab (${formatINR(slab.bonusAmount)})?`);
    if (!confirmed) return;
    try {
      await api.delete(`/bonuses/fast-start/slabs/${slab.id}`);
      toast.show("Slab deleted", "success");
      loadSlabs();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete slab", "error");
    }
  };

  const openAddRetention = () => {
    setEditingRetentionId(null);
    setRetentionForm(emptyForm);
    setRetentionTouched(false);
    setRetentionModalOpen(true);
  };

  const openEditRetention = (slab: RetentionBonusSlab) => {
    setEditingRetentionId(slab.id);
    setRetentionForm({ unitsThreshold: String(slab.unitsThreshold), bonusAmount: String(slab.bonusAmount), isActive: slab.isActive });
    setRetentionTouched(false);
    setRetentionModalOpen(true);
  };

  const retentionUnitsNum = Number(retentionForm.unitsThreshold);
  const retentionBonusNum = Number(retentionForm.bonusAmount);
  const retentionUnitsValid = Number.isInteger(retentionUnitsNum) && retentionUnitsNum >= 1;
  const retentionBonusValid = retentionForm.bonusAmount.trim() !== "" && retentionBonusNum >= 0;
  const retentionFormValid = retentionUnitsValid && retentionBonusValid;

  const saveRetention = async () => {
    setRetentionTouched(true);
    if (!retentionFormValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setRetentionSaving(true);
    try {
      const payload = { unitsThreshold: retentionUnitsNum, bonusAmount: retentionBonusNum, isActive: retentionForm.isActive };
      if (editingRetentionId) {
        await api.patch(`/bonuses/retention/slabs/${editingRetentionId}`, payload);
        toast.show("Slab updated", "success");
      } else {
        await api.post("/bonuses/retention/slabs", payload);
        toast.show("Slab created", "success");
      }
      setRetentionModalOpen(false);
      loadRetentionSlabs();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save slab", "error");
    } finally {
      setRetentionSaving(false);
    }
  };

  const removeRetention = async (slab: RetentionBonusSlab) => {
    const confirmed = window.confirm(`Delete the ${slab.unitsThreshold}-unit slab (${formatINR(slab.bonusAmount)})?`);
    if (!confirmed) return;
    try {
      await api.delete(`/bonuses/retention/slabs/${slab.id}`);
      toast.show("Slab deleted", "success");
      loadRetentionSlabs();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete slab", "error");
    }
  };

  const openAddOverride = () => {
    setEditingOverrideId(null);
    setOverrideForm(emptyOverrideForm);
    setOverrideTouched(false);
    setOverrideModalOpen(true);
  };

  const openEditOverride = (slab: LeadershipOverrideSlab) => {
    setEditingOverrideId(slab.id);
    setOverrideForm({ generation: String(slab.generation), percent: String(slab.percent), isActive: slab.isActive });
    setOverrideTouched(false);
    setOverrideModalOpen(true);
  };

  const overrideGenerationNum = Number(overrideForm.generation);
  const overridePercentNum = Number(overrideForm.percent);
  const overrideGenerationValid = [1, 2, 3].includes(overrideGenerationNum);
  const overridePercentValid = overrideForm.percent.trim() !== "" && overridePercentNum >= 0 && overridePercentNum <= 100;
  const overrideFormValid = overrideGenerationValid && overridePercentValid;

  const saveOverride = async () => {
    setOverrideTouched(true);
    if (!overrideFormValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setOverrideSaving(true);
    try {
      const payload = { generation: overrideGenerationNum, percent: overridePercentNum, isActive: overrideForm.isActive };
      if (editingOverrideId) {
        await api.patch(`/overrides/slabs/${editingOverrideId}`, payload);
        toast.show("Slab updated", "success");
      } else {
        await api.post("/overrides/slabs", payload);
        toast.show("Slab created", "success");
      }
      setOverrideModalOpen(false);
      loadOverrideSlabs();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save slab", "error");
    } finally {
      setOverrideSaving(false);
    }
  };

  const removeOverride = async (slab: LeadershipOverrideSlab) => {
    const confirmed = window.confirm(`Delete the generation ${slab.generation} slab (${slab.percent}%)?`);
    if (!confirmed) return;
    try {
      await api.delete(`/overrides/slabs/${slab.id}`);
      toast.show("Slab deleted", "success");
      loadOverrideSlabs();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete slab", "error");
    }
  };

  const directCompoundingNum = Number(directForm.compoundingPercent);
  const directMonthlyNum = Number(directForm.monthlyIncomePercent);
  const directCompoundingValid = directForm.compoundingPercent.trim() !== "" && directCompoundingNum >= 0 && directCompoundingNum <= 100;
  const directMonthlyValid = directForm.monthlyIncomePercent.trim() !== "" && directMonthlyNum >= 0 && directMonthlyNum <= 100;
  const directFormValid = directCompoundingValid && directMonthlyValid;

  const saveDirectConfig = async () => {
    setDirectTouched(true);
    if (!directFormValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setDirectSaving(true);
    try {
      const payload = {
        compoundingPercent: directCompoundingNum,
        monthlyIncomePercent: directMonthlyNum,
        isActive: directForm.isActive,
      };
      const res = await api.patch("/bonuses/direct-acquisition", payload);
      setDirectConfig(res.data.data.config);
      toast.show("Direct Acquisition Bonus config updated", "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save Direct Acquisition Bonus config", "error");
    } finally {
      setDirectSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bonus Center"
        description="The six Wealth Partner income streams from the compensation plan. Fast Start, Retention, and Leadership Override are live below; the rest need a dedicated backend module."
      />

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Zap size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Fast Start Bonus</p>
              <p className="text-sm text-slate-500">
                A sponsor's 30-day window starts the day their own first investment is approved. Bonus is paid on the
                combined active units their direct-referred team invests within that window, capped at the highest
                tier reached.
              </p>
            </div>
          </div>
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Slab
          </Button>
        </div>

        {slabsLoading ? (
          <PageLoader />
        ) : slabs.length === 0 ? (
          <EmptyState
            title="No slabs configured yet"
            description="Add a units-threshold → bonus-amount slab to start paying the Fast Start Bonus."
            icon={<Zap size={22} />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Units Threshold</th>
                  <th className="px-3 py-2">Bonus Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-800">{s.unitsThreshold} units</td>
                    <td className="px-3 py-2 font-bold text-emerald">{formatINR(s.bonusAmount)}</td>
                    <td className="px-3 py-2">
                      <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "active" : "inactive"}</Badge>
                    </td>
                    <td className="px-3 py-2">
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
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <p className="mb-3 font-bold text-slate-800">Fast Start Bonus Awards</p>
        {awardsLoading ? (
          <PageLoader />
        ) : !awards || awards.items.length === 0 ? (
          <EmptyState title="No awards paid out yet" description="Fast Start Bonus credits will show up here as sponsors' teams qualify." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2">Sponsor</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {awards.items.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {typeof a.user === "string" ? a.user : a.user.fullName || a.user.mobile}
                      </td>
                      <td className="px-3 py-2 font-bold text-emerald">{formatINR(a.amount)}</td>
                      <td className="px-3 py-2 text-slate-500">{a.description}</td>
                      <td className="px-3 py-2 text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {awards.page} of {awards.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={awards.page <= 1}
                  onClick={() => setAwardsPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={awards.page >= awards.totalPages}
                  onClick={() => setAwardsPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 p-1.5 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Repeat size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Retention Bonus</p>
              <p className="text-sm text-slate-500">
                Lifetime cumulative — a sponsor's direct-referred team's renewal units (matured investments
                reinvested via "Renew Investment", not withdrawn) are matched against these tiers, capped at the
                highest tier reached.
              </p>
            </div>
          </div>
          <Button onClick={openAddRetention}>
            <Plus size={16} /> Add Slab
          </Button>
        </div>

        {retentionSlabsLoading ? (
          <PageLoader />
        ) : retentionSlabs.length === 0 ? (
          <EmptyState
            title="No slabs configured yet"
            description="Add a units-threshold → bonus-amount slab to start paying the Retention Bonus."
            icon={<Repeat size={22} />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Units Threshold</th>
                  <th className="px-3 py-2">Bonus Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {retentionSlabs.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-800">{s.unitsThreshold} units</td>
                    <td className="px-3 py-2 font-bold text-emerald">{formatINR(s.bonusAmount)}</td>
                    <td className="px-3 py-2">
                      <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "active" : "inactive"}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditRetention(s)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeRetention(s)}
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
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <p className="mb-3 font-bold text-slate-800">Retention Bonus Awards</p>
        {retentionAwardsLoading ? (
          <PageLoader />
        ) : !retentionAwards || retentionAwards.items.length === 0 ? (
          <EmptyState title="No awards paid out yet" description="Retention Bonus credits will show up here as direct teams renew." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2">Sponsor</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionAwards.items.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {typeof a.user === "string" ? a.user : a.user.fullName || a.user.mobile}
                      </td>
                      <td className="px-3 py-2 font-bold text-emerald">{formatINR(a.amount)}</td>
                      <td className="px-3 py-2 text-slate-500">{a.description}</td>
                      <td className="px-3 py-2 text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {retentionAwards.page} of {retentionAwards.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={retentionAwards.page <= 1}
                  onClick={() => setRetentionAwardsPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={retentionAwards.page >= retentionAwards.totalPages}
                  onClick={() => setRetentionAwardsPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 p-1.5 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Users size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Leadership Override</p>
              <p className="text-sm text-slate-500">
                Settled monthly (1st of the month, for the calendar month that just closed) — every user earns
                this % of their own Gen 1/2/3 upline's Commission wallet total for that month, only counted for
                generations that currently outrank them. Credited to the Bonus wallet; visible in Wallets →
                Transactions.
              </p>
            </div>
          </div>
          <Button onClick={openAddOverride}>
            <Plus size={16} /> Add Slab
          </Button>
        </div>

        {overrideSlabsLoading ? (
          <PageLoader />
        ) : overrideSlabs.length === 0 ? (
          <EmptyState
            title="No slabs configured yet"
            description="Add a generation → percent slab to start paying the Leadership Override Bonus."
            icon={<Users size={22} />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Generation</th>
                  <th className="px-3 py-2">Percent</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...overrideSlabs]
                  .sort((a, b) => a.generation - b.generation)
                  .map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-800">Generation {s.generation}</td>
                      <td className="px-3 py-2 font-bold text-emerald">{s.percent}%</td>
                      <td className="px-3 py-2">
                        <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "active" : "inactive"}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditOverride(s)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => removeOverride(s)}
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
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <UserPlus size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-800">Direct Acquisition Bonus</p>
            <p className="text-sm text-slate-500">
              Paid on investment approval — a sponsor earns this % of their direct (level-1) referral's investment,
              rate depending on the referred plan type. Uncapped, not rank-gated. Credited to the Commission wallet,
              in addition to Rank Income.
            </p>
          </div>
        </div>

        {directConfigLoading ? (
          <PageLoader />
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                Compounding Plan %
              </label>
              <input
                value={directForm.compoundingPercent}
                onChange={(e) => setDirectForm((f) => ({ ...f, compoundingPercent: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="e.g. 3"
                className={`w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  directTouched && !directCompoundingValid ? "border-red-400" : "border-slate-300"
                }`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                Monthly Income Plan %
              </label>
              <input
                value={directForm.monthlyIncomePercent}
                onChange={(e) => setDirectForm((f) => ({ ...f, monthlyIncomePercent: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="e.g. 2"
                className={`w-32 rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  directTouched && !directMonthlyValid ? "border-red-400" : "border-slate-300"
                }`}
              />
            </div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={directForm.isActive}
                onChange={(e) => setDirectForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
              />
              Active
            </label>
            <Button onClick={saveDirectConfig} disabled={directSaving}>
              {directSaving ? "Saving…" : "Save"}
            </Button>
            {directConfig && (
              <Badge tone={directConfig.isActive ? "success" : "neutral"}>{directConfig.isActive ? "active" : "inactive"}</Badge>
            )}
          </div>
        )}
        {directTouched && (!directCompoundingValid || !directMonthlyValid) && (
          <p className="mt-2 text-xs font-semibold text-red-500">Enter valid percentages between 0 and 100</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {OTHER_PROGRAMS.map((p) => (
          <Card key={p.name}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-slate-800">{p.name}</p>
              <Badge tone="warning">Backend pending</Badge>
            </div>
            <p className="text-sm text-slate-500">{p.detail}</p>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Slab" : "Add Slab"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Units Threshold *</label>
            <input
              value={form.unitsThreshold}
              onChange={(e) => setForm((f) => ({ ...f, unitsThreshold: e.target.value.replace(/\D/g, "") }))}
              placeholder="e.g. 50"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                touched && !unitsValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {touched && !unitsValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid positive integer</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Bonus Amount (₹) *</label>
            <input
              value={form.bonusAmount}
              onChange={(e) => setForm((f) => ({ ...f, bonusAmount: e.target.value.replace(/[^0-9.]/g, "") }))}
              placeholder="e.g. 10000"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                touched && !bonusValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {touched && !bonusValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid amount (0 or more)</p>}
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

      <Modal open={retentionModalOpen} onClose={() => setRetentionModalOpen(false)} title={editingRetentionId ? "Edit Slab" : "Add Slab"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Units Threshold *</label>
            <input
              value={retentionForm.unitsThreshold}
              onChange={(e) => setRetentionForm((f) => ({ ...f, unitsThreshold: e.target.value.replace(/\D/g, "") }))}
              placeholder="e.g. 100"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                retentionTouched && !retentionUnitsValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {retentionTouched && !retentionUnitsValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid positive integer</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Bonus Amount (₹) *</label>
            <input
              value={retentionForm.bonusAmount}
              onChange={(e) => setRetentionForm((f) => ({ ...f, bonusAmount: e.target.value.replace(/[^0-9.]/g, "") }))}
              placeholder="e.g. 10000"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                retentionTouched && !retentionBonusValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {retentionTouched && !retentionBonusValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid amount (0 or more)</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={retentionForm.isActive}
              onChange={(e) => setRetentionForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
            />
            Active
          </label>

          <div className="mt-2 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setRetentionModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={saveRetention} disabled={retentionSaving}>
              {retentionSaving ? "Saving…" : editingRetentionId ? "Save Changes" : "Create Slab"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={overrideModalOpen} onClose={() => setOverrideModalOpen(false)} title={editingOverrideId ? "Edit Slab" : "Add Slab"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Generation *</label>
            <select
              value={overrideForm.generation}
              onChange={(e) => setOverrideForm((f) => ({ ...f, generation: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              <option value="1">Generation 1</option>
              <option value="2">Generation 2</option>
              <option value="3">Generation 3</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Percent (%) *</label>
            <input
              value={overrideForm.percent}
              onChange={(e) => setOverrideForm((f) => ({ ...f, percent: e.target.value.replace(/[^0-9.]/g, "") }))}
              placeholder="e.g. 2"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                overrideTouched && !overridePercentValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {overrideTouched && !overridePercentValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid percent (0–100)</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={overrideForm.isActive}
              onChange={(e) => setOverrideForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
            />
            Active
          </label>

          <div className="mt-2 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={saveOverride} disabled={overrideSaving}>
              {overrideSaving ? "Saving…" : editingOverrideId ? "Save Changes" : "Create Slab"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

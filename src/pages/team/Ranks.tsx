import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Award } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import type { Rank, RankSlab, RankBenefitSlab, RankAchievementSlab } from "@/lib/types";

const RANKS: Rank[] = [
  "investor",
  "associate",
  "senior_associate",
  "manager",
  "senior_manager",
  "director",
  "regional_director",
  "national_director",
];

const NON_INVESTOR_RANKS = RANKS.filter((r) => r !== "investor");

const label = (r: Rank) => r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type RankSlabForm = {
  rank: Rank;
  selfUnitsMin: string;
  directTeamSizeMin: string;
  requiredDirectRank: Rank;
  teamBusinessUnitMin: string;
  incomePercent: string;
  isActive: boolean;
};

const emptyForm: RankSlabForm = {
  rank: NON_INVESTOR_RANKS[0],
  selfUnitsMin: "",
  directTeamSizeMin: "",
  requiredDirectRank: RANKS[0],
  teamBusinessUnitMin: "",
  incomePercent: "",
  isActive: true,
};

const BENEFIT_FIELDS = [
  { key: "mobileBonus", label: "Mobile Bonus" },
  { key: "groomingBonus", label: "Grooming Bonus" },
  { key: "conveyanceBonus", label: "Conveyance Bonus" },
  { key: "lifeStyleBonus", label: "Life Style Bonus" },
  { key: "businessTourBonus", label: "Business Tour Bonus" },
  { key: "familyTripBonus", label: "Family Trip Bonus" },
] as const;

type BenefitSlabForm = {
  rank: Rank;
  mobileBonus: string;
  groomingBonus: string;
  conveyanceBonus: string;
  lifeStyleBonus: string;
  businessTourBonus: string;
  familyTripBonus: string;
  qualifyingDirectUnitsPerMonth: string;
  isActive: boolean;
};

const emptyBenefitForm: BenefitSlabForm = {
  rank: NON_INVESTOR_RANKS[0],
  mobileBonus: "",
  groomingBonus: "",
  conveyanceBonus: "",
  lifeStyleBonus: "",
  businessTourBonus: "",
  familyTripBonus: "",
  qualifyingDirectUnitsPerMonth: "",
  isActive: true,
};

type AchievementSlabForm = {
  rank: Rank;
  amount: string;
  isActive: boolean;
};

const emptyAchievementForm: AchievementSlabForm = {
  rank: NON_INVESTOR_RANKS[0],
  amount: "",
  isActive: true,
};

const money = (v: number) => (v > 0 ? `₹${v.toLocaleString("en-IN")}` : "N/a");

export default function Ranks() {
  const toast = useToast();
  const [slabs, setSlabs] = useState<RankSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [benefitSlabs, setBenefitSlabs] = useState<RankBenefitSlab[]>([]);
  const [benefitLoading, setBenefitLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [benefitModalOpen, setBenefitModalOpen] = useState(false);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [benefitForm, setBenefitForm] = useState(emptyBenefitForm);
  const [benefitTouched, setBenefitTouched] = useState(false);
  const [benefitSaving, setBenefitSaving] = useState(false);

  const [achievementSlabs, setAchievementSlabs] = useState<RankAchievementSlab[]>([]);
  const [achievementLoading, setAchievementLoading] = useState(true);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState(emptyAchievementForm);
  const [achievementTouched, setAchievementTouched] = useState(false);
  const [achievementSaving, setAchievementSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ranks");
      const sorted = [...(res.data.data.slabs as RankSlab[])].sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
      setSlabs(sorted);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load rank qualification slabs", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBenefits = async () => {
    setBenefitLoading(true);
    try {
      const res = await api.get("/ranks/benefit-slabs");
      const sorted = [...(res.data.data.slabs as RankBenefitSlab[])].sort(
        (a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank)
      );
      setBenefitSlabs(sorted);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load rank benefit slabs", "error");
    } finally {
      setBenefitLoading(false);
    }
  };

  const loadAchievements = async () => {
    setAchievementLoading(true);
    try {
      const res = await api.get("/ranks/achievement-slabs");
      const sorted = [...(res.data.data.slabs as RankAchievementSlab[])].sort(
        (a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank)
      );
      setAchievementSlabs(sorted);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load rank achievement slabs", "error");
    } finally {
      setAchievementLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadBenefits();
    loadAchievements();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTouched(false);
    setModalOpen(true);
  };

  const openEdit = (slab: RankSlab) => {
    setEditingId(slab.id);
    setForm({
      rank: slab.rank,
      selfUnitsMin: String(slab.selfUnitsMin),
      directTeamSizeMin: String(slab.directTeamSizeMin),
      requiredDirectRank: slab.requiredDirectRank,
      teamBusinessUnitMin: String(slab.teamBusinessUnitMin),
      incomePercent: String(slab.incomePercent),
      isActive: slab.isActive,
    });
    setTouched(false);
    setModalOpen(true);
  };

  const selfUnitsNum = Number(form.selfUnitsMin);
  const teamSizeNum = Number(form.directTeamSizeMin);
  const businessUnitNum = form.teamBusinessUnitMin.trim() === "" ? 0 : Number(form.teamBusinessUnitMin);
  const incomePercentNum = Number(form.incomePercent);
  const selfUnitsValid = Number.isInteger(selfUnitsNum) && selfUnitsNum >= 0;
  const teamSizeValid = Number.isInteger(teamSizeNum) && teamSizeNum >= 0;
  const businessUnitValid = Number.isInteger(businessUnitNum) && businessUnitNum >= 0;
  const incomePercentValid = form.incomePercent.trim() !== "" && incomePercentNum >= 0 && incomePercentNum <= 100;
  const formValid = selfUnitsValid && teamSizeValid && businessUnitValid && incomePercentValid;

  const save = async () => {
    setTouched(true);
    if (!formValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        rank: form.rank,
        selfUnitsMin: selfUnitsNum,
        directTeamSizeMin: teamSizeNum,
        requiredDirectRank: form.requiredDirectRank,
        teamBusinessUnitMin: businessUnitNum,
        incomePercent: incomePercentNum,
        isActive: form.isActive,
      };
      if (editingId) {
        await api.patch(`/ranks/${editingId}`, payload);
        toast.show("Rank slab updated", "success");
      } else {
        await api.post("/ranks", payload);
        toast.show("Rank slab created", "success");
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save rank slab", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slab: RankSlab) => {
    const confirmed = window.confirm(`Delete the ${label(slab.rank)} qualification slab?`);
    if (!confirmed) return;
    try {
      await api.delete(`/ranks/${slab.id}`);
      toast.show("Rank slab deleted", "success");
      load();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete rank slab", "error");
    }
  };

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await api.post("/ranks/recalculate");
      const { scanned, changed, achievementBonusesPaid, achievementBonusTotal } = res.data.data;
      const achievementNote =
        achievementBonusesPaid > 0 ? ` · ${achievementBonusesPaid} achievement bonus${achievementBonusesPaid === 1 ? "" : "es"} paid (${money(achievementBonusTotal)})` : "";
      toast.show(`Recalculated ${scanned} users — ${changed} rank change${changed === 1 ? "" : "s"}${achievementNote}`, "success");
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Recalculation failed", "error");
    } finally {
      setRecalculating(false);
    }
  };

  const openAddBenefit = () => {
    setEditingBenefitId(null);
    setBenefitForm(emptyBenefitForm);
    setBenefitTouched(false);
    setBenefitModalOpen(true);
  };

  const openEditBenefit = (slab: RankBenefitSlab) => {
    setEditingBenefitId(slab.id);
    setBenefitForm({
      rank: slab.rank,
      mobileBonus: String(slab.mobileBonus),
      groomingBonus: String(slab.groomingBonus),
      conveyanceBonus: String(slab.conveyanceBonus),
      lifeStyleBonus: String(slab.lifeStyleBonus),
      businessTourBonus: String(slab.businessTourBonus),
      familyTripBonus: String(slab.familyTripBonus),
      qualifyingDirectUnitsPerMonth: String(slab.qualifyingDirectUnitsPerMonth),
      isActive: slab.isActive,
    });
    setBenefitTouched(false);
    setBenefitModalOpen(true);
  };

  const benefitAmountNums = Object.fromEntries(
    BENEFIT_FIELDS.map(({ key }) => [key, benefitForm[key].trim() === "" ? 0 : Number(benefitForm[key])])
  ) as Record<(typeof BENEFIT_FIELDS)[number]["key"], number>;
  const benefitAmountsValid = BENEFIT_FIELDS.every(
    ({ key }) => Number.isInteger(benefitAmountNums[key]) && benefitAmountNums[key] >= 0
  );
  const qualifyingUnitsNum = Number(benefitForm.qualifyingDirectUnitsPerMonth);
  const qualifyingUnitsValid = Number.isInteger(qualifyingUnitsNum) && qualifyingUnitsNum >= 0;
  const benefitFormValid = benefitAmountsValid && qualifyingUnitsValid;

  const saveBenefit = async () => {
    setBenefitTouched(true);
    if (!benefitFormValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setBenefitSaving(true);
    try {
      const payload = {
        rank: benefitForm.rank,
        ...benefitAmountNums,
        qualifyingDirectUnitsPerMonth: qualifyingUnitsNum,
        isActive: benefitForm.isActive,
      };
      if (editingBenefitId) {
        await api.patch(`/ranks/benefit-slabs/${editingBenefitId}`, payload);
        toast.show("Rank benefit slab updated", "success");
      } else {
        await api.post("/ranks/benefit-slabs", payload);
        toast.show("Rank benefit slab created", "success");
      }
      setBenefitModalOpen(false);
      loadBenefits();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save rank benefit slab", "error");
    } finally {
      setBenefitSaving(false);
    }
  };

  const removeBenefit = async (slab: RankBenefitSlab) => {
    const confirmed = window.confirm(`Delete the ${label(slab.rank)} benefit slab?`);
    if (!confirmed) return;
    try {
      await api.delete(`/ranks/benefit-slabs/${slab.id}`);
      toast.show("Rank benefit slab deleted", "success");
      loadBenefits();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete rank benefit slab", "error");
    }
  };

  const openAddAchievement = () => {
    setEditingAchievementId(null);
    setAchievementForm(emptyAchievementForm);
    setAchievementTouched(false);
    setAchievementModalOpen(true);
  };

  const openEditAchievement = (slab: RankAchievementSlab) => {
    setEditingAchievementId(slab.id);
    setAchievementForm({
      rank: slab.rank,
      amount: String(slab.amount),
      isActive: slab.isActive,
    });
    setAchievementTouched(false);
    setAchievementModalOpen(true);
  };

  const achievementAmountNum = Number(achievementForm.amount);
  const achievementAmountValid = achievementForm.amount.trim() !== "" && achievementAmountNum >= 0;

  const saveAchievement = async () => {
    setAchievementTouched(true);
    if (!achievementAmountValid) {
      toast.show("Please fix the highlighted fields", "error");
      return;
    }
    setAchievementSaving(true);
    try {
      const payload = {
        rank: achievementForm.rank,
        amount: achievementAmountNum,
        isActive: achievementForm.isActive,
      };
      if (editingAchievementId) {
        await api.patch(`/ranks/achievement-slabs/${editingAchievementId}`, payload);
        toast.show("Rank achievement slab updated", "success");
      } else {
        await api.post("/ranks/achievement-slabs", payload);
        toast.show("Rank achievement slab created", "success");
      }
      setAchievementModalOpen(false);
      loadAchievements();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not save rank achievement slab", "error");
    } finally {
      setAchievementSaving(false);
    }
  };

  const removeAchievement = async (slab: RankAchievementSlab) => {
    const confirmed = window.confirm(`Delete the ${label(slab.rank)} achievement slab?`);
    if (!confirmed) return;
    try {
      await api.delete(`/ranks/achievement-slabs/${slab.id}`);
      toast.show("Rank achievement slab deleted", "success");
      loadAchievements();
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Could not delete rank achievement slab", "error");
    }
  };

  const evaluateBenefits = async () => {
    setEvaluating(true);
    try {
      const res = await api.post("/ranks/benefits/evaluate");
      const { yearMonth, scanned, qualified, totalPaid } = res.data.data;
      toast.show(
        `${yearMonth}: ${qualified} of ${scanned} users qualified — ₹${totalPaid.toLocaleString("en-IN")} paid`,
        "success"
      );
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Evaluation failed", "error");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Ranks & Leadership"
        description="Qualification criteria for the 8-tier Wealth Partner career ladder — recalculated automatically every night, or on demand below."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={recalculate} disabled={recalculating}>
              <RefreshCw size={16} className={recalculating ? "animate-spin" : ""} /> Recalculate Now
            </Button>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Slab
            </Button>
          </div>
        }
      />

      {slabs.length === 0 ? (
        <EmptyState
          title="No rank qualification slabs configured yet"
          description="Add a slab to define what it takes to reach each rank."
          icon={<Award size={22} />}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Self Units</th>
                <th className="px-5 py-3">Team Size</th>
                <th className="px-5 py-3">Required Direct Rank</th>
                <th className="px-5 py-3">Team Business Units</th>
                <th className="px-5 py-3">Rank Income %</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slabs.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{label(s.rank)}</td>
                  <td className="px-5 py-3 text-slate-600">{s.selfUnitsMin}</td>
                  <td className="px-5 py-3 text-slate-600">{s.directTeamSizeMin} direct</td>
                  <td className="px-5 py-3 text-slate-600">{label(s.requiredDirectRank)}+</td>
                  <td className="px-5 py-3 text-slate-600">{s.teamBusinessUnitMin > 0 ? s.teamBusinessUnitMin : "None"}</td>
                  <td className="px-5 py-3 font-bold text-emerald">{s.incomePercent}%</td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Rank Slab" : "Add Rank Slab"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Rank *</label>
            <select
              value={form.rank}
              onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value as Rank }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {NON_INVESTOR_RANKS.map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Self Units Min *</label>
              <input
                value={form.selfUnitsMin}
                onChange={(e) => setForm((f) => ({ ...f, selfUnitsMin: e.target.value.replace(/\D/g, "") }))}
                placeholder="e.g. 1"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !selfUnitsValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !selfUnitsValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid number</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Direct Team Size Min *</label>
              <input
                value={form.directTeamSizeMin}
                onChange={(e) => setForm((f) => ({ ...f, directTeamSizeMin: e.target.value.replace(/\D/g, "") }))}
                placeholder="e.g. 2"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                  touched && !teamSizeValid ? "border-red-400" : "border-slate-300"
                }`}
              />
              {touched && !teamSizeValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid number</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Required Direct Rank *</label>
            <select
              value={form.requiredDirectRank}
              onChange={(e) => setForm((f) => ({ ...f, requiredDirectRank: e.target.value as Rank }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">Each counted direct referral must have reached at least this rank.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Team Business Units Min</label>
            <input
              value={form.teamBusinessUnitMin}
              onChange={(e) => setForm((f) => ({ ...f, teamBusinessUnitMin: e.target.value.replace(/\D/g, "") }))}
              placeholder="0 = no requirement"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                touched && !businessUnitValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {touched && !businessUnitValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid number</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Rank Income % *</label>
            <input
              value={form.incomePercent}
              onChange={(e) => setForm((f) => ({ ...f, incomePercent: e.target.value.replace(/[^0-9.]/g, "") }))}
              placeholder="e.g. 3"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                touched && !incomePercentValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {touched && !incomePercentValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid percent (0–100)</p>}
            <p className="mt-1 text-xs text-slate-400">
              This rank's rate in the 7-level income table — earned on investments from the matching level of anyone's downline.
            </p>
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

      <div className="mt-8">
        <PageHeader
          title="Rank-wise Monthly Benefits"
          description="Recurring perk bonuses paid to the Reward wallet each month a rank is held, once that month's direct/level-one team business meets the qualifying units."
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={evaluateBenefits} disabled={evaluating}>
                <RefreshCw size={16} className={evaluating ? "animate-spin" : ""} /> Run Monthly Evaluation Now
              </Button>
              <Button onClick={openAddBenefit}>
                <Plus size={16} /> Add Slab
              </Button>
            </div>
          }
        />

        {benefitLoading ? (
          <PageLoader />
        ) : benefitSlabs.length === 0 ? (
          <EmptyState
            title="No rank benefit slabs configured yet"
            description="Add a slab to define the monthly perk bonuses for each rank."
            icon={<Award size={22} />}
          />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Rank</th>
                  {BENEFIT_FIELDS.map(({ key, label: l }) => (
                    <th key={key} className="px-5 py-3">
                      {l}
                    </th>
                  ))}
                  <th className="px-5 py-3">Qualifying (PM)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {benefitSlabs.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{label(s.rank)}</td>
                    {BENEFIT_FIELDS.map(({ key }) => (
                      <td key={key} className="px-5 py-3 text-slate-600">
                        {money(s[key])}
                      </td>
                    ))}
                    <td className="px-5 py-3 font-semibold text-emerald">{s.qualifyingDirectUnitsPerMonth} unit Direct Business</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "active" : "inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditBenefit(s)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeBenefit(s)}
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
      </div>

      <Modal
        open={benefitModalOpen}
        onClose={() => setBenefitModalOpen(false)}
        title={editingBenefitId ? "Edit Rank Benefit Slab" : "Add Rank Benefit Slab"}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Rank *</label>
            <select
              value={benefitForm.rank}
              onChange={(e) => setBenefitForm((f) => ({ ...f, rank: e.target.value as Rank }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {NON_INVESTOR_RANKS.map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BENEFIT_FIELDS.map(({ key, label: l }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">{l}</label>
                <input
                  value={benefitForm[key]}
                  onChange={(e) => setBenefitForm((f) => ({ ...f, [key]: e.target.value.replace(/\D/g, "") }))}
                  placeholder="0 = N/a"
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                    benefitTouched && !(Number.isInteger(benefitAmountNums[key]) && benefitAmountNums[key] >= 0)
                      ? "border-red-400"
                      : "border-slate-300"
                  }`}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Qualifying Direct Units / Month *</label>
            <input
              value={benefitForm.qualifyingDirectUnitsPerMonth}
              onChange={(e) => setBenefitForm((f) => ({ ...f, qualifyingDirectUnitsPerMonth: e.target.value.replace(/\D/g, "") }))}
              placeholder="e.g. 1"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                benefitTouched && !qualifyingUnitsValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {benefitTouched && !qualifyingUnitsValid && <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid number</p>}
            <p className="mt-1 text-xs text-slate-400">
              Minimum units of new investment approved for direct/level-one referrals that month.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={benefitForm.isActive}
              onChange={(e) => setBenefitForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
            />
            Active
          </label>

          <div className="mt-2 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setBenefitModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={saveBenefit} disabled={benefitSaving}>
              {benefitSaving ? "Saving…" : editingBenefitId ? "Save Changes" : "Create Slab"}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="mt-8">
        <PageHeader
          title="Rank One-time Achievement Bonus"
          description="A one-time reward credited to the Reward wallet the moment a user first reaches each rank."
          actions={
            <Button onClick={openAddAchievement}>
              <Plus size={16} /> Add Slab
            </Button>
          }
        />

        {achievementLoading ? (
          <PageLoader />
        ) : achievementSlabs.length === 0 ? (
          <EmptyState
            title="No achievement slabs configured yet"
            description="Add a slab to define the one-time reward for each rank."
            icon={<Award size={22} />}
          />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">One-time Reward</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {achievementSlabs.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{label(s.rank)}</td>
                    <td className="px-5 py-3 font-bold text-emerald">{money(s.amount)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "active" : "inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditAchievement(s)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => removeAchievement(s)}
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
      </div>

      <Modal
        open={achievementModalOpen}
        onClose={() => setAchievementModalOpen(false)}
        title={editingAchievementId ? "Edit Achievement Slab" : "Add Achievement Slab"}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Rank *</label>
            <select
              value={achievementForm.rank}
              onChange={(e) => setAchievementForm((f) => ({ ...f, rank: e.target.value as Rank }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {NON_INVESTOR_RANKS.map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">One-time Reward Amount *</label>
            <input
              value={achievementForm.amount}
              onChange={(e) => setAchievementForm((f) => ({ ...f, amount: e.target.value.replace(/[^0-9.]/g, "") }))}
              placeholder="e.g. 5000"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald ${
                achievementTouched && !achievementAmountValid ? "border-red-400" : "border-slate-300"
              }`}
            />
            {achievementTouched && !achievementAmountValid && (
              <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid amount</p>
            )}
            <p className="mt-1 text-xs text-slate-400">Credited once to the Reward wallet the first time this rank is reached.</p>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={achievementForm.isActive}
              onChange={(e) => setAchievementForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald focus:ring-emerald"
            />
            Active
          </label>

          <div className="mt-2 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setAchievementModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={saveAchievement} disabled={achievementSaving}>
              {achievementSaving ? "Saving…" : editingAchievementId ? "Save Changes" : "Create Slab"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

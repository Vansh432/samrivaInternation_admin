import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

const RANKS = [
  { rank: "Investor", role: "Business Starter", income: "—", bonus: "—" },
  { rank: "Associate", role: "Team Builder", income: "3.00%", bonus: "₹5,000" },
  { rank: "Senior Associate", role: "Team Developer", income: "1.00%", bonus: "₹50,000" },
  { rank: "Manager", role: "Business Manager", income: "0.85%", bonus: "₹2,50,000" },
  { rank: "Senior Manager", role: "Team Leader", income: "0.70%", bonus: "₹5,00,000" },
  { rank: "Director", role: "Business Director", income: "0.55%", bonus: "₹25,00,000" },
  { rank: "Regional Director", role: "Regional Leader", income: "0.40%", bonus: "₹50,00,000" },
  { rank: "National Director", role: "Visionary Leader", income: "0.25%", bonus: "₹2,50,00,000" },
];

export default function Ranks() {
  return (
    <div>
      <PageHeader
        title="Ranks & Leadership"
        description="Official 8-tier Wealth Partner career ladder from the compensation plan. Per-user rank tracking lives on the user's profile (see User Detail); automated recalculation and rank-history are backend-pending."
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Leadership Role</th>
              <th className="px-4 py-3">Rank Income %</th>
              <th className="px-4 py-3">Rank Advancement Bonus</th>
            </tr>
          </thead>
          <tbody>
            {RANKS.map((r) => (
              <tr key={r.rank} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-semibold text-slate-800">{r.rank}</td>
                <td className="px-4 py-3 text-slate-600">{r.role}</td>
                <td className="px-4 py-3 text-slate-600">{r.income}</td>
                <td className="px-4 py-3 text-slate-600">{r.bonus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const PROGRAMS = [
  {
    name: "Fast Start Bonus",
    detail: "30-day window from registration. 50 units → ₹10,000 · 100 units → ₹25,000 · 150 units → ₹50,000.",
  },
  {
    name: "Retention Bonus",
    detail: "Ongoing, based on renewal units. 100 → ₹10,000 · 250 → ₹30,000 · 500 → ₹75,000 · 1000 → ₹2,00,000.",
  },
  {
    name: "Leadership Override",
    detail: "Up to 3 generations deep. Gen 1 → 2.00% · Gen 2 → 1.00% · Gen 3 → 0.50% of the qualifying leader's rank income.",
  },
  {
    name: "Rank Advancement Bonus",
    detail: "One-time cash reward on hitting each new rank (see Ranks & Leadership page for the full table).",
  },
  {
    name: "Direct Acquisition Bonus",
    detail: "3% (Compounding Plan) / 2% (Monthly Income Plan) on a personally-introduced investor's investment, uncapped.",
  },
  {
    name: "Leadership Pool",
    detail: "Monthly pool for eligible senior leaders. Qualification rules and slab table not yet published by the client.",
  },
];

export default function Bonuses() {
  return (
    <div>
      <PageHeader
        title="Bonus Center"
        description="The six Wealth Partner income streams from the compensation plan. Live accrual, ledgers, and per-user payout tracking need a dedicated bonuses backend module — none of the six are wired to real data yet."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROGRAMS.map((p) => (
          <Card key={p.name}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-slate-800">{p.name}</p>
              <Badge tone="warning">Backend pending</Badge>
            </div>
            <p className="text-sm text-slate-500">{p.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

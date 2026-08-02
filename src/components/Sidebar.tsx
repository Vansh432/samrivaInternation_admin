import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Landmark,
  ClipboardCheck,
  Wallet,
  ArrowDownToLine,
  Network,
  Award,
  Gift,
  FileBarChart,
  FileText,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

type NavItem = { label: string; to: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  { title: "Overview", items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }] },
  {
    title: "User Management",
    items: [
      { label: "All Users", to: "/users", icon: Users },
      { label: "KYC Queue", to: "/kyc-queue", icon: ShieldCheck },
    ],
  },
  {
    title: "Investments",
    items: [
      { label: "All Investments", to: "/investments/all", icon: Landmark },
      { label: "Approvals", to: "/investment-approvals", icon: ClipboardCheck },
      { label: "Rate Plans", to: "/investments", icon: Landmark },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Wallets & Transactions", to: "/wallets", icon: Wallet },
      { label: "Withdrawals", to: "/withdrawals", icon: ArrowDownToLine },
    ],
  },
  {
    title: "MLM / Career Plan",
    items: [
      { label: "Team & Genealogy", to: "/team", icon: Network },
      { label: "Ranks & Leadership", to: "/ranks", icon: Award },
    ],
  },
  { title: "Bonus Center", items: [{ label: "Bonus Programs", to: "/bonuses", icon: Gift }] },
  { title: "Reports & Documents", items: [{ label: "Reports", to: "/reports", icon: FileBarChart }] },
  { title: "Content", items: [{ label: "CMS", to: "/cms", icon: FileText }] },
  {
    title: "System",
    items: [
      { label: "Activity Logs", to: "/activity-logs", icon: ScrollText },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald text-sm font-extrabold text-gold">
          S
        </div>
        <div className="leading-tight">
          <p className="text-sm font-extrabold text-slate-800">Samriva</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Master Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive ? "bg-emerald text-white" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

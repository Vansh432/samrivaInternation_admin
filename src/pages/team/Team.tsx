import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronDown, ChevronRight, User as UserIcon, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { KycBadge, RoleBadge } from "@/components/ui/Badge";
import type { AdminUser, TeamSummary, TeamMember, TeamNode, Paginated } from "@/lib/types";

function TreeRow({ node, expanded, onToggle, isRoot }: { node: TeamNode; expanded: Record<string, boolean>; onToggle: (id: string) => void; isRoot?: boolean }) {
  const hasChildren = node.children.length > 0;
  const isOpen = !!expanded[node.id];
  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${isRoot ? "border-emerald bg-emerald/5" : "border-slate-200 bg-white"}`}
        style={{ marginLeft: node.level * 20 }}
      >
        <button
          onClick={() => hasChildren && onToggle(node.id)}
          className="flex h-5 w-5 items-center justify-center text-slate-400"
          disabled={!hasChildren}
        >
          {hasChildren ? (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
        </button>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${isRoot ? "bg-emerald" : "bg-slate-400"}`}>
          {isRoot ? <TrendingUp size={15} /> : <UserIcon size={14} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">{node.name}</p>
          <p className="text-[11px] font-semibold text-slate-400">
            L{node.level} · {node.role.replace("_", " ")}
            {!node.isActive ? " · inactive" : ""}
          </p>
        </div>
        <p className="text-sm font-bold text-emerald">{node.activeUnits} units</p>
      </div>
      {hasChildren && isOpen && (
        <div className="mt-1 flex flex-col gap-1">
          {node.children.map((c) => (
            <TreeRow key={c.id} node={c} expanded={expanded} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Team() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [tree, setTree] = useState<TeamNode | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [levelData, setLevelData] = useState<Paginated<TeamMember> | null>(null);
  const [levelLoading, setLevelLoading] = useState(false);

  const loadTeam = async (user: AdminUser) => {
    setLoading(true);
    setActiveLevel(null);
    setLevelData(null);
    try {
      const [s, t] = await Promise.all([
        api.get(`/admin/team/${user.id}/summary`),
        api.get(`/admin/team/${user.id}/tree`),
      ]);
      setSummary(s.data.data);
      const rootNode: TeamNode = t.data.data;
      setTree(rootNode);
      const auto: Record<string, boolean> = {};
      const walk = (n: TeamNode) => {
        if (n.level < 2) auto[n.id] = true;
        n.children.forEach(walk);
      };
      walk(rootNode);
      setExpanded(auto);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load team", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setResults([]);
    setSearch("");
    setSearchParams({ userId: user.id });
    loadTeam(user);
  };

  // Deep-link support: /team?userId=... (e.g. linked from UserDetail.tsx)
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && userId !== selectedUser?.id) {
      api
        .get(`/admin/users/${userId}`)
        .then((res) => {
          setSelectedUser(res.data.data.user);
          loadTeam(res.data.data.user);
        })
        .catch(() => toast.show("User not found", "error"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/admin/users", { params: { search: search.trim(), limit: 8 } });
        setResults(res.data.data.items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openLevel = async (level: number) => {
    if (!selectedUser) return;
    if (activeLevel === level) {
      setActiveLevel(null);
      setLevelData(null);
      return;
    }
    setActiveLevel(level);
    setLevelLoading(true);
    try {
      const res = await api.get(`/admin/team/${selectedUser.id}/level/${level}`, { params: { limit: 50 } });
      setLevelData(res.data.data);
    } catch (e: any) {
      toast.show(e?.response?.data?.message || "Failed to load level members", "error");
    } finally {
      setLevelLoading(false);
    }
  };

  const toggleTreeNode = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div>
      <PageHeader
        title="Team & Genealogy"
        description="Full sponsorship tree, level-wise breakdown, and active-unit counts per user."
      />

      <Card className="mb-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by investor mobile or name to view their team..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20"
          />
        </div>
        {search.trim() && (
          <div className="mt-2 flex flex-col gap-1">
            {searching ? (
              <p className="px-2 py-2 text-xs text-slate-400">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-400">No matching users.</p>
            ) : (
              results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectUser(u)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span>
                    <span className="font-semibold text-slate-800">{u.fullName || u.mobile}</span>{" "}
                    <span className="text-xs text-slate-400">{u.mobile}</span>
                  </span>
                  <RoleBadge role={u.role} />
                </button>
              ))
            )}
          </div>
        )}
      </Card>

      {!selectedUser ? (
        <EmptyState title="Search for a user" description="Pick an investor above to view their sponsorship team." icon={<Users size={22} />} />
      ) : loading ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Viewing team of</p>
                <p className="text-lg font-bold text-slate-800">{selectedUser.fullName || selectedUser.mobile}</p>
                <p className="text-xs text-slate-500">{selectedUser.mobile}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Downline</p>
                  <p className="text-xl font-bold text-slate-800">{summary?.totalDownline ?? 0}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Direct</p>
                  <p className="text-xl font-bold text-slate-800">{summary?.directCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Active Units</p>
                  <p className="text-xl font-bold text-emerald">{summary?.totalActiveUnits ?? 0}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Active Investors</th>
                  <th className="px-4 py-3">Active Units</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(summary?.levels ?? []).map((lvl) => (
                  <tr
                    key={lvl.level}
                    className={`cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 ${lvl.memberCount === 0 ? "opacity-50" : ""}`}
                    onClick={() => lvl.memberCount > 0 && openLevel(lvl.level)}
                  >
                    <td className="px-4 py-3 font-bold text-slate-800">Level {lvl.level}</td>
                    <td className="px-4 py-3">{lvl.memberCount}</td>
                    <td className="px-4 py-3">{lvl.activeInvestorCount}</td>
                    <td className="px-4 py-3 font-semibold text-emerald">{lvl.activeUnits}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-emerald">
                      {lvl.memberCount > 0 ? (activeLevel === lvl.level ? "Hide" : "View") : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {activeLevel !== null && (
            <Card className="overflow-x-auto p-0">
              <p className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Level {activeLevel} members</p>
              {levelLoading ? (
                <PageLoader />
              ) : (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">KYC</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Active Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelData?.items.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{m.fullName || "—"}</p>
                          <p className="text-xs text-slate-500">{m.mobile}</p>
                        </td>
                        <td className="px-4 py-3">
                          <RoleBadge role={m.role} />
                        </td>
                        <td className="px-4 py-3">
                          <KycBadge status={m.kycStatus} />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-semibold text-emerald">{m.activeUnits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          <Card>
            <p className="mb-3 text-sm font-bold text-slate-700">Genealogy Tree</p>
            {tree && <TreeRow node={tree} expanded={expanded} onToggle={toggleTreeNode} isRoot />}
          </Card>
        </div>
      )}
    </div>
  );
}

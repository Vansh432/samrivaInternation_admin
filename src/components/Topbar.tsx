import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RoleBadge } from "./ui/Badge";

export function Topbar() {
  const { user, logOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-bold text-slate-800">{user?.fullName || user?.mobile}</p>
          <div className="mt-0.5">{user && <RoleBadge role={user.role} />}</div>
        </div>
        <button
          onClick={logOut}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          title="Log out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

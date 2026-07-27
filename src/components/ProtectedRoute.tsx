import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "./ui/Spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export function SuperAdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "super_admin") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
        Only Super Admin can access this section.
      </div>
    );
  }
  return <>{children}</>;
}

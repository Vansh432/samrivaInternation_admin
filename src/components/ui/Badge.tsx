import React from "react";

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  gold: "bg-gold/10 text-gold-dark",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof TONE_CLASSES }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

const KYC_TONE: Record<string, keyof typeof TONE_CLASSES> = {
  pending: "neutral",
  submitted: "warning",
  approved: "success",
  rejected: "danger",
  hold: "warning",
};

const STATUS_TONE: Record<string, keyof typeof TONE_CLASSES> = {
  active: "success",
  inactive: "neutral",
  suspended: "warning",
  blocked: "danger",
};

export function KycBadge({ status }: { status: string }) {
  return <Badge tone={KYC_TONE[status] ?? "neutral"}>{status}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const tone = role === "super_admin" || role === "admin" ? "gold" : "neutral";
  return <Badge tone={tone}>{role.replace("_", " ")}</Badge>;
}

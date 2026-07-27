export type AdminRole = "investor" | "wealth_partner" | "franchise" | "employee" | "admin" | "super_admin";

export type KycStatus = "pending" | "submitted" | "approved" | "rejected" | "hold";

export type UserStatus = "active" | "inactive" | "suspended" | "blocked";

export type AdminUser = {
  id: string;
  mobile: string;
  role: AdminRole;
  fullName?: string | null;
  email?: string | null;
  dob?: string | null;
  address?: { line1?: string; city?: string; state?: string; pincode?: string } | null;
  status: UserStatus;
  kyc: {
    status: KycStatus;
    pan?: string;
    aadhaar?: string;
    bank?: { accountNumber?: string; ifsc?: string; holderName?: string };
    nominee?: { name?: string; relation?: string; dob?: string };
    addressProofUrl?: string;
    selfieUrl?: string;
    termsAcceptedAt?: string;
    // Reused for both a rejection reason and a hold reason — whichever action was last taken.
    rejectionReason?: string;
    submittedAt?: string;
    reviewedAt?: string;
  };
  referralCode?: string | null;
  sponsor?: string | null;
  rank?: { current: string };
  createdAt?: string;
};

export type DashboardStats = {
  totalUsers: number;
  totalInvestors: number;
  totalWealthPartners: number;
  totalAdmins: number;
  pendingKyc: number;
  submittedKyc: number;
  approvedKyc: number;
  rejectedKyc: number;
  activeUsers: number;
  suspendedUsers: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PlanType = "compounding" | "monthly_income";

export type RateSlab = {
  id: string;
  minUnits: number;
  maxUnits: number | null;
  tenureMonths: number[];
  compoundingRatePercent: number;
  monthlyIncomeRatePercent: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type InvestmentStatus = "pending_verification" | "active" | "rejected" | "matured" | "cancelled";

export type AdminInvestment = {
  id: string;
  user: { id: string; mobile: string; fullName?: string | null } | string;
  planType: PlanType;
  units: number;
  tenureMonths: number;
  unitValueInr: number;
  principal: number;
  ratePercent: number;
  paymentMode: string;
  amountPaid: number;
  transactionId: string;
  paymentProofUrl?: string;
  certificateNumber: string;
  status: InvestmentStatus;
  startDate?: string | null;
  maturityDate?: string | null;
  rejectionReason?: string;
  createdAt: string;
};

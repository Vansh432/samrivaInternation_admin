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

export type TeamLevelSummary = { level: number; memberCount: number; activeInvestorCount: number; activeUnits: number };

export type TeamSummary = {
  totalDownline: number;
  totalActiveUnits: number;
  directCount: number;
  levels: TeamLevelSummary[];
};

export type TeamMember = {
  id: string;
  mobile: string;
  fullName: string | null;
  role: AdminRole;
  status: UserStatus;
  kycStatus: KycStatus;
  joinedAt: string;
  activeUnits: number;
};

export type TeamNode = {
  id: string;
  name: string;
  mobile: string;
  role: AdminRole;
  activeUnits: number;
  isActive: boolean;
  level: number;
  children: TeamNode[];
};

export type FastStartBonusSlab = {
  id: string;
  unitsThreshold: number;
  bonusAmount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FastStartBonusAward = {
  id: string;
  user: { id: string; mobile: string; fullName?: string | null } | string;
  amount: number;
  description?: string;
  createdAt: string;
};

export type ActivityLogLevel = "info" | "warn" | "error";

export type ActivityLog = {
  id: string;
  type: string;
  action: string;
  level: ActivityLogLevel;
  message: string;
  meta?: Record<string, unknown>;
  user?: { id: string; mobile: string; fullName?: string | null } | string | null;
  actor?: { id: string; mobile: string; fullName?: string | null } | string | null;
  createdAt: string;
};

export type RetentionBonusSlab = {
  id: string;
  unitsThreshold: number;
  bonusAmount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LeadershipOverrideSlab = {
  id: string;
  generation: number;
  percent: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DirectAcquisitionBonusConfig = {
  compoundingPercent: number;
  monthlyIncomePercent: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WalletType = "main" | "reward" | "bonus" | "commission";
export type WalletTxnType = "credit" | "debit";
export type WalletTxnStatus = "pending" | "settled";

export type CommissionSettlementPeriod = {
  order: number;
  startDay: number;
  endDay: number | null;
  closingDay: number;
};

export type CommissionSettlementConfig = {
  periods: CommissionSettlementPeriod[];
  createdAt?: string;
  updatedAt?: string;
};

export type WalletTransactionAdmin = {
  id: string;
  user: { id: string; mobile: string; fullName?: string | null } | string;
  walletType: WalletType;
  type: WalletTxnType;
  amount: number;
  balanceAfter?: number;
  status?: WalletTxnStatus;
  source: string;
  description?: string;
  createdAt: string;
};

export type TdsConfig = {
  mode: "fixed" | "percentage";
  value: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TransferableWalletType = "bonus" | "reward" | "commission";
export type TransferRequestStatus = "pending" | "approved" | "rejected";

export type WalletTransferRequestAdmin = {
  id: string;
  user: { id: string; mobile: string; fullName?: string | null } | string;
  fromWalletType: TransferableWalletType;
  amount: number;
  tdsMode: "fixed" | "percentage";
  tdsValue: number;
  tdsAmount: number;
  netAmount: number;
  status: TransferRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
};

export type Rank =
  | "investor"
  | "associate"
  | "senior_associate"
  | "manager"
  | "senior_manager"
  | "director"
  | "regional_director"
  | "national_director";

export type RankSlab = {
  id: string;
  rank: Rank;
  selfUnitsMin: number;
  directTeamSizeMin: number;
  requiredDirectRank: Rank;
  teamBusinessUnitMin: number;
  incomePercent: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RankAchievementSlab = {
  id: string;
  rank: Rank;
  amount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RankBenefitSlab = {
  id: string;
  rank: Rank;
  mobileBonus: number;
  groomingBonus: number;
  conveyanceBonus: number;
  lifeStyleBonus: number;
  businessTourBonus: number;
  familyTripBonus: number;
  qualifyingDirectUnitsPerMonth: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

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

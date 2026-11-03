export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  referralCode: string;
  referredBy?: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalProfitEarned: number;
  referralEarnings: number;
  activePlanId?: string;
  activePlanName?: string;
  planActivatedAt?: string;
  planExpiresAt?: string;
  dailyTasksCompletedToday: number;
  lastTaskDate: string;
  role: 'user' | 'admin';
  createdAt: string;
  status: 'active' | 'suspended';
}

export type PlanColorTheme = 'bronze' | 'amber' | 'gold' | 'diamond' | 'obsidian' | 'royal' | 'sovereign';

export interface InvestmentPlan {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  price: number;
  dailyMinEarn: number;
  dailyMaxEarn: number;
  dailyTaskCount: number;
  validityDays: number;
  totalEstimatedReturn: number;
  colorTheme: PlanColorTheme;
  features: string[];
  isPopular: boolean;
  status: 'active' | 'inactive';
}

export type PaymentType = 'easypaisa' | 'jazzcash' | 'bank' | 'usdt';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  accountTitle: string;
  accountNumber: string;
  instructions: string;
  minDeposit: number;
  maxDeposit: number;
  qrCodeUrl?: string;
  isActive: boolean;
}

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  planId?: string;
  planName?: string;
  amount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentType: PaymentType;
  transactionId: string;
  senderAccountNumber: string;
  receiptProofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  paymentMethodType: PaymentType;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  status: 'pending' | 'approved' | 'rejected';
  fee: number;
  netAmount: number;
  createdAt: string;
  reviewedAt?: string;
  remarks?: string;
}

export interface TaskQuiz {
  id: string;
  title: string;
  type: 'quiz';
  category: string;
  reward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  quizData: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'task_earning'
  | 'referral_bonus'
  | 'plan_activation'
  | 'admin_adjustment';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
  meta?: Record<string, any>;
}

export interface AppSettings {
  siteName: string;
  currencySymbol: string;
  currencyCode: string;
  minDeposit: number;
  minWithdrawal: number;
  level1CommissionPercent: number;
  level2CommissionPercent: number;
  level3CommissionPercent: number;
  adminEmail: string;
  adminSecretPassword: string;
  announcementText: string;
  enableQuizzes: boolean;
  supportPhone?: string;
  supportTelegram?: string;
  supportWhatsApp?: string;
}

export type TabType = 'dashboard' | 'plans' | 'tasks' | 'referrals' | 'history';

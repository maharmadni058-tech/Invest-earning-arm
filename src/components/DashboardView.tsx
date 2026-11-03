import React, { useState } from 'react';
import {
  Wallet,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Users,
  BrainCircuit,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  Gift,
  HelpCircle,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { User, AppSettings, InvestmentPlan } from '../types';

interface DashboardViewProps {
  user: User;
  settings: AppSettings;
  plans: InvestmentPlan[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onGoToPlans: () => void;
  onGoToTasks: () => void;
  onGoToReferrals: () => void;
  onOpenSupport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  settings,
  plans,
  onOpenDeposit,
  onOpenWithdraw,
  onGoToPlans,
  onGoToTasks,
  onGoToReferrals,
  onOpenSupport
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const activePlan = plans.find(p => p.id === user.activePlanId);
  const inviteUrl = `${window.location.origin}?ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const maxTasks = activePlan ? activePlan.dailyTaskCount : 0;
  const tasksRemaining = Math.max(0, maxTasks - (user.dailyTasksCompletedToday || 0));
  const progressPercent = maxTasks > 0 ? ((user.dailyTasksCompletedToday || 0) / maxTasks) * 100 : 0;

  return (
    <div className="space-y-5 pb-6">
      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#0c1822] via-[#09131c] to-[#060b10] border border-emerald-500/30 shadow-2xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Total Balance
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showBalance ? 'Hide Balance' : 'Show Balance'}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Status Tag */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Account</span>
            </div>
          </div>

          {/* Balance Numbers */}
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
              {settings.currencySymbol}
            </span>
            <span className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
              {showBalance ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '•••••••'}
            </span>
            <span className="text-xs font-medium text-slate-400 font-mono">{settings.currencyCode}</span>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={onOpenDeposit}
              className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-950/15 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-extrabold">Deposit</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#111c26] hover:bg-[#162432] text-white font-semibold border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center mb-1 text-emerald-400 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold">Withdraw</span>
            </button>

            <button
              onClick={onGoToPlans}
              className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#111c26] hover:bg-[#162432] text-white font-semibold border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center mb-1 text-amber-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold">Plans</span>
            </button>

            <button
              onClick={onGoToReferrals}
              className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-[#111c26] hover:bg-[#162432] text-white font-semibold border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center mb-1 text-teal-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold">Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Plan / Upgrade Banner */}
      {activePlan ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0d1e1c] to-[#0c1622] border border-emerald-500/40 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{activePlan.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Daily Yield: <span className="text-emerald-400 font-bold">Rs. {activePlan.dailyMinEarn}</span> / day
                </p>
              </div>
            </div>

            <button
              onClick={onGoToTasks}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Solve Tasks ({tasksRemaining} Left)</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Today's Task Progress</span>
              <span className="font-mono font-bold text-white">
                {user.dailyTasksCompletedToday || 0} / {activePlan.dailyTaskCount} Completed
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#17120a] to-[#141820] border border-amber-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-200 text-sm sm:text-base">No Active Investment Package</h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-md">
                  Activate Bronze (Rs. 500) to Sovereign (Rs. 50,000) to start claiming daily arithmetic quiz cash rewards!
                </p>
              </div>
            </div>

            <button
              onClick={onGoToPlans}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
            >
              <span>Explore Packages</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0c141d] border border-slate-800/90">
          <span className="text-[11px] text-slate-400 block mb-1">Total Deposited</span>
          <p className="text-base sm:text-lg font-bold text-white font-mono">
            {settings.currencySymbol} {user.totalDeposited.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400">Verified Capital</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0c141d] border border-slate-800/90">
          <span className="text-[11px] text-slate-400 block mb-1">Total Withdrawn</span>
          <p className="text-base sm:text-lg font-bold text-white font-mono">
            {settings.currencySymbol} {user.totalWithdrawn.toLocaleString()}
          </p>
          <span className="text-[10px] text-teal-400">Cash Dispatched</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0c141d] border border-slate-800/90">
          <span className="text-[11px] text-slate-400 block mb-1">Task Profits</span>
          <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
            {settings.currencySymbol} {user.totalProfitEarned.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-300">Arithmetic Quiz</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0c141d] border border-slate-800/90">
          <span className="text-[11px] text-slate-400 block mb-1">Team Commission</span>
          <p className="text-base sm:text-lg font-bold text-amber-400 font-mono">
            {settings.currencySymbol} {user.referralEarnings.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-300">3-Tier Matrix</span>
        </div>
      </div>

      {/* Quick Invite & Earn Widget */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0b141d] border border-emerald-500/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Multi-Tier Referral</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">10% - 5% - 2%</span>
            </div>
            <h3 className="font-bold text-white text-sm sm:text-base mt-0.5">
              Invite Friends & Earn Instant Commissions
            </h3>
          </div>
          <button
            onClick={onGoToReferrals}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Team Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Copy Box */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="flex-1 flex items-center bg-[#070c12] border border-slate-700/80 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-400 truncate select-all font-mono">
              {inviteUrl}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => setShowQRModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* How it Works / Trust Pillars */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#091118] border border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          How Invest in Arm Works
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-[#060b10] border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h5 className="font-bold text-slate-200 text-xs mb-1">Pick an Investment Plan</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deposit via Easypaisa, JazzCash, Bank or USDT from Rs. 500 up to Rs. 50,000.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#060b10] border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h5 className="font-bold text-slate-200 text-xs mb-1">Complete Daily Math Tasks</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Answer quick math quizzes every 24 hours to earn guaranteed daily yield directly.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#060b10] border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h5 className="font-bold text-slate-200 text-xs mb-1">Instant 24/7 Cashouts</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Withdraw straight to your Easypaisa, JazzCash or Bank account from just Rs. 300.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0c1622] border border-emerald-500/30 p-6 text-center">
            <h3 className="font-bold text-lg text-white mb-1">Your Referral QR Code</h3>
            <p className="text-xs text-slate-400 mb-4">Friends can scan this to join under your team</p>

            <div className="p-4 bg-white rounded-2xl inline-block mx-auto mb-4 shadow-xl">
              {/* High quality SVG QR code representation */}
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                {/* QR corner squares */}
                <rect x="10" y="10" width="24" height="24" fill="black" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="black" />

                <rect x="66" y="10" width="24" height="24" fill="black" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="black" />

                <rect x="10" y="66" width="24" height="24" fill="black" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="black" />

                {/* Data blocks */}
                <rect x="42" y="12" width="6" height="6" fill="black" />
                <rect x="52" y="12" width="6" height="6" fill="black" />
                <rect x="42" y="24" width="8" height="6" fill="black" />
                <rect x="12" y="44" width="6" height="6" fill="black" />
                <rect x="24" y="44" width="8" height="8" fill="black" />
                <rect x="40" y="40" width="20" height="20" fill="#059669" rx="3" />
                <rect x="70" y="44" width="6" height="8" fill="black" />
                <rect x="80" y="52" width="8" height="6" fill="black" />
                <rect x="42" y="70" width="6" height="8" fill="black" />
                <rect x="54" y="78" width="8" height="6" fill="black" />
                <rect x="72" y="72" width="16" height="16" fill="black" />
              </svg>
            </div>

            <p className="text-xs font-mono text-emerald-400 font-bold mb-4">
              Referral Code: {user.referralCode}
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

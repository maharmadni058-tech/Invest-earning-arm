import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Zap,
  Lock,
  Trophy,
  Wallet,
  Check,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, TaskQuiz, InvestmentPlan, AppSettings } from '../types';
import { storage } from '../services/storageService';

interface TasksViewProps {
  user: User | null;
  plans: InvestmentPlan[];
  quizzes: TaskQuiz[];
  settings: AppSettings;
  onGoToPlans: () => void;
  onOpenAuth: () => void;
  onTaskCompleted: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  user,
  plans,
  quizzes,
  settings,
  onGoToPlans,
  onOpenAuth,
  onTaskCompleted
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<{
    success: boolean;
    message: string;
    amount?: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Daily countdown timer to midnight 00:00
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('00h 00m 00s (Resetting...)');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const activePlan = plans.find(p => p.id === user?.activePlanId);
  const isClaimedToday = Boolean(user && user.lastTaskDate === todayStr && user.dailyTasksCompletedToday >= 1);
  const dailyProfitAmount = activePlan ? activePlan.dailyMinEarn || activePlan.dailyMaxEarn || 46 : 0;

  // 1-Click Profit Claim Handler (Only one time per day)
  const handleClaimProfitOneClick = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!activePlan) {
      onGoToPlans();
      return;
    }
    if (isClaimedToday || isClaiming) return;

    setIsClaiming(true);
    setClaimFeedback(null);

    try {
      const res = await storage.claimDailyProfit(user.id);
      setIsClaiming(false);

      if (res.success) {
        setClaimFeedback({
          success: true,
          message: res.message,
          amount: res.profitEarned
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });

        onTaskCompleted();
      } else {
        setClaimFeedback({
          success: false,
          message: res.message
        });
      }
    } catch (err: any) {
      setIsClaiming(false);
      setClaimFeedback({
        success: false,
        message: err?.message || 'Network error. Please try again.'
      });
    }
  };

  // If user not signed in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 rounded-3xl bg-[#0c1622] border border-emerald-500/30 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <Zap className="w-8 h-8 fill-emerald-400" />
        </div>
        <h3 className="font-extrabold text-xl text-white mb-2">1-Click Daily Profit Claim</h3>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Sign in or create your account to unlock instant 1-click daily cash profit claims credited straight to your wallet.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  // If user has no active plan
  if (!activePlan) {
    return (
      <div className="space-y-6 pb-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#19130c] via-[#131720] to-[#0b1018] border border-amber-500/30 shadow-2xl text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            1-Click Task Upgrade
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-3 mb-2">
            Unlock 1-Click Daily Profit Claim
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
            Activate any investment package (from Bronze Rs. 500 up to Sovereign Rs. 50,000) to collect your guaranteed daily profit in <strong>only one click every 24 hours</strong>!
          </p>

          <button
            onClick={onGoToPlans}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <span>Activate Package & Start Claiming</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Available Tiers Overview */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available 1-Click Daily Profit Tiers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.slice(0, 4).map(p => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#0c141d] border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm">{p.name}</h5>
                  <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                    Rs. {p.dailyMinEarn} Daily in 1-Click
                  </p>
                  <span className="text-[10px] text-slate-500">Contract: Rs. {p.price}</span>
                </div>
                <button
                  onClick={onGoToPlans}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                >
                  Activate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Plan: 1-Click Daily Profit Claim
  return (
    <div className="space-y-6 pb-6 max-w-2xl mx-auto">
      {/* Top Status Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c1b26] to-[#09121a] border border-emerald-500/35 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Upgraded Task Terminal
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1-CLICK SYSTEM
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {activePlan.name}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Fixed Daily Profit Quota: <strong className="text-emerald-400 font-mono font-bold">Rs. {dailyProfitAmount.toLocaleString()}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 sm:px-3 rounded-xl bg-[#070d13] border border-emerald-500/30 text-right">
              <span className="text-[10px] text-slate-400 block">Status Today</span>
              <span className={`text-xs sm:text-sm font-bold font-mono ${isClaimedToday ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isClaimedToday ? 'Claimed (1/1)' : 'Available (1/1)'}
              </span>
            </div>
            <div className="p-2 sm:px-3 rounded-xl bg-[#070d13] border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block">Total Profit</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                Rs. {(user.totalProfitEarned || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Main Claim Action */}
        <div className="pt-6 pb-2 text-center">
          {!isClaimedToday ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 max-w-md mx-auto">
                <span className="text-xs text-emerald-300 font-semibold block mb-1">
                  Today's Fixed Daily Profit Ready
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                  {settings.currencySymbol} {dailyProfitAmount.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  One-time daily claim • Single click will immediately credit funds to your wallet balance
                </p>
              </div>

              <button
                onClick={handleClaimProfitOneClick}
                disabled={isClaiming}
                className="w-full max-w-md py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 mx-auto"
              >
                <Zap className={`w-5 h-5 fill-slate-950 ${isClaiming ? 'animate-spin' : 'animate-bounce'}`} />
                <span>
                  {isClaiming
                    ? 'Processing Cloud Claim...'
                    : `Claim Rs. ${dailyProfitAmount.toLocaleString()} Profit in 1-Click`}
                </span>
              </button>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant 24/7 wallet credit • Only one claim allowed per calendar day</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 max-w-md mx-auto text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-emerald-200">
                  Today's Profit Successfully Claimed!
                </h3>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 mb-1">
                  +{settings.currencySymbol} {dailyProfitAmount.toLocaleString()} Credited
                </div>
                <p className="text-xs text-slate-300">
                  You have successfully collected your 1-time daily profit quota for today.
                </p>
              </div>

              {/* Countdown Card */}
              <div className="p-3.5 rounded-2xl bg-[#070d13] border border-slate-800 max-w-md mx-auto flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Next 1-Click Claim Unlocks in:</span>
                </div>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {timeLeft}
                </span>
              </div>

              <div className="w-full max-w-md mx-auto py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Only 1 Claim Per Day Allowed (Resets 00:00 Midnight PKT)</span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback message banner */}
        {claimFeedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              claimFeedback.success
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {claimFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{claimFeedback.message}</span>
          </div>
        )}
      </div>

      {/* Package Contract Summary Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#091017] border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Contract Details & Daily Guarantee
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#060a0f] border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Daily Payout</span>
            <span className="font-bold text-emerald-400">Rs. {dailyProfitAmount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060a0f] border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Contract Term</span>
            <span className="font-bold text-white">{activePlan.validityDays} Days</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060a0f] border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Total Est. Return</span>
            <span className="font-bold text-amber-300">Rs. {activePlan.totalEstimatedReturn.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060a0f] border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">Net Profit</span>
            <span className="font-bold text-teal-300">Rs. {(activePlan.totalEstimatedReturn - activePlan.price).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Check,
  Zap,
  Calculator,
  ShieldCheck,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { InvestmentPlan, User, AppSettings, PlanColorTheme } from '../types';

interface PlansViewProps {
  plans: InvestmentPlan[];
  user: User | null;
  settings: AppSettings;
  onSelectPlanForDeposit: (plan: InvestmentPlan) => void;
  onActivateWithBalance: (plan: InvestmentPlan) => void;
  onOpenAuth: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  plans,
  user,
  settings,
  onSelectPlanForDeposit,
  onActivateWithBalance,
  onOpenAuth
}) => {
  const [filter, setFilter] = useState<'all' | 'popular' | 'vip'>('all');
  const [calcPlanIndex, setCalcPlanIndex] = useState<number>(3); // Diamond 5,000 by default

  const filteredPlans = plans.filter(p => {
    if (filter === 'popular') return p.isPopular || p.price <= 5000;
    if (filter === 'vip') return p.price >= 10000;
    return true;
  });

  const calcPlan = plans[calcPlanIndex] || plans[0];
  const netProfit = calcPlan.totalEstimatedReturn - calcPlan.price;
  const roiPercentage = ((netProfit / calcPlan.price) * 100).toFixed(0);

  const getThemeStyles = (theme: PlanColorTheme) => {
    switch (theme) {
      case 'bronze':
        return {
          border: 'border-amber-700/40 hover:border-amber-600/70',
          bg: 'from-[#140f0a] to-[#0c1015]',
          badge: 'bg-amber-900/50 text-amber-300 border-amber-700',
          accent: 'text-amber-400',
          btn: 'bg-amber-600 hover:bg-amber-500 text-slate-950',
          glow: 'from-amber-600/10'
        };
      case 'amber':
        return {
          border: 'border-yellow-600/40 hover:border-yellow-500/70',
          bg: 'from-[#161208] to-[#0d1218]',
          badge: 'bg-yellow-900/50 text-yellow-300 border-yellow-600',
          accent: 'text-yellow-400',
          btn: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950',
          glow: 'from-yellow-500/10'
        };
      case 'gold':
        return {
          border: 'border-amber-500/40 hover:border-amber-400/80',
          bg: 'from-[#1a1409] to-[#0d141e]',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'text-amber-300',
          btn: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110',
          glow: 'from-amber-400/15'
        };
      case 'diamond':
        return {
          border: 'border-emerald-500/50 hover:border-emerald-400',
          bg: 'from-[#0a1c17] to-[#0a141e]',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          accent: 'text-emerald-400',
          btn: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20',
          glow: 'from-emerald-500/20'
        };
      case 'obsidian':
        return {
          border: 'border-purple-500/40 hover:border-purple-400',
          bg: 'from-[#160c20] to-[#0b1018]',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          accent: 'text-purple-300',
          btn: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 shadow-lg shadow-purple-500/20',
          glow: 'from-purple-500/20'
        };
      case 'royal':
        return {
          border: 'border-blue-500/40 hover:border-blue-400',
          bg: 'from-[#0a1526] to-[#0a0f16]',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          accent: 'text-blue-300',
          btn: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 hover:brightness-110 shadow-lg shadow-blue-500/20',
          glow: 'from-blue-500/20'
        };
      case 'sovereign':
        return {
          border: 'border-rose-500/50 hover:border-rose-400',
          bg: 'from-[#1f0a12] to-[#0b0e14]',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          accent: 'text-rose-400',
          btn: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:brightness-110 shadow-lg shadow-rose-500/25',
          glow: 'from-rose-500/20'
        };
      default:
        return {
          border: 'border-slate-800',
          bg: 'from-[#0f172a] to-[#0b0f19]',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          accent: 'text-white',
          btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
          glow: 'from-emerald-500/10'
        };
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Guaranteed High-Yield Micro Contracts</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Choose Your Investment Package
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Lock in 30-day contracts with guaranteed daily returns claimable in only 1-click every 24 hours.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 mt-4 p-1 rounded-2xl bg-[#0c141d] border border-slate-800 max-w-xs mx-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({plans.length})
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filter === 'popular'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setFilter('vip')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filter === 'vip'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            VIP Tiers
          </button>
        </div>
      </div>

      {/* ROI Calculator Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1824] to-[#091017] border border-emerald-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Interactive Profit Calculator</h3>
            <p className="text-[11px] text-slate-400">Select any tier to project daily and 30-day net profits</p>
          </div>
        </div>

        {/* Package Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {plans.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCalcPlanIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                calcPlanIndex === idx
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              Rs. {p.price.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Output Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-[#070c12] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Initial Deposit</span>
            <span className="font-mono text-sm sm:text-base font-bold text-white">
              Rs. {calcPlan.price.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#070c12] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Daily Task Earnings</span>
            <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">
              Rs. {calcPlan.dailyMinEarn.toLocaleString()} / day
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#070c12] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">30-Day Total Return</span>
            <span className="font-mono text-sm sm:text-base font-bold text-amber-300">
              Rs. {calcPlan.totalEstimatedReturn.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#070c12] border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 block">Net Profit (+{roiPercentage}%)</span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-400">
              Rs. {netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map(plan => {
          const theme = getThemeStyles(plan.colorTheme);
          const isUserActivePlan = user?.activePlanId === plan.id;
          const userCanAfford = user && user.balance >= plan.price;
          const planNetProfit = plan.totalEstimatedReturn - plan.price;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-5 bg-gradient-to-b ${theme.bg} border ${theme.border} transition-all duration-200 shadow-xl overflow-hidden`}
            >
              {/* Corner Glow */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-b ${theme.glow} to-transparent rounded-full blur-2xl pointer-events-none`}
              />

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
                    {plan.badge}
                  </span>
                  {plan.isPopular && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Flame className="w-3 h-3 fill-amber-400 text-amber-400" /> Hot Choice
                    </span>
                  )}
                  {isUserActivePlan && (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/50">
                      Currently Active
                    </span>
                  )}
                </div>

                {/* Plan Title & Tagline */}
                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="my-4 p-3 rounded-2xl bg-[#060a0f]/80 border border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Package Price</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                        Rs. {plan.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Daily Yield</span>
                      <span className={`text-base sm:text-lg font-bold font-mono ${theme.accent}`}>
                        Rs. {plan.dailyMinEarn} <span className="text-[11px] text-slate-400">/day</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Return (30 Days):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      Rs. {plan.totalEstimatedReturn.toLocaleString()} (Profit: +Rs. {planNetProfit.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    What's Included
                  </span>
                  {plan.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-2 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {!user ? (
                  <button
                    onClick={onOpenAuth}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-md ${theme.btn}`}
                  >
                    Sign In to Activate
                  </button>
                ) : isUserActivePlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                  >
                    ✓ Package Currently Active
                  </button>
                ) : userCanAfford ? (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => onActivateWithBalance(plan)}
                      className={`w-full py-3 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-md ${theme.btn}`}
                    >
                      Instant Activate (Pay from Balance)
                    </button>
                    <button
                      onClick={() => onSelectPlanForDeposit(plan)}
                      className="w-full py-2 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
                    >
                      Pay via JazzCash
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectPlanForDeposit(plan)}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${theme.btn}`}
                  >
                    <span>Deposit & Activate Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ReceiptText,
  ArrowDownLeft,
  ArrowUpRight,
  BrainCircuit,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { Transaction, User, AppSettings } from '../types';

interface LedgerViewProps {
  user: User | null;
  transactions: Transaction[];
  settings: AppSettings;
  onOpenAuth: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  user,
  transactions,
  settings,
  onOpenAuth
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 rounded-3xl bg-[#0c1622] border border-emerald-500/30 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <ReceiptText className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-xl text-white mb-2">Transaction Ledger</h3>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Sign in to view your complete financial transaction log, task profits, and payout statuses.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filter transactions for this user
  const userTransactions = transactions.filter(t => t.userId === user.id);

  const filtered = userTransactions.filter(tx => {
    if (filterType === 'deposits' && tx.type !== 'deposit') return false;
    if (filterType === 'withdrawals' && tx.type !== 'withdrawal') return false;
    if (filterType === 'tasks' && tx.type !== 'task_earning') return false;
    if (filterType === 'referrals' && tx.type !== 'referral_bonus') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
      );
    }
    return true;
  });

  const getTxIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'task_earning':
        return <BrainCircuit className="w-4 h-4 text-teal-400" />;
      case 'referral_bonus':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'plan_activation':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      default:
        return <ReceiptText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Success</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Declined</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-emerald-400" />
            <span>Account Ledger & History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time record of your investments, daily task payouts, and withdrawal disbursements.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#090f16] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'deposits', label: 'Deposits' },
          { id: 'withdrawals', label: 'Withdrawals' },
          { id: 'tasks', label: 'Task Earnings' },
          { id: 'referrals', label: 'Team Bonuses' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              filterType === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-[#091017] hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#091017] border border-slate-800/90 shadow-xl">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ReceiptText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No transactions recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Your deposits, task profits, and withdrawal history will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(tx => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#060a0f] border border-slate-800/90 hover:border-slate-700/80 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getTxIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm">{tx.title}</h4>
                        {getStatusBadge(tx.status)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tx.description}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm sm:text-base ${
                        isPositive ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {settings.currencySymbol} {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">{tx.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { User, AppSettings, PaymentType } from '../types';
import { storage } from '../services/storageService';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  settings: AppSettings;
  onWithdrawSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  onWithdrawSuccess
}) => {
  const [method, setMethod] = useState<PaymentType>('easypaisa');
  const [amount, setAmount] = useState<number>(300);
  const [accountTitle, setAccountTitle] = useState<string>(user.fullName);
  const [accountNumber, setAccountNumber] = useState<string>(user.phone);
  const [bankName, setBankName] = useState<string>('Meezan Bank');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < settings.minWithdrawal) {
      setError(`Minimum withdrawal is ${settings.currencySymbol} ${settings.minWithdrawal}.`);
      return;
    }

    if (amount > user.balance) {
      setError('Insufficient wallet balance.');
      return;
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      setError('Please provide your complete account title and account number.');
      return;
    }

    const res = await storage.createWithdrawal({
      userId: user.id,
      userName: user.fullName,
      userPhone: user.phone,
      amount: Number(amount),
      paymentMethodType: method,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      bankName: method === 'bank' ? bankName.trim() : undefined
    });

    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onWithdrawSuccess();
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-[#0c1622] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">Withdrawal Initiated!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mb-4 leading-relaxed">
              Rs. {amount.toLocaleString()} requested to {method.toUpperCase()} ({accountNumber}). Funds will arrive in your account shortly.
            </p>
            <div className="p-3 rounded-2xl bg-[#070d14] border border-emerald-500/30 text-xs text-slate-400 max-w-xs mx-auto">
              ⚡ Status: <span className="text-amber-400 font-semibold">Processing via Gateway</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Withdraw Cash</h3>
                <p className="text-xs text-slate-400">Direct 24/7 payout to your bank or mobile wallet</p>
              </div>
            </div>

            {/* Current Balance Bar */}
            <div className="p-3 rounded-2xl bg-[#070d13] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Available to Cashout:</span>
              </div>
              <span className="font-mono font-extrabold text-white text-sm">
                Rs. {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Payout Channel */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Select Cashout Gateway
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'easypaisa' as PaymentType, label: 'Easypaisa' },
                  { id: 'jazzcash' as PaymentType, label: 'JazzCash' },
                  { id: 'bank' as PaymentType, label: 'Bank IBFT' },
                  { id: 'usdt' as PaymentType, label: 'USDT TRC20' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`py-2 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                      method === item.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-[#070c12] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Withdrawal Amount (Min Rs. {settings.minWithdrawal})
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(Math.floor(user.balance))}
                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  All Balance
                </button>
              </div>

              {/* Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2">
                {[300, 500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer shrink-0 ${
                      amount === val
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Rs. {val}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min={settings.minWithdrawal}
                max={user.balance}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Account Details */}
            <div className="space-y-3">
              {method === 'bank' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. Meezan Bank, HBL, Allied Bank"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Account Holder Title / Full Name
                </label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={e => setAccountTitle(e.target.value)}
                  placeholder="Enter exact name on your account"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Account Number / Mobile Wallet Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="e.g. 03001234567 or IBAN"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Fee Calculation Note */}
            <div className="p-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span>Withdrawal Fee (0%):</span>
              <span className="font-mono text-emerald-400 font-bold">Rs. 0.00 (Zero Fee)</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={user.balance < settings.minWithdrawal}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Confirm Cashout (Rs. {amount.toLocaleString()})
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

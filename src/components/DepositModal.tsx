import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  QrCode,
  FileCheck
} from 'lucide-react';
import { PaymentMethod, InvestmentPlan, User, AppSettings } from '../types';
import { storage } from '../services/storageService';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  settings: AppSettings;
  paymentMethods: PaymentMethod[];
  plans: InvestmentPlan[];
  preSelectedPlan?: InvestmentPlan | null;
  onDepositSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  paymentMethods,
  plans,
  preSelectedPlan,
  onDepositSuccess
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    paymentMethods[0]?.id || ''
  );
  const [amount, setAmount] = useState<number>(preSelectedPlan ? preSelectedPlan.price : 1500);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    preSelectedPlan ? preSelectedPlan.id : ''
  );
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (preSelectedPlan) {
      setAmount(preSelectedPlan.price);
      setSelectedPlanId(preSelectedPlan.id);
    }
  }, [preSelectedPlan]);

  if (!isOpen) return null;

  const fallbackJazzCash: PaymentMethod = {
    id: 'pm-jazzcash-official',
    name: 'JazzCash Fast Transfer',
    type: 'jazzcash',
    accountTitle: 'Tasleem bibi',
    accountNumber: '03087348367',
    instructions: 'Send exact amount via JazzCash App or *786# to 03087348367 (Tasleem bibi). Save transaction receipt and input the 11 or 12-digit TID / TRX ID below for instant verification.',
    minDeposit: 300,
    maxDeposit: 100000,
    isActive: true
  };

  const currentMethod =
    paymentMethods.find(m => m.type === 'jazzcash') ||
    paymentMethods[0] ||
    fallbackJazzCash;

  const handleCopyNumber = () => {
    if (!currentMethod) return;
    navigator.clipboard.writeText(currentMethod.accountNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyTitle = () => {
    if (!currentMethod) return;
    navigator.clipboard.writeText(currentMethod.accountTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < settings.minDeposit) {
      setError(`Minimum deposit amount is ${settings.currencySymbol} ${settings.minDeposit}`);
      return;
    }

    if (!senderAccount.trim()) {
      setError('Please provide your JazzCash sender account / mobile number.');
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setError('Please enter a valid JazzCash Transaction ID (TID / TRX ID) from your receipt.');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlanId);

    await storage.createDeposit({
      userId: user.id,
      userName: user.fullName,
      userPhone: user.phone,
      amount: Number(amount),
      planId: plan?.id,
      planName: plan?.name,
      paymentMethodId: currentMethod.id,
      paymentMethodName: currentMethod.name,
      paymentType: currentMethod.type,
      senderAccountNumber: senderAccount.trim(),
      transactionId: transactionId.trim().toUpperCase()
    });

    setSuccess(true);
    setTimeout(() => {
      onDepositSuccess();
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c1622] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
            <h3 className="text-xl font-extrabold text-white mb-2">Deposit Submitted!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mb-4 leading-relaxed">
              Your JazzCash TID <strong className="text-emerald-400 font-mono">{transactionId}</strong> has been received by the verification team.
            </p>
            <div className="p-3 rounded-2xl bg-[#070d14] border border-emerald-500/30 text-xs text-slate-400 max-w-xs mx-auto">
              ⚡ Status: <span className="text-amber-400 font-semibold">Pending Admin Approval</span> (Usually approved in 5 - 15 minutes)
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/40 bg-black shrink-0">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-06_at_13.51.57_2043a638.jpeg"
                  alt="Invest in Arm"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Deposit & Activate</h3>
                <p className="text-xs text-slate-400">Add funds via JazzCash to your Invest in Arm balance</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Badge */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  1. Payment Gateway (Only JazzCash)
                </label>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Official Account
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#070c12] border border-emerald-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center border border-amber-500/40 text-xs shrink-0 tracking-wider">
                  JC
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">JazzCash Fast Transfer</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold">
                      Instant Payout
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Direct JazzCash Deposit Gateway</span>
                </div>
              </div>
            </div>

            {/* Gateway Account Details Card */}
            {currentMethod && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#070f17] to-[#0a141e] border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Account Title (Receiver):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-sm">{currentMethod.accountTitle}</span>
                    <button
                      type="button"
                      onClick={handleCopyTitle}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Copy Title"
                    >
                      {copiedTitle ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-400">JazzCash Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-extrabold text-emerald-400 text-base">
                      {currentMethod.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-[#060a0f] p-2 rounded-xl border border-slate-800">
                  💡 {currentMethod.instructions}
                </p>
              </div>
            )}

            {/* Amount Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  2. Deposit Amount ({settings.currencySymbol})
                </label>
                <span className="text-[10px] text-slate-400">Min: Rs. {settings.minDeposit}</span>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2">
                {[500, 1500, 3000, 5000, 10000, 30000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      const matching = plans.find(p => p.price === val);
                      if (matching) setSelectedPlanId(matching.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer shrink-0 ${
                      amount === val
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Rs. {val.toLocaleString()}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min={settings.minDeposit}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="Enter deposit amount"
              />
            </div>

            {/* Auto-Activate Plan Dropdown (Optional) */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                3. Auto-Activate Package Upon Approval
              </label>
              <select
                value={selectedPlanId}
                onChange={e => {
                  setSelectedPlanId(e.target.value);
                  const p = plans.find(plan => plan.id === e.target.value);
                  if (p) setAmount(p.price);
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="">Do not auto-activate (Only credit balance)</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - Rs. {p.price.toLocaleString()} ({p.dailyMinEarn}/day)
                  </option>
                ))}
              </select>
            </div>

            {/* Sender Number & TRX ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Your JazzCash Mobile / Sender Number
                </label>
                <input
                  type="text"
                  value={senderAccount}
                  onChange={e => setSenderAccount(e.target.value)}
                  placeholder="e.g. 03001234567"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  JazzCash Transaction ID (TID)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  placeholder="e.g. 02938475819 (11 or 12 digits)"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Submit Deposit Request (Rs. {amount.toLocaleString()})
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                🔒 Safe 256-bit SSL encrypted financial transaction gateway
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

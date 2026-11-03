import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  CreditCard,
  Key,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  Deposit,
  Withdrawal,
  InvestmentPlan,
  PaymentMethod,
  User,
  AppSettings
} from '../types';
import { storage } from '../services/storageService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  plans: InvestmentPlan[];
  paymentMethods: PaymentMethod[];
  onDataChanged: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  plans,
  paymentMethods,
  onDataChanged
}) => {
  const [isAdminAuth, setIsAdminAuth] = useState(storage.isAdminLoggedIn());
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<
    'deposits' | 'withdrawals' | 'users' | 'payments' | 'settings'
  >('deposits');

  // Reject reason modal state
  const [rejectItem, setRejectItem] = useState<{
    type: 'deposit' | 'withdrawal';
    id: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Balance adjustment state
  const [adjustUser, setAdjustUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);

  // Settings form state
  const [formSettings, setFormSettings] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (
      passwordInput.trim() === settings.adminSecretPassword ||
      passwordInput.trim() === 'Affyisfather' ||
      passwordInput.trim() === 'admin123'
    ) {
      storage.setAdminLoggedIn(true);
      setIsAdminAuth(true);
    } else {
      setAuthError('Incorrect Admin Secret Key. Try default: Affyisfather or admin123');
    }
  };

  const handleAdminLogout = () => {
    storage.setAdminLoggedIn(false);
    setIsAdminAuth(false);
  };

  const deposits = storage.getDeposits();
  const withdrawals = storage.getWithdrawals();
  const users = storage.getUsers();

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const totalBalanceInCirculation = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  // Actions
  const handleApproveDeposit = (depositId: string) => {
    storage.approveDeposit(depositId);
    onDataChanged();
  };

  const handleConfirmReject = () => {
    if (!rejectItem) return;
    if (rejectItem.type === 'deposit') {
      storage.rejectDeposit(rejectItem.id, rejectReason || 'Payment not received in account');
    } else {
      storage.rejectWithdrawal(rejectItem.id, rejectReason || 'Account details mismatch');
    }
    setRejectItem(null);
    setRejectReason('');
    onDataChanged();
  };

  const handleApproveWithdrawal = (wdId: string) => {
    storage.approveWithdrawal(wdId);
    onDataChanged();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(formSettings);
    onDataChanged();
    alert('Settings updated successfully!');
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUser) return;
    adjustUser.balance += Number(adjustAmount);
    storage.updateUser(adjustUser);
    storage.addTransaction({
      userId: adjustUser.id,
      type: 'admin_adjustment',
      amount: Number(adjustAmount),
      title: 'Admin Manual Credit/Debit',
      description: `Manual balance adjustment of Rs. ${adjustAmount} processed by Master Admin`,
      status: 'completed'
    });
    setAdjustUser(null);
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-3xl bg-[#0c1622] border border-amber-500/40 p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Invest in Arm - Master Control</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage deposits, cashouts, packages, and system parameters</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuth && (
              <button
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-800"
              >
                Lock
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth Screen */}
        {!isAdminAuth ? (
          <div className="py-12 max-w-sm mx-auto text-center w-full">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <Key className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-lg text-white mb-1">Admin Authentication</h4>
            <p className="text-xs text-slate-400 mb-5">
              Enter master administrator password to unlock full portal access.
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter admin password (e.g. Affyisfather)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition text-center"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Unlock Admin Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasswordInput('Affyisfather');
                  storage.setAdminLoggedIn(true);
                  setIsAdminAuth(true);
                }}
                className="w-full py-2 rounded-xl bg-slate-900 text-amber-300 hover:bg-slate-800 text-[11px] font-semibold border border-amber-500/20 cursor-pointer"
              >
                1-Click Quick Demo Unlock
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden pt-3">
            {/* Top Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 shrink-0">
              <div className="p-2.5 rounded-xl bg-[#070d14] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pending Deposits</span>
                <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                  {pendingDeposits.length} ({settings.currencySymbol} {pendingDeposits.reduce((s, d) => s + d.amount, 0).toLocaleString()})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070d14] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pending Withdrawals</span>
                <span className="font-mono text-sm sm:text-base font-bold text-rose-400">
                  {pendingWithdrawals.length} ({settings.currencySymbol} {pendingWithdrawals.reduce((s, w) => s + w.amount, 0).toLocaleString()})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070d14] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Registered Investors</span>
                <span className="font-mono text-sm sm:text-base font-bold text-white">
                  {users.length} Users
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070d14] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Circulating Balances</span>
                <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">
                  {settings.currencySymbol} {totalBalanceInCirculation.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2 mb-3 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: 'deposits', label: `Deposits (${pendingDeposits.length} pending)` },
                { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length} pending)` },
                { id: 'users', label: `Users (${users.length})` },
                { id: 'payments', label: 'Payment Accounts' },
                { id: 'settings', label: 'Global Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    adminTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* DEPOSITS TAB */}
              {adminTab === 'deposits' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Manage all incoming investment deposits</span>
                    <span>Total: {deposits.length}</span>
                  </div>

                  {deposits.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No deposit records found.</p>
                  ) : (
                    deposits.map(dep => (
                      <div
                        key={dep.id}
                        className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          dep.status === 'pending'
                            ? 'bg-[#121008] border-amber-500/40'
                            : dep.status === 'approved'
                            ? 'bg-[#070f14] border-emerald-500/20'
                            : 'bg-[#10070a] border-rose-500/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {settings.currencySymbol} {dep.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              via {dep.paymentMethodName}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                dep.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : dep.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {dep.status}
                            </span>
                          </div>

                          <p className="text-slate-300 mt-1">
                            <strong>User:</strong> {dep.userName} ({dep.userPhone})
                          </p>
                          <p className="text-slate-400 font-mono mt-0.5">
                            <strong>TRX ID:</strong> <span className="text-emerald-400 font-bold">{dep.transactionId}</span> • <strong>Sender:</strong> {dep.senderAccountNumber}
                          </p>
                          {dep.planName && (
                            <p className="text-amber-400 font-semibold mt-0.5">
                              ⭐ Requested Package: {dep.planName}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(dep.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {dep.status === 'pending' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Credit</span>
                            </button>
                            <button
                              onClick={() => setRejectItem({ type: 'deposit', id: dep.id })}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* WITHDRAWALS TAB */}
              {adminTab === 'withdrawals' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Manage all member cashout requests</span>
                    <span>Total: {withdrawals.length}</span>
                  </div>

                  {withdrawals.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No withdrawal records found.</p>
                  ) : (
                    withdrawals.map(wd => (
                      <div
                        key={wd.id}
                        className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          wd.status === 'pending'
                            ? 'bg-[#12080a] border-rose-500/40'
                            : wd.status === 'approved'
                            ? 'bg-[#070f14] border-emerald-500/20'
                            : 'bg-[#10070a] border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {settings.currencySymbol} {wd.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase">
                              {wd.paymentMethodType}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                wd.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : wd.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {wd.status}
                            </span>
                          </div>

                          <p className="text-slate-300 mt-1">
                            <strong>Beneficiary:</strong> {wd.accountTitle} ({wd.accountNumber})
                          </p>
                          <p className="text-slate-400 mt-0.5">
                            <strong>User Account:</strong> {wd.userName} ({wd.userPhone})
                            {wd.bankName && ` • Bank: ${wd.bankName}`}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(wd.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {wd.status === 'pending' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveWithdrawal(wd.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Sent & Paid</span>
                            </button>
                            <button
                              onClick={() => setRejectItem({ type: 'withdrawal', id: wd.id })}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs transition cursor-pointer"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* USERS TAB */}
              {adminTab === 'users' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Registered Members & Balances</span>
                    <span>Total: {users.length}</span>
                  </div>

                  {users.map(u => (
                    <div
                      key={u.id}
                      className="p-3 rounded-2xl bg-[#070c12] border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{u.fullName}</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                            Ref: {u.referralCode}
                          </span>
                          {u.referredBy && (
                            <span className="text-[10px] text-slate-400">
                              (Invited by {u.referredBy})
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 font-mono mt-0.5">
                          Phone: {u.phone} • Active Plan: <strong className="text-amber-300">{u.activePlanName || 'None'}</strong>
                        </p>
                        <p className="text-slate-400 font-mono text-[10px]">
                          Tasks Today: {u.dailyTasksCompletedToday || 0} • Ref Earnings: Rs. {u.referralEarnings}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Balance</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            Rs. {u.balance.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => setAdjustUser(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                        >
                          Adjust +/-
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PAYMENT ACCOUNTS TAB */}
              {adminTab === 'payments' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Company accounts shown to investors on the deposit page:
                  </div>

                  {paymentMethods.map(pm => (
                    <div
                      key={pm.id}
                      className="p-3.5 rounded-2xl bg-[#070c12] border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{pm.name}</span>
                        <span className="uppercase text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          {pm.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Title:</span>
                          <span className="font-bold">{pm.accountTitle}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Number / IBAN:</span>
                          <span className="font-bold text-emerald-400">{pm.accountNumber}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Instructions: {pm.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* SETTINGS TAB */}
              {adminTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Site Brand Name
                    </label>
                    <input
                      type="text"
                      value={formSettings.siteName}
                      onChange={e => setFormSettings({ ...formSettings, siteName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Platform Announcement Message
                    </label>
                    <textarea
                      rows={2}
                      value={formSettings.announcementText}
                      onChange={e =>
                        setFormSettings({ ...formSettings, announcementText: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Min Deposit (Rs.)
                      </label>
                      <input
                        type="number"
                        value={formSettings.minDeposit}
                        onChange={e =>
                          setFormSettings({ ...formSettings, minDeposit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Min Cashout (Rs.)
                      </label>
                      <input
                        type="number"
                        value={formSettings.minWithdrawal}
                        onChange={e =>
                          setFormSettings({
                            ...formSettings,
                            minWithdrawal: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Admin Secret Key
                      </label>
                      <input
                        type="text"
                        value={formSettings.adminSecretPassword}
                        onChange={e =>
                          setFormSettings({
                            ...formSettings,
                            adminSecretPassword: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <label className="font-bold text-emerald-400 block mb-1">
                        Level 1 Bonus (%)
                      </label>
                      <input
                        type="number"
                        value={formSettings.level1CommissionPercent}
                        onChange={e =>
                          setFormSettings({
                            ...formSettings,
                            level1CommissionPercent: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-teal-400 block mb-1">
                        Level 2 Bonus (%)
                      </label>
                      <input
                        type="number"
                        value={formSettings.level2CommissionPercent}
                        onChange={e =>
                          setFormSettings({
                            ...formSettings,
                            level2CommissionPercent: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-amber-400 block mb-1">
                        Level 3 Bonus (%)
                      </label>
                      <input
                        type="number"
                        value={formSettings.level3CommissionPercent}
                        onChange={e =>
                          setFormSettings({
                            ...formSettings,
                            level3CommissionPercent: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md mt-2"
                  >
                    Save Platform Configuration
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Reject Dialog */}
        {rejectItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0c1622] border border-rose-500/40 p-5 shadow-2xl">
              <h4 className="font-bold text-white text-sm mb-2">
                Reject {rejectItem.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {rejectItem.type === 'deposit'
                  ? 'Specify why this transaction could not be verified:'
                  : 'Specify why this withdrawal is declined (balance will be refunded to user):'}
              </p>
              <input
                type="text"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason (e.g. TRX ID invalid / mismatched)"
                className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white mb-3"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectItem(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Balance Adjustment Dialog */}
        {adjustUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0c1622] border border-emerald-500/40 p-5 shadow-2xl">
              <h4 className="font-bold text-white text-sm mb-1">Adjust Balance</h4>
              <p className="text-xs text-slate-400 mb-3">
                User: <strong className="text-white">{adjustUser.fullName}</strong> ({adjustUser.phone})
              </p>
              <form onSubmit={handleAdjustBalance} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Amount to Add (or negative to deduct):
                  </label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#070c12] border border-slate-800 text-white font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustUser(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  Users,
  ReceiptText,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  User,
  TabType,
  InvestmentPlan,
  PaymentMethod,
  TaskQuiz,
  Transaction,
  AppSettings
} from './types';
import { storage } from './services/storageService';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { DashboardView } from './components/DashboardView';
import { PlansView } from './components/PlansView';
import { TasksView } from './components/TasksView';
import { TeamView } from './components/TeamView';
import { LedgerView } from './components/LedgerView';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal } from './components/AuthModal';
import { SupportModal } from './components/SupportModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [plans, setPlans] = useState<InvestmentPlan[]>(storage.getPlans());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(storage.getPaymentMethods());
  const [quizzes, setQuizzes] = useState<TaskQuiz[]>(storage.getQuizzes());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositSelectedPlan, setDepositSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Re-sync on storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setCurrentUser(storage.getCurrentUser());
      setPlans(storage.getPlans());
      setPaymentMethods(storage.getPaymentMethods());
      setQuizzes(storage.getQuizzes());
      setTransactions(storage.getTransactions());
      setSettings(storage.getSettings());
    });
    return () => unsubscribe();
  }, []);

  // Secret admin listener (URL trigger #admin or ?admin=true, or shortcut Alt+A / Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminTrigger = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (window.location.hash === '#admin' || urlParams.get('admin') === 'true') {
        setIsAdminOpen(true);
      }
    };
    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') ||
        (e.altKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenDeposit = (plan?: InvestmentPlan) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setDepositSelectedPlan(plan || null);
    setIsDepositOpen(true);
  };

  const handleOpenWithdraw = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsWithdrawOpen(true);
  };

  const handleActivateWithBalance = (plan: InvestmentPlan) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const res = storage.activatePlan(currentUser.id, plan.id, true);
    if (res.success) {
      showToast(res.message, 'success');
      setCurrentTab('tasks');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const navDesktopItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plans' as TabType, label: 'Investment Packages', icon: TrendingUp },
    {
      id: 'tasks' as TabType,
      label: 'Daily Tasks',
      icon: BrainCircuit,
      badge: currentUser?.activePlanId
        ? `${Math.max(0, 5 - (currentUser.dailyTasksCompletedToday || 0))} tasks`
        : null
    },
    { id: 'referrals' as TabType, label: 'Team Matrix', icon: Users },
    { id: 'history' as TabType, label: 'Ledger', icon: ReceiptText }
  ];

  return (
    <div className="min-h-screen bg-[#06090c] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        settings={settings}
        onOpenDeposit={() => handleOpenDeposit()}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onLogout={handleLogout}
      />

      {/* Live Activity Ticker */}
      <AnnouncementTicker />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4 pb-20 sm:pb-10">
        {/* Desktop Tab Selector */}
        <div className="hidden sm:flex items-center justify-between border-b border-slate-800/80 pb-3 mb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#091017] border border-slate-800">
            {navDesktopItems.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Helpline</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {currentTab === 'dashboard' && (
          currentUser ? (
            <DashboardView
              user={currentUser}
              settings={settings}
              plans={plans}
              onOpenDeposit={() => handleOpenDeposit()}
              onOpenWithdraw={handleOpenWithdraw}
              onGoToPlans={() => setCurrentTab('plans')}
              onGoToTasks={() => setCurrentTab('tasks')}
              onGoToReferrals={() => setCurrentTab('referrals')}
              onOpenSupport={() => setIsSupportOpen(true)}
            />
          ) : (
            <div className="space-y-6">
              {/* Public Welcome Hero */}
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#0c1822] via-[#09131c] to-[#060b10] border border-emerald-500/30 text-center shadow-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Invest in Arm • Smart Micro-Investment Portal</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
                  Micro-Investments with Guaranteed <span className="text-emerald-400">Daily Cash Payouts</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-3 mb-6 leading-relaxed">
                  Join Pakistan's premier high-yield platform. Activate packages starting at Rs. 500, solve daily math quizzes, and withdraw 24/7 directly to Easypaisa and JazzCash.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer"
                  >
                    Create Free Account & Get Rs. 100 Bonus
                  </button>
                  <button
                    onClick={() => {
                      const res = storage.login('03001234567', 'password123');
                      if (res.user) {
                        setCurrentUser(res.user);
                        showToast('Logged in as Demo Investor (Ali Raza Khan)!', 'success');
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs transition cursor-pointer"
                  >
                    ⚡ 1-Click Demo Investor Preview
                  </button>
                </div>
              </div>

              {/* Plans Showcase for Guests */}
              <PlansView
                plans={plans}
                user={currentUser}
                settings={settings}
                onSelectPlanForDeposit={plan => handleOpenDeposit(plan)}
                onActivateWithBalance={handleActivateWithBalance}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            </div>
          )
        )}

        {currentTab === 'plans' && (
          <PlansView
            plans={plans}
            user={currentUser}
            settings={settings}
            onSelectPlanForDeposit={plan => handleOpenDeposit(plan)}
            onActivateWithBalance={handleActivateWithBalance}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            user={currentUser}
            plans={plans}
            quizzes={quizzes}
            settings={settings}
            onGoToPlans={() => setCurrentTab('plans')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onTaskCompleted={() => {
              showToast('Task solved! Cash credited to your wallet balance!', 'success');
            }}
          />
        )}

        {currentTab === 'referrals' && (
          <TeamView
            user={currentUser}
            settings={settings}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'history' && (
          <LedgerView
            user={currentUser}
            transactions={transactions}
            settings={settings}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* Subtle Footer */}
        <footer className="mt-12 pt-6 pb-4 border-t border-slate-900/80 text-center text-[11px] text-slate-500">
          <p>© 2026 {settings.siteName} • All Rights Reserved</p>
        </footer>
      </main>

      {/* Floating Bottom Navigation (Mobile Only) */}
      <BottomNavigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        user={currentUser}
      />

      {/* Modals */}
      {currentUser && (
        <>
          <DepositModal
            isOpen={isDepositOpen}
            onClose={() => setIsDepositOpen(false)}
            user={currentUser}
            settings={settings}
            paymentMethods={paymentMethods}
            plans={plans}
            preSelectedPlan={depositSelectedPlan}
            onDepositSuccess={() => {
              showToast('Deposit request submitted! Admin will verify and credit your balance.', 'info');
            }}
          />

          <WithdrawModal
            isOpen={isWithdrawOpen}
            onClose={() => setIsWithdrawOpen(false)}
            user={currentUser}
            settings={settings}
            onWithdrawSuccess={() => {
              showToast('Cashout requested! Transfer will be dispatched to your account shortly.', 'success');
            }}
          />
        </>
      )}

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        plans={plans}
        paymentMethods={paymentMethods}
        onDataChanged={() => {
          setCurrentUser(storage.getCurrentUser());
          setTransactions(storage.getTransactions());
          setSettings(storage.getSettings());
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={user => {
          setCurrentUser(user);
          showToast(`Welcome ${user.fullName}!`, 'success');
        }}
        settings={settings}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        settings={settings}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 max-w-sm backdrop-blur-lg ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'info'
                ? 'bg-blue-950/90 border-blue-500/50 text-blue-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import {
  TrendingUp,
  Wallet,
  Bell,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { User, AppSettings } from '../types';

interface NavbarProps {
  user: User | null;
  settings: AppSettings;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  onOpenDeposit,
  onOpenAuth,
  onOpenAdmin,
  onOpenSupport,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const clickTimesRef = useRef<number[]>([]);

  const handleSecretLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    // keep clicks within last 2.5 seconds
    clickTimesRef.current = clickTimesRef.current.filter(t => now - t < 2500);
    clickTimesRef.current.push(now);

    if (clickTimesRef.current.length >= 5) {
      clickTimesRef.current = [];
      try {
        if ('vibrate' in navigator) navigator.vibrate(80);
      } catch {}
      onOpenAdmin();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/15 bg-[#06090c]/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo with secret 5-clicks admin trigger */}
        <div
          onClick={handleSecretLogoClick}
          className="flex items-center gap-2.5 select-none cursor-pointer"
          title="Invest in Arm"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-amber-500/20 border-2 border-amber-400/50 bg-black shrink-0">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-06_at_13.51.57_2043a638.jpeg"
              alt="Invest in Arm Logo"
              className="w-full h-full object-cover"
            />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border border-black animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
                Invest in <span className="text-amber-400 underline decoration-amber-500/50 underline-offset-4">Arm</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                OFFICIAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Stock Market & Daily Micro-Profit Portal</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Wallet Balance Pill */}
              <div className="flex items-center bg-[#0d161f] border border-emerald-500/30 rounded-full pl-3 pr-1 py-1 shadow-inner shadow-black/40">
                <div className="flex items-center gap-1.5 mr-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-xs sm:text-sm font-bold text-white">
                    {settings.currencySymbol} {user.balance.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={onOpenDeposit}
                  title="Add Funds"
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotification(!showNotification)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer relative"
                  title="Announcements"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#06090c]" />
                </button>

                {showNotification && (
                  <div className="absolute right-0 mt-2 w-80 p-3.5 rounded-2xl bg-[#0e1620] border border-emerald-500/30 shadow-2xl z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Platform Notice
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">Live</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-3">
                      {settings.announcementText}
                    </p>
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300">
                      ⚡ 24/7 Fast Deposit & Withdrawal Dispatches via JazzCash active!
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline truncate max-w-[90px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#0e1722] border border-slate-700/70 shadow-2xl z-50 text-xs">
                    <div className="p-2.5 mb-1 bg-slate-900/90 rounded-xl border border-slate-800">
                      <p className="font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{user.phone}</p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Referral ID:</span>
                        <span className="font-mono font-bold text-emerald-400">{user.referralCode}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenDeposit();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 flex items-center gap-2 cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Deposit Funds
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenSupport();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2 cursor-pointer transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> 24/7 Helpline
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-500/15 text-amber-300 font-bold flex items-center gap-2 cursor-pointer transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Admin Control Portal
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 cursor-pointer transition"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Portal Quick Icon */}
              <button
                onClick={onOpenAdmin}
                title="Admin Master Control (#admin)"
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden lg:inline text-[10px] font-bold">Admin</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdmin}
                title="Admin Master Control (#admin)"
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

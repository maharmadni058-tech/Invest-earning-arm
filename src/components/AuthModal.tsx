import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { storage } from '../services/storageService';
import { User, AppSettings } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  settings: AppSettings;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  settings
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if URL has ?ref=...
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setMode('register');
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await storage.login(phoneOrEmail, password);
        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }
        setSuccessMsg('Welcome back!');
        setTimeout(() => {
          if (res.user) onAuthSuccess(res.user);
          onClose();
        }, 400);
      } else {
        const finalName = fullName.trim() || 'Investor';
        if (!phoneOrEmail.trim() || phoneOrEmail.trim().length < 3) {
          setError('Please enter a valid mobile number or email.');
          setIsSubmitting(false);
          return;
        }

        const res = await storage.register({
          fullName: finalName,
          phone: phoneOrEmail,
          email: phoneOrEmail.includes('@') ? phoneOrEmail.trim().toLowerCase() : undefined,
          password: password || 'Mahar11223344',
          referralCode: referralCode.trim() || undefined
        });

        if (!res.success) {
          setError(res.message);
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(res.message);
        setTimeout(() => {
          if (res.user) onAuthSuccess(res.user);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto rounded-3xl bg-[#0e1726] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Invest in Arm</h3>
            <p className="text-xs text-slate-400">Micro-Investment & Daily Profit Portal</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#070c12] border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Registration Welcome Promo */}
        {mode === 'register' && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Get Rs. 10 instant bonus credited upon registration!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs mb-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-tight">{error}</span>
            </div>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  if (!fullName) setFullName('Investor');
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Free Account with "{phoneOrEmail || 'this email'}" (Get Rs. 10 Bonus)</span>
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Mahar Madni"
                className="w-full px-3 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Mobile Number (or Email)
            </label>
            <input
              type="text"
              value={phoneOrEmail}
              onChange={e => setPhoneOrEmail(e.target.value)}
              placeholder="e.g. 03087348367 or 58@gmail.com"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your account password"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. ARM7788"
                className="w-full px-3 py-2.5 rounded-xl bg-[#070c12] border border-slate-800 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
          >
            {isSubmitting
              ? 'Connecting...'
              : mode === 'login'
              ? 'Sign In to Portal'
              : 'Register & Claim Rs. 10 Bonus'}
          </button>

          <div className="text-center pt-2">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 transition cursor-pointer"
              >
                New here? <span className="text-emerald-400 font-bold underline underline-offset-2">Create Account & Claim Rs. 10</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 transition cursor-pointer"
              >
                Already have an account? <span className="text-emerald-400 font-bold underline underline-offset-2">Sign In here</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  QrCode,
  DollarSign,
  UserCheck,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { User, AppSettings } from '../types';
import { storage } from '../services/storageService';

interface TeamViewProps {
  user: User | null;
  settings: AppSettings;
  onOpenAuth: () => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ user, settings, onOpenAuth }) => {
  const [activeTierTab, setActiveTierTab] = useState<'l1' | 'l2' | 'l3'>('l1');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 rounded-3xl bg-[#0c1622] border border-emerald-500/30 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-xl text-white mb-2">Team Referral Program</h3>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Sign in to access your unique referral link, 3-tier matrix rewards, and instant commission earnings.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const teamData = storage.getTeamStats(user.referralCode);
  const inviteUrl = `${window.location.origin}?ref=${user.referralCode}`;
  const totalTeamCount = teamData.level1.length + teamData.level2.length + teamData.level3.length;

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

  const handleWhatsAppShare = () => {
    const text = encodeURI(
      `🔥 Earn daily profit from home with Invest in Arm!\n\nActivate verified investment packages, solve quick math challenges daily, and withdraw instantly via Easypaisa or JazzCash.\n\nJoin with my referral code ${user.referralCode} and get Rs. 100 welcome bonus:\n${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    const text = encodeURI(
      `Earn daily cash with Invest in Arm! Join with code ${user.referralCode} & get welcome bonus:\n${inviteUrl}`
    );
    window.open(`https://t.me/share/url?url=${encodeURI(inviteUrl)}&text=${text}`, '_blank');
  };

  const currentTierMembers =
    activeTierTab === 'l1'
      ? teamData.level1
      : activeTierTab === 'l2'
      ? teamData.level2
      : teamData.level3;

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#0e1d2c] via-[#091522] to-[#060c14] border border-emerald-500/35 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>3-Tier Multi-Level Earnings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Team Referral Network
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
              Earn lifetime commissions when your invited friends activate investment tiers. 10% direct, 5% tier-2, 2% tier-3!
            </p>
          </div>

          <div className="p-3.5 sm:px-5 rounded-2xl bg-[#070e17] border border-emerald-500/30 text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Total Commission Earned</span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">
              Rs. {user.referralEarnings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Invite link and code copy */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Referral Code */}
          <div className="p-3 rounded-2xl bg-[#060a10] border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your Referral Code</span>
              <span className="font-mono text-base font-extrabold text-amber-400">{user.referralCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Referral Link */}
          <div className="p-3 rounded-2xl bg-[#060a10] border border-slate-800 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unique Invite Link</span>
              <span className="font-mono text-xs text-slate-300 truncate block select-all">{inviteUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-slate-950 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>
          <button
            onClick={handleTelegramShare}
            className="flex-1 py-2.5 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-[#0088cc] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Share on Telegram</span>
          </button>
        </div>
      </div>

      {/* 3-Tier Commission Explainer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#0c141d] border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400">Level 1 (Direct)</span>
            <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {settings.level1CommissionPercent}% BONUS
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Instant cash on every friend you personally invite. When they activate a Rs. 5,000 package, you get <strong className="text-emerald-400">Rs. 500</strong> instantly.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Members:</span>
            <span className="font-mono font-bold text-white">{teamData.level1.length} Users</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c141d] border border-teal-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-400">Level 2 (Indirect)</span>
            <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
              {settings.level2CommissionPercent}% BONUS
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Passive income when your Level-1 friends invite others. When they activate a Rs. 10,000 plan, you receive <strong className="text-teal-400">Rs. 500</strong> passive bonus.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Members:</span>
            <span className="font-mono font-bold text-white">{teamData.level2.length} Users</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c141d] border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400">Level 3 (Generational)</span>
            <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {settings.level3CommissionPercent}% BONUS
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Depth commission from downline referrals. Continuous passive income streamed straight into your wallet without doing extra tasks.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Your Members:</span>
            <span className="font-mono font-bold text-white">{teamData.level3.length} Users</span>
          </div>
        </div>
      </div>

      {/* Team Breakdown Table / List */}
      <div className="p-5 rounded-3xl bg-[#0b131c] border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Your Team Downline</h3>
            <p className="text-xs text-slate-400">Total Network Size: {totalTeamCount} Registered Investors</p>
          </div>

          {/* Tier Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#060a0f] border border-slate-800">
            <button
              onClick={() => setActiveTierTab('l1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTierTab === 'l1'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Level 1 ({teamData.level1.length})
            </button>
            <button
              onClick={() => setActiveTierTab('l2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTierTab === 'l2'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Level 2 ({teamData.level2.length})
            </button>
            <button
              onClick={() => setActiveTierTab('l3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTierTab === 'l3'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Level 3 ({teamData.level3.length})
            </button>
          </div>
        </div>

        {/* Member cards */}
        {currentTierMembers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#070b10] border border-slate-800 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No members in this tier yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Share your invite link on WhatsApp groups, Telegram channels, and Facebook to build your network!
            </p>
            <button
              onClick={handleCopyLink}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Invite Link</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {currentTierMembers.map(member => (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-[#070b10] border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs">
                    {member.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm">{member.fullName}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {member.phone.slice(0, 4)}***{member.phone.slice(-3)} • Joined {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      member.activePlanId
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {member.activePlanName || 'No Plan Active'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Deposited: Rs. {member.totalDeposited.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

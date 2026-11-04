import React from 'react';
import {
  X,
  Headphones,
  MessageSquare,
  Send,
  HelpCircle,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How do I start earning daily cash on Invest in Arm?',
      a: 'Simply deposit and activate any investment package (starting from Bronze Rs. 500 up to Sovereign Rs. 50,000). Once active, go to Daily Tasks to solve arithmetic quizzes and claim your guaranteed daily cash yield!'
    },
    {
      q: 'How long does a deposit take to be approved?',
      a: 'Deposits are manually verified by our finance team within 5 to 15 minutes after submitting your payment TRX ID and sender mobile number.'
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum cashout threshold is Rs. 300. Withdrawals are processed 24/7 with zero fees directly to your verified JazzCash account.'
    },
    {
      q: 'How does the 3-Tier referral program work?',
      a: 'When someone registers using your referral code and activates a package, you earn 10% direct commission (Level 1). If they invite someone, you receive 5% (Level 2), and if that person invites someone, you receive 2% (Level 3)!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c1622] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Headphones className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">24/7 Official Support</h3>
            <p className="text-xs text-slate-400">Direct assistance from Invest in Arm finance team</p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <a
            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(settings.supportWhatsApp || '923459876543')}&text=Hello%20Invest%20in%20Arm%20Support`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 flex items-center gap-3 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-slate-950 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">WhatsApp Helpline</span>
              <span className="text-[11px] text-[#25D366] font-mono">Instant Chat 24/7</span>
            </div>
          </a>

          <a
            href={settings.supportTelegram || 'https://t.me/InvestInArmOfficial'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/40 flex items-center gap-3 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">Telegram Channel</span>
              <span className="text-[11px] text-[#0088cc]">Official Updates & Proofs</span>
            </div>
          </a>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Frequently Asked Questions</span>
          </h4>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-[#070d13] border border-slate-800">
                <h5 className="font-bold text-white text-xs mb-1">{faq.q}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Invest in Arm operates 24/7 verified financial dispatches across Pakistan.
          </p>
        </div>
      </div>
    </div>
  );
};

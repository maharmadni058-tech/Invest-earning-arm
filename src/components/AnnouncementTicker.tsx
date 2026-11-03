import React from 'react';
import { ShieldCheck, Flame, Bell, Zap } from 'lucide-react';
import { MOCK_ACTIVITY_FEED } from '../data/defaultData';

export const AnnouncementTicker: React.FC = () => {
  return (
    <div className="w-full bg-[#091118] border-b border-emerald-500/10 py-1.5 px-3 overflow-hidden text-xs">
      <div className="max-w-5xl mx-auto flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0 bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[11px] border border-emerald-500/30">
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400 animate-bounce" />
          <span>LIVE ACTIVITY</span>
        </div>

        <div className="overflow-hidden relative w-full h-5 flex items-center">
          <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
            {MOCK_ACTIVITY_FEED.concat(MOCK_ACTIVITY_FEED).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>{item.text}</span>
                <span className="text-[10px] text-slate-500">({item.time})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

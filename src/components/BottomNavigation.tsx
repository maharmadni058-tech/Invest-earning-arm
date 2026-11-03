import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  Users,
  ReceiptText
} from 'lucide-react';
import { TabType, User } from '../types';

interface BottomNavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  user: User | null;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onChangeTab,
  user
}) => {
  const remainingTasks = user?.activePlanId
    ? Math.max(0, 5 - (user.dailyTasksCompletedToday || 0)) // or dynamic based on plan
    : 0;

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Home',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'plans' as TabType,
      label: 'Plans',
      icon: TrendingUp,
      badge: 'HOT'
    },
    {
      id: 'tasks' as TabType,
      label: 'Tasks',
      icon: BrainCircuit,
      badge: user?.activePlanId && remainingTasks > 0 ? `${remainingTasks}` : null
    },
    {
      id: 'referrals' as TabType,
      label: 'Team',
      icon: Users,
      badge: '10%'
    },
    {
      id: 'history' as TabType,
      label: 'Ledger',
      icon: ReceiptText,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#06090c]/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 sm:hidden">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.badge && (
                <span
                  className={`absolute -top-1 right-2 text-[9px] font-extrabold px-1 rounded-full ${
                    item.badge === 'HOT'
                      ? 'bg-rose-500 text-white'
                      : item.badge === '10%'
                      ? 'bg-amber-500/90 text-slate-950'
                      : 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

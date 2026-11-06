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
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = Boolean(user && user.lastTaskDate === todayStr && user.dailyTasksCompletedToday >= 1);
  const hasClaimReady = Boolean(user?.activePlanId && !isClaimedToday);

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
      badge: 'TOP'
    },
    {
      id: 'tasks' as TabType,
      label: 'Profit',
      icon: BrainCircuit,
      badge: hasClaimReady ? '1' : null
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-neutral-800 backdrop-blur-xl px-2 py-1.5 sm:hidden">
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
                  ? 'text-white bg-neutral-900 border border-neutral-800'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.badge && (
                <span className="absolute -top-1 right-2 text-[9px] font-extrabold px-1 rounded-full bg-white text-black border border-neutral-200">
                  {item.badge}
                </span>
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-white' : 'text-neutral-400'} transition-transform`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

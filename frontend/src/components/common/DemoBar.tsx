import React from 'react';
import { Shield, Store, User as UserIcon, RefreshCw, Sparkles } from 'lucide-react';
import { User, UserRole } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from './Toast';

interface DemoBarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onOpenAi: () => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({ currentUser, onSwitchUser, onOpenAi }) => {
  const { showToast } = useToast();
  const allUsers = dbService.getUsers();

  const adminUser = allUsers.find(u => u.role === 'admin') || allUsers[0];
  const shopUser = allUsers.find(u => u.role === 'shop') || allUsers[1];
  const citizenUser = allUsers.find(u => u.role === 'citizen') || allUsers[4];

  const handleRoleSwitch = (role: UserRole) => {
    let target = citizenUser;
    if (role === 'admin') target = adminUser;
    if (role === 'shop') target = shopUser;

    dbService.setCurrentUser(target);
    onSwitchUser(target);
    showToast(
      `Switched to ${role.toUpperCase()} mode`,
      `Active identity: ${target.name} (${target.role})`,
      'info'
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to initial Perinthalmanna seed?')) {
      dbService.resetDemoData();
      showToast('Demo Data Reset', 'All seed shops and offers restored.', 'success');
      setTimeout(() => window.location.reload(), 300);
    }
  };

  return (
    <aside aria-label="Hackathon Demo Bar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] sm:w-auto">
      <div className="bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Hackathon Badge */}
        <div className="hidden md:flex items-center gap-2 border-r border-slate-700/80 pr-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide text-slate-300 text-xs">Hojathon 2026</span>
        </div>

        {/* Quick Switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin */}
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              currentUser.role === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Switch to Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-amber-300 sm:w-4 sm:h-4" />
            <span>Admin</span>
          </button>

          {/* Shop */}
          <button
            onClick={() => handleRoleSwitch('shop')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              currentUser.role === 'shop'
                ? 'bg-indigo-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Switch to Shop Owner Dashboard"
          >
            <Store className="w-3.5 h-3.5 text-indigo-300 sm:w-4 sm:h-4" />
            <span>Shop Owner</span>
          </button>

          {/* Citizen */}
          <button
            onClick={() => handleRoleSwitch('citizen')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              currentUser.role === 'citizen'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Switch to Citizen Discovery View"
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-300 sm:w-4 sm:h-4" />
            <span>Citizen</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pl-1.5 sm:pl-3 border-l border-slate-700/80">
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs shadow-glow transition-all"
            title="Launch Agentic AI Deal Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          <button
            onClick={handleResetData}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to fresh seed demo data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

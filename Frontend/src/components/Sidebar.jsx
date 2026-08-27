import React from 'react';
import { LayoutDashboard, BarChart3, Bell, Utensils, Settings, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'menu', label: 'Menu Planner', icon: Utensils },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800/80 flex flex-col justify-between p-6 h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <ShieldAlert className="w-7 h-7 text-emerald-400" />
          <h1 className="font-bold text-white text-xl tracking-tight">SmartPlate AI</h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-2 pt-4 border-t border-slate-800/60">
        <p className="text-xs text-slate-500">Portal Version 1.0.0</p>
      </div>
    </aside>
  );
}
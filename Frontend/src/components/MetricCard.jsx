import React from 'react';

export default function MetricCard({ title, value, subtext, type = 'normal' }) {
  const valueColors = {
    normal: 'text-sky-400',
    danger: 'text-rose-400',
    success: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="bg-[#1e293b]/70 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
        <div className={`text-3xl font-extrabold ${valueColors[type] || 'text-white'}`}>{value}</div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-slate-400">{subtext}</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20">
          • LIVE ENGINE
        </span>
      </div>
    </div>
  );
}
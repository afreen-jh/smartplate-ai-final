import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings Control Panel</h2>
        <p className="text-xs text-slate-400">Campus Canteen Management Ecosystem</p>
      </div>

      <div className="bg-[#1e293b]/70 border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-6">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span>⚙️</span> Engine Variables Control Panel
          </h3>
          <p className="text-xs text-slate-400">Tune active system parameters and detection criteria rules.</p>
        </div>

        {/* Range Slider Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white block">Anomaly Trigger Margin Limit</label>
          <p className="text-xs text-slate-400 mb-2">Set warning ceilings when real production trends drift from standard baselines.</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="30"
              defaultValue="10"
              className="w-full accent-sky-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="bg-slate-900 border border-slate-700 text-sky-400 font-bold text-xs px-3 py-1 rounded-lg">
              10%
            </span>
          </div>
        </div>

        {/* Select Dropdown Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white block">Active ML Prediction Blueprint Model</label>
          <p className="text-xs text-slate-400 mb-2">Select running back-end architecture logic engines.</p>
          <select className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none">
            <option>Neural Ensemble Framework v2 (XGBoost Optimized)</option>
            <option>Linear Regression Baseline Engine</option>
            <option>Random Forest Canteen Predictor</option>
          </select>
        </div>

        {/* Status Box */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
          <p className="text-xs text-slate-300">
            <strong className="text-emerald-400">Security Engine Matrix Running Stable:</strong> System adjustments apply across local operational loops immediately without stopping analytical processes.
          </p>
        </div>
      </div>
    </div>
  );
}
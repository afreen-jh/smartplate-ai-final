import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const alertStyles = {
  danger: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    icon: <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />,
    badge: 'bg-rose-500/20 text-rose-300',
    label: 'CRITICAL'
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: <Info className="w-5 h-5 text-amber-400 mt-0.5" />,
    badge: 'bg-amber-500/20 text-amber-300',
    label: 'WARNING'
  },
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />,
    badge: 'bg-emerald-500/20 text-emerald-300',
    label: 'INFO'
  }
};

export default function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://smartplate-ai-final.onrender.com/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch alerts:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Alerts Control Panel</h2>
        <p className="text-xs text-slate-400">Campus Canteen Management Ecosystem</p>
      </div>

      <div className="bg-[#1e293b]/70 border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <span>🔔</span> System Notification History Log
        </h3>
        <p className="text-xs text-slate-400 mb-4">Comprehensive diagnostic stream regarding operational constraints and optimization overrides.</p>

        {loading && <p className="text-slate-400 text-sm">Loading alerts...</p>}

        {!loading && alerts.length === 0 && (
          <p className="text-slate-400 text-sm">No alerts right now — everything looks normal.</p>
        )}

        {alerts.map((alert) => {
          const style = alertStyles[alert.type] || alertStyles.success;
          return (
            <div key={alert.id} className={`p-4 rounded-xl border ${style.border} ${style.bg} flex items-start justify-between`}>
              <div className="flex items-start gap-3">
                {style.icon}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.badge}`}>{style.label}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">{alert.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
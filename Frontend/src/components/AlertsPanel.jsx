import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'Anomaly',
      message: 'Anomaly: +35 extra plates prepared for Breakfast.',
      icon: 'anomaly'
    },
    {
      id: 2,
      type: 'High Waste Alert',
      message: 'High Waste Alert: 18% Rice wasted during Lunch.',
      icon: 'high_waste'
    },
    {
      id: 3,
      type: 'AI Rec',
      message: 'AI Rec: Reduce Dinner prep by 12%.',
      icon: 'rec'
    }
  ]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/alerts')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch alerts');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch((err) => {
        console.warn('Backend alerts offline, using fallback data:', err);
      });
  }, []);

  const getAlertStyles = (type = '') => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('anomaly') || lowerType.includes('critical')) {
      return {
        border: 'border-l-rose-500',
        bg: 'bg-rose-500/10',
        text: 'text-rose-300',
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      };
    }
    if (lowerType.includes('waste') || lowerType.includes('warning')) {
      return {
        border: 'border-l-amber-500',
        bg: 'bg-amber-500/10',
        text: 'text-amber-300',
        icon: <Info className="w-4 h-4 text-amber-400 shrink-0" />
      };
    }
    return {
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
    };
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🚨</span>
        <h3 className="text-base font-bold text-white">Real-Time Waste Anomalies</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const style = getAlertStyles(alert.type || alert.message);
          return (
            <div
              key={alert.id || index}
              className={`p-3.5 rounded-xl border-l-4 ${style.border} ${style.bg} flex items-center gap-3 transition-transform hover:translate-x-1`}
            >
              {style.icon}
              <p className={`text-xs font-semibold ${style.text}`}>
                {alert.message || `${alert.type}: ${alert.text}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
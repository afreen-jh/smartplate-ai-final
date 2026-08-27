import React, { useState, useEffect } from 'react';
import { TrendingDown, Users, Calendar } from 'lucide-react';

export default function AnalyticsView() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/analytics/insights')
      .then(res => res.json())
      .then(data => {
        setInsights(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch insights:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-slate-400">Loading analytics...</p>;
  }

  const records = [
    {
      title: 'Weekly Waste Variance Reduction',
      subtitle: 'Aggregated over trailing 7-day windows',
      stat: `${insights?.wasteVarianceReduction > 0 ? '-' : ''}${Math.abs(insights?.wasteVarianceReduction ?? 0)}% ${insights?.wasteVarianceReduction > 0 ? '↗' : ''}`,
      statColor: insights?.wasteVarianceReduction > 0 ? 'text-emerald-400' : 'text-slate-300',
      icon: TrendingDown,
    },
    {
      title: 'Canteen Attendance Baseline Predictor',
      subtitle: 'Confidence interval accuracy alignment',
      stat: `${insights?.attendanceMatch ?? 0}% Match`,
      statColor: 'text-white',
      icon: Users,
    },
    {
      title: 'Peak Dynamic Margin Window',
      subtitle: 'Highest optimization variance logged this semester',
      stat: insights?.peakMarginWindow ?? 'N/A',
      statColor: 'text-sky-400',
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Control Panel</h2>
        <p className="text-xs text-slate-400">Campus Canteen Management Ecosystem</p>
      </div>

      <div className="bg-[#1e293b]/70 border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-6">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span>📈</span> Historical Trend Analysis
          </h3>
          <p className="text-xs text-slate-400">Deep insights into long-term operational baselines and consumption tracking patterns.</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Metric Performance Records</h4>
          {records.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <div key={idx} className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-800 rounded-lg text-slate-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">{rec.title}</h5>
                    <p className="text-xs text-slate-400">{rec.subtitle}</p>
                  </div>
                </div>
                <div className={`font-bold text-sm ${rec.statColor}`}>{rec.stat}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
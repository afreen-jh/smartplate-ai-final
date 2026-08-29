import React, { useState, useEffect } from 'react';

export default function DemandChart() {
  const [weeklyForecast, setWeeklyForecast] = useState([
    { day: 'Mon', actual: 420, forecast: 450, variance: '+7.6%' },
    { day: 'Tue', actual: 450, forecast: 478, variance: '+6.2%' },
    { day: 'Wed', actual: 480, forecast: 506, variance: '+5.5%' },
    { day: 'Thu', actual: 510, forecast: 488, variance: '-4.3%' },
    { day: 'Fri', actual: 520, forecast: 547, variance: '+5.2%' },
    { day: 'Sat', actual: 380, forecast: 346, variance: '-9.0%' },
    { day: 'Sun', actual: 350, forecast: 328, variance: '-6.2%' }
  ]);

  useEffect(() => {
    fetch('https://smartplate-ai-final.onrender.com/predictions/forecast')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch forecast');
        return res.json();
      })
      .then((data) => {
        // Extract array directly from payload key mockWeeklyForecast
        if (data && data.mockWeeklyForecast) {
          setWeeklyForecast(data.mockWeeklyForecast);
        }
      })
      .catch((err) => {
        console.warn('Backend forecast API offline, using cached mock data:', err);
      });
  }, []);

  const maxVal = 600;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="text-base font-bold text-white">Demand Forecasting Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive scheduling models vs actual meal consumption (in kg)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
            <span className="text-slate-300">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
            <span className="text-slate-300">AI Forecast</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="relative h-64 overflow-hidden flex items-end justify-between gap-2 pt-8 pb-2 border-b border-slate-800">
        {weeklyForecast.map((item, idx) => {
          const actualHeight = `${(item.actual / maxVal) * 100}%`;
          const forecastHeight = `${(item.forecast / maxVal) * 100}%`;
          const isNegative = item.variance?.startsWith('-');

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Variance Tag */}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded mb-2 ${
                  isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {item.variance}
              </span>

              {/* Bars Pair */}
              <div className="w-full flex justify-center items-end gap-1.5 h-full">
                <div
                  style={{ height: actualHeight }}
                  className="w-1/2 max-w-[16px] bg-sky-500 rounded-t-sm transition-all group-hover:brightness-125"
                  title={`Actual: ${item.actual} kg`}
                ></div>
                <div
                  style={{ height: forecastHeight }}
                  className="w-1/2 max-w-[16px] bg-indigo-500 rounded-t-sm transition-all group-hover:brightness-125"
                  title={`Forecast: ${item.forecast} kg`}
                ></div>
              </div>

              {/* Day Label */}
              <span className="text-xs text-slate-400 mt-3 font-medium">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
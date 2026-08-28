import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function MenuPlanner() {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMenuPlanner = () => {
    fetch('http://smartplate-ai-final.onrender.com/menu-planner')
      .then(res => res.json())
      .then(data => {
        setMenuData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch menu planner:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenuPlanner();
  }, []);

  const handleInputChange = (id, value) => {
    setMenuData(prev =>
      prev.map(item => item.id === id ? { ...item, base_plate_count: value } : item)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        menuData.map(item =>
          fetch(`http://smartplate-ai-final.onrender.com/menu-planner/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base_plate_count: Number(item.base_plate_count) })
          })
        )
      );
      fetchMenuPlanner();
    } catch (err) {
      console.error('Failed to save menu planner:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return <p className="text-slate-400">Loading menu planner...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Menu Control Panel</h2>
        <p className="text-xs text-slate-400">Campus Canteen Management Ecosystem</p>
      </div>

      <div className="bg-[#1e293b]/70 border border-slate-700/60 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span>🍱</span> Production Schedule Optimizer
            </h3>
            <p className="text-xs text-slate-400">Adjust local baseline parameters for automated model override computations.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">MEAL TIMING</th>
                <th className="py-3 px-4">MENU ITEM</th>
                <th className="py-3 px-4">BASE PLATE COUNT</th>
                <th className="py-3 px-4">AI VARIANCE FACTOR</th>
                <th className="py-3 px-4">TARGET PRODUCTION OPTIMIZATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {menuData.map((row) => (
                <tr key={row.id}>
                  <td className="py-4 px-4 font-bold text-sky-400">
                    {row.meal_type.charAt(0).toUpperCase() + row.meal_type.slice(1)}
                  </td>
                  <td className="py-4 px-4 text-slate-200 italic">{row.name}</td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={row.base_plate_count}
                      onChange={(e) => handleInputChange(row.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1 w-20 text-center font-bold"
                    />
                  </td>
                  <td className={`py-4 px-4 font-bold ${row.ai_variance_factor < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.ai_variance_factor > 0 ? '+' : ''}{row.ai_variance_factor} plates
                  </td>
                  <td className="py-4 px-4 font-bold text-white">{row.target_production} Units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
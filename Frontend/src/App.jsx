import React, { useState, useEffect } from 'react';
import {
  Utensils, Mail, Lock, User, Eye, EyeOff, TrendingDown,
  Zap, ShieldCheck, ArrowRight, Sparkles, BarChart3,
  Bell, UtensilsCrossed, Settings as SettingsIcon, MapPin,
  Save, RotateCw, Trash2, RefreshCw, Check, AlertTriangle
} from 'lucide-react';

import MetricCard from './components/MetricCard';
import DemandChart from './components/DemandChart';
import AlertsPanel from './components/AlertsPanel';
import MenuPlanner from './components/MenuPlanner';
import AnalyticsView from './components/AnalyticsView';
import AlertsView from './components/AlertsView';
import SettingsView from './components/SettingsView';
import Sidebar from './components/Sidebar';

export default function App() {
  // Authentication & Navigation States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);

  // Auth Form Input States
  const [loginEmail, setLoginEmail] = useState('afreen751int@gmail.com');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [signupName, setSignupName] = useState('Afreen');
  const [signupEmail, setSignupEmail] = useState('afreen751int@gmail.com');
  const [signupPassword, setSignupPassword] = useState('••••••••');
  const [signupRole, setSignupRole] = useState('Mess Manager');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  // Backend Analytics Data State
  const [summary, setSummary] = useState({
    totalPreparedKg: 450,
    totalWastedKg: 45,
    wastePercentage: 10,
    costSavedINR: 3500,
    efficiencyStatus: '98.4%'
  });
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Fetch summary analytics from backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/analytics/summary')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setLoadingSummary(false);
      })
      .catch((err) => {
        console.warn('Backend unavailable, using default summary:', err);
        setLoadingSummary(false);
      });
  }, []);

  // Handler functions for Auth
  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message);
    }
    setAuthLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Signup failed');
      }
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message);
    }
    setAuthLoading(false);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  // If user is not authenticated, show Auth Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Hero Section */}
          <div className="md:w-1/2 p-8 lg:p-12 bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
                  <Utensils className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">SmartPlate AI</h1>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Next-Gen Kitchen Analytics Engine
              </div>

              <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                Predict demand. Eliminate waste. Optimize yield.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Enterprise-grade machine learning tailored for campus canteens and large-scale meal planning operations.
              </p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Up to 25% Reduction</p>
                    <p className="text-xs text-slate-400">In daily meal over-preparation waste</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Real-time Anomaly Engine</p>
                    <p className="text-xs text-slate-400">Instant telemetry alerts during live serving</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Role-Based Security</p>
                    <p className="text-xs text-slate-400">Segregated permissions for admins and kitchen staff</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-800/60 flex justify-between text-xs text-slate-500">
              <span>v2.4.0 Engine Active</span>
              <span>SmartPlate AI Ecosystem</span>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-[#0d1322]">
            <div className="flex bg-slate-900/80 p-1 rounded-xl mb-8 border border-slate-800">
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authMode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white">Welcome back</h3>
                  <p className="text-xs text-slate-400 mt-1">Access your kitchen telemetry panel.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0" />
                    Remember session
                  </label>
                  <a href="#" className="text-blue-400 hover:underline">Forgot password?</a>
                </div>

                {authError && (
                  <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
                >
                  {authLoading ? 'Authenticating...' : 'Authenticate'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">Create an account</h3>
                  <p className="text-xs text-slate-400 mt-1">Register credentials to access the system.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Assigned Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Mess Manager">Mess Manager</option>
                    <option value="Head Chef">Head Chef</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>

                {authError && (
                  <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
                >
                  {authLoading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Main Dashboard UI
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={handleSignOut} />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Food Waste Intelligence Panel</h1>
            <p className="text-xs text-slate-400">Campus Canteen Management Ecosystem</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-200">Main Hostel Mess</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
            >
              Sign In
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="TOTAL VOLUME PREPARED"
                value={`${summary.totalPreparedKg} kg`}
                subtext="Accumulated baseline today"
                badge="• LIVE"
              />
              <MetricCard
                title="OPTIMIZED FOOD WASTE"
                value={`${summary.totalWastedKg} kg`}
                subtext={`Target ceiling hit (${summary.wastePercentage}%)`}
                badge="• LIVE"
                badgeColor="text-emerald-400"
              />
              <MetricCard
                title="DIRECT COST PROTECTION"
                value={`₹${summary.costSavedINR}`}
                subtext="Resource footprint reduction"
                badge="• LIVE"
                valueColor="text-emerald-400"
              />
              <MetricCard
                title="SYSTEM PERFORMANCE"
                value={summary.efficiencyStatus}
                subtext="ML engine operations level"
                badge="• LIVE"
                valueColor="text-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DemandChart />
              </div>
              <div>
                <AlertsPanel />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'menu' && <MenuPlanner />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
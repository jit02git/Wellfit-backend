import React, { useState } from 'react';
import { Activity, User, Mail, Clock, RefreshCw } from 'lucide-react';

export default function AuthForm({ onSubmit, actionLoading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      isLogin,
      payload: isLogin 
        ? { email: form.email, password: form.password }
        : form
    });
  };

  return (
    <div className="max-w-md w-full mx-auto my-12">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
        
        {/* Auth Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-emerald-500/10">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {isLogin ? 'Welcome back to Wellfit' : 'Create an Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-2 text-center">
            {isLogin 
              ? 'Log in to book wellness sessions and manage your schedule.' 
              : 'Sign up today to start booking wellness sessions.'}
          </p>
        </div>

        {/* Form toggler */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Clock className="w-4.5 h-4.5 transform rotate-45" />
              </span>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Are you a Member or Trainer?</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                  form.role === 'member'
                    ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={form.role === 'member'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-sm font-semibold">🏋️ Member</span>
                </label>
                <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                  form.role === 'trainer'
                    ? 'border-emerald-500 bg-emerald-950/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="trainer"
                    checked={form.role === 'trainer'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-sm font-semibold">💪 Trainer</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-sm font-bold tracking-tight rounded-xl py-3.5 transition-all shadow-lg hover:shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {actionLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

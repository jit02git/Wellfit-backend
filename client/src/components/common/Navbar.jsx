import React from 'react';
import { Activity, Wallet, LogOut } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, notificationsCount, handleLogout }) {
  if (!user) return null;

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/10">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">Wellfit</span>
            <span className="text-xs block text-slate-400 font-medium uppercase tracking-widest mt-[-2px]">{user.role} workspace</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bookings' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {user.role === 'member' ? 'My Bookings' : 'Attendees'}
          </button>

          {user.role === 'member' && (
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative ${
                activeTab === 'notifications' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mock Inbox
              {notificationsCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </button>
          )}
        </div>

        {/* Profile & Logout */}
        <div className="flex items-center gap-5">
          {user.role === 'member' && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wide text-emerald-500">WALLET:</span>
              <span className="text-sm font-bold tracking-tight text-emerald-300">₹{user.walletBalance?.toFixed(2) || '0.00'}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase">
              {user.name ? user.name.charAt(0) : ''}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold leading-none">{user.name}</p>
              <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

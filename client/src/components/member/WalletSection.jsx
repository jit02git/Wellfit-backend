import React, { useState } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';

export default function WalletSection({ user, actionLoading, onTopUp }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    onTopUp(amount, () => setAmount(''));
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-emerald-500" /> Wallet Balance
      </h3>
      
      <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center mb-6">
        <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">Available Funds</p>
        <p className="text-4xl font-black text-emerald-400 tracking-tight">
          ₹{user.walletBalance?.toFixed(2) || '0.00'}
        </p>
        <p className="text-xs text-slate-500 mt-2">Each booking automatically deducts ₹200.00</p>
      </div>

      {/* Top-up Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Add Mock Balance</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold text-sm">₹</span>
          <input
            type="number"
            min="1"
            placeholder="Enter amount (e.g., 500)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl pl-7 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-slate-100 hover:bg-white text-slate-950 text-sm font-bold rounded-xl py-2.5 transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Top Up Wallet</span>}
        </button>
      </form>
    </div>
  );
}

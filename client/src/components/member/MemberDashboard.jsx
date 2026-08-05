import React from 'react';
import WalletSection from './WalletSection';
import AvailableSlots from './AvailableSlots';

export default function MemberDashboard({ user, actionLoading, handleTopUp, availableSlots, handleBookSession }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Wallet Section (Col 1) */}
      <div className="lg:col-span-1 space-y-6">
        <WalletSection 
          user={user} 
          actionLoading={actionLoading} 
          onTopUp={handleTopUp} 
        />

        {/* Info Tips Panel */}
        <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <h4 className="text-sm font-bold text-slate-300">💡 Wellness Tip</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consistent practice builds enduring habits. Take 15 minutes to review slots, add mock funds to cover your sessions, and lock in your trainers early.
          </p>
        </div>
      </div>

      {/* Bookable Trainer Slots Catalog (Col 2 & 3) */}
      <AvailableSlots 
        availableSlots={availableSlots} 
        actionLoading={actionLoading} 
        onBookSession={handleBookSession} 
      />
    </div>
  );
}

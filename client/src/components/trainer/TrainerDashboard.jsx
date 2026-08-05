import React from 'react';
import CreateSlotForm from './CreateSlotForm';
import PublishedSlots from './PublishedSlots';

export default function TrainerDashboard({ actionLoading, handleCreateSlot, trainerSlots }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Add Slots Form (Col 1) */}
      <div className="lg:col-span-1 space-y-6">
        <CreateSlotForm 
          actionLoading={actionLoading} 
          onCreateSlot={handleCreateSlot} 
        />

        {/* Instructor Instructions */}
        <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <h4 className="text-sm font-bold text-slate-300">📆 Calendar Publishing Tip</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            To maximize booking conversions, space your hours evenly and avoid listing time segments in the past. Slots require a valid start time and end time.
          </p>
        </div>
      </div>

      {/* Trainer Slots Published (Col 2 & 3) */}
      <PublishedSlots trainerSlots={trainerSlots} />
    </div>
  );
}

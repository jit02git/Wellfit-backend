import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';

export default function CreateSlotForm({ actionLoading, onCreateSlot }) {
  const [slot, setSlot] = useState({ startTime: '', endTime: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slot.startTime || !slot.endTime) {
      return;
    }
    onCreateSlot(slot, () => setSlot({ startTime: '', endTime: '' }));
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
      <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-emerald-500" /> Add Available Slot
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Slot Start Time</label>
          <input
            type="datetime-local"
            required
            value={slot.startTime}
            onChange={(e) => setSlot({ ...slot, startTime: e.target.value })}
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Slot End Time</label>
          <input
            type="datetime-local"
            required
            value={slot.endTime}
            onChange={(e) => setSlot({ ...slot, endTime: e.target.value })}
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-sm font-bold rounded-xl py-3 transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {actionLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" /> Publish Slot
            </>
          )}
        </button>
      </form>
    </div>
  );
}

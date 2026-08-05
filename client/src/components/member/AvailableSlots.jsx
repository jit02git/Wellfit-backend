import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function AvailableSlots({ availableSlots, actionLoading, onBookSession }) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" /> Book a New Session
        </h3>

        {availableSlots.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-850 p-10 rounded-xl text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold">No available slots published yet</p>
            <p className="text-slate-500 text-xs mt-1">Check back later or ask trainers to add availability slots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSlots.map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              
              return (
                <div 
                  key={slot._id} 
                  className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80 hover:border-slate-700/85 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                          TR
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Trainer</p>
                          <p className="text-sm font-semibold text-slate-200">{slot.trainerId?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full tracking-wide">
                        ₹200
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-5 text-slate-400 text-xs">
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-slate-300">Date:</span> {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 opacity-0" />
                        <span className="font-semibold text-slate-300">Time:</span> {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onBookSession(slot._id)}
                    disabled={actionLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg text-xs tracking-wide transition-all shadow hover:shadow-emerald-500/10"
                  >
                    Book Session
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

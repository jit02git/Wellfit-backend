import React from 'react';
import { Calendar } from 'lucide-react';

export default function PublishedSlots({ trainerSlots }) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" /> My Published Slots
        </h3>

        {trainerSlots.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-850 p-10 rounded-xl text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold">You have not published any slots yet</p>
            <p className="text-slate-500 text-xs mt-1">Use the panel on the left to add dates and times to your calendar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Time Window</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm">
                {trainerSlots.map((slot) => {
                  const start = new Date(slot.startTime);
                  const end = new Date(slot.endTime);

                  return (
                    <tr key={slot._id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {slot.isBooked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Open
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Activity, CheckCircle } from 'lucide-react';

export default function BookingsList({ bookings, user }) {
  const isMember = user.role === 'member';

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-2">
        {isMember ? 'My Booking History' : 'Client Sessions Roster'}
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        {isMember 
          ? 'A list of your registered fitness and wellness coaching sessions.' 
          : 'List of members who have locked in appointments on your calendar.'}
      </p>

      {bookings.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-850 p-12 rounded-xl text-center max-w-xl mx-auto my-6">
          <Activity className="w-12 h-12 text-slate-650 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No bookings found</p>
          <p className="text-slate-500 text-xs mt-1">
            {isMember 
              ? 'Select available time slots to confirm appointment bookings.' 
              : 'Your slots are currently open and waiting for members to book.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Session Date</th>
                <th className="py-3 px-4 font-semibold">Time Interval</th>
                <th className="py-3 px-4 font-semibold">
                  {isMember ? 'Trainer' : 'Member Details'}
                </th>
                <th className="py-3 px-4 font-semibold">Paid Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm">
              {bookings.map((booking) => {
                const start = new Date(booking.slotId?.startTime);
                const end = new Date(booking.slotId?.endTime);

                return (
                  <tr key={booking._id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 px-4 text-slate-200 font-semibold">
                      {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4">
                      {isMember ? (
                        <div>
                          <p className="text-slate-200 font-semibold">{booking.slotId?.trainerId?.name || 'Wellness Trainer'}</p>
                          <p className="text-xs text-slate-500">{booking.slotId?.trainerId?.email || ''}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-200 font-semibold">{booking.memberId?.name || 'Member Client'}</p>
                          <p className="text-xs text-slate-500">{booking.memberId?.email || ''}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-mono text-xs">
                      ₹{booking.amountPaid?.toFixed(2) || '200.00'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

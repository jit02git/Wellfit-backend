import React from 'react';
import { Inbox, Mail } from 'lucide-react';

export default function MockInbox({ notifications }) {
  return (
    <div className="glass-panel rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-2">
        <Inbox className="w-6 h-6 text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">System Email Logs (Mock Inbox)</h2>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        This mock inbox acts as the recipient endpoint for automated notification emails dispatched to you upon successful slot confirmations.
      </p>

      {notifications.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-850 p-12 rounded-xl text-center max-w-xl mx-auto my-6">
          <Mail className="w-12 h-12 text-slate-750 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">Your inbox is currently empty</p>
          <p className="text-slate-500 text-xs mt-1">Book trainer slots to receive confirmation emails here.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 hover:border-slate-750 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-850 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded tracking-wide mr-2.5">
                    Email Confirmation
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">To: {notif.recipientEmail}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-2">{notif.subject}</h4>
              <pre className="text-xs text-slate-400 font-sans whitespace-pre-line leading-relaxed leading-5">
                {notif.body}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

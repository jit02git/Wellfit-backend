import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-slate-400 font-medium animate-pulse">Loading Wellfit session...</p>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-400 mb-4 shadow-xl">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">403 — Access Denied</h1>
      <p className="text-sm text-slate-400 max-w-md mt-2">
        You do not have permission to access this resource or operate outside your assigned base scope.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </button>
    </div>
  );
};

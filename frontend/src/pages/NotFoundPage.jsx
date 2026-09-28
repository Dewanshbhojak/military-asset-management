import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-amber-400 mb-4 shadow-xl">
        <Compass className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">404 — Sector Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mt-2">
        The route or resource you are looking for does not exist or has been relocated.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-6 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Command Center
      </button>
    </div>
  );
};

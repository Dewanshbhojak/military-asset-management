import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 my-4 flex items-start gap-3 text-red-200">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-300">Request Error</h4>
        <p className="text-sm mt-1 text-red-200/80">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-red-900/60 hover:bg-red-800 text-red-100 px-3 py-1.5 rounded-lg border border-red-700/50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
};

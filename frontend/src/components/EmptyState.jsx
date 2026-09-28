import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ title = 'No data available', description = 'There are no items matching your criteria.', icon: Icon = PackageOpen }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-xl">
      <div className="p-3 bg-slate-800/60 rounded-full mb-3 text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
};

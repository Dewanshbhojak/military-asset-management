import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'amber', onClick, isClickable = false }) => {
  const colorMap = {
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    green: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    red: 'border-red-500/30 text-red-400 bg-red-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  };

  const badgeStyle = colorMap[color] || colorMap.amber;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:border-amber-500/50 hover:bg-slate-900/90 group' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${badgeStyle}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {isClickable && (
          <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Click details →
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

import React from 'react';

export default function Stat({ label, value, tone = 'slate' }) {
  const configs = {
    slate: {
      borderColor: '#6366f1', // Indigo
      bgLight: 'bg-indigo-50/50',
      textClass: 'text-indigo-700',
      bgGradient: 'to-indigo-50/20',
      icon: UsersIconMini,
    },
    brand: {
      borderColor: '#95298E', // CBE Purple
      bgLight: 'bg-brand-50/50',
      textClass: 'text-brand-700',
      bgGradient: 'to-brand-50/20',
      icon: BuildingIconMini,
    },
    emerald: {
      borderColor: '#10b981', // Emerald
      bgLight: 'bg-emerald-50/50',
      textClass: 'text-emerald-700',
      bgGradient: 'to-emerald-50/25',
      icon: AwardIconMini,
    },
    amber: {
      borderColor: '#B38D32', // CBE Gold
      bgLight: 'bg-gold-50/50',
      textClass: 'text-gold-700',
      bgGradient: 'to-gold-50/20',
      icon: WaitlistIconMini,
    },
  };

  const c = configs[tone] || configs.slate;

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 p-4 flex items-center justify-between bg-gradient-to-br from-white ${c.bgGradient} shadow-sm transition-all hover:shadow-md`}
      style={{ borderLeftColor: c.borderColor }}
    >
      <div className="space-y-0.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight leading-none tabular-nums">
          {value}
        </div>
      </div>
      <div className={`p-2 rounded-lg ${c.bgLight} ${c.textClass} border border-black/5`}>
        <c.icon className="w-4.5 h-4.5" />
      </div>
    </div>
  );
}

/* Mini icons for Live Scope stats */
function UsersIconMini(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}
function BuildingIconMini(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h6" />
    </svg>
  );
}
function AwardIconMini(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function WaitlistIconMini(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

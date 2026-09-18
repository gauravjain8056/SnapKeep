import React from 'react';
import { useMemo } from 'react';
import { AlertCircle, Calendar, CheckSquare, Clock } from 'lucide-react';

export const StatsOverview = ({ items = [], statsData, onFilterSelect }) => {
  const stats = useMemo(() => {
    if (statsData) return statsData;

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    let criticalCount = 0;
    let upcomingDeadlinesCount = 0;
    let needsConfirmCount = 0;
    let inRetentionCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.priority === 'critical') criticalCount++;
      if (item.needsConfirmation) needsConfirmCount++;
      if (item.retention?.status === 'retention') inRetentionCount++;
      if (item.deadline) {
        const d = new Date(item.deadline);
        if (d >= now && d <= threeDaysFromNow) upcomingDeadlinesCount++;
      }
    }

    return { criticalCount, upcomingDeadlinesCount, needsConfirmCount, inRetentionCount };
  }, [items, statsData]);

  const cards = [
    {
      label: 'Critical',
      value: stats.criticalCount,
      sub: 'Mandatory / High stakes',
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20 hover:border-red-500/40',
      onClick: () => onFilterSelect({ priority: 'critical' }),
    },
    {
      label: 'Next 3 Days',
      value: stats.upcomingDeadlinesCount,
      sub: 'Upcoming deadlines',
      icon: Calendar,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      onClick: () => onFilterSelect({ dueSoon: true }),
    },
    {
      label: 'Confirm',
      value: stats.needsConfirmCount,
      sub: 'Ambiguous dates/details',
      icon: CheckSquare,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      onClick: () => onFilterSelect({ needsConfirmation: true }),
    },
    {
      label: 'Expiring',
      value: stats.inRetentionCount,
      sub: 'Eligible for deletion',
      icon: Clock,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20 hover:border-red-500/40',
      onClick: () => onFilterSelect({ status: 'retention' }),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={card.onClick}
          className={`glass-card text-left p-4 rounded-2xl border ${card.border} transition group`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${card.color}`}>
              {card.label}
            </span>
            <div className={`p-1.5 rounded-lg ${card.bg} ${card.color} group-hover:scale-110 transition`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">{card.value}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">{card.sub}</p>
        </button>
      ))}
    </div>
  );
};

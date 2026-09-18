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
      bg: 'bg-red-950/60',
      border: 'border-zinc-800 hover:border-red-900',
      onClick: () => onFilterSelect({ priority: 'critical' }),
    },
    {
      label: 'Next 3 Days',
      value: stats.upcomingDeadlinesCount,
      sub: 'Upcoming deadlines',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-950/60',
      border: 'border-zinc-800 hover:border-blue-900',
      onClick: () => onFilterSelect({ dueSoon: true }),
    },
    {
      label: 'Needs Review',
      value: stats.needsConfirmCount,
      sub: 'Ambiguous fields',
      icon: CheckSquare,
      color: 'text-zinc-300',
      bg: 'bg-zinc-900',
      border: 'border-zinc-800 hover:border-zinc-700',
      onClick: () => onFilterSelect({ needsConfirmation: true }),
    },
    {
      label: 'Expiring',
      value: stats.inRetentionCount,
      sub: 'Eligible for deletion',
      icon: Clock,
      color: 'text-red-400',
      bg: 'bg-red-950/60',
      border: 'border-zinc-800 hover:border-red-900',
      onClick: () => onFilterSelect({ status: 'retention' }),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={card.onClick}
          className={`bg-zinc-950 text-left p-4 rounded-lg border ${card.border} transition-colors`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${card.color}`}>
              {card.label}
            </span>
            <div className={`p-1.5 rounded ${card.bg} ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{card.value}</div>
          <p className="text-xs text-zinc-400 mt-0.5">{card.sub}</p>
        </button>
      ))}
    </div>
  );
};

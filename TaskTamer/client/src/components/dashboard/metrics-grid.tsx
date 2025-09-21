import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, Zap, Target } from 'lucide-react';

export default function MetricsGrid() {
  const { data: metricsData } = useQuery({
    queryKey: ['/api/analytics/metrics'],
  });

  const metrics = metricsData?.metrics ?? {
    avgDailyIncome: 0,
    avgDailyHours: 0,
    workStreak: 0,
    monthlyEarnings: 0,
    incomeChange: 0,
    hoursChange: 0,
  };

  const metricCards = [
    {
      title: 'Avg Daily Income',
      value: `$${metrics.avgDailyIncome}`,
      change: `${metrics.incomeChange > 0 ? '+' : ''}${metrics.incomeChange}% from last month`,
      icon: DollarSign,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Avg Daily Hours',
      value: `${metrics.avgDailyHours}h`,
      change: `${metrics.hoursChange > 0 ? '+' : ''}${metrics.hoursChange}h from last month`,
      icon: Clock,
      bgColor: 'bg-accent',
      iconColor: 'text-accent-foreground',
    },
    {
      title: 'Work Streak',
      value: `${metrics.workStreak} days`,
      change: 'Keep it up!',
      icon: Zap,
      bgColor: 'bg-secondary',
      iconColor: 'text-secondary-foreground',
    },
    {
      title: 'This Month',
      value: `$${metrics.monthlyEarnings}`,
      change: '78% of target',
      icon: Target,
      bgColor: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="metric-card bg-card rounded-xl p-6 border border-border shadow-sm" data-testid={`metric-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            <p className="text-2xl font-bold text-foreground mt-1" data-testid={`value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
              {card.value}
            </p>
            <p className="text-xs text-primary mt-1">{card.change}</p>
          </div>
        );
      })}
    </div>
  );
}

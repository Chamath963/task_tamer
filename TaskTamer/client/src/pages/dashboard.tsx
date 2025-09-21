import WorkSessionTimer from '@/components/timer/work-session-timer';
import MetricsGrid from '@/components/dashboard/metrics-grid';
import EarningsChart from '@/components/dashboard/earnings-chart';
import WorkHoursChart from '@/components/dashboard/work-hours-chart';
import DailyWorkJournal from '@/components/journal/daily-work-journal';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Current Work Session Timer */}
      <WorkSessionTimer />
      
      {/* Key Metrics Cards */}
      <MetricsGrid />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart />
        <WorkHoursChart />
      </div>
      
      {/* Today's Work Sessions */}
      <DailyWorkJournal />
    </div>
  );
}

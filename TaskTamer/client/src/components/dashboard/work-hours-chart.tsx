import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WorkHoursChart() {
  const { data: sessionsData } = useQuery({
    queryKey: ['/api/sessions'],
  });

  const sessions = sessionsData?.sessions ?? [];
  
  // Transform data for chart (last 6 months)
  const chartData = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    
    const monthSessions = sessions.filter((session: any) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfMonth && sessionDate <= endOfMonth && !session.isActive;
    });
    
    const totalHours = monthSessions.reduce((sum: number, session: any) => {
      return sum + (session.duration || 0);
    }, 0) / 3600; // Convert seconds to hours
    
    chartData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      hours: Math.round(totalHours),
    });
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="work-hours-chart-title">Work Hours</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              formatter={(value) => [`${value}h`, 'Hours']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="hours" 
              fill="hsl(var(--chart-2))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

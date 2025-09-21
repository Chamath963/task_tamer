import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Edit } from 'lucide-react';

export default function Journal() {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7); // Last 7 days
    return { start, end };
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['/api/sessions', {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
    }],
  });

  const sessions = sessionsData?.sessions ?? [];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeRange = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    if (!endTime) return `Started ${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    
    const end = new Date(endTime);
    return `${start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })}`;
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups: any, session: any) => {
    const date = new Date(session.startTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Work Journal</h1>
          <p className="text-muted-foreground">
            Review your work sessions and track your progress over time.
          </p>
        </div>
        
        <Button variant="outline" data-testid="button-filter">
          <Calendar className="w-4 h-4 mr-2" />
          Filter Dates
        </Button>
      </div>

      {Object.keys(groupedSessions).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No work sessions found for the selected period.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSessions)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dateSessions]: [string, any]) => {
              const totalDuration = dateSessions.reduce((sum: number, session: any) => 
                sum + (session.duration || 0), 0
              );

              return (
                <Card key={date} data-testid={`day-sessions-${date}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {formatDate(date)}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        Total: {formatTime(totalDuration)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dateSessions.map((session: any, index: number) => (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                          data-testid={`session-${date}-${index}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-primary'}`}></div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {session.taskName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatTimeRange(session.startTime, session.endTime)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-foreground">
                              {session.duration ? formatTime(session.duration) : 'In progress'}
                            </span>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${session.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}

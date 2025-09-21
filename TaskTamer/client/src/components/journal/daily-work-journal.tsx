import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Link } from 'wouter';

export default function DailyWorkJournal() {
  const { data: todaySessionsData } = useQuery({
    queryKey: ['/api/sessions/today'],
  });

  const todaySessions = todaySessionsData?.sessions ?? [];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
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

  const totalHours = todaySessions.reduce((sum: number, session: any) => 
    sum + (session.duration || 0), 0
  );

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground" data-testid="daily-journal-title">
            Today's Work Sessions
          </h3>
          <span className="text-sm text-muted-foreground" data-testid="total-hours">
            Total: {formatTime(totalHours)}
          </span>
        </div>
        
        {todaySessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No work sessions today yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Start your timer to begin tracking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySessions.map((session: any, index: number) => (
              <div 
                key={session.id} 
                className="work-session-item flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border transition-all duration-200"
                data-testid={`session-${index}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-foreground" data-testid={`session-task-${index}`}>
                      {session.taskName}
                    </h4>
                    {session.endTime && (
                      <p className="text-sm text-muted-foreground" data-testid={`session-time-${index}`}>
                        {formatTimeRange(session.startTime, session.endTime)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-foreground" data-testid={`session-duration-${index}`}>
                    {formatTime(session.duration || 0)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`button-edit-session-${index}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-border">
          <Link href="/journal">
            <Button 
              variant="ghost" 
              className="w-full py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              data-testid="button-view-all-sessions"
            >
              View All Sessions This Week →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

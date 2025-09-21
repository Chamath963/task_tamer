import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';

export default function WorkSessionTimer() {
  const [taskName, setTaskName] = useState('');
  const { 
    formatTime, 
    isRunning, 
    activeSession,
    startTimer, 
    pauseTimer, 
    resumeTimer,
    completeTimer, 
    isLoading 
  } = useTimer();
  const { toast } = useToast();

  const handleStart = () => {
    if (!taskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter what you're working on before starting the timer.",
        variant: "destructive",
      });
      return;
    }
    startTimer(taskName);
    toast({
      title: "Timer started",
      description: `Started working on: ${taskName}`,
    });
  };

  const handleComplete = () => {
    completeTimer();
    setTaskName('');
    toast({
      title: "Session completed!",
      description: "Your work session has been saved.",
    });
  };

  const handlePause = () => {
    if (isRunning) {
      pauseTimer();
      toast({
        title: "Timer paused",
        description: "Take a break! Resume when you're ready.",
      });
    } else {
      resumeTimer();
      toast({
        title: "Timer resumed",
        description: "Back to work!",
      });
    }
  };

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Current Work Session</h2>
          
          {/* Timer Display */}
          <div className="timer-display text-6xl font-mono font-bold text-primary mb-6" data-testid="timer-display">
            {formatTime}
          </div>
          
          {/* Task Name Input */}
          <div className="mb-6 max-w-md mx-auto">
            <Input 
              type="text" 
              placeholder="What are you working on?"
              className="w-full px-4 py-3 text-center text-lg border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              value={activeSession ? activeSession.taskName : taskName}
              onChange={(e) => setTaskName(e.target.value)}
              disabled={!!activeSession}
              data-testid="input-task-name"
            />
          </div>
          
          {/* Timer Controls */}
          <div className="flex justify-center space-x-4">
            {!activeSession ? (
              <Button 
                onClick={handleStart}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
                data-testid="button-start-timer"
              >
                {isLoading ? 'Starting...' : 'Start Timer'}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handlePause}
                  disabled={isLoading}
                  variant={isRunning ? "destructive" : "secondary"}
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  data-testid="button-pause-timer"
                >
                  {isLoading ? 'Processing...' : isRunning ? 'Pause' : 'Resume'}
                </Button>
                
                <Button 
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
                  data-testid="button-complete-session"
                >
                  {isLoading ? 'Completing...' : 'Complete Session'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

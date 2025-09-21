import WorkSessionTimer from '@/components/timer/work-session-timer';

export default function Timer() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Work Timer</h1>
        <p className="text-muted-foreground">
          Focus on your work and track your productivity with our simple timer.
        </p>
      </div>
      
      <WorkSessionTimer />
    </div>
  );
}

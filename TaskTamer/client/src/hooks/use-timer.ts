import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { WorkSession } from '@shared/schema';

export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const queryClient = useQueryClient();

  // Get active session
  const { data: activeSessionData } = useQuery({
    queryKey: ['/api/sessions/active'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const activeSession = activeSessionData?.session || null;

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async ({ taskName }: { taskName: string }) => {
      const response = await apiRequest('POST', '/api/sessions', {
        taskName,
        startTime: new Date().toISOString(),
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/today'] });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const endTime = new Date();
      const startTime = new Date(activeSession.startTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const response = await apiRequest('PUT', `/api/sessions/${sessionId}`, {
        endTime: endTime.toISOString(),
        duration,
        isActive: false,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setIsRunning(false);
      setSeconds(0);
    },
  });

  // Pause session mutation
  const pauseSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('PUT', `/api/sessions/${sessionId}`, {
        isActive: false,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
      setIsRunning(false);
    },
  });

  // Resume session mutation
  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('PUT', `/api/sessions/${sessionId}`, {
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/active'] });
      setIsRunning(true);
    },
  });

  // Update timer based on active session
  useEffect(() => {
    if (activeSession) {
      const startTime = new Date(activeSession.startTime);
      const currentTime = new Date();
      const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
      setSeconds(elapsed);
      setIsRunning(activeSession.isActive);
    } else {
      setSeconds(0);
      setIsRunning(false);
    }
  }, [activeSession]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        const startTime = new Date(activeSession.startTime);
        const currentTime = new Date();
        const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
        setSeconds(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, activeSession]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const startTimer = (taskName: string) => {
    startTimerMutation.mutate({ taskName });
  };

  const pauseTimer = () => {
    if (activeSession) {
      pauseSessionMutation.mutate(activeSession.id);
    }
  };

  const resumeTimer = () => {
    if (activeSession) {
      resumeSessionMutation.mutate(activeSession.id);
    }
  };

  const completeTimer = () => {
    if (activeSession) {
      completeSessionMutation.mutate(activeSession.id);
    }
  };

  return {
    seconds,
    isRunning,
    activeSession,
    formatTime: formatTime(seconds),
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer,
    isLoading: startTimerMutation.isPending || completeSessionMutation.isPending || pauseSessionMutation.isPending || resumeSessionMutation.isPending,
  };
}

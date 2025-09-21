import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EarningsChart from '@/components/dashboard/earnings-chart';
import WorkHoursChart from '@/components/dashboard/work-hours-chart';
import MetricsGrid from '@/components/dashboard/metrics-grid';

export default function Analytics() {
  const [earningsAmount, setEarningsAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: earningsData } = useQuery({
    queryKey: ['/api/earnings'],
  });

  const earnings = earningsData?.earnings ?? [];

  const addEarningsMutation = useMutation({
    mutationFn: async ({ month, year, amount }: { month: number; year: number; amount: string }) => {
      const response = await apiRequest('POST', '/api/earnings', {
        month,
        year,
        amount,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/earnings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/metrics'] });
      setEarningsAmount('');
      toast({
        title: "Earnings updated",
        description: `Monthly earnings for ${getMonthName(selectedMonth)} ${selectedYear} have been saved.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update earnings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString('en-US', { month: 'long' });
  };

  const handleSubmitEarnings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!earningsAmount || parseFloat(earningsAmount) < 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid earnings amount.",
        variant: "destructive",
      });
      return;
    }

    addEarningsMutation.mutate({
      month: selectedMonth,
      year: selectedYear,
      amount: earningsAmount,
    });
  };

  const currentMonthEarnings = earnings.find((e: any) => 
    e.month === selectedMonth && e.year === selectedYear
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track your earnings and analyze your work patterns to optimize your freelance business.
        </p>
      </div>

      {/* Key Metrics */}
      <MetricsGrid />

      {/* Add Monthly Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Update Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitEarnings} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {getMonthName(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-2 min-w-[200px]">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter earnings amount"
                value={earningsAmount}
                onChange={(e) => setEarningsAmount(e.target.value)}
                data-testid="input-earnings-amount"
              />
            </div>

            <Button 
              type="submit" 
              disabled={addEarningsMutation.isPending}
              data-testid="button-save-earnings"
            >
              {addEarningsMutation.isPending ? 'Saving...' : 'Save Earnings'}
            </Button>
          </form>

          {currentMonthEarnings && (
            <p className="text-sm text-muted-foreground mt-2">
              Current earnings for {getMonthName(selectedMonth)} {selectedYear}: ${currentMonthEarnings.amount}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart />
        <WorkHoursChart />
      </div>
    </div>
  );
}

/**
 * UsageLimitBar component
 * Displays usage limits and warnings
 */

import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { getUsageStats, getDailyLimit, getMonthlyLimit } from '@/utils/localStorage';

export default function UsageLimitBar() {
  const stats = getUsageStats();
  const dailyLimit = getDailyLimit();
  const monthlyLimit = getMonthlyLimit();
  
  const dailyPercent = (stats.daily.count / dailyLimit) * 100;
  const monthlyPercent = (stats.monthly.count / monthlyLimit) * 100;
  
  const showWarning = dailyPercent > 80 || monthlyPercent > 80;

  return (
    <Card className="p-4" data-testid="card-usage-limits">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Usage Limits</h3>
          {showWarning && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">Approaching limit</span>
            </div>
          )}
        </div>

        {/* Daily Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily</span>
            <span className="font-medium" data-testid="text-daily-usage">
              {stats.daily.count} / {dailyLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                dailyPercent > 80 ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(dailyPercent, 100)}%` }}
              data-testid="bar-daily-usage"
            />
          </div>
        </div>

        {/* Monthly Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly</span>
            <span className="font-medium" data-testid="text-monthly-usage">
              {stats.monthly.count} / {monthlyLimit}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                monthlyPercent > 80 ? 'bg-destructive' : 'bg-chart-2'
              }`}
              style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
              data-testid="bar-monthly-usage"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Limits reset daily at midnight and monthly on the 1st
        </p>
      </div>
    </Card>
  );
}

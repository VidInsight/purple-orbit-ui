import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExecutionSuccessChartProps {
  data: {
    success: number;
    failed: number;
    running: number;
  };
}

export const ExecutionSuccessChart = ({ data }: ExecutionSuccessChartProps) => {
  const chartData = [
    { name: 'Success', value: data.success, color: 'hsl(var(--success))' },
    { name: 'Failed', value: data.failed, color: 'hsl(var(--destructive))' },
    { name: 'Running', value: data.running, color: 'hsl(var(--warning))' },
  ];

  const total = data.success + data.failed + data.running;
  const successRate = total > 0 ? ((data.success / total) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Success Rate</CardTitle>
        <CardDescription>Last 30 days performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm text-foreground">
                    {value}: {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-semibold text-foreground">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

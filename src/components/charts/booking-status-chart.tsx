"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingStatusChartProps {
  data: { status: string; _count: { id: number } }[];
}

const COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#10b981",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#6366f1",
  CANCELLED: "#ef4444",
};

export function BookingStatusChart({ data }: BookingStatusChartProps) {
  const chartData = data.map((d) => ({
    name: d.status.charAt(0) + d.status.slice(1).toLowerCase().replace("_", " "),
    value: d._count.id,
    status: d.status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bookings by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry: typeof chartData[number]) => (
                  <Cell
                    key={entry.status}
                    fill={COLORS[entry.status] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

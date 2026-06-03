"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadFunnelChartProps {
  data: { status: string; _count: { id: number } }[];
}

const STATUS_ORDER = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED", "LOST"];

export function LeadFunnelChart({ data }: LeadFunnelChartProps) {
  const sorted = STATUS_ORDER.map((status) => {
    const found = data.find((d) => d.status === status);
    return {
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      count: found?._count.id ?? 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lead Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
            No leads yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={72} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

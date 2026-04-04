"use client";

import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChartData {
  name: string;
  yield: number;
  crop: string;
  date: string;
}

interface DashboardChartProps {
  data: ChartData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4edea3" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
        <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0b1326', borderColor: '#1e293b', borderRadius: '8px' }}
          itemStyle={{ color: '#e2e8f0' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
        />
        <Area type="monotone" dataKey="yield" stroke="#4edea3" fillOpacity={1} fill="url(#colorYield)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function ReviewVolumeChart({ data }: { data: { week: string; count: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(24,20,15,0.1)" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 700 }} stroke="#18140f" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#18140f" />
          <Tooltip
            contentStyle={{
              border: "3px solid #18140f",
              borderRadius: "0.75rem",
              fontWeight: 600,
            }}
          />
          <Bar dataKey="count" fill="#ff6b35" radius={[6, 6, 0, 0]} name="Ulasan" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

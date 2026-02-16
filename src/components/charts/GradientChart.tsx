"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useClimbStore } from "@/store/useClimbStore";
import { alignClimb, filterByViewRange } from "@/lib/align-climbs";
import { smoothGradients } from "@/lib/gradient-calc";
import { GRADIENT_ZONES } from "@/types/climb";

export function GradientChart() {
  const { climbs, selectedClimbIds, smoothingWindow, viewRange } = useClimbStore();

  const selectedClimbs = useMemo(
    () => climbs.filter((c) => selectedClimbIds.includes(c.id)),
    [climbs, selectedClimbIds]
  );

  const chartData = useMemo(() => {
    const aligned = selectedClimbs.map((climb) => {
      const smoothed = {
        ...climb,
        points: smoothGradients(climb.points, smoothingWindow),
      };
      const ac = alignClimb(smoothed);
      const filtered = filterByViewRange(ac.alignedPoints, viewRange);
      return { climb: ac, points: filtered };
    });

    // Merge all points into a common distance axis
    const allDistances = new Set<number>();
    aligned.forEach(({ points }) => {
      points.forEach((p) => {
        allDistances.add(Math.round(p.distanceFromPeak * 100) / 100);
      });
    });

    const sortedDistances = Array.from(allDistances).sort((a, b) => a - b);

    // Sample to max ~500 points for performance
    const step = Math.max(1, Math.floor(sortedDistances.length / 500));
    const sampledDistances = sortedDistances.filter((_, i) => i % step === 0);

    return sampledDistances.map((dist) => {
      const row: Record<string, number | undefined> = { distance: dist };
      aligned.forEach(({ climb, points }) => {
        const closest = points.reduce((prev, curr) =>
          Math.abs(curr.distanceFromPeak - dist) < Math.abs(prev.distanceFromPeak - dist)
            ? curr
            : prev
        );
        if (Math.abs(closest.distanceFromPeak - dist) < 0.15) {
          row[climb.id] = Math.round(closest.gradient * 10) / 10;
          row[`${climb.id}_elev`] = Math.round(closest.elevation);
        }
      });
      return row;
    });
  }, [selectedClimbs, smoothingWindow, viewRange]);

  const minDist = chartData.length > 0 ? chartData[0].distance ?? 0 : -20;
  const maxDist = 0;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

          {GRADIENT_ZONES.map((zone) => (
            <ReferenceArea
              key={zone.label}
              y1={zone.min}
              y2={zone.max}
              fill={zone.color}
              fillOpacity={1}
            />
          ))}

          <XAxis
            dataKey="distance"
            type="number"
            domain={[minDist as number, maxDist]}
            tickFormatter={(v: number) => `${v.toFixed(1)} km`}
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            label={{ value: "Distance to Summit (km)", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.5)" }}
          />
          <YAxis
            domain={[-2, 25]}
            tickFormatter={(v: number) => `${v}%`}
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            label={{ value: "Gradient %", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                  <p className="text-xs text-muted-foreground mb-2">
                    {typeof label === "number" ? `${label.toFixed(1)} km from summit` : label}
                  </p>
                  {payload.map((entry) => {
                    const climb = selectedClimbs.find((c) => c.id === entry.dataKey);
                    if (!climb) return null;
                    const elevKey = `${climb.id}_elev`;
                    const elevData = entry.payload[elevKey];
                    return (
                      <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: climb.color }}
                        />
                        <span className="font-medium">{climb.name}:</span>
                        <span>{entry.value}%</span>
                        {elevData !== undefined && (
                          <span className="text-muted-foreground">({elevData}m)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />

          {selectedClimbs.map((climb) => (
            <Line
              key={climb.id}
              type="monotone"
              dataKey={climb.id}
              stroke={climb.color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name={climb.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

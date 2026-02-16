"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useClimbStore } from "@/store/useClimbStore";
import { alignClimb, filterByViewRange } from "@/lib/align-climbs";
import { smoothGradients } from "@/lib/gradient-calc";

export function ElevationChart() {
  const { climbs, selectedClimbIds, smoothingWindow, viewRange, normalizeElevation } = useClimbStore();

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

    const allDistances = new Set<number>();
    aligned.forEach(({ points }) => {
      points.forEach((p) => {
        allDistances.add(Math.round(p.distanceFromPeak * 100) / 100);
      });
    });

    const sortedDistances = Array.from(allDistances).sort((a, b) => a - b);
    const step = Math.max(1, Math.floor(sortedDistances.length / 500));
    const sampledDistances = sortedDistances.filter((_, i) => i % step === 0);

    // Find start elevations for normalization
    const startElevations: Record<string, number> = {};
    if (normalizeElevation) {
      aligned.forEach(({ climb, points }) => {
        if (points.length > 0) {
          startElevations[climb.id] = points[0].elevation;
        }
      });
    }

    return sampledDistances.map((dist) => {
      const row: Record<string, number | undefined> = { distance: dist };
      aligned.forEach(({ climb, points }) => {
        const closest = points.reduce((prev, curr) =>
          Math.abs(curr.distanceFromPeak - dist) < Math.abs(prev.distanceFromPeak - dist)
            ? curr
            : prev
        );
        if (Math.abs(closest.distanceFromPeak - dist) < 0.15) {
          let elev = closest.elevation;
          if (normalizeElevation && startElevations[climb.id] !== undefined) {
            elev -= startElevations[climb.id];
          }
          row[climb.id] = Math.round(elev);
        }
      });
      return row;
    });
  }, [selectedClimbs, smoothingWindow, viewRange, normalizeElevation]);

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="distance"
            type="number"
            tickFormatter={(v: number) => `${v.toFixed(1)} km`}
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            label={{ value: "Distance to Summit (km)", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.5)" }}
          />
          <YAxis
            tickFormatter={(v: number) => `${v}m`}
            stroke="rgba(255,255,255,0.5)"
            fontSize={12}
            label={{
              value: normalizeElevation ? "Elevation Gain (m)" : "Elevation (m)",
              angle: -90,
              position: "insideLeft",
              fill: "rgba(255,255,255,0.5)",
            }}
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
                    return (
                      <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: climb.color }}
                        />
                        <span className="font-medium">{climb.name}:</span>
                        <span>{entry.value}m</span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />

          {selectedClimbs.map((climb) => (
            <Area
              key={climb.id}
              type="monotone"
              dataKey={climb.id}
              stroke={climb.color}
              fill={climb.color}
              fillOpacity={0.15}
              strokeWidth={2}
              connectNulls={false}
              name={climb.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

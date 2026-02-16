"use client";

import { useClimbStore } from "@/store/useClimbStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatsTable() {
  const { climbs, selectedClimbIds } = useClimbStore();
  const selectedClimbs = climbs.filter((c) => selectedClimbIds.includes(c.id));

  if (selectedClimbs.length === 0) {
    return (
      <div className="text-muted-foreground text-sm text-center py-8">
        Select climbs to compare stats.
      </div>
    );
  }

  const stats = [
    {
      label: "Distance",
      getValue: (c: (typeof selectedClimbs)[0]) => `${(c.stats.totalDistance / 1000).toFixed(1)} km`,
    },
    {
      label: "Elev. Gain",
      getValue: (c: (typeof selectedClimbs)[0]) => `${Math.round(c.stats.elevationGain)} m`,
    },
    {
      label: "Avg Gradient",
      getValue: (c: (typeof selectedClimbs)[0]) => `${c.stats.avgGradient}%`,
    },
    {
      label: "Max Gradient",
      getValue: (c: (typeof selectedClimbs)[0]) => `${c.stats.maxGradient}%`,
      sublabel: "(500m window)",
    },
    {
      label: "Peak Elevation",
      getValue: (c: (typeof selectedClimbs)[0]) => `${c.stats.peakElevation} m`,
    },
    {
      label: "Category",
      getValue: (c: (typeof selectedClimbs)[0]) => c.stats.category,
    },
    {
      label: "Difficulty",
      getValue: (c: (typeof selectedClimbs)[0]) => `${c.stats.difficultyIndex}`,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Metric</th>
            {selectedClimbs.map((climb) => (
              <th key={climb.id} className="text-right py-2 px-2 min-w-[100px]">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: climb.color }}
                  />
                  <span className="font-medium truncate max-w-[120px]">{climb.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => (
            <tr key={stat.label} className="border-b border-border/50">
              <td className="py-2 pr-4 text-muted-foreground">
                {stat.label}
                {stat.sublabel && (
                  <span className="text-xs block">{stat.sublabel}</span>
                )}
              </td>
              {selectedClimbs.map((climb) => {
                const value = stat.getValue(climb);
                const isBest =
                  stat.label === "Category"
                    ? false
                    : selectedClimbs.length > 1 &&
                      selectedClimbs.every(
                        (c) => parseFloat(stat.getValue(c)) <= parseFloat(value) ||
                               c.id === climb.id
                      );

                return (
                  <td
                    key={climb.id}
                    className={`text-right py-2 px-2 ${isBest ? "font-bold" : ""}`}
                  >
                    {stat.label === "Category" ? (
                      <Badge variant="outline">{value}</Badge>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

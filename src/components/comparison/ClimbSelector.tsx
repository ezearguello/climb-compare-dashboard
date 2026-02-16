"use client";

import { useClimbStore } from "@/store/useClimbStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ClimbSelector() {
  const { climbs, selectedClimbIds, toggleSelection, removeClimb } = useClimbStore();

  if (climbs.length === 0) {
    return (
      <div className="text-muted-foreground text-sm text-center py-4">
        No climbs loaded. Upload a GPX file or load sample data.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {climbs.map((climb) => {
        const isSelected = selectedClimbIds.includes(climb.id);
        return (
          <div
            key={climb.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isSelected ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelection(climb.id)}
            />
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: climb.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{climb.name}</p>
              <p className="text-xs text-muted-foreground">
                {(climb.stats.totalDistance / 1000).toFixed(1)} km &middot;{" "}
                {climb.stats.avgGradient}% avg &middot;{" "}
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  Cat {climb.stats.category}
                </Badge>
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeClimb(climb.id)}
            >
              &times;
            </Button>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useClimbStore } from "@/store/useClimbStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SMOOTHING_OPTIONS = [50, 100, 200, 500];
const VIEW_RANGE_OPTIONS = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "15 km", value: 15 },
  { label: "20 km", value: 20 },
  { label: "All", value: null },
];

export function ChartControls() {
  const {
    smoothingWindow,
    viewRange,
    normalizeElevation,
    setSmoothing,
    setViewRange,
    setNormalizeElevation,
  } = useClimbStore();

  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground whitespace-nowrap">Smoothing:</Label>
        <div className="flex gap-1">
          {SMOOTHING_OPTIONS.map((opt) => (
            <Button
              key={opt}
              variant={smoothingWindow === opt ? "default" : "outline"}
              size="sm"
              onClick={() => setSmoothing(opt)}
              className="text-xs px-2 h-7"
            >
              {opt}m
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground whitespace-nowrap">View range:</Label>
        <div className="flex gap-1">
          {VIEW_RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.label}
              variant={viewRange === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setViewRange(opt.value)}
              className="text-xs px-2 h-7"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="normalize"
          checked={normalizeElevation}
          onCheckedChange={(checked) => setNormalizeElevation(checked === true)}
        />
        <Label htmlFor="normalize" className="text-sm text-muted-foreground cursor-pointer">
          Normalize elevation
        </Label>
      </div>
    </div>
  );
}

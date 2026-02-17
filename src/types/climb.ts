export interface ClimbPoint {
  lat: number;
  lon: number;
  elevation: number;
  distance: number; // cumulative distance in meters from start
  gradient: number; // gradient in percent
}

export interface Climb {
  id: string;
  name: string;
  color: string;
  points: ClimbPoint[];
  stats: ClimbStats;
}

export interface AlignedClimb extends Climb {
  alignedPoints: AlignedPoint[];
}

export interface AlignedPoint {
  distanceFromPeak: number; // negative = before peak, 0 = peak
  elevation: number;
  gradient: number;
  lat: number;
  lon: number;
}

export interface ClimbStats {
  totalDistance: number; // meters
  elevationGain: number; // meters
  avgGradient: number; // percent
  maxGradient: number; // percent (over 500m window)
  peakElevation: number; // meters
  startElevation: number; // meters
  difficultyIndex: number;
  category: ClimbCategory;
}

export type ClimbCategory = "HC" | "1" | "2" | "3" | "4" | "Uncategorized";

export const CLIMB_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
  "#14b8a6", "#e11d48",
];

export const GRADIENT_ZONES = [
  { min: 0, max: 3, color: "#22c55e20", label: "Easy" },
  { min: 3, max: 6, color: "#eab30820", label: "Moderate" },
  { min: 6, max: 9, color: "#f9731620", label: "Hard" },
  { min: 9, max: 12, color: "#ef444420", label: "Very Hard" },
  { min: 12, max: 30, color: "#a855f720", label: "Extreme" },
];

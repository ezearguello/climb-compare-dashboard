import { ClimbPoint, ClimbStats, ClimbCategory } from "@/types/climb";

/**
 * Calculate comprehensive stats for a climb.
 */
export function calculateStats(points: ClimbPoint[]): ClimbStats {
  if (points.length < 2) {
    return {
      totalDistance: 0,
      elevationGain: 0,
      avgGradient: 0,
      maxGradient: 0,
      peakElevation: 0,
      startElevation: 0,
      difficultyIndex: 0,
      category: "Uncategorized",
    };
  }

  const totalDistance = points[points.length - 1].distance - points[0].distance;

  let elevationGain = 0;
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].elevation - points[i - 1].elevation;
    if (diff > 0) elevationGain += diff;
  }

  const avgGradient = totalDistance > 0
    ? (elevationGain / totalDistance) * 100
    : 0;

  const maxGradient = calculateMaxGradient(points, 500);

  const peakElevation = Math.max(...points.map((p) => p.elevation));
  const startElevation = points[0].elevation;

  const distKm = totalDistance / 1000;
  const difficultyIndex = distKm * (avgGradient * avgGradient) / 10;

  const category = categorizeClimb(elevationGain, distKm, avgGradient);

  return {
    totalDistance,
    elevationGain,
    avgGradient: Math.round(avgGradient * 10) / 10,
    maxGradient: Math.round(maxGradient * 10) / 10,
    peakElevation: Math.round(peakElevation),
    startElevation: Math.round(startElevation),
    difficultyIndex: Math.round(difficultyIndex),
    category,
  };
}

/**
 * Calculate max gradient over a rolling window of given meters.
 */
function calculateMaxGradient(points: ClimbPoint[], windowMeters: number): number {
  let maxGrad = 0;

  for (let i = 0; i < points.length; i++) {
    const startDist = points[i].distance;
    const startElev = points[i].elevation;

    // Find the point approximately windowMeters ahead
    for (let j = i + 1; j < points.length; j++) {
      const dist = points[j].distance - startDist;
      if (dist >= windowMeters) {
        const grad = ((points[j].elevation - startElev) / dist) * 100;
        maxGrad = Math.max(maxGrad, grad);
        break;
      }
    }
  }

  return maxGrad;
}

function categorizeClimb(
  elevGain: number,
  distKm: number,
  avgGrad: number
): ClimbCategory {
  const score = elevGain * avgGrad;

  if (score > 80000 || (elevGain > 1500 && avgGrad > 6)) return "HC";
  if (score > 50000 || (elevGain > 800 && avgGrad > 5)) return "1";
  if (score > 25000 || (elevGain > 500 && avgGrad > 5)) return "2";
  if (score > 15000 || (elevGain > 300 && avgGrad > 4)) return "3";
  if (score > 8000 || (elevGain > 150 && distKm > 1)) return "4";
  return "Uncategorized";
}

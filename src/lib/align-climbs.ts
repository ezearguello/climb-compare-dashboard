import { AlignedClimb, AlignedPoint, Climb } from "@/types/climb";

/**
 * Align a climb by its peak: transform distance axis so peak=0,
 * distances before peak are negative.
 */
export function alignClimb(climb: Climb): AlignedClimb {
  const points = climb.points;
  if (points.length === 0) {
    return { ...climb, alignedPoints: [] };
  }

  // Find the peak (max elevation point)
  let peakIdx = 0;
  let peakElev = points[0].elevation;
  for (let i = 1; i < points.length; i++) {
    if (points[i].elevation > peakElev) {
      peakElev = points[i].elevation;
      peakIdx = i;
    }
  }

  const peakDistance = points[peakIdx].distance;

  // Only take points up to and including the peak (the uphill portion)
  const uphillPoints = points.slice(0, peakIdx + 1);

  const alignedPoints: AlignedPoint[] = uphillPoints.map((p) => ({
    distanceFromPeak: (p.distance - peakDistance) / 1000, // convert to km
    elevation: p.elevation,
    gradient: p.gradient,
    lat: p.lat,
    lon: p.lon,
  }));

  return { ...climb, alignedPoints };
}

/**
 * Filter aligned points to show only the last N km before the peak.
 */
export function filterByViewRange(
  alignedPoints: AlignedPoint[],
  viewRangeKm: number | null
): AlignedPoint[] {
  if (!viewRangeKm) return alignedPoints;
  return alignedPoints.filter((p) => p.distanceFromPeak >= -viewRangeKm);
}

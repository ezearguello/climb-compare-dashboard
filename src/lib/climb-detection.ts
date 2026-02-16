import { ClimbPoint } from "@/types/climb";

/**
 * Auto-detect the longest significant ascent in a GPX trace.
 * Allows small dips (up to dipTolerance meters) within an ascent.
 */
export function detectClimb(
  points: ClimbPoint[],
  dipTolerance: number = 10
): ClimbPoint[] {
  if (points.length < 2) return points;

  // Find all ascending segments allowing small dips
  const segments: { start: number; end: number; gain: number }[] = [];
  let segStart = 0;
  let maxElev = points[0].elevation;
  let minSincePeak = points[0].elevation;

  for (let i = 1; i < points.length; i++) {
    const elev = points[i].elevation;

    if (elev > maxElev) {
      maxElev = elev;
      minSincePeak = elev;
    } else {
      minSincePeak = Math.min(minSincePeak, elev);
    }

    // If we've dropped more than tolerance below our peak, end this segment
    if (maxElev - minSincePeak > dipTolerance) {
      const gain = maxElev - points[segStart].elevation;
      if (gain > 50) {
        // Find where the peak actually was
        let peakIdx = i - 1;
        for (let j = i - 1; j >= segStart; j--) {
          if (points[j].elevation === maxElev) {
            peakIdx = j;
            break;
          }
        }
        segments.push({ start: segStart, end: peakIdx, gain });
      }
      segStart = i;
      maxElev = elev;
      minSincePeak = elev;
    }
  }

  // Don't forget the last segment
  const lastGain = maxElev - points[segStart].elevation;
  if (lastGain > 50) {
    let peakIdx = points.length - 1;
    for (let j = points.length - 1; j >= segStart; j--) {
      if (points[j].elevation === maxElev) {
        peakIdx = j;
        break;
      }
    }
    segments.push({ start: segStart, end: peakIdx, gain: lastGain });
  }

  if (segments.length === 0) return points;

  // Pick the segment with the most elevation gain
  const best = segments.reduce((a, b) => (a.gain > b.gain ? a : b));

  // Re-index distances starting from 0
  const climbPoints = points.slice(best.start, best.end + 1);
  const startDist = climbPoints[0].distance;
  return climbPoints.map((p) => ({
    ...p,
    distance: p.distance - startDist,
  }));
}

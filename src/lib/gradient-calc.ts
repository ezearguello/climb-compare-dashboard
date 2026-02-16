import { ClimbPoint } from "@/types/climb";

/**
 * Smooth gradients using a distance-based moving average window.
 * Window is by distance (meters), not point count.
 */
export function smoothGradients(
  points: ClimbPoint[],
  windowMeters: number = 100
): ClimbPoint[] {
  if (points.length < 2) return points;

  const halfWindow = windowMeters / 2;

  return points.map((point, i) => {
    const centerDist = point.distance;
    const windowStart = centerDist - halfWindow;
    const windowEnd = centerDist + halfWindow;

    // Find points within the window
    let elevStart: number | null = null;
    let elevEnd: number | null = null;
    let distStart: number | null = null;
    let distEnd: number | null = null;

    for (let j = 0; j < points.length; j++) {
      const d = points[j].distance;
      if (d >= windowStart && elevStart === null) {
        elevStart = points[j].elevation;
        distStart = d;
      }
      if (d <= windowEnd) {
        elevEnd = points[j].elevation;
        distEnd = d;
      }
    }

    if (elevStart !== null && elevEnd !== null && distStart !== null && distEnd !== null) {
      const totalDist = distEnd - distStart;
      const smoothedGradient = totalDist > 0
        ? ((elevEnd - elevStart) / totalDist) * 100
        : point.gradient;

      return { ...point, gradient: smoothedGradient };
    }

    return point;
  });
}

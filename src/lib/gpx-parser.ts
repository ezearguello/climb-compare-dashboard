import { ClimbPoint } from "@/types/climb";

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function parseGpxFile(gpxContent: string): ClimbPoint[] {
  // Use gpxparser library
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GpxParser = require("gpxparser");
  const gpx = new GpxParser();
  gpx.parse(gpxContent);

  if (!gpx.tracks.length) {
    throw new Error("No tracks found in GPX file");
  }

  const track = gpx.tracks[0];
  const rawPoints = track.points;

  if (rawPoints.length < 2) {
    throw new Error("Track must have at least 2 points");
  }

  const points: ClimbPoint[] = [];
  let cumulativeDistance = 0;

  for (let i = 0; i < rawPoints.length; i++) {
    const pt = rawPoints[i];

    if (i > 0) {
      const prev = rawPoints[i - 1];
      const dist = haversineDistance(prev.lat, prev.lon, pt.lat, pt.lon);
      cumulativeDistance += dist;
    }

    const gradient = i > 0
      ? (() => {
          const prev = rawPoints[i - 1];
          const dist = haversineDistance(prev.lat, prev.lon, pt.lat, pt.lon);
          return dist > 0 ? ((pt.ele - prev.ele) / dist) * 100 : 0;
        })()
      : 0;

    points.push({
      lat: pt.lat,
      lon: pt.lon,
      elevation: pt.ele,
      distance: cumulativeDistance,
      gradient,
    });
  }

  return points;
}

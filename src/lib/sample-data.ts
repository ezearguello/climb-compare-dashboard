import { Climb, ClimbPoint, CLIMB_COLORS } from "@/types/climb";
import { smoothGradients } from "./gradient-calc";
import { calculateStats } from "./difficulty";

// ── Real GPX data (from Strava exports) ────────────────────────────
import altoElNogoli from "@/data/alto-el-nogoli.json";
import elAmago from "@/data/el-amago.json";

interface ClimbProfile {
  name: string;
  distanceKm: number;
  startElevation: number;
  segments: { fraction: number; gradient: number }[];
  lat: number;
  lon: number;
  bearing: number;
}

// ── European Classics ──────────────────────────────────────────────

const EUROPE_PROFILES: ClimbProfile[] = [
  {
    name: "Alpe d'Huez",
    distanceKm: 13.8,
    startElevation: 744,
    segments: [
      { fraction: 0.07, gradient: 10.5 },
      { fraction: 0.07, gradient: 8.0 },
      { fraction: 0.07, gradient: 10.0 },
      { fraction: 0.07, gradient: 9.0 },
      { fraction: 0.07, gradient: 8.5 },
      { fraction: 0.07, gradient: 9.5 },
      { fraction: 0.07, gradient: 8.0 },
      { fraction: 0.08, gradient: 7.5 },
      { fraction: 0.07, gradient: 8.0 },
      { fraction: 0.07, gradient: 9.0 },
      { fraction: 0.07, gradient: 7.5 },
      { fraction: 0.07, gradient: 8.5 },
      { fraction: 0.07, gradient: 7.0 },
      { fraction: 0.08, gradient: 6.5 },
    ],
    lat: 45.0569,
    lon: 6.0714,
    bearing: 330,
  },
  {
    name: "Alto de l'Angliru",
    distanceKm: 12.5,
    startElevation: 280,
    segments: [
      { fraction: 0.15, gradient: 5.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 10.0 },
      { fraction: 0.10, gradient: 12.5 },
      { fraction: 0.10, gradient: 14.0 },
      { fraction: 0.10, gradient: 11.0 },
      { fraction: 0.10, gradient: 16.0 },
      { fraction: 0.10, gradient: 23.5 },
      { fraction: 0.08, gradient: 18.0 },
      { fraction: 0.07, gradient: 12.0 },
    ],
    lat: 43.2333,
    lon: -5.9333,
    bearing: 180,
  },
  {
    name: "Mont Ventoux (Bédoin)",
    distanceKm: 21.5,
    startElevation: 300,
    segments: [
      { fraction: 0.10, gradient: 4.5 },
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 9.5 },
      { fraction: 0.10, gradient: 10.0 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 10.5 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 6.0 },
    ],
    lat: 44.1740,
    lon: 5.2788,
    bearing: 0,
  },
  {
    name: "Stelvio Pass",
    distanceKm: 24.3,
    startElevation: 950,
    segments: [
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 7.0 },
    ],
    lat: 46.5285,
    lon: 10.4532,
    bearing: 270,
  },
  {
    name: "Col du Tourmalet",
    distanceKm: 17.1,
    startElevation: 852,
    segments: [
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 6.5 },
    ],
    lat: 42.8681,
    lon: 0.1456,
    bearing: 90,
  },
];

// ── Puertos Argentinos (datos reales de GPX de Strava) ──────────────

const GPX_CLIMBS: { name: string; points: ClimbPoint[] }[] = [
  altoElNogoli as { name: string; points: ClimbPoint[] },
  elAmago as { name: string; points: ClimbPoint[] },
];

const PROFILES: ClimbProfile[] = [...EUROPE_PROFILES];

function generatePoints(profile: ClimbProfile): ClimbPoint[] {
  const totalDist = profile.distanceKm * 1000;
  const stepSize = 10; // 10 meter resolution
  const numPoints = Math.floor(totalDist / stepSize);
  const points: ClimbPoint[] = [];

  let elevation = profile.startElevation;
  const bearingRad = (profile.bearing * Math.PI) / 180;

  for (let i = 0; i <= numPoints; i++) {
    const distance = i * stepSize;
    const fraction = distance / totalDist;

    // Find which segment we're in
    let cumFraction = 0;
    let segGradient = profile.segments[0].gradient;
    for (const seg of profile.segments) {
      cumFraction += seg.fraction;
      if (fraction <= cumFraction) {
        segGradient = seg.gradient;
        break;
      }
    }

    // Add some noise for realism
    const noise = (Math.sin(i * 0.3) * 0.8 + Math.cos(i * 0.17) * 0.5) * 1.2;
    const gradient = segGradient + noise;

    if (i > 0) {
      elevation += (gradient / 100) * stepSize;
    }

    // Calculate approximate lat/lon
    const distKm = distance / 1000;
    const latOffset = (distKm * Math.cos(bearingRad)) / 111.32;
    const lonOffset = (distKm * Math.sin(bearingRad)) / (111.32 * Math.cos((profile.lat * Math.PI) / 180));

    points.push({
      lat: profile.lat + latOffset,
      lon: profile.lon + lonOffset,
      elevation,
      distance,
      gradient: i === 0 ? 0 : gradient,
    });
  }

  return points;
}

export function generateSampleClimbs(): Climb[] {
  // Real GPX climbs first
  const realClimbs: Climb[] = GPX_CLIMBS.map((gpx, index) => {
    const points = smoothGradients(gpx.points, 100);
    const stats = calculateStats(points);
    return {
      id: `gpx-${index}`,
      name: gpx.name,
      color: CLIMB_COLORS[index % CLIMB_COLORS.length],
      points,
      stats,
    };
  });

  // Then synthetic European classics
  const syntheticClimbs: Climb[] = PROFILES.map((profile, index) => {
    const rawPoints = generatePoints(profile);
    const points = smoothGradients(rawPoints, 100);
    const stats = calculateStats(points);
    return {
      id: `sample-${index}`,
      name: profile.name,
      color: CLIMB_COLORS[(realClimbs.length + index) % CLIMB_COLORS.length],
      points,
      stats,
    };
  });

  return [...realClimbs, ...syntheticClimbs];
}

import { Climb, ClimbPoint, CLIMB_COLORS } from "@/types/climb";
import { smoothGradients } from "./gradient-calc";
import { calculateStats } from "./difficulty";

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

// ── Puertos Argentinos ─────────────────────────────────────────────

const ARGENTINA_PROFILES: ClimbProfile[] = [
  {
    // Cuesta del Portezuelo - Catamarca
    // Icónica subida con curvas cerradas por la Sierra de Ancasti
    // ~12 km, de ~800m a ~1,680m
    name: "Cuesta del Portezuelo (Catamarca)",
    distanceKm: 12.0,
    startElevation: 800,
    segments: [
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 7.0 },
    ],
    lat: -28.3833,
    lon: -65.6167,
    bearing: 290,
  },
  {
    // Cuesta de Lipán - Jujuy
    // Ruta 52 hacia Salinas Grandes, de ~2,300m a ~4,170m
    // ~18 km con curvas cerradas y paisaje lunar
    name: "Cuesta de Lipán (Jujuy)",
    distanceKm: 18.0,
    startElevation: 2300,
    segments: [
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 10.5 },
      { fraction: 0.10, gradient: 11.0 },
      { fraction: 0.10, gradient: 12.0 },
      { fraction: 0.10, gradient: 10.5 },
      { fraction: 0.10, gradient: 11.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 7.5 },
    ],
    lat: -23.6500,
    lon: -65.9500,
    bearing: 310,
  },
  {
    // El Nogolí - San Luis
    // Subida serrana desde la ciudad de San Luis (~730m) a ~1,450m
    // ~14 km por RP9, sinuosa entre sierras
    name: "El Nogolí (San Luis)",
    distanceKm: 14.0,
    startElevation: 730,
    segments: [
      { fraction: 0.10, gradient: 4.5 },
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 4.0 },
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 4.0 },
      { fraction: 0.10, gradient: 3.5 },
    ],
    lat: -33.3333,
    lon: -66.3167,
    bearing: 350,
  },
  {
    // El Amago - San Luis
    // Subida al embalse El Amago por la RP39
    // ~10 km desde ~800m hasta ~1,350m, tramos empinados
    name: "El Amago (San Luis)",
    distanceKm: 10.0,
    startElevation: 800,
    segments: [
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 4.5 },
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 4.0 },
    ],
    lat: -33.2667,
    lon: -66.2000,
    bearing: 320,
  },
  {
    // Mirador del Sol - San Luis
    // Circuito serrano con subida al mirador panorámico
    // ~7 km desde ~750m hasta ~1,200m, rampas fuertes
    name: "Mirador del Sol (San Luis)",
    distanceKm: 7.0,
    startElevation: 750,
    segments: [
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 9.5 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 4.0 },
    ],
    lat: -33.3000,
    lon: -66.3500,
    bearing: 280,
  },
  {
    // Paso de Agua Negra - San Juan
    // Uno de los pasos internacionales más altos: 4,780m
    // Subida desde Las Flores (~2,400m), ~50km total
    // Tramo final más duro: últimos 22km
    name: "Paso de Agua Negra (San Juan)",
    distanceKm: 22.0,
    startElevation: 3200,
    segments: [
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 6.5 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 4.5 },
    ],
    lat: -30.1667,
    lon: -69.8167,
    bearing: 300,
  },
  {
    // Cuesta de Miranda - La Rioja (Ruta 40)
    // Desde Villa Unión (~1,100m) hasta ~2,020m
    // ~12km de cornisa tallada en roca roja
    name: "Cuesta de Miranda (La Rioja, RN40)",
    distanceKm: 12.0,
    startElevation: 1100,
    segments: [
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 7.5 },
      { fraction: 0.10, gradient: 6.0 },
      { fraction: 0.10, gradient: 5.0 },
    ],
    lat: -29.3833,
    lon: -67.7500,
    bearing: 200,
  },
];

const PROFILES: ClimbProfile[] = [...ARGENTINA_PROFILES, ...EUROPE_PROFILES];

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
  return PROFILES.map((profile, index) => {
    const rawPoints = generatePoints(profile);
    const points = smoothGradients(rawPoints, 100);
    const stats = calculateStats(points);

    return {
      id: `sample-${index}`,
      name: profile.name,
      color: CLIMB_COLORS[index % CLIMB_COLORS.length],
      points,
      stats,
    };
  });
}

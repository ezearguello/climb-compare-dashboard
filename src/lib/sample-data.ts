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
    // Abra del Acay - Salta
    // Punto más alto de la Ruta 40: 4,895m
    // Subida larga y tendida desde San Antonio de los Cobres (~3,775m)
    name: "Abra del Acay (Salta, RN40)",
    distanceKm: 28.0,
    startElevation: 3775,
    segments: [
      { fraction: 0.10, gradient: 3.5 },
      { fraction: 0.10, gradient: 4.0 },
      { fraction: 0.10, gradient: 3.8 },
      { fraction: 0.10, gradient: 4.5 },
      { fraction: 0.10, gradient: 4.0 },
      { fraction: 0.10, gradient: 4.2 },
      { fraction: 0.10, gradient: 3.5 },
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 4.5 },
      { fraction: 0.10, gradient: 3.0 },
    ],
    lat: -24.3961,
    lon: -66.1917,
    bearing: 0,
  },
  {
    // Cuesta del Obispo - Salta
    // Desde Chicoana (~1,500m) hasta Piedra del Molino (~3,348m)
    // ~20 km de subida con curvas espectaculares
    name: "Cuesta del Obispo (Salta)",
    distanceKm: 20.0,
    startElevation: 1500,
    segments: [
      { fraction: 0.10, gradient: 5.5 },
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 10.0 },
      { fraction: 0.10, gradient: 11.5 },
      { fraction: 0.10, gradient: 10.0 },
      { fraction: 0.10, gradient: 9.5 },
      { fraction: 0.10, gradient: 8.0 },
      { fraction: 0.10, gradient: 7.0 },
    ],
    lat: -25.1667,
    lon: -65.8333,
    bearing: 315,
  },
  {
    // Los Caracoles - Mendoza
    // Las famosas curvas de la Ruta 7 hacia el Cristo Redentor
    // Desde Uspallata (~1,900m) hasta Las Cuevas (~3,200m), ~65km
    // Acá tomamos el tramo final de caracoles: Puente del Inca a Las Cuevas ~15km
    name: "Los Caracoles, Ruta 7 (Mendoza)",
    distanceKm: 15.0,
    startElevation: 2720,
    segments: [
      { fraction: 0.10, gradient: 4.0 },
      { fraction: 0.10, gradient: 3.5 },
      { fraction: 0.10, gradient: 4.5 },
      { fraction: 0.10, gradient: 5.0 },
      { fraction: 0.10, gradient: 3.0 },
      { fraction: 0.10, gradient: 4.0 },
      { fraction: 0.10, gradient: 3.5 },
      { fraction: 0.10, gradient: 2.5 },
      { fraction: 0.10, gradient: 3.0 },
      { fraction: 0.10, gradient: 2.0 },
    ],
    lat: -32.8258,
    lon: -69.9100,
    bearing: 270,
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
  {
    // Alto de la Ventana - Sierra de la Ventana, Buenos Aires
    // Subida al Cerro de la Ventana por RP76
    // ~8km desde la base (~280m) hasta ~1,100m
    name: "Alto de la Ventana (Buenos Aires)",
    distanceKm: 8.0,
    startElevation: 280,
    segments: [
      { fraction: 0.10, gradient: 7.0 },
      { fraction: 0.10, gradient: 8.5 },
      { fraction: 0.10, gradient: 10.0 },
      { fraction: 0.10, gradient: 12.0 },
      { fraction: 0.10, gradient: 13.5 },
      { fraction: 0.10, gradient: 11.0 },
      { fraction: 0.10, gradient: 10.0 },
      { fraction: 0.10, gradient: 12.5 },
      { fraction: 0.10, gradient: 9.0 },
      { fraction: 0.10, gradient: 8.0 },
    ],
    lat: -38.0833,
    lon: -61.7833,
    bearing: 0,
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

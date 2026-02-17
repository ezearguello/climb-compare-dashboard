/**
 * Script to convert GPX files to JSON for hardcoding in the app.
 * Usage: node scripts/gpx-to-json.mjs <gpx-file> [name]
 */
import fs from "fs";
import path from "path";

// Minimal GPX parser (no dependency needed for script)
function parseGpx(xml) {
  const points = [];
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>\s*<ele>([^<]+)<\/ele>/g;
  let match;
  while ((match = trkptRegex.exec(xml)) !== null) {
    points.push({
      lat: parseFloat(match[1]),
      lon: parseFloat(match[2]),
      ele: parseFloat(match[3]),
    });
  }
  return points;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const gpxFile = process.argv[2];
if (!gpxFile) {
  console.error("Usage: node scripts/gpx-to-json.mjs <gpx-file>");
  process.exit(1);
}

const xml = fs.readFileSync(gpxFile, "utf-8");
const rawPoints = parseGpx(xml);

console.log(`Parsed ${rawPoints.length} points`);

// Calculate cumulative distance and gradient
const points = [];
let cumDist = 0;

for (let i = 0; i < rawPoints.length; i++) {
  const pt = rawPoints[i];
  if (i > 0) {
    const prev = rawPoints[i - 1];
    cumDist += haversine(prev.lat, prev.lon, pt.lat, pt.lon);
  }
  const gradient = i > 0
    ? (() => {
        const prev = rawPoints[i - 1];
        const d = haversine(prev.lat, prev.lon, pt.lat, pt.lon);
        return d > 0 ? ((pt.ele - prev.ele) / d) * 100 : 0;
      })()
    : 0;

  points.push({
    lat: Math.round(pt.lat * 1e6) / 1e6,
    lon: Math.round(pt.lon * 1e6) / 1e6,
    elevation: Math.round(pt.ele * 10) / 10,
    distance: Math.round(cumDist * 10) / 10,
    gradient: Math.round(gradient * 100) / 100,
  });
}

// Extract name from GPX
const nameMatch = xml.match(/<name>([^<]+)<\/name>/);
const name = process.argv[3] || (nameMatch ? nameMatch[1] : path.basename(gpxFile, ".gpx"));

const totalDist = points[points.length - 1].distance;
const elevGain = points.reduce((sum, p, i) => {
  if (i === 0) return 0;
  const diff = p.elevation - points[i - 1].elevation;
  return sum + (diff > 0 ? diff : 0);
}, 0);
const peakElev = Math.max(...points.map(p => p.elevation));

console.log(`Name: ${name}`);
console.log(`Distance: ${(totalDist / 1000).toFixed(1)} km`);
console.log(`Elevation gain: ${Math.round(elevGain)} m`);
console.log(`Peak: ${Math.round(peakElev)} m`);
console.log(`Points: ${points.length}`);

// Sample down if too many points (keep ~every 20m)
let sampled = points;
if (points.length > 1000) {
  const step = Math.max(1, Math.floor(points.length / (totalDist / 20)));
  sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  console.log(`Sampled to ${sampled.length} points`);
}

const outFile = path.join("src", "data", `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ name, points: sampled }, null, 2));
console.log(`Written to ${outFile}`);

<div align="center">

# Climb Compare

### Compare legendary cycling climbs side by side

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Overlay gradient profiles from GPX files, aligned at the summit.**
Compare the Alpe d'Huez against the Angliru. See where Mont Ventoux ramps up vs. the Stelvio. All in one chart.

[Live Demo](#) &nbsp;&middot;&nbsp; [Getting Started](#getting-started) &nbsp;&middot;&nbsp; [Features](#features) &nbsp;&middot;&nbsp; [Tech Stack](#tech-stack)

</div>

---

## Features

### Gradient Profile Overlay
Compare gradient profiles of multiple climbs on a single chart. Climbs are **aligned by their summit** (distance = 0), so you can see exactly how each climb behaves in the final kilometers before the top. Color-coded gradient zones make it easy to spot the brutal sections at a glance.

| Zone | Gradient | Difficulty |
|------|----------|------------|
| Green | 0 - 3% | Easy |
| Yellow | 3 - 6% | Moderate |
| Orange | 6 - 9% | Hard |
| Red | 9 - 12% | Very Hard |
| Purple | 12%+ | Extreme |

### Elevation Profile
Area chart showing elevation profiles with optional **normalization** — start every climb at 0m to compare pure elevation gain regardless of starting altitude.

### Interactive Controls
- **Smoothing window** — Adjust from 50m to 500m to reduce GPS noise or reveal micro-gradients
- **View range** — Focus on the last 5, 10, 15, or 20 km before the summit
- **Normalize elevation** — Compare elevation gain independently of start altitude
- **Toggle climbs** — Show/hide individual climbs from all charts

### GPX Upload
Drag and drop `.gpx` or `.tcx` files to add your own climbs. The app automatically:
- Parses GPS coordinates and elevation data
- Detects the main climb segment (ignoring descents and flat sections)
- Calculates distance via Haversine formula
- Applies gradient smoothing

### Statistics Table
Side-by-side comparison of key metrics for all selected climbs:

| Metric | Description |
|--------|-------------|
| Distance | Total climb length |
| Elevation Gain | Cumulative meters gained |
| Avg Gradient | Overall average slope |
| Max Gradient | Steepest 500m rolling window |
| Peak Elevation | Summit altitude |
| Category | HC, 1, 2, 3, or 4 |
| Difficulty Index | `distance_km × avg_grad² / 10` |

### Interactive Map
Dark-themed Leaflet map with CartoDB tiles showing the GPS traces of all selected climbs, colored to match their chart lines. Click any trace for a popup with key stats.

### Sample Data
Ships with 5 synthetic climb profiles modeled after iconic ascents:

| Climb | Distance | Avg Gradient | Notable |
|-------|----------|-------------|---------|
| Alpe d'Huez | 13.8 km | ~8.1% | 21 hairpin bends |
| Alto de l'Angliru | 12.5 km | ~10.2% | Ramps to 23.5% |
| Mont Ventoux (Bedoin) | 21.5 km | ~7.6% | The Beast of Provence |
| Stelvio Pass | 24.3 km | ~7.5% | 48 switchbacks |
| Col du Tourmalet | 17.1 km | ~7.4% | Highest paved pass in Pyrenees |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/ezearguello/climb-compare-dashboard.git
cd climb-compare-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sample climbs load automatically.

### Build for Production

```bash
npm run build
npm start
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Map** | [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) |
| **GPX Parsing** | [gpxparser](https://github.com/Luuka/GPXParser.js) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Fonts** | [Geist](https://vercel.com/font) (Sans + Mono) |
| **Theme** | Dark mode by default (zinc palette) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with dark theme + Geist fonts
│   └── page.tsx            # Main dashboard page
├── components/
│   ├── charts/
│   │   ├── GradientChart.tsx   # Gradient profile overlay (LineChart)
│   │   ├── ElevationChart.tsx  # Elevation profile overlay (AreaChart)
│   │   └── ChartControls.tsx   # Smoothing, view range, normalize
│   ├── comparison/
│   │   ├── ClimbSelector.tsx   # Sidebar climb list with toggles
│   │   └── StatsTable.tsx      # Comparative metrics table
│   ├── map/
│   │   └── ClimbMap.tsx        # Leaflet map with climb traces
│   ├── upload/
│   │   └── GpxUploader.tsx     # Drag & drop GPX/TCX uploader
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── gpx-parser.ts          # GPX file parsing + Haversine distance
│   ├── gradient-calc.ts       # Distance-based gradient smoothing
│   ├── climb-detection.ts     # Auto-detect ascent segments
│   ├── align-climbs.ts        # Summit alignment + view range filter
│   ├── difficulty.ts          # Stats calculation + categorization
│   └── sample-data.ts         # 5 synthetic climb generators
├── store/
│   └── useClimbStore.ts       # Zustand global state
└── types/
    └── climb.ts               # TypeScript interfaces + constants
```

---

## How It Works

### Summit Alignment

The core concept: every climb is aligned so the **summit = distance 0**. Distances before the peak are negative. This means when you overlay two climbs, you're comparing what happens at the same distance from the top — the most meaningful way to compare final-kilometer difficulty.

```
Distance axis:  -15km ──────────────── -5km ──────── 0 (summit)
                 ▲ start of climb                     ▲ peak
```

### Gradient Smoothing

Raw GPS elevation data is noisy. The app applies a **distance-based moving average** — not a point-count average — so the smoothing window represents real-world distance (e.g., 100m means "average over 100 meters of road"), regardless of GPS point density.

### Climb Detection

When you upload a GPX file from a full ride, the app automatically finds the **longest significant ascent** by:
1. Tracking elevation trends
2. Allowing small dips (up to 10m) within an ascent
3. Selecting the segment with the most total elevation gain

---

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ezearguello/climb-compare-dashboard)

Or connect your repo at [vercel.com/new](https://vercel.com/new) — zero configuration needed.

### Docker

```bash
docker build -t climb-compare .
docker run -p 3000:3000 climb-compare
```

---

## Roadmap

- [ ] Gradient-colored polylines on map (green to red by steepness)
- [ ] Segment-by-segment comparison slider
- [ ] Strava/Komoot GPX import via URL
- [ ] Power estimation overlay (W/kg at given speed)
- [ ] Persistent storage with Supabase
- [ ] Share comparison via URL
- [ ] Mobile-optimized layout
- [ ] GPX export of synthetic climbs

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

Built with caffeine and climbing data.

**[ezearguello](https://github.com/ezearguello)**

</div>

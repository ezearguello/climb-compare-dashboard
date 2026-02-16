"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import { useClimbStore } from "@/store/useClimbStore";
import "leaflet/dist/leaflet.css";

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
}

export function ClimbMap() {
  const { climbs, selectedClimbIds } = useClimbStore();
  const selectedClimbs = useMemo(
    () => climbs.filter((c) => selectedClimbIds.includes(c.id)),
    [climbs, selectedClimbIds]
  );

  const allBounds = useMemo(() => {
    const pts: [number, number][] = [];
    selectedClimbs.forEach((c) => {
      c.points.forEach((p) => pts.push([p.lat, p.lon]));
    });
    return pts;
  }, [selectedClimbs]);

  const center: [number, number] = allBounds.length > 0
    ? [
        allBounds.reduce((s, p) => s + p[0], 0) / allBounds.length,
        allBounds.reduce((s, p) => s + p[1], 0) / allBounds.length,
      ]
    : [45.0, 6.0];

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={10}
        className="h-full w-full"
        style={{ background: "#1a1a2e" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {allBounds.length > 0 && <FitBounds bounds={allBounds} />}

        {selectedClimbs.map((climb) => {
          const positions: [number, number][] = climb.points.map((p) => [p.lat, p.lon]);
          return (
            <Polyline
              key={climb.id}
              positions={positions}
              color={climb.color}
              weight={3}
              opacity={0.8}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{climb.name}</p>
                  <p>{(climb.stats.totalDistance / 1000).toFixed(1)} km</p>
                  <p>{climb.stats.avgGradient}% avg gradient</p>
                  <p>{Math.round(climb.stats.elevationGain)}m elevation gain</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );
}

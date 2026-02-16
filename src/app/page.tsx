"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useClimbStore } from "@/store/useClimbStore";
import { GradientChart } from "@/components/charts/GradientChart";
import { ElevationChart } from "@/components/charts/ElevationChart";
import { ChartControls } from "@/components/charts/ChartControls";
import { GpxUploader } from "@/components/upload/GpxUploader";
import { ClimbSelector } from "@/components/comparison/ClimbSelector";
import { StatsTable } from "@/components/comparison/StatsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ClimbMap = dynamic(
  () => import("@/components/map/ClimbMap").then((mod) => mod.ClimbMap),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-card rounded-lg animate-pulse" /> }
);

export default function Home() {
  const { climbs, loadSampleData } = useClimbStore();

  useEffect(() => {
    if (climbs.length === 0) {
      loadSampleData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Climb Compare</h1>
            <p className="text-sm text-muted-foreground">
              Compare mountain cycling climb profiles aligned by summit
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadSampleData}>
            Load Sample Data
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border p-4 space-y-4 flex-shrink-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upload GPX</CardTitle>
            </CardHeader>
            <CardContent>
              <GpxUploader />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Climbs ({climbs.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-1">
              <ClimbSelector />
            </CardContent>
          </Card>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 space-y-4 min-w-0">
          <ChartControls />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Gradient Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <GradientChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Elevation Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ElevationChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Climb Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsTable />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Map</CardTitle>
            </CardHeader>
            <CardContent>
              <ClimbMap />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useState, useRef } from "react";
import { useClimbStore } from "@/store/useClimbStore";
import { parseGpxFile } from "@/lib/gpx-parser";
import { detectClimb } from "@/lib/climb-detection";
import { smoothGradients } from "@/lib/gradient-calc";
import { calculateStats } from "@/lib/difficulty";
import { Button } from "@/components/ui/button";

export function GpxUploader() {
  const { addClimb, smoothingWindow } = useClimbStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const rawPoints = parseGpxFile(text);
        const climbPoints = detectClimb(rawPoints);
        const smoothed = smoothGradients(climbPoints, smoothingWindow);
        const stats = calculateStats(smoothed);

        const name = file.name.replace(/\.(gpx|tcx)$/i, "");
        addClimb({
          id: `upload-${Date.now()}`,
          name,
          points: smoothed,
          stats,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
      }
    },
    [addClimb, smoothingWindow]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(processFile);
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx,.tcx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-muted-foreground text-sm">
          <p className="font-medium">Drop GPX/TCX files here</p>
          <p className="text-xs mt-1">or click to browse</p>
        </div>
      </div>
      {error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}

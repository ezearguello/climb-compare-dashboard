import { create } from "zustand";
import { Climb, CLIMB_COLORS } from "@/types/climb";
import { generateSampleClimbs } from "@/lib/sample-data";

interface ClimbStore {
  climbs: Climb[];
  selectedClimbIds: string[];
  smoothingWindow: number;
  viewRange: number | null; // km before peak, null = all
  normalizeElevation: boolean;

  addClimb: (climb: Omit<Climb, "color">) => void;
  removeClimb: (id: string) => void;
  toggleSelection: (id: string) => void;
  setSmoothing: (window: number) => void;
  setViewRange: (range: number | null) => void;
  setNormalizeElevation: (normalize: boolean) => void;
  loadSampleData: () => void;
}

export const useClimbStore = create<ClimbStore>((set, get) => ({
  climbs: [],
  selectedClimbIds: [],
  smoothingWindow: 100,
  viewRange: null,
  normalizeElevation: false,

  addClimb: (climb) => {
    const { climbs } = get();
    const usedColors = new Set(climbs.map((c) => c.color));
    const color = CLIMB_COLORS.find((c) => !usedColors.has(c)) || CLIMB_COLORS[climbs.length % CLIMB_COLORS.length];

    const newClimb: Climb = { ...climb, color };
    set({
      climbs: [...climbs, newClimb],
      selectedClimbIds: [...get().selectedClimbIds, newClimb.id],
    });
  },

  removeClimb: (id) => {
    set({
      climbs: get().climbs.filter((c) => c.id !== id),
      selectedClimbIds: get().selectedClimbIds.filter((i) => i !== id),
    });
  },

  toggleSelection: (id) => {
    const { selectedClimbIds } = get();
    set({
      selectedClimbIds: selectedClimbIds.includes(id)
        ? selectedClimbIds.filter((i) => i !== id)
        : [...selectedClimbIds, id],
    });
  },

  setSmoothing: (window) => set({ smoothingWindow: window }),
  setViewRange: (range) => set({ viewRange: range }),
  setNormalizeElevation: (normalize) => set({ normalizeElevation: normalize }),

  loadSampleData: () => {
    const samples = generateSampleClimbs();
    set({
      climbs: samples,
      selectedClimbIds: samples.map((s) => s.id),
    });
  },
}));

import { create } from 'zustand';

interface Filters {
  racingLine: boolean;
  speedGradient: boolean;
  brakeZones: boolean;
  throttleZones: boolean;
  apexPoints: boolean;
  drsZones: boolean;
  fastZones: boolean;
  slowZones: boolean;
}

interface AppState {
  activeTrack: string;
  setActiveTrack: (name: string) => void;

  isZoomed: boolean;
  zoomTarget: [number, number, number] | null;
  setZoomed: (zoomed: boolean, target?: [number, number, number]) => void;

  filters: Filters;
  toggleFilter: (key: keyof Filters) => void;

  computeTime: number;
  setComputeTime: (ms: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTrack: 'MONZA',
  setActiveTrack: (name) => set({ activeTrack: name, isZoomed: false, zoomTarget: null }),

  isZoomed: false,
  zoomTarget: null,
  setZoomed: (zoomed, target) =>
    set({ isZoomed: zoomed, zoomTarget: target || null }),

  filters: {
    racingLine: true,
    speedGradient: false,
    brakeZones: false,
    throttleZones: false,
    apexPoints: false,
    drsZones: false,
    fastZones: false,
    slowZones: false,
  },
  toggleFilter: (key) =>
    set((s) => ({ filters: { ...s.filters, [key]: !s.filters[key] } })),

  computeTime: 0,
  setComputeTime: (ms) => set({ computeTime: ms }),
}));

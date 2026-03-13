import { create } from 'zustand';
import { TyreCompound } from '@/lib/strategyEngine';

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

  tyre: TyreCompound;
  setTyre: (tyre: TyreCompound) => void;
  temperature: number;
  setTemperature: (temp: number) => void;

  isZoomed: boolean;
  zoomTarget: [number, number, number] | null;
  setZoomed: (zoomed: boolean, target?: [number, number, number]) => void;

  filters: Filters;
  toggleFilter: (key: keyof Filters) => void;

  computeTime: number;
  setComputeTime: (ms: number) => void;
  carProgress: number;
  setCarProgress: (t: number) => void;
  allCarsProgress: number[];
  setAllCarsProgress: (progresses: number[]) => void;
  currentSpeed: number;
  setCurrentSpeed: (speed: number) => void;
  currentLap: number;
  setLap: (lap: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTrack: 'MONZA',
  setActiveTrack: (name) => set({ activeTrack: name, isZoomed: false, zoomTarget: null }),

  tyre: 'dry-medium',
  setTyre: (tyre) => set({ tyre }),
  temperature: 28, // Default mid temp for MONZA
  setTemperature: (temp) => set({ temperature: temp }),

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
  carProgress: 0,
  setCarProgress: (t) => set({ carProgress: t }),
  allCarsProgress: [0, 0, 0, 0],
  setAllCarsProgress: (progresses) => set({ allCarsProgress: progresses }),
  currentSpeed: 0,
  setCurrentSpeed: (speed) => set({ currentSpeed: speed }),
  currentLap: 1,
  setLap: (lap) => set({ currentLap: lap }),
}));

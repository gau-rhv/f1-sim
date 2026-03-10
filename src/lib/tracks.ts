// F1 Track data — ported from f1-sim reference implementation
// Coordinates are in pixel/meter scale (not normalized)
// Each track includes corner characteristics for physics simulation

export interface CornerData {
  type: 'hairpin' | 'tight' | 'medium' | 'fast';
  angle: number;
  radius: number;
  position: number; // 0-1 position along track
}

export interface TrackData {
  name: string;
  id: string;
  country: string;
  flag: string;
  lengthKm: number;
  corners: number;
  lapRecord: string;
  points: [number, number][];
  cornerData: CornerData[];
}

// Monaco Grand Prix — tight street circuit
const monaco: TrackData = {
  name: "MONACO",
  id: "monaco",
  country: "Monaco",
  flag: "🇲🇨",
  lengthKm: 3.337,
  corners: 19,
  lapRecord: "1:12.909",
  points: [
    [0, 0], [50, 0], [100, 20], [150, 50], [180, 80], [200, 100],
    [220, 110], [250, 120], [280, 130], [300, 140], [320, 150],
    [340, 160], [350, 170], [340, 190], [320, 210], [280, 230],
    [240, 240], [200, 250], [150, 240], [100, 220], [60, 200],
    [30, 180], [10, 150], [0, 120], [0, 60]
  ],
  cornerData: [
    { type: 'hairpin', angle: 180, radius: 15, position: 0.1 },
    { type: 'medium', angle: 90, radius: 40, position: 0.3 },
    { type: 'tight', angle: 120, radius: 25, position: 0.5 },
    { type: 'fast', angle: 60, radius: 80, position: 0.7 },
    { type: 'hairpin', angle: 180, radius: 12, position: 0.9 },
  ],
};

// Silverstone — high-speed British circuit
const silverstone: TrackData = {
  name: "SILVERSTONE",
  id: "silverstone",
  country: "United Kingdom",
  flag: "🇬🇧",
  lengthKm: 5.891,
  corners: 18,
  lapRecord: "1:27.097",
  points: [
    [0, 0], [100, 0], [200, 10], [300, 30], [380, 70], [420, 120],
    [430, 170], [420, 220], [380, 260], [320, 280], [260, 290],
    [200, 300], [150, 320], [100, 350], [50, 380], [0, 400],
    [-50, 390], [-100, 360], [-140, 320], [-160, 270], [-150, 220],
    [-120, 180], [-80, 150], [-40, 120], [0, 80]
  ],
  cornerData: [
    { type: 'fast', angle: 45, radius: 100, position: 0.1 },
    { type: 'medium', angle: 90, radius: 60, position: 0.3 },
    { type: 'fast', angle: 60, radius: 90, position: 0.5 },
    { type: 'medium', angle: 120, radius: 45, position: 0.7 },
    { type: 'fast', angle: 90, radius: 70, position: 0.9 },
  ],
};

// Spa-Francorchamps — legendary Belgian circuit
const spa: TrackData = {
  name: "SPA-FRANCORCHAMPS",
  id: "spa",
  country: "Belgium",
  flag: "🇧🇪",
  lengthKm: 7.004,
  corners: 19,
  lapRecord: "1:41.252",
  points: [
    [0, 0], [150, 0], [300, 20], [450, 60], [550, 120], [600, 180],
    [620, 250], [610, 320], [570, 380], [500, 420], [420, 440],
    [340, 450], [260, 470], [180, 500], [100, 540], [30, 580],
    [-20, 620], [-50, 650], [-60, 680], [-50, 700], [-20, 710],
    [20, 700], [50, 680], [70, 650], [60, 600], [30, 540],
    [-20, 480], [-80, 420], [-120, 360], [-140, 300], [-130, 240],
    [-100, 190], [-60, 150], [-20, 110], [0, 60]
  ],
  cornerData: [
    { type: 'hairpin', angle: 180, radius: 20, position: 0.1 },
    { type: 'fast', angle: 30, radius: 150, position: 0.3 },
    { type: 'medium', angle: 90, radius: 50, position: 0.5 },
    { type: 'fast', angle: 60, radius: 120, position: 0.7 },
    { type: 'tight', angle: 150, radius: 30, position: 0.9 },
  ],
};

// Bahrain International Circuit — desert night circuit
const bahrain: TrackData = {
  name: "BAHRAIN",
  id: "bahrain",
  country: "Bahrain",
  flag: "🇧🇭",
  lengthKm: 5.412,
  corners: 15,
  lapRecord: "1:31.447",
  points: [
    [0, 0], [80, 0], [160, 10], [240, 40], [300, 80], [340, 130],
    [360, 190], [370, 250], [360, 310], [330, 360], [280, 400],
    [220, 420], [160, 430], [100, 440], [40, 460], [-10, 490],
    [-40, 520], [-50, 550], [-40, 570], [-10, 580], [30, 570],
    [60, 550], [70, 520], [60, 480], [30, 430], [-10, 380],
    [-40, 330], [-50, 280], [-40, 230], [-10, 180], [20, 130],
    [40, 80], [30, 40]
  ],
  cornerData: [
    { type: 'tight', angle: 120, radius: 30, position: 0.15 },
    { type: 'medium', angle: 90, radius: 50, position: 0.35 },
    { type: 'tight', angle: 140, radius: 25, position: 0.55 },
    { type: 'medium', angle: 90, radius: 45, position: 0.75 },
    { type: 'tight', angle: 120, radius: 35, position: 0.9 },
  ],
};

export const tracks: TrackData[] = [monaco, silverstone, spa, bahrain];

export function getTrackByName(name: string): TrackData | undefined {
  return tracks.find(t => t.name === name);
}

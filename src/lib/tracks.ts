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
  maxSpeed: number; // Top speed for this track in KM/H
  minSpeed: number; // Minimum speed for tight corners in KM/H
  // Pitstop Data
  pitLanePoints: [number, number][];
  pitEntryProgress: number; // 0-1
  pitExitProgress: number;  // 0-1
  pitBoxes: [number, number][]; // 4 pit boxes
}

// Monza 
const monza: TrackData = {
  name: "MONZA",
  id: "monza",
  country: "Monza",
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
  maxSpeed: 360,
  minSpeed: 105,
  pitLanePoints: [
    [-60, 150], [-60, 80], [-60, 30], [-30, -30], [20, -40], [50, -20]
  ],
  pitEntryProgress: 0.92,
  pitExitProgress: 0.08,
  pitBoxes: [
    [-60, 90], [-60, 75], [-60, 60], [-60, 45]
  ]
};

const silverstone: TrackData = {
  name: "SILVERSTONE",
  id: "silverstone",
  country: "United Kingdom",
  flag: "🇬🇧",
  lengthKm: 5.891,
  corners: 18,
  lapRecord: "1:27.097",
  points: [
    [310, 330], [260, 335], [200, 330], [140, 335],
    [95, 320], [60, 275], [40, 215],
    [50, 140], [90, 85], [155, 55], [215, 70],
    [260, 115], [255, 165], [220, 200], [170, 210], [135, 195],
    [120, 225], [140, 260], [185, 275],
    [245, 270], [305, 280], [375, 270], [435, 285],
    [485, 295], [510, 325], [475, 350], [435, 335],
    [415, 320],
    [395, 350], [370, 380], [340, 360],
  ],
  cornerData: [
    { type: 'fast',   angle: 150, radius: 60, position: 0.15 },
    { type: 'medium', angle: 90,  radius: 40, position: 0.35 },
    { type: 'tight',  angle: 110, radius: 25, position: 0.52 },
    { type: 'hairpin',angle: 160, radius: 15, position: 0.75 },
    { type: 'tight',  angle: 140, radius: 20, position: 0.92 },
  ],
  maxSpeed: 345,
  minSpeed: 98,
  pitLanePoints: [
    [340, 420], [280, 420], [220, 420], [160, 420], [100, 420], [80, 400]
  ],
  pitEntryProgress: 0.95,
  pitExitProgress: 0.05,
  pitBoxes: [
    [260, 420], [230, 420], [200, 420], [170, 420]
  ]
};

const spa: TrackData = {
  name: "SPA-FRANCORCHAMPS",
  id: "spa",
  country: "Belgium",
  flag: "🇧🇪",
  lengthKm: 7.004,
  corners: 19,
  lapRecord: "1:41.252",
  points: [
    [60, 140], [110, 138], [160, 135], [210, 130],
    [248, 120], [270, 100], [278, 72], [268, 48], [245, 32],
    [218, 24], [280, 18], [340, 22],
    [375, 38], [398, 68], [408, 105],
    [405, 148], [388, 182], [362, 208],
    [330, 225], [305, 248], [290, 278],
    [295, 310], [315, 335],
    [308, 365], [285, 388], [252, 400],
    [215, 405], [175, 402],
    [140, 392], [112, 372], [98, 345],
    [95, 315], [105, 288],
    [88, 260], [65, 235], [50, 205],
    [45, 175], [50, 150],
  ],
  cornerData: [
    { type: 'fast',    angle: 55,  radius: 48, position: 0.10 },
    { type: 'medium',  angle: 95,  radius: 35, position: 0.30 },
    { type: 'tight',   angle: 120, radius: 22, position: 0.48 },
    { type: 'hairpin', angle: 155, radius: 16, position: 0.68 },
    { type: 'medium',  angle: 80,  radius: 40, position: 0.88 },
  ],
  maxSpeed: 355,
  minSpeed: 95,
  pitLanePoints: [
    [10, 180], [80, 180], [160, 180], [200, 180], [240, 160]
  ],
  pitEntryProgress: 0.94,
  pitExitProgress: 0.06,
  pitBoxes: [
    [90, 180], [120, 180], [150, 180], [180, 180]
  ]
};

const bahrain: TrackData = {
  name: "BAHRAIN",
  id: "bahrain",
  country: "Bahrain",
  flag: "🇧🇭",
  lengthKm: 5.412,
  corners: 15,
  lapRecord: "1:31.447",
  points: [
    [320, 335], [270, 340], [220, 345], [170, 350], 
    [120, 355], [85, 350], [55, 335],
    [35, 305], [20, 270], [25, 220],
    [45, 150], [80, 85], [140, 45],
    [195, 35], [245, 45], [285, 75], [290, 115],
    [270, 160], [230, 185], [195, 195],
    [160, 205], [145, 220], [165, 225], [200, 220],
    [250, 215], [300, 210], [360, 220], [420, 230],
    [460, 240], [490, 260], [500, 285],
    [490, 310], [460, 320], [430, 325],
    [390, 330], [360, 335],
  ],
  cornerData: [
    { type: 'tight',  angle: 120, radius: 25, position: 0.12 },
    { type: 'fast',   angle: 160, radius: 80, position: 0.35 },
    { type: 'medium', angle: 90,  radius: 35, position: 0.52 },
    { type: 'medium', angle: 60,  radius: 40, position: 0.65 },
    { type: 'hairpin', angle: 170, radius: 15, position: 0.88 },
  ],
  maxSpeed: 342,
  minSpeed: 96,
  pitLanePoints: [
    [400, 420], [350, 420], [250, 420], [150, 420], [100, 420], [50, 390]
  ],
  pitEntryProgress: 0.93,
  pitExitProgress: 0.07,
  pitBoxes: [
    [300, 420], [250, 420], [200, 420], [150, 420]
  ]
};

export const tracks: TrackData[] = [monza, silverstone, spa, bahrain];

export function getTrackByName(name: string): TrackData | undefined {
  return tracks.find(t => t.name === name);
}

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

// Monza Grand Prix — tight street circuit
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
    // Bottom straight
    [80, 320], [160, 318], [240, 316], [315, 314],
    // Right curve going up
    [355, 308], [385, 290], [400, 262], [405, 232],
    // Slight kink right then sweeps left
    [400, 200], [388, 172], [368, 148],
    // Top right bump (Copse area bulges outward)
    [355, 128], [348, 108], [340, 88],
    // Top straight going left
    [310, 72], [270, 62], [230, 58], [190, 60],
    // Top left gentle curve
    [152, 68], [118, 82], [90, 102],
    // Left side coming down
    [68, 130], [52, 162], [46, 196],
    // Bottom left corner back to start
    [48, 228], [54, 262], [66, 290], [80, 310],
  ],
  cornerData: [
    { type: 'fast',   angle: 55, radius: 60, position: 0.12 },
    { type: 'medium', angle: 85, radius: 40, position: 0.30 },
    { type: 'fast',   angle: 60, radius: 55, position: 0.52 },
    { type: 'medium', angle: 90, radius: 38, position: 0.72 },
    { type: 'tight',  angle: 110, radius: 22, position: 0.90 },
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
    // ── Top connector arch (left → right) ──
    [40, 100], [52, 55], [85, 22], [130, 10], [175, 22], [208, 55],
    // ── Right straight going DOWN ──
    [220, 100], [220, 150], [220, 200], [220, 250],
    [220, 300], [220, 350], [220, 400],
    // ── Big round hook at the bottom (turns RIGHT, clockwise) ──
    [217, 423], [208, 445], [194, 464],
    [175, 478], [153, 487], [130, 490],
    [107, 487], [85, 478], [66, 464],
    [52, 445], [43, 423],
    // ── Left straight going UP ──
    [40, 400], [40, 350], [40, 300], [40, 250],
    [40, 200], [40, 150], [40, 100],
  ],
  cornerData: [
    { type: 'fast',    angle: 40,  radius: 55, position: 0.04 }, // top arch
    { type: 'medium',  angle: 85,  radius: 40, position: 0.30 }, // right straight entry
    { type: 'hairpin', angle: 180, radius: 18, position: 0.55 }, // bottom hook apex
    { type: 'medium',  angle: 85,  radius: 40, position: 0.78 }, // left straight entry
    { type: 'fast',    angle: 40,  radius: 55, position: 0.96 }, // top arch return
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
    // ── Top straight (left → right) ──
    [60, 60], [120, 58], [180, 56], [240, 55], [300, 56],
    // ── Turn 1-2-3 right-side chicane (going down) ──
    [340, 62], [365, 78], [378, 100],
    [380, 130], [372, 158],
    // ── Short straight then tight Turn 4 hairpin ──
    [355, 180], [348, 200], [352, 222],
    [365, 240], [378, 255],
    // ── Descent to Turn 5-6-7 ──
    [382, 280], [375, 308], [358, 330],
    [332, 348], [300, 358],
    // ── Bottom straight (right → left) ──
    [260, 362], [220, 364], [180, 365], [140, 364], [100, 360],
    // ── Turn 8-9-10 left-side curves (going up) ──
    [70, 352], [48, 335], [35, 310],
    [30, 280], [32, 248],
    // ── Back straight going up ──
    [38, 218], [44, 185], [48, 150],
    // ── Turn 11-12 sweeping left back to start ──
    [50, 120], [52, 92], [56, 74],
  ],
  cornerData: [
    { type: 'tight',  angle: 120, radius: 28, position: 0.14 },  // T1-2-3 chicane
    { type: 'hairpin', angle: 160, radius: 18, position: 0.32 },  // T4 hairpin
    { type: 'medium', angle: 90,  radius: 42, position: 0.52 },  // T5-6-7
    { type: 'tight',  angle: 110, radius: 30, position: 0.72 },  // T8-9-10
    { type: 'medium', angle: 70,  radius: 50, position: 0.92 },  // T11-12
  ],
};

export const tracks: TrackData[] = [monza, silverstone, spa, bahrain];

export function getTrackByName(name: string): TrackData | undefined {
  return tracks.find(t => t.name === name);
}

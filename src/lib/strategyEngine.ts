export type TyreCompound =
  | 'dry-soft'
  | 'dry-medium'
  | 'dry-hard'
  | 'wet-fullwet'
  | 'wet-intermediate';

export type Track = 'spa' | 'silverstone' | 'bahrain' | 'monza';

type TrackConfig = {
  name: string;
  tempMin: number;
  tempMax: number;
  lapMin: number;
  lapMax: number;
  laps: number;
  topSpeed: number;
  lengthKm: number;
};

type TyreConfig = {
  name: string;
  lapModifier: number;
  speedModifier: number;
  degradation: number;
  family: 'dry' | 'wet';
};

export const TRACKS: Record<Track, TrackConfig> = {
  spa: {
    name: 'Spa-Francorchamps',
    tempMin: 14,
    tempMax: 32,
    lapMin: 104,
    lapMax: 110,
    laps: 44,
    topSpeed: 345,
    lengthKm: 7.004,
  },
  silverstone: {
    name: 'Silverstone',
    tempMin: 10,
    tempMax: 25,
    lapMin: 87,
    lapMax: 95,
    laps: 52,
    topSpeed: 335,
    lengthKm: 5.891,
  },
  bahrain: {
    name: 'Bahrain',
    tempMin: 25,
    tempMax: 42,
    lapMin: 88,
    lapMax: 95,
    laps: 57,
    topSpeed: 330,
    lengthKm: 5.412,
  },
  monza: {
    name: 'Monza',
    tempMin: 22,
    tempMax: 35,
    lapMin: 78,
    lapMax: 85,
    laps: 53,
    topSpeed: 365,
    lengthKm: 5.793,
  },
};

export const TYRES: Record<TyreCompound, TyreConfig> = {
  'dry-soft': { name: 'Soft', lapModifier: 0.96, speedModifier: 1.01, degradation: 1.08, family: 'dry' },
  'dry-medium': { name: 'Medium', lapModifier: 1.0, speedModifier: 1.0, degradation: 1.0, family: 'dry' },
  'dry-hard': { name: 'Hard', lapModifier: 1.04, speedModifier: 0.99, degradation: 0.92, family: 'dry' },
  'wet-fullwet': { name: 'Full Wet', lapModifier: 1.15, speedModifier: 0.95, degradation: 1.02, family: 'wet' },
  'wet-intermediate': { name: 'Intermediate', lapModifier: 1.08, speedModifier: 0.97, degradation: 1.01, family: 'wet' },
};

type PredictionInput = {
  track: Track;
  tyre: TyreCompound;
  temperature: number;
};

export type PredictionResult = {
  lapTimeSeconds: number;
  raceTimeSeconds: number;
  topSpeed: number;
  recommendation: string;
  strategyLabel: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getTemperaturePenalty(track: TrackConfig, temperature: number) {
  const optimal = (track.tempMin + track.tempMax) / 2;
  const deviation = Math.abs(temperature - optimal);
  const normalized = deviation / Math.max(1, (track.tempMax - track.tempMin) / 2);
  return clamp(normalized * 0.08, 0, 0.12);
}

function getRecommendation(track: TrackConfig, tyre: TyreConfig, temperature: number) {
  if (temperature < track.tempMin) {
    return `Track is below the optimal window for ${track.name}. Prioritize tyre warm-up with aggressive out-lap and avoid wheelspin at exits.`;
  }
  if (temperature > track.tempMax) {
    return `Track is above optimal for ${track.name}. Protect rear tyres with smoother traction and consider earlier pit undercut.`;
  }
  if (tyre.family === 'wet') {
    return `${tyre.name} is conservative in this window. Use it only for unstable grip phases and switch to dry compounds once line dries.`;
  }
  if (tyre.name === 'Soft') {
    return `Soft compound offers peak pace. Attack in clean air, then box early to avoid cliff degradation in final stint.`;
  }
  if (tyre.name === 'Hard') {
    return `Hard compound favors consistency. Extend first stint and optimize overcut opportunities with stable lap rhythm.`;
  }
  return `Medium compound is the safest all-round strategy at ${track.name}. Balance push laps and tyre preservation for race control.`;
}

export function predictStrategy(input: PredictionInput): PredictionResult {
  const track = TRACKS[input.track];
  const tyre = TYRES[input.tyre];

  const baseLap = (track.lapMin + track.lapMax) / 2;
  const tempPenalty = getTemperaturePenalty(track, input.temperature);
  const wearPenalty = (tyre.degradation - 1) * 0.04;

  const lapTimeSeconds = baseLap * tyre.lapModifier * (1 + tempPenalty + wearPenalty);
  const raceTimeSeconds = lapTimeSeconds * track.laps;
  const topSpeed = Math.round(track.topSpeed * tyre.speedModifier * (1 - tempPenalty * 0.3));

  return {
    lapTimeSeconds,
    raceTimeSeconds,
    topSpeed,
    recommendation: getRecommendation(track, tyre, input.temperature),
    strategyLabel: `${track.name} · ${tyre.name} · ${input.temperature}C`,
  };
}

export function formatLap(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${mins}:${sec.toFixed(3).padStart(6, '0')}`;
}

export function formatRaceTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
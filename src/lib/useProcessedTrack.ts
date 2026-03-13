// processes raw track data into optimized racing line + analysis
import * as THREE from 'three';
import { TrackData } from './tracks';
import {
  interpolateTrack,
  optimizeRacingLine,
  computeSpeedProfile,
  getBrakingZones,
  getThrottleZones,
  getApexPoints,
  buildCurve3D,
  estimateLapTime,
} from './racingLine';

export interface ProcessedTrack {
  centerline: [number, number][];
  racingLine: [number, number][];
  speeds: number[];
  minSpeed: number;
  maxSpeed: number;
  curve3D: THREE.CatmullRomCurve3;
  pitLaneCurve: THREE.CatmullRomCurve3;
  pitBoxes3D: THREE.Vector3[];
  pitEntryProgress: number;
  pitExitProgress: number;
  brakingZones: { start: number; end: number }[];
  throttleZones: { start: number; end: number }[];
  apexIndices: number[];
  lapTime: string;
  computeMs: number;
  // Track bounds for centering in 3D
  bounds: { minX: number; maxX: number; minY: number; maxY: number; cx: number; cy: number; range: number };
}

// Reset cache to handle interface changes during dev
const trackCache = new Map<string, ProcessedTrack>();

export function processTrack(track: TrackData): ProcessedTrack {
  if (trackCache.has(track.id)) {
    return trackCache.get(track.id)!;
  }

  const t0 = performance.now();

  // 1. Interpolate to smooth centerline (100 points for perf)
  const centerline = interpolateTrack(track.points, 100);

  // 2. Optimize racing line (25 iterations for better convergence)
  const racingLine = optimizeRacingLine(centerline, 25, track.maxSpeed);

  // 3. Speed profile using f1-sim formula
  const speeds = computeSpeedProfile(racingLine, track, track.maxSpeed, track.minSpeed, 1.0);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);

  // 4. Analysis
  const brakingZones = getBrakingZones(speeds);
  const throttleZones = getThrottleZones(speeds);
  const apexIndices = getApexPoints(speeds);

  // 5. Compute bounds for centering
  const xs = centerline.map(p => p[0]);
  const ys = centerline.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const range = Math.max(maxX - minX, maxY - minY) * 1.2;

  // 6. Build 3D curves (centered at origin)
  const centeredLine = racingLine.map(
    ([x, y]) => [x - cx, y - cy] as [number, number]
  );
  const curve3D = buildCurve3D(centeredLine, 0.3);

  const centeredPitPoints = track.pitLanePoints.map(
    ([x, y]) => new THREE.Vector3(x - cx, 0.3, y - cy)
  );
  const pitLaneCurve = new THREE.CatmullRomCurve3(centeredPitPoints, false);

  const pitBoxes3D = track.pitBoxes.map(
    ([x, y]) => new THREE.Vector3(x - cx, 0.3, y - cy)
  );

  // 7. Lap time estimate
  const lapTime = estimateLapTime(speeds, track.lengthKm);

  const computeMs = Math.round(performance.now() - t0);

  const result: ProcessedTrack = {
    centerline,
    racingLine,
    speeds,
    minSpeed,
    maxSpeed,
    curve3D,
    pitLaneCurve,
    pitBoxes3D,
    pitEntryProgress: track.pitEntryProgress,
    pitExitProgress: track.pitExitProgress,
    brakingZones,
    throttleZones,
    apexIndices,
    lapTime,
    computeMs,
    bounds: { minX, maxX, minY, maxY, cx, cy, range },
  };

  trackCache.set(track.id, result);
  return result;
}

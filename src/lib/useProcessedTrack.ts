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
  brakingZones: { start: number; end: number }[];
  throttleZones: { start: number; end: number }[];
  apexIndices: number[];
  lapTime: string;
  computeMs: number;
  // Track bounds for centering in 3D
  bounds: { minX: number; maxX: number; minY: number; maxY: number; cx: number; cy: number; range: number };
}

export function processTrack(track: TrackData): ProcessedTrack {
  const t0 = performance.now();

  // 1. Interpolate to smooth centerline (200 points)
  const centerline = interpolateTrack(track.points, 200);

  // 2. Optimize racing line (50 iterations for perf)
  const racingLine = optimizeRacingLine(centerline, 50, 320);

  // 3. Speed profile using f1-sim formula
  const speeds = computeSpeedProfile(racingLine, track, 320, 1.0);
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

  // 6. Build 3D curve (centered at origin)
  const centeredLine = racingLine.map(
    ([x, y]) => [x - cx, y - cy] as [number, number]
  );
  const curve3D = buildCurve3D(centeredLine, 0.3);

  // 7. Lap time estimate
  const lapTime = estimateLapTime(speeds, track.lengthKm);

  const computeMs = Math.round(performance.now() - t0);

  return {
    centerline,
    racingLine,
    speeds,
    minSpeed,
    maxSpeed,
    curve3D,
    brakingZones,
    throttleZones,
    apexIndices,
    lapTime,
    computeMs,
    bounds: { minX, maxX, minY, maxY, cx, cy, range },
  };
}

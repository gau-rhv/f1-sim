// Racing Line Optimizer — ported from f1-sim (gau-rhv/f1-sim)
// Uses minimum curvature algorithm with L-BFGS-B-style gradient descent
// Speed profile based on corner radius and curvature
// Braking/throttle zone detection via speed derivatives

import * as THREE from 'three';
import { TrackData } from './tracks';

// ─── Catmull-Rom spline interpolation ────────────────────────
export function interpolateTrack(
  points: [number, number][],
  numPoints: number = 200
): [number, number][] {
  const n = points.length;
  const result: [number, number][] = [];

  for (let t = 0; t < numPoints; t++) {
    const f = (t / numPoints) * n;
    const i = Math.floor(f) % n;
    const s = f - Math.floor(f);

    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const x = 0.5 * (
      (2 * p1[0]) +
      (-p0[0] + p2[0]) * s +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s * s +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s * s * s
    );
    const y = 0.5 * (
      (2 * p1[1]) +
      (-p0[1] + p2[1]) * s +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s * s +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s * s * s
    );

    result.push([x, y]);
  }
  return result;
}

// ─── Curvature at each point ─────────────────────────────────
function computeCurvatures(line: [number, number][]): number[] {
  const n = line.length;
  const curvatures: number[] = [];

  for (let i = 0; i < n; i++) {
    const prev = line[(i - 1 + n) % n];
    const curr = line[i];
    const next = line[(i + 1) % n];

    const v1x = curr[0] - prev[0];
    const v1y = curr[1] - prev[1];
    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];

    const d1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const d2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (d1 > 0 && d2 > 0) {
      const cross = Math.abs(v1x * v2y - v1y * v2x);
      // Menger curvature
      curvatures.push((2 * cross) / (d1 * d2 * (d1 + d2) + 1e-6));
    } else {
      curvatures.push(0);
    }
  }
  return curvatures;
}

// ─── Path length ─────────────────────────────────────────────
function pathLength(line: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < line.length; i++) {
    const dx = line[i][0] - line[i - 1][0];
    const dy = line[i][1] - line[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  // Close the loop
  const dx = line[0][0] - line[line.length - 1][0];
  const dy = line[0][1] - line[line.length - 1][1];
  total += Math.sqrt(dx * dx + dy * dy);
  return total;
}

// ─── Objective function (from f1-sim) ────────────────────────
// Minimize: path_length/max_speed + curvature*1000 + distance*500
function objectiveFunction(
  line: [number, number][],
  trackPoints: [number, number][],
  maxSpeed: number
): number {
  const curvatures = computeCurvatures(line);
  const meanCurvature = curvatures.reduce((a, b) => a + b, 0) / curvatures.length;

  // Distance from track centerline
  let totalDist = 0;
  for (const p of line) {
    let minDist = Infinity;
    for (const tp of trackPoints) {
      const dx = p[0] - tp[0];
      const dy = p[1] - tp[1];
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) minDist = d;
    }
    totalDist += minDist;
  }
  const meanDist = totalDist / line.length;

  const pLen = pathLength(line);
  const timeEstimate = pLen / (maxSpeed * 0.7) + meanCurvature * 1000;

  return timeEstimate + meanDist * 500;
}

// ─── Racing line optimizer (gradient descent) ────────────────
// Iteratively moves points to minimize the objective function
// using numerical gradient computation
export function optimizeRacingLine(
  trackPoints: [number, number][],
  iterations: number = 300,
  maxSpeed: number = 320
): [number, number][] {
  const n = trackPoints.length;
  const line: [number, number][] = trackPoints.map(p => [...p] as [number, number]);

  for (let iter = 0; iter < iterations; iter++) {
    const lr = 0.5 * (1 - iter / iterations * 0.7); // decaying learning rate
    const eps = 0.5;

    for (let i = 0; i < n; i++) {
      // Numerical gradient for x
      const origX = line[i][0];
      line[i][0] = origX + eps;
      const fxPlus = objectiveFunction(line, trackPoints, maxSpeed);
      line[i][0] = origX - eps;
      const fxMinus = objectiveFunction(line, trackPoints, maxSpeed);
      line[i][0] = origX;
      const gradX = (fxPlus - fxMinus) / (2 * eps);

      // Numerical gradient for y
      const origY = line[i][1];
      line[i][1] = origY + eps;
      const fyPlus = objectiveFunction(line, trackPoints, maxSpeed);
      line[i][1] = origY - eps;
      const fyMinus = objectiveFunction(line, trackPoints, maxSpeed);
      line[i][1] = origY;
      const gradY = (fyPlus - fyMinus) / (2 * eps);

      // Update with constraint: don't deviate too far from track
      line[i][0] -= lr * gradX;
      line[i][1] -= lr * gradY;

      // Clamp: stay within trackWidth of nearest track point
      const trackWidth = 12;
      let nearestIdx = 0;
      let nearestDist = Infinity;
      let projX = 0, projY = 0;
      
      for (let j = 0; j < trackPoints.length; j++) {
        const curr = trackPoints[j];
        const next = trackPoints[(j + 1) % trackPoints.length];
        
        const dx = next[0] - curr[0];
        const dy = next[1] - curr[1];
        const lenSq = dx * dx + dy * dy;
        
        if (lenSq > 0) {
          const t = Math.max(0, Math.min(1, 
            ((line[i][0] - curr[0]) * dx + (line[i][1] - curr[1]) * dy) / lenSq
          ));
          projX = curr[0] + t * dx;
          projY = curr[1] + t * dy;
        } else {
          projX = curr[0];
          projY = curr[1];
        }
        
        const distX = line[i][0] - projX;
        const distY = line[i][1] - projY;
        const d = distX * distX + distY * distY;
        
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = j;
          if (lenSq > 0) {
            const t = Math.max(0, Math.min(1, 
              ((line[i][0] - curr[0]) * dx + (line[i][1] - curr[1]) * dy) / lenSq
            ));
            projX = curr[0] + t * dx;
            projY = curr[1] + t * dy;
          }
        }
      }
      
      nearestDist = Math.sqrt(nearestDist);
      if (nearestDist > trackWidth) {
        const dx = line[i][0] - projX;
        const dy = line[i][1] - projY;
        const scale = trackWidth / nearestDist;
        line[i][0] = projX + dx * scale;
        line[i][1] = projY + dy * scale;
      }
    }
  }

  // Smooth the output
  return smoothLine(line, 5);
}

// ─── Smooth a polyline ───────────────────────────────────────
function smoothLine(line: [number, number][], passes: number = 3): [number, number][] {
  const result = line.map(p => [...p] as [number, number]);
  const n = result.length;
  const window = 3;

  for (let pass = 0; pass < passes; pass++) {
    const temp = result.map(p => [...p] as [number, number]);
    for (let i = 0; i < n; i++) {
      let sx = 0, sy = 0, count = 0;
      for (let j = -window; j <= window; j++) {
        const idx = (i + j + n) % n;
        sx += temp[idx][0];
        sy += temp[idx][1];
        count++;
      }
      result[i][0] = sx / count;
      result[i][1] = sy / count;
    }
  }
  return result;
}

// ─── Speed profile (from f1-sim) ─────────────────────────────
// speed = min(maxSpeed, 60/sqrt(cornerRadius) * downforce * 5)
export function computeSpeedProfile(
  racingLine: [number, number][],
  track: TrackData,
  maxSpeed: number = 320,
  downforce: number = 1.0
): number[] {
  const n = racingLine.length;
  const curvatures = computeCurvatures(racingLine);
  const speeds: number[] = [];

  for (let i = 0; i < n; i++) {
    const pos = i / n;
    const curv = curvatures[i];

    // Find applicable corner
    let cornerRadius = 200; // default = straight
    for (const corner of track.cornerData) {
      const dist = Math.abs(pos - corner.position);
      if (dist < 0.08) {
        cornerRadius = corner.radius;
        break;
      }
    }

    // f1-sim formula
    if (curv > 0.005) {
      const radiusFromCurv = 1 / (curv + 1e-8);
      const effectiveRadius = Math.min(radiusFromCurv, cornerRadius);
      const speed = Math.min(maxSpeed, (60 / Math.sqrt(effectiveRadius)) * downforce * 5);
      speeds.push(Math.max(50, speed));
    } else {
      speeds.push(maxSpeed);
    }
  }

  // Smooth speeds (physical constraint: can't instantly change speed)
  const smoothed = [...speeds];
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < n; i++) {
      const prev = smoothed[(i - 1 + n) % n];
      const next = smoothed[(i + 1) % n];
      smoothed[i] = smoothed[i] * 0.5 + (prev + next) * 0.25;
    }
  }

  return smoothed.map(s => Math.round(Math.max(50, Math.min(maxSpeed, s))));
}

// ─── Braking zones (from f1-sim) ─────────────────────────────
// Detected when deceleration > 15% threshold
export function getBrakingZones(
  speeds: number[],
  threshold: number = 0.12
): { start: number; end: number }[] {
  const n = speeds.length;
  const zones: { start: number; end: number }[] = [];
  let inBraking = false;
  let startIdx = 0;

  for (let i = 1; i < n - 1; i++) {
    const decel = (speeds[i] - speeds[i + 1]) / speeds[i];
    if (decel > threshold && !inBraking) {
      startIdx = i;
      inBraking = true;
    } else if (decel < 0.02 && inBraking) {
      zones.push({ start: startIdx, end: i });
      inBraking = false;
    }
  }
  if (inBraking) zones.push({ start: startIdx, end: n - 1 });
  return zones;
}

// ─── Throttle zones (from f1-sim) ────────────────────────────
// Detected when acceleration > 2% threshold
export function getThrottleZones(
  speeds: number[],
  threshold: number = 0.02
): { start: number; end: number }[] {
  const n = speeds.length;
  const zones: { start: number; end: number }[] = [];
  let inThrottle = false;
  let startIdx = 0;

  for (let i = 1; i < n - 1; i++) {
    const accel = (speeds[i + 1] - speeds[i]) / speeds[i];
    if (accel > threshold && !inThrottle) {
      startIdx = i;
      inThrottle = true;
    } else if (accel < 0 && inThrottle) {
      zones.push({ start: startIdx, end: i });
      inThrottle = false;
    }
  }
  if (inThrottle) zones.push({ start: startIdx, end: n - 1 });
  return zones;
}

// ─── Apex points (from f1-sim) ───────────────────────────────
// Local speed minima with 2-point look-behind/ahead
export function getApexPoints(speeds: number[]): number[] {
  const apices: number[] = [];
  for (let i = 2; i < speeds.length - 2; i++) {
    if (
      speeds[i] < speeds[i - 1] &&
      speeds[i] < speeds[i - 2] &&
      speeds[i] < speeds[i + 1] &&
      speeds[i] < speeds[i + 2]
    ) {
      apices.push(i);
    }
  }
  return apices;
}

// ─── Speed-based color (blue→cyan→green→yellow→red) ──────────
export function getSpeedColor(speed: number, minS: number, maxS: number): THREE.Color {
  const t = (speed - minS) / (maxS - minS || 1);
  if (t < 0.25) {
    return new THREE.Color().lerpColors(new THREE.Color(0x3050FF), new THREE.Color(0x00D2FF), t / 0.25);
  } else if (t < 0.5) {
    return new THREE.Color().lerpColors(new THREE.Color(0x00D2FF), new THREE.Color(0x00FF87), (t - 0.25) / 0.25);
  } else if (t < 0.75) {
    return new THREE.Color().lerpColors(new THREE.Color(0x00FF87), new THREE.Color(0xFFD700), (t - 0.5) / 0.25);
  } else {
    return new THREE.Color().lerpColors(new THREE.Color(0xFFD700), new THREE.Color(0xFF1E00), (t - 0.75) / 0.25);
  }
}

// ─── Build Three.js curve ────────────────────────────────────
export function buildCurve3D(
  points: [number, number][],
  yOffset: number = 0
): THREE.CatmullRomCurve3 {
  const vectors = points.map(([x, y]) => new THREE.Vector3(x, yOffset, y));
  return new THREE.CatmullRomCurve3(vectors, true, 'catmullrom', 0.5);
}

// ─── Estimate lap time from speed profile ────────────────────
export function estimateLapTime(speeds: number[], trackLengthKm: number): string {
  const n = speeds.length;
  const segLenM = (trackLengthKm * 1000) / n;
  let totalSec = 0;
  for (let i = 0; i < n; i++) {
    totalSec += segLenM / (speeds[i] / 3.6);
  }
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const s = Math.floor(sec);
  const ms = Math.round((sec - s) * 1000);
  return `${min}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

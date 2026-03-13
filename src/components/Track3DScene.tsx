'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { ProcessedTrack } from '@/lib/useProcessedTrack';
import { getSpeedColor } from '@/lib/racingLine';

function ZoneLabel({ position, label, color }: { position: THREE.Vector3, label: string, color: string }) {
  return (
    <Html position={position} center distanceFactor={150} zIndexRange={[100, 0]}>
      <div style={{
        background: 'rgba(10,10,10,0.9)',
        border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '4px',
        fontFamily: 'var(--font-display)',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '0.15em',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        transform: 'translate3d(0, -30px, 0)',
        boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {label}
        {/* Pointer line */}
        <div style={{
          width: '1px',
          height: '30px',
          background: color,
          position: 'absolute',
          top: '100%',
        }} />
        {/* Pointer dot at bottom */}
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: color,
          position: 'absolute',
          top: 'calc(100% + 28px)',
        }} />
      </div>
    </Html>
  );
}


// ═══════════════════════════════════════════════════════════════
//  Layer 1: TRACK SURFACE — dark grey asphalt ribbon
// ═══════════════════════════════════════════════════════════════
function TrackSurface({ processed }: { processed: ProcessedTrack }) {
  const { cx, cy } = processed.bounds;
  const geometry = useMemo(() => {
    const pts = processed.centerline;
    const n = pts.length;
    const hw = 20; // track half-width in coord units

    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const curr = pts[i];
      const next = pts[(i + 1) % n];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      // left and right edge (centered)
      vertices.push(curr[0] - cx + nx * hw, 0, curr[1] - cy + ny * hw);
      vertices.push(curr[0] - cx - nx * hw, 0, curr[1] - cy - ny * hw);
    }

    for (let i = 0; i < n; i++) {
      const ni = (i + 1) % n;
      indices.push(i * 2, i * 2 + 1, ni * 2);
      indices.push(i * 2 + 1, ni * 2 + 1, ni * 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [processed, cx, cy]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#2a2a2a" roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Layer 1b: RACING SURFACE — slightly brighter inner strip
// ═══════════════════════════════════════════════════════════════
function RacingSurface({ processed }: { processed: ProcessedTrack }) {
  const { cx, cy } = processed.bounds;
  const geometry = useMemo(() => {
    const pts = processed.centerline;
    const n = pts.length;
    const hw = 10;
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const curr = pts[i];
      const next = pts[(i + 1) % n];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      vertices.push(curr[0] - cx + nx * hw, 0.05, curr[1] - cy + ny * hw);
      vertices.push(curr[0] - cx - nx * hw, 0.05, curr[1] - cy - ny * hw);
    }

    for (let i = 0; i < n; i++) {
      const ni = (i + 1) % n;
      indices.push(i * 2, i * 2 + 1, ni * 2);
      indices.push(i * 2 + 1, ni * 2 + 1, ni * 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [processed, cx, cy]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#3a3a3a" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Layer 2: TRACK BOUNDARIES — white edge lines
// ═══════════════════════════════════════════════════════════════
function TrackBoundary({ processed, offset }: { processed: ProcessedTrack; offset: number }) {
  const { cx, cy } = processed.bounds;
  const points = useMemo(() => {
    const pts = processed.centerline;
    const n = pts.length;
    const result: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const curr = pts[i];
      const next = pts[(i + 1) % n];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = (-dy / len) * offset;
      const ny = (dx / len) * offset;
      result.push(new THREE.Vector3(curr[0] - cx + nx, 0.15, curr[1] - cy + ny));
    }
    result.push(result[0].clone());
    return result;
  }, [processed, cx, cy, offset]);

  return <Line points={points} color="#ffffff" lineWidth={2} />;
}

// ═══════════════════════════════════════════════════════════════
//  Layer 3: RACING LINE — colored by speed or throttle/brake
//  Green = throttle, Red = braking, White = coasting (like f1-sim)
// ═══════════════════════════════════════════════════════════════
function RacingLine({ processed }: { processed: ProcessedTrack }) {
  const filters = useAppStore((s) => s.filters);
  const { cx, cy } = processed.bounds;

  const { points, colors, speedUpPos, slowUpPos } = useMemo(() => {
    const n = processed.racingLine.length;
    const pts: THREE.Vector3[] = [];
    const cols: [number, number, number][] = [];

    // Pre-smooth acceleration values
    const accels: number[] = [];
    for (let i = 0; i < n; i++) {
      let sum = 0, count = 0;
      for (let k = -3; k <= 3; k++) {
        const curr = processed.speeds[(i + k + n) % n];
        const next = processed.speeds[(i + k + 1 + n) % n];
        sum += next - curr;
        count++;
      }
      accels.push(sum / count);
    }

    for (let i = 0; i < n; i++) {
      const [x, y] = processed.racingLine[i];
      pts.push(new THREE.Vector3(x - cx, 0.3, y - cy));

      if (filters.speedGradient) {
        const c = getSpeedColor(processed.speeds[i], processed.minSpeed, processed.maxSpeed);
        cols.push([c.r, c.g, c.b]);
      } else {
        const accel = accels[i];
        if (accel < -4) {
          cols.push([0.91, 0.0, 0.18]); // Red — braking
        } else if (accel > 3) {
          cols.push([0.22, 1.0, 0.08]); // Green — throttle
        } else {
          cols.push([0.9, 0.9, 0.9]); // White — coasting
        }
      }
    }

    pts.push(pts[0].clone());
    cols.push(cols[0]);

    let maxAccIdx = 0;
    let minAccIdx = 0;
    for (let i = 1; i < n; i++) {
        if (accels[i] > accels[maxAccIdx]) maxAccIdx = i;
        if (accels[i] < accels[minAccIdx]) minAccIdx = i;
    }

    const speedUpPos = new THREE.Vector3(
        processed.racingLine[maxAccIdx][0] - cx, 
        0.3, 
        processed.racingLine[maxAccIdx][1] - cy
    );
    const slowUpPos = new THREE.Vector3(
        processed.racingLine[minAccIdx][0] - cx, 
        0.3, 
        processed.racingLine[minAccIdx][1] - cy
    );

    return { points: pts, colors: cols, speedUpPos, slowUpPos };
  }, [processed, cx, cy, filters.speedGradient]);

  if (!filters.racingLine && !filters.speedGradient) return null;

  return (
    <>
      <Line points={points} vertexColors={colors} lineWidth={3.5} />
      {filters.speedGradient && (
        <>
          <ZoneLabel position={speedUpPos} label="SPEED UP ZONE" color="#FF8C00" />
          <ZoneLabel position={slowUpPos} label="SLOW DOWN ZONE" color="#E8002D" />
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Layer 4: BRAKING ZONES — red highlighted sections
// ═══════════════════════════════════════════════════════════════
function BrakingZoneLines({ processed }: { processed: ProcessedTrack }) {
  const show = useAppStore((s) => s.filters.brakeZones);
  const { cx, cy } = processed.bounds;

  const segments = useMemo(() =>
    processed.brakingZones.map((z) => {
      const pts: THREE.Vector3[] = [];
      for (let i = z.start; i <= Math.min(z.end, processed.racingLine.length - 1); i++) {
        const [x, y] = processed.racingLine[i];
        pts.push(new THREE.Vector3(x - cx, 0.4, y - cy));
      }
      return pts;
    }),
  [processed, cx, cy]);

  const labelPos = useMemo(() => {
    if (!segments.length) return null;
    const longest = segments.reduce((prev, curr) => (curr.length > prev.length ? curr : prev));
    return longest.length > 0 ? longest[Math.floor(longest.length / 2)] : null;
  }, [segments]);

  if (!show) return null;
  return (
    <>
      {segments.map((pts, i) =>
        pts.length > 1 ? <Line key={`b${i}`} points={pts} color="#FF4444" lineWidth={6} /> : null
      )}
      {labelPos && <ZoneLabel position={labelPos} label="BRAKE ZONE" color="#FF4444" />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Layer 5: THROTTLE ZONES — green highlighted sections
// ═══════════════════════════════════════════════════════════════
function ThrottleZoneLines({ processed }: { processed: ProcessedTrack }) {
  const show = useAppStore((s) => s.filters.throttleZones);
  const { cx, cy } = processed.bounds;

  const segments = useMemo(() =>
    processed.throttleZones.map((z) => {
      const pts: THREE.Vector3[] = [];
      for (let i = z.start; i <= Math.min(z.end, processed.racingLine.length - 1); i++) {
        const [x, y] = processed.racingLine[i];
        pts.push(new THREE.Vector3(x - cx, 0.4, y - cy));
      }
      return pts;
    }),
  [processed, cx, cy]);

  const labelPos = useMemo(() => {
    if (!segments.length) return null;
    const longest = segments.reduce((prev, curr) => (curr.length > prev.length ? curr : prev));
    return longest.length > 0 ? longest[Math.floor(longest.length / 2)] : null;
  }, [segments]);

  if (!show) return null;
  return (
    <>
      {segments.map((pts, i) =>
        pts.length > 1 ? <Line key={`t${i}`} points={pts} color="#44FF44" lineWidth={5} /> : null
      )}
      {labelPos && <ZoneLabel position={labelPos} label="THROTTLE ZONE" color="#44FF44" />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  APEX MARKERS — gold diamonds at speed minima
// ═══════════════════════════════════════════════════════════════
function ApexMarkers({ processed }: { processed: ProcessedTrack }) {
  const show = useAppStore((s) => s.filters.apexPoints);
  const { cx, cy } = processed.bounds;
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  const positions = useMemo(() =>
    processed.apexIndices.map((idx) => {
      const [x, y] = processed.racingLine[idx % processed.racingLine.length];
      return new THREE.Vector3(x - cx, 2, y - cy);
    }),
  [processed, cx, cy]);

  useFrame((_, dt) => { refs.current.forEach(m => { if (m) m.rotation.y += dt; }); });

  if (!show) return null;
  return (
    <>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          <mesh ref={(el) => { refs.current[i] = el; }}>
            <octahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
          <pointLight color="#FFD700" intensity={1} distance={15} />
        </group>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  START/FINISH MARKER — green marker
// ═══════════════════════════════════════════════════════════════
function StartFinish({ processed }: { processed: ProcessedTrack }) {
  const { cx, cy } = processed.bounds;
  
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const rows = 4;
    const cols = 16;
    const w = canvas.width / cols;
    const h = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#111111';
        ctx.fillRect(c * w, r * h, w, h);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Match the logic from TrackSurface for perfect alignment
  const { pos, rot } = useMemo(() => {
    const pts = processed.centerline;
    const n = pts.length;
    const i = 0;
    
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    
    // Rotation should be perpendicular to the track direction
    const angle = Math.atan2(dx, dy);
    
    return {
      pos: new THREE.Vector3(curr[0] - cx, 0.05, curr[1] - cy),
      rot: angle
    };
  }, [processed, cx, cy]);

  return (
    <mesh 
      position={pos} 
      rotation={[-Math.PI / 2, 0, rot]}
    >
      <planeGeometry args={[40, 6]} />
      <meshStandardMaterial 
        map={texture} 
        transparent 
        opacity={0.9} 
        polygonOffset 
        polygonOffsetFactor={-4}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DRS ZONES
// ═══════════════════════════════════════════════════════════════
function DRSZones({ processed }: { processed: ProcessedTrack }) {
  const show = useAppStore((s) => s.filters.drsZones);
  const { cx, cy } = processed.bounds;

  const segments = useMemo(() => {
    const n = processed.speeds.length;
    const thresh = processed.minSpeed + (processed.maxSpeed - processed.minSpeed) * 0.85;
    const zones: { start: number; end: number }[] = [];
    let zs = -1;
    for (let i = 0; i < n; i++) {
      if (processed.speeds[i] >= thresh) { if (zs === -1) zs = i; }
      else { if (zs !== -1 && i - zs > 8) zones.push({ start: zs, end: i }); zs = -1; }
    }
    return zones.map(z => {
      const pts: THREE.Vector3[] = [];
      for (let i = z.start; i <= z.end; i++) {
        const [x, y] = processed.racingLine[i % n];
        pts.push(new THREE.Vector3(x - cx, 0.35, y - cy));
      }
      return pts;
    });
  }, [processed, cx, cy]);

  const labelPos = useMemo(() => {
    if (!segments.length) return null;
    const longest = segments.reduce((prev, curr) => (curr.length > prev.length ? curr : prev));
    return longest.length > 0 ? longest[Math.floor(longest.length / 2)] : null;
  }, [segments]);

  if (!show) return null;
  return (
    <>
      {segments.map((pts, i) =>
        pts.length > 1 ? <Line key={i} points={pts} color="#00D2FF" lineWidth={6} opacity={0.6} transparent /> : null
      )}
      {labelPos && <ZoneLabel position={labelPos} label="DRS ZONE" color="#00D2FF" />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SPEED ZONE HIGHLIGHTS (fast = green, slow = purple)
// ═══════════════════════════════════════════════════════════════
function SpeedZones({ processed }: { processed: ProcessedTrack }) {
  const { fastZones, slowZones } = useAppStore((s) => s.filters);
  const { cx, cy } = processed.bounds;

  const { fast, slow, fastLabel, slowLabel } = useMemo(() => {
    const n = processed.speeds.length;
    const t20 = processed.minSpeed + (processed.maxSpeed - processed.minSpeed) * 0.2;
    const t80 = processed.minSpeed + (processed.maxSpeed - processed.minSpeed) * 0.8;
    const f: THREE.Vector3[] = [], s: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const [x, y] = processed.racingLine[i];
      const v = new THREE.Vector3(x - cx, 0.3, y - cy);
      if (processed.speeds[i] >= t80) f.push(v);
      if (processed.speeds[i] <= t20) s.push(v);
    }
    return { 
      fast: f, 
      slow: s,
      fastLabel: f.length > 0 ? f[Math.floor(f.length / 2)] : null,
      slowLabel: s.length > 0 ? s[Math.floor(s.length / 2)] : null
    };
  }, [processed, cx, cy]);

  return (
    <>
      {fastZones && fast.length > 1 && (
        <>
          <Line points={fast} color="#39FF14" lineWidth={5} opacity={0.6} transparent />
          {fastLabel && <ZoneLabel position={fastLabel} label="FAST ZONE" color="#39FF14" />}
        </>
      )}
      {slowZones && slow.length > 1 && (
        <>
          <Line points={slow} color="#7030FF" lineWidth={5} opacity={0.6} transparent />
          {slowLabel && <ZoneLabel position={slowLabel} label="SLOW ZONE" color="#7030FF" />}
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANIMATED CAR
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  CAR MODEL COMPONENT
// ═══════════════════════════════════════════════════════════════
function CarModel({ color, scale = 1.8, wheelRef }: { color: string; scale?: number; wheelRef: React.MutableRefObject<(THREE.Mesh | null)[]> }) {
  return (
    <group scale={scale}>
      {/* Underbody / Floor / Plank — Grounding the car */}
      <mesh position={[0, -0.28, 0.2]}>
        <boxGeometry args={[2.0, 0.1, 4.0]} />
        <meshStandardMaterial color="#080808" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Diffuser (rear kicks up) */}
      <mesh position={[0, -0.15, -1.8]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Main Chassis / Tub - Z Forward */}
      <mesh castShadow position={[0, 0, -0.2]}>
        <boxGeometry args={[0.9, 0.5, 3.4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Nose cone - tapered */}
      <mesh position={[0, -0.1, 2.1]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[0.6, 0.3, 1.8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Cockpit Surround */}
      <mesh position={[0, 0.25, 0.8]}>
        <boxGeometry args={[0.85, 0.2, 1.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Driver Helmet */}
      <group position={[0, 0.45, 0.6]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.05, 0.15]}>
          <boxGeometry args={[0.25, 0.12, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* Front Wing Complex */}
      <group position={[0, -0.24, 3.0]}>
        {/* Main plane */}
        <mesh><boxGeometry args={[2.5, 0.05, 0.6]} /><meshStandardMaterial color="#111" /></mesh>
        {/* Upper flaps */}
        <mesh position={[0, 0.1, 0.05]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[2.4, 0.03, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Endplates */}
        <mesh position={[1.25, 0.2, 0.1]}><boxGeometry args={[0.04, 0.5, 0.7]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[-1.25, 0.2, 0.1]}><boxGeometry args={[0.04, 0.5, 0.7]} /><meshStandardMaterial color={color} /></mesh>
      </group>

      {/* Bargeboards / Sidepod deflectors */}
      <group position={[0.7, -0.1, 1.4]}>
        <mesh rotation={[0, 0.1, 0]}><boxGeometry args={[0.05, 0.6, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
      <group position={[-0.7, -0.1, 1.4]}>
        <mesh rotation={[0, -0.1, 0]}><boxGeometry args={[0.05, 0.6, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
      </group>

      {/* Sidepods - sculpted look */}
      <mesh position={[0.75, -0.05, 0.2]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.45, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.6} />
      </mesh>
      <mesh position={[-0.75, -0.05, 0.2]} rotation={[0, -0.1, 0]}>
        <boxGeometry args={[0.5, 0.45, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.6} />
      </mesh>

      {/* Side Mirrors */}
      <mesh position={[0.55, 0.35, 1.1]}><boxGeometry args={[0.15, 0.08, 0.1]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[-0.55, 0.35, 1.1]}><boxGeometry args={[0.15, 0.08, 0.1]} /><meshStandardMaterial color={color} /></mesh>

      {/* Rear Wing Complex */}
      <group position={[0, 0.55, -1.8]}>
        {/* Main profile */}
        <mesh><boxGeometry args={[2.0, 0.08, 0.6]} /><meshStandardMaterial color={color} /></mesh>
        {/* Top flap (DRS) */}
        <mesh position={[0, 0.15, -0.1]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[1.9, 0.05, 0.4]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Endplates */}
        <mesh position={[1.0, -0.35, 0]}><boxGeometry args={[0.05, 1.0, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[-1.0, -0.35, 0]}><boxGeometry args={[0.05, 1.0, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
      </group>

      {/* Halo Protection */}
      <mesh position={[0, 0.42, 0.65]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.42, 0.07, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#111" metalness={0.9} />
      </mesh>
      {/* Halo center pillar */}
      <mesh position={[0, 0.3, 1.05]}>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Engine Intake / Airbox */}
      <mesh position={[0, 0.65, -0.2]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.5, 0.35, 1.0]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Rear T-cam */}
      <mesh position={[0, 0.85, -0.4]}>
        <boxGeometry args={[0.2, 0.08, 0.15]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Dynamic Spinning Wheels with Hub Caps */}
      {[ [0.9, -0.15, 1.45], [-0.9, -0.15, 1.45], [0.9, -0.15, -1.3], [-0.9, -0.15, -1.3] ].map((pos, i) => (
        <group key={i} position={pos as any}>
          <group rotation={[0, 0, Math.PI / 2]}>
            <mesh ref={el => { wheelRef.current[i] = el; }}>
              <cylinderGeometry args={[0.5, 0.5, 0.55, 24]} />
              <meshStandardMaterial color="#121212" roughness={0.6} metalness={0.1} />
              {/* Visual rim detail */}
              <mesh position={[0, 0.28, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.05, 12]} />
                <meshStandardMaterial color="#333" />
              </mesh>
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANIMATED CARS (Multi-Car Racing)
// ═══════════════════════════════════════════════════════════════
function AnimatedCars({ processed }: { processed: ProcessedTrack }) {
  const cars = [
    { ref: useRef<THREE.Group>(null), wheels: useRef<(THREE.Mesh | null)[]>([]), color: "#E8002D", type: 'player' },
    { ref: useRef<THREE.Group>(null), wheels: useRef<(THREE.Mesh | null)[]>([]), color: "#0066FF", type: 'ai', offset: 5 },
    { ref: useRef<THREE.Group>(null), wheels: useRef<(THREE.Mesh | null)[]>([]), color: "#C0C0C0", type: 'ai', offset: -6 },
    { ref: useRef<THREE.Group>(null), wheels: useRef<(THREE.Mesh | null)[]>([]), color: "#FF8700", type: 'ai', offset: 8 },
  ];
  
  const hl = useRef<THREE.PointLight>(null);
  const tl = useRef<THREE.PointLight>(null);
  const { setCarProgress, setAllCarsProgress, setCurrentSpeed, currentLap, setLap } = useAppStore();
  
  const tRefs = useRef([0, 0.98, 0.96, 0.94]); // Initial staggered positions
  const lateralRefs = useRef([0, 6, -6, 10]); // Player is 0, others have base offsets
  const posVec = useMemo(() => new THREE.Vector3(), []);
  const lookVec = useMemo(() => new THREE.Vector3(), []);

  // Pre-calculate base centerline for AI reference
  const centerlinePts = useMemo(() => {
    const { cx, cy } = processed.bounds;
    return processed.centerline.map(p => new THREE.Vector3(p[0] - cx, 0.3, p[1] - cy));
  }, [processed]);
  
  const centerlineCurve = useMemo(() => new THREE.CatmullRomCurve3(centerlinePts, true), [centerlinePts]);

  useFrame((state, dt) => {
    const n = processed.racingLine.length;
    
    // 1. Calculate Player Progress First (i=0)
    const playerT = tRefs.current[0];
    const playerIdx = Math.floor(playerT * n) % n;
    const physicsSpeed = processed.speeds[playerIdx] || 200;
    const playerSpeed = physicsSpeed; // Compatibility for AI logic
    
    // Constant for mapping KM/H to simulation progress. Increased to 0.0008 for more speed.
    const progressPerKmh = 0.0008;

    // 1. Handle Player & Overall Physics
    const { allCarsTireWear, setAllCarsTireWear, isPitting, setIsPitting } = useAppStore.getState();
    const wearRefs = useRef<number[]>([100, 100, 100, 100]);
    const pitStateRefs = useRef<('none'|'entry'|'stopping'|'exit')[]>(['none', 'none', 'none', 'none']);
    const pitTimerRefs = useRef<number[]>([0, 0, 0, 0]);

    // Update store with tire wear every ~1s to save on perf
    const lastStoreUpdate = useRef(0);
    if (state.clock.getElapsedTime() - lastStoreUpdate.current > 1.0) {
      setAllCarsTireWear([...wearRefs.current]);
      setIsPitting([...pitStateRefs.current.map(s => s !== 'none')]);
      lastStoreUpdate.current = state.clock.getElapsedTime();
    }

    // Hard-coded Dual-Range Speedometer (Strictly synced with UI limits):
    let displaySpeed = 0;
    const slowThreshold = processed.minSpeed + 20; 
    
    if (physicsSpeed < slowThreshold) {
      const t = (physicsSpeed - processed.minSpeed) / 20;
      displaySpeed = processed.minSpeed + t * 15; 
    } else {
      const t = (physicsSpeed - slowThreshold) / (processed.maxSpeed - slowThreshold);
      displaySpeed = 230 + t * (processed.maxSpeed - 230);
    }
    
    // 2. Update and render all cars
    const playerPos = new THREE.Vector3();
    if (cars[0].ref.current) playerPos.copy(cars[0].ref.current.position);

    cars.forEach((car, i) => {
      if (!car.ref.current) return;
      
      let speed = playerSpeed; 
      const currentState = pitStateRefs.current[i];
      
      // Tire Wear Decay
      const wearDecayBase = 0.02; // Tune for 1-2 stops
      const decay = (speed / 300) * wearDecayBase * dt;
      wearRefs.current[i] = Math.max(0, wearRefs.current[i] - decay);

      // Pitstop State Machine
      if (currentState === 'none') {
        const t = tRefs.current[i];
        if (wearRefs.current[i] < 30) { // Trigger pit if wear < 30%
          const entryDist = Math.abs(t - processed.pitEntryProgress);
          if (entryDist < 0.005) {
            pitStateRefs.current[i] = 'entry';
            tRefs.current[i] = 0; // Reset progress for pitlane curve
          }
        }
      }

      const p = new THREE.Vector3();
      const tangent = new THREE.Vector3();

      if (currentState !== 'none') {
        // PITLANE LOGIC
        speed = 80; // Pit limit

        if (currentState === 'entry') {
          tRefs.current[i] += dt * (speed * progressPerKmh) * 0.8; // Move along pitlane
          if (tRefs.current[i] > 0.45) { // Halfway through is stopping area
            pitStateRefs.current[i] = 'stopping';
            pitTimerRefs.current[i] = 2.5; // 2.5s tire change
          }
        } else if (currentState === 'stopping') {
          speed = 0;
          pitTimerRefs.current[i] -= dt;
          if (pitTimerRefs.current[i] <= 0) {
            pitStateRefs.current[i] = 'exit';
            wearRefs.current[i] = 100; // Fresh Tires!
          }
        } else if (currentState === 'exit') {
          tRefs.current[i] += dt * (speed * progressPerKmh) * 0.8;
          if (tRefs.current[i] >= 1.0) {
            pitStateRefs.current[i] = 'none';
            tRefs.current[i] = processed.pitExitProgress; // Rejoin main track at exit point
          }
        }

        // Get position from Pitlane Curve
        processed.pitLaneCurve.getPointAt(THREE.MathUtils.clamp(tRefs.current[i], 0, 1), p);
        processed.pitLaneCurve.getTangentAt(THREE.MathUtils.clamp(tRefs.current[i], 0, 1), tangent);
        
        // Special case for stopping at assigned pit box
        if (currentState === 'stopping' || (currentState === 'entry' && tRefs.current[i] > 0.4)) {
          const boxPos = processed.pitBoxes3D[i];
          if (boxPos) {
             const lerpT = THREE.MathUtils.clamp((tRefs.current[i] - 0.4) * 10, 0, 1);
             p.lerp(boxPos, lerpT);
          }
        }
      } else {
        // MAIN TRACK LOGIC
        if (i === 0) {
          tRefs.current[0] = (playerT + dt * physicsSpeed * progressPerKmh) % 1;
          setCarProgress(tRefs.current[0]);
          setCurrentSpeed(displaySpeed);
          
          if (playerT > 0.8 && tRefs.current[0] < 0.2) {
            if (currentLap < 70) setLap(currentLap + 1);
          }
        } else {
          // AI Logic
          const t = tRefs.current[i];
          let deltaT = tRefs.current[0] - t;
          if (deltaT > 0.5) deltaT -= 1;
          if (deltaT < -0.5) deltaT += 1;

          const error = deltaT;
          const magnetStrength = 0.7;
          const variation = Math.sin(state.clock.getElapsedTime() * 0.2 + i * 1.5) * 0.03;
          const targetSpeedMultiplier = 1.0 + (error * magnetStrength) + variation;
          
          let leadClamp = deltaT < -0.002 ? 0.85 : 1.15;
          if (currentLap === 70 && playerT > 0.94) {
            if (deltaT < 0.01) leadClamp = 0.6; 
          }
          speed = playerSpeed * THREE.MathUtils.clamp(targetSpeedMultiplier, 0.7, leadClamp);
          tRefs.current[i] = (tRefs.current[i] + dt * speed * progressPerKmh) % 1;
        }

        const curve = i === 0 ? processed.curve3D : centerlineCurve;
        curve.getPointAt(tRefs.current[i], p);
        curve.getTangentAt(tRefs.current[i], tangent);
        
        if (i > 0) {
          const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
          const carMeta = (car as any);
          const baseOffset = carMeta.offset || (i % 2 === 0 ? 6 : -6);
          let currentOffset = lateralRefs.current[i];
          
          const worldPosAI = p.clone().add(normal.clone().multiplyScalar(currentOffset));
          const distSq = worldPosAI.distanceToSquared(playerPos);
          if (distSq < 30) {
            const toPlayer = playerPos.clone().sub(p);
            const playerLat = toPlayer.dot(normal);
            currentOffset += currentOffset > playerLat ? 0.6 : -0.6;
          }
          currentOffset = THREE.MathUtils.lerp(currentOffset, baseOffset, 0.04);
          currentOffset = THREE.MathUtils.clamp(currentOffset, -15, 15);
          lateralRefs.current[i] = currentOffset;
          p.add(normal.multiplyScalar(currentOffset));
        }
      }
      
      car.ref.current.position.copy(p);
      car.ref.current.lookAt(p.x + tangent.x, p.y, p.z + tangent.z);

      const wheelCircumference = 2.0; 
      const wheelRotationSpeed = (speed / 3.6) * dt * (1 / wheelCircumference);
      car.wheels.current.forEach(w => { if (w) w.rotation.y += wheelRotationSpeed; });

      if (i === 0) {
        if (hl.current) hl.current.position.set(p.x + tangent.x * 5, p.y + 1.2, p.z + tangent.z * 5);
        if (tl.current) tl.current.position.set(p.x - tangent.x * 3, p.y + 0.6, p.z - tangent.z * 3);
      }
    });
    setAllCarsProgress([...tRefs.current]);
  });

  return (
    <>
      {cars.map((car, i) => (
        <group key={i} ref={car.ref}>
          <CarModel color={car.color} wheelRef={car.wheels} />
        </group>
      ))}
      <pointLight ref={hl} color="#fff" intensity={5} distance={30} />
      <pointLight ref={tl} color="#f00" intensity={4} distance={20} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CAMERA CONTROLLER
// ═══════════════════════════════════════════════════════════════
function CameraController({ processed }: { processed: ProcessedTrack }) {
  const { camera } = useThree();
  const ctrl = useRef<any>(null);
  const { isZoomed, zoomTarget, carProgress } = useAppStore();
  const target = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const pVec = useMemo(() => new THREE.Vector3(), []);
  const tVec = useMemo(() => new THREE.Vector3(), []);
  const { range } = processed.bounds;

  // Dynamic camera distance based on track size
  const camDist = range * 0.9;

  useFrame(() => {
    if (isZoomed && zoomTarget) {
      // Sync with carProgress from store
      const p = processed.curve3D.getPointAt(carProgress % 1, pVec);
      const t = processed.curve3D.getTangentAt(carProgress % 1, tVec);
      
      // Chase cam position (offset behind car)
      target.current.set(p.x - t.x * 25, p.y + 12, p.z - t.z * 25);
      camera.position.lerp(target.current, 0.1);
      
      // Look at the car (slightly ahead of it for smoother feel)
      lookTarget.current.set(p.x + t.x * 12, p.y + 2, p.z + t.z * 12);
      camera.lookAt(lookTarget.current);
      
      if (ctrl.current) ctrl.current.enabled = false;
    } else {
      target.current.set(0, camDist, camDist * 0.7);
      camera.position.lerp(target.current, 0.03);
      camera.lookAt(0, 0, 0);
      if (ctrl.current) ctrl.current.enabled = true;
    }
  });

  return <OrbitControls ref={ctrl} enableDamping dampingFactor={0.05} minDistance={20} maxDistance={camDist * 3} maxPolarAngle={Math.PI / 2.1} />;
}

// ═══════════════════════════════════════════════════════════════
//  CLICK HANDLER
// ═══════════════════════════════════════════════════════════════
function ClickCatcher({ processed }: { processed: ProcessedTrack }) {
  const { setZoomed, isZoomed } = useAppStore();
  const { range } = processed.bounds;

  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (isZoomed) return;
    e.stopPropagation();
    setZoomed(true, [e.point.x, e.point.y, e.point.z]);
  }, [isZoomed, setZoomed]);

  return (
    <mesh onClick={onClick} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[range, range]} />
      <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN SCENE
// ═══════════════════════════════════════════════════════════════
export default function Track3DScene({ processed }: { processed: ProcessedTrack }) {
  const { range } = processed.bounds;
  const camDist = range * 0.9;

  return (
    <Canvas
      camera={{ position: [0, camDist, camDist * 0.7], fov: 55, near: 0.1, far: range * 10 }}
      style={{ background: '#0A0A0A' }}
      shadows
      gl={{ antialias: true }}
    >
      {/* Lighting — like f1-sim's dark theme */}
      <ambientLight intensity={0.35} />
      <directionalLight intensity={1.0} position={[range * 0.3, range * 0.5, range * 0.3]} castShadow />
      <hemisphereLight color="#1a1a3a" groundColor="#0a0a12" intensity={0.4} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[range * 4, range * 4]} />
        <meshStandardMaterial color="#0a0a10" roughness={1} />
      </mesh>
      <gridHelper args={[range * 3, 60, '#151520', '#0e0e18']} position={[0, -0.3, 0]} />

      {/* Track layers (matching f1-sim: surface → racing surface → boundaries → racing line → zones) */}
      <TrackSurface processed={processed} />
      <RacingSurface processed={processed} />
      <TrackBoundary processed={processed} offset={20} />
      <TrackBoundary processed={processed} offset={-20} />

      {/* Racing line and overlays */}
      <RacingLine processed={processed} />
      <BrakingZoneLines processed={processed} />
      <ThrottleZoneLines processed={processed} />
      <StartFinish processed={processed} />

      {/* Cars */}
      <AnimatedCars processed={processed} />

      {/* Filter layers */}
      <ApexMarkers processed={processed} />
      <DRSZones processed={processed} />
      <SpeedZones processed={processed} />

      {/* Interaction */}
      <ClickCatcher processed={processed} />
      <CameraController processed={processed} />
    </Canvas>
  );
}

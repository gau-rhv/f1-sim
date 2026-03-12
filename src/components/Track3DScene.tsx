'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { ProcessedTrack } from '@/lib/useProcessedTrack';
import { getSpeedColor } from '@/lib/racingLine';

// ═══════════════════════════════════════════════════════════════
//  Layer 1: TRACK SURFACE — dark grey asphalt ribbon
// ═══════════════════════════════════════════════════════════════
function TrackSurface({ processed }: { processed: ProcessedTrack }) {
  const { cx, cy } = processed.bounds;
  const geometry = useMemo(() => {
    const pts = processed.centerline;
    const n = pts.length;
    const hw = 15; // track half-width in coord units
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

  const { points, colors } = useMemo(() => {
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
    return { points: pts, colors: cols };
  }, [processed, cx, cy, filters.speedGradient]);

  if (!filters.racingLine && !filters.speedGradient) return null;

  return <Line points={points} vertexColors={colors} lineWidth={3.5} />;
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

  if (!show) return null;
  return (
    <>
      {segments.map((pts, i) =>
        pts.length > 1 ? <Line key={`b${i}`} points={pts} color="#FF4444" lineWidth={6} /> : null
      )}
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

  if (!show) return null;
  return (
    <>
      {segments.map((pts, i) =>
        pts.length > 1 ? <Line key={`t${i}`} points={pts} color="#44FF44" lineWidth={5} /> : null
      )}
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
  const pos = useMemo(() => {
    const [x, y] = processed.racingLine[0];
    return new THREE.Vector3(x - cx, 0.3, y - cy);
  }, [processed, cx, cy]);

  return (
    <group position={pos}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 3]} />
        <meshBasicMaterial color="#00FF00" />
      </mesh>
    </group>
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

  if (!show) return null;
  return (
    <>
      {segments.map((pts, i) =>
        pts.length > 1 ? <Line key={i} points={pts} color="#00D2FF" lineWidth={6} opacity={0.6} transparent /> : null
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SPEED ZONE HIGHLIGHTS (fast = green, slow = purple)
// ═══════════════════════════════════════════════════════════════
function SpeedZones({ processed }: { processed: ProcessedTrack }) {
  const { fastZones, slowZones } = useAppStore((s) => s.filters);
  const { cx, cy } = processed.bounds;

  const { fast, slow } = useMemo(() => {
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
    return { fast: f, slow: s };
  }, [processed, cx, cy]);

  return (
    <>
      {fastZones && fast.length > 1 && <Line points={fast} color="#39FF14" lineWidth={5} opacity={0.6} transparent />}
      {slowZones && slow.length > 1 && <Line points={slow} color="#7030FF" lineWidth={5} opacity={0.6} transparent />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANIMATED CAR
// ═══════════════════════════════════════════════════════════════
function AnimatedCar({ processed }: { processed: ProcessedTrack }) {
  const car = useRef<THREE.Group>(null);
  const hl = useRef<THREE.PointLight>(null);
  const tl = useRef<THREE.PointLight>(null);
  const tRef = useRef(0);
  const posVec = useMemo(() => new THREE.Vector3(), []);
  const lookVec = useMemo(() => new THREE.Vector3(), []);
  const hlVec = useMemo(() => new THREE.Vector3(), []);
  const tlVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!car.current) return;
    const n = processed.racingLine.length;
    const idx = Math.floor(tRef.current * n) % n;
    const speed = processed.speeds[idx] || 200;
    tRef.current += dt * 0.04 * (speed / 340);
    if (tRef.current > 1) tRef.current -= 1;

    const p = processed.curve3D.getPointAt(tRef.current, posVec);
    const t = processed.curve3D.getTangentAt(tRef.current, lookVec);
    car.current.position.set(p.x, 1, p.z);
    car.current.lookAt(p.x + t.x, 1, p.z + t.z);

    if (hl.current) hl.current.position.set(p.x + t.x * 5, 2, p.z + t.z * 5);
    if (tl.current) tl.current.position.set(p.x - t.x * 3, 1.5, p.z - t.z * 3);
  });

  return (
    <>
      <group ref={car}>
        <mesh castShadow>
          <boxGeometry args={[5, 1, 2.2]} />
          <meshStandardMaterial color="#E8002D" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh position={[0.5, 0.6, 0]}>
          <boxGeometry args={[1.2, 0.35, 1]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[2.8, 0, 0]}>
          <boxGeometry args={[0.5, 0.1, 2.8]} />
          <meshStandardMaterial color="#E8002D" />
        </mesh>
        <mesh position={[-2.2, 0.8, 0]}>
          <boxGeometry args={[0.2, 0.6, 2.4]} />
          <meshStandardMaterial color="#E8002D" />
        </mesh>
      </group>
      <pointLight ref={hl} color="#fff" intensity={3} distance={20} />
      <pointLight ref={tl} color="#f00" intensity={2} distance={12} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CAMERA CONTROLLER
// ═══════════════════════════════════════════════════════════════
function CameraController({ processed }: { processed: ProcessedTrack }) {
  const { camera } = useThree();
  const ctrl = useRef<any>(null);
  const { isZoomed, zoomTarget } = useAppStore();
  const target = useRef(new THREE.Vector3());
  const carT = useRef(0);
  const pVec = useMemo(() => new THREE.Vector3(), []);
  const tVec = useMemo(() => new THREE.Vector3(), []);
  const { range } = processed.bounds;

  // Dynamic camera distance based on track size
  const camDist = range * 0.9;

  useFrame((_, dt) => {
    carT.current += dt * 0.04;
    if (carT.current > 1) carT.current -= 1;

    if (isZoomed && zoomTarget) {
      const p = processed.curve3D.getPointAt(carT.current % 1, pVec);
      const t = processed.curve3D.getTangentAt(carT.current % 1, tVec);
      target.current.set(p.x - t.x * 20, 12, p.z - t.z * 20);
      camera.position.lerp(target.current, 0.04);
      camera.lookAt(p.x + t.x * 10, 0, p.z + t.z * 10);
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
      <TrackBoundary processed={processed} offset={15} />
      <TrackBoundary processed={processed} offset={-15} />

      {/* Racing line and overlays */}
      <RacingLine processed={processed} />
      <BrakingZoneLines processed={processed} />
      <ThrottleZoneLines processed={processed} />
      <StartFinish processed={processed} />

      {/* Car */}
      <AnimatedCar processed={processed} />

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

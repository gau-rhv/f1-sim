'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import * as THREE from 'three';
import { ProcessedTrack } from '@/lib/useProcessedTrack';
import styles from './Minimap.module.css';

const CAR_COLORS = [
  "#E8002D", // Ferrari (Red)
  "#0066FF", // Red Bull (Blue)
  "#C0C0C0", // Audi (Grey)
  "#FF8700"  // McLaren (Orange)
];

const TEAM_NAMES = [
  "FERRARI",
  "RED BULL",
  "AUDI",
  "MCLAREN"
];

export default function Minimap({ processed }: { processed: ProcessedTrack }) {
  const allCarsProgress = useAppStore((s) => s.allCarsProgress);
  const isPitting = useAppStore((s) => s.isPitting);
  
  const { centerline, bounds } = processed;
  if (!centerline || centerline.length === 0) return null;
  const { minX, maxX, minY, maxY } = bounds;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Calculate SVG scale to fit the 190x190 area
  const scale = Math.min(190 / width, 190 / height);
  
  const svgPath = useMemo(() => {
    return centerline.map((p, i) => {
      const x = (p[0] - minX) * scale + (190 - width * scale) / 2;
      const y = (p[1] - minY) * scale + (190 - height * scale) / 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  }, [centerline, minX, minY, scale, width, height]);

  const pitPath = useMemo(() => {
    const points = processed.pitLaneCurve.getPoints(50);
    return points.map((p, i) => {
      // Points are already centered, so we need to RE-ADD cx,cy to match logic below
      const x = (p.x + processed.bounds.cx - minX) * scale + (190 - width * scale) / 2;
      const y = (p.z + processed.bounds.cy - minY) * scale + (190 - height * scale) / 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [processed, minX, minY, scale, width, height]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>PHYSICS ENGINE SIMULATION</div>
      <div className={styles.minimapWrapper}>
        <svg viewBox="0 0 190 190" className={styles.trackOutline}>
          <path d={svgPath} />
          <path d={pitPath} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 2" />
          
          {/* Start/Finish Line Indicator */}
          {(() => {
            const p = centerline[0];
            const next = centerline[1];
            const dx = next[0] - p[0];
            const dy = next[1] - p[1];
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            
            const x = (p[0] - minX) * scale + (190 - width * scale) / 2;
            const y = (p[1] - minY) * scale + (190 - height * scale) / 2;
            
            const x1 = x + nx * 10;
            const y1 = y + ny * 10;
            const x2 = x - nx * 10;
            const y2 = y - ny * 10;
            
            return (
              <line 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke="#ffffff" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
            );
          })()}
        </svg>

        {allCarsProgress
          .map((progress, i) => ({ progress, i }))
          .map(({ progress, i }) => {
            let x, y;
            if (isPitting[i]) {
                const vec = new THREE.Vector3();
                processed.pitLaneCurve.getPointAt(THREE.MathUtils.clamp(progress, 0, 1), vec);
                x = (vec.x + processed.bounds.cx - minX) * scale + (190 - width * scale) / 2;
                y = (vec.z + processed.bounds.cy - minY) * scale + (190 - height * scale) / 2;
            } else {
                const n = centerline.length;
                const idx = Math.floor((progress % 1) * n);
                const p = centerline[idx] || centerline[0];
                x = (p[0] - minX) * scale + (190 - width * scale) / 2;
                y = (p[1] - minY) * scale + (190 - height * scale) / 2;
            }
            
            return (
              <div 
                key={i}
                className={`${styles.carDot} ${i === 0 ? styles.playerDot : ''}`}
                style={{ 
                  left: `${x}px`, 
                  top: `${y}px`,
                  backgroundColor: CAR_COLORS[i],
                  color: CAR_COLORS[i],
                  zIndex: 100 + i
                }}
              />
            );
          })}
      </div>
      
      {/* Live Standings Below Radar */}
      <div className={styles.leaderboard}>
        {allCarsProgress
          .map((progress, i) => ({ progress, i }))
          .sort((a, b) => (b.progress) - (a.progress)) // Real race position
          .map((data, idx) => (
            <div key={data.i} className={styles.leaderboardItem}>
              <span className={styles.posText}>P{idx + 1}</span>
              <div className={styles.leaderboardDot} style={{ backgroundColor: CAR_COLORS[data.i] }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                <span>{TEAM_NAMES[data.i]}</span>
                {isPitting[data.i] && (
                  <span style={{ fontSize: '8px', color: '#ff4d4d', fontWeight: 900, background: 'rgba(255,77,77,0.1)', padding: '1px 4px', borderRadius: '2px' }}>
                    PIT
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

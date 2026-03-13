'use client';

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
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
  
  const { centerline, bounds } = processed;
  if (!centerline || centerline.length === 0) return null;
  const { minX, maxX, minY, maxY } = bounds;
  
  const width = maxX - minX;
  const height = maxY - minY;
  const padding = 10;
  
  // Calculate SVG scale to fit the 190x190 area (container minus padding)
  const scale = Math.min(190 / width, 190 / height);
  
  const svgPath = useMemo(() => {
    return centerline.map((p, i) => {
      const x = (p[0] - minX) * scale + (190 - width * scale) / 2;
      const y = (p[1] - minY) * scale + (190 - height * scale) / 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  }, [centerline, minX, minY, scale, width, height]);

  // Minimap is now always visible as requested

  return (
    <div className={styles.container}>
      <div className={styles.title}>PHYSICS ENGINE SIMULATION</div>
      <div className={styles.minimapWrapper}>
        <svg viewBox="0 0 190 190" className={styles.trackOutline}>
          <path d={svgPath} />
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
          .sort((a, b) => (a.progress % 1) - (b.progress % 1))
          .map(({ progress, i }) => {
            const n = centerline.length;
            const idx = Math.floor((progress % 1) * n);
            const p = centerline[idx] || centerline[0];
            
            const x = (p[0] - minX) * scale + (190 - width * scale) / 2;
            const y = (p[1] - minY) * scale + (190 - height * scale) / 2;
            
            return (
              <div 
                key={i}
                className={`${styles.carDot} ${i === 0 ? styles.playerDot : ''}`}
                style={{ 
                  left: `${x}px`, 
                  top: `${y}px`,
                  backgroundColor: CAR_COLORS[i],
                  color: CAR_COLORS[i],
                  zIndex: Math.floor(progress * 1000) // Position-based z-index
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
              <span>{TEAM_NAMES[data.i]}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

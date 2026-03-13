'use client';

import { useAppStore } from '@/lib/store';
import { TrackData } from '@/lib/tracks';
import { ProcessedTrack } from '@/lib/useProcessedTrack';
import { TRACKS, predictStrategy, formatLap, Track } from '@/lib/strategyEngine';
import styles from './InfoPanel.module.css';

export default function InfoPanel({
  track,
  processed,
}: {
  track: TrackData;
  processed: ProcessedTrack;
}) {
  const trackMapAppToStrategy: Record<string, Track> = {
    'SPA-FRANCORCHAMPS': 'spa',
    'SILVERSTONE': 'silverstone',
    'BAHRAIN': 'bahrain',
    'MONZA': 'monza',
  };

  const modelTrack = trackMapAppToStrategy[track.name];
  const strategyInput = modelTrack 
    ? { track: modelTrack, tyre: useAppStore((s) => s.tyre), temperature: useAppStore((s) => s.temperature) } 
    : { track: 'monza' as const, tyre: useAppStore((s) => s.tyre), temperature: useAppStore((s) => s.temperature) };

  const strategy = predictStrategy(strategyInput);
  const tireWear = useAppStore((s) => s.allCarsTireWear[0]);
  
  // Use processed speeds for 100% sync with the 3D scene
  const topSpeed = processed.maxSpeed;
  const minSpeed = processed.minSpeed;

  const getTireColor = (w: number) => {
    if (w > 60) return '#39FF14';
    if (w > 30) return '#FF8700';
    return '#E8002D';
  };

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <span className={styles.label}>TRACK NAME</span>
        <span className={styles.value}>{track.name}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.row}>
        <span className={styles.label}>CIRCUIT LENGTH</span>
        <span className={styles.valueGreen}>{track.lengthKm} km</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>CORNERS</span>
        <span className={styles.valueGreen}>{track.corners}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>COMPUTE TIME</span>
        <span className={styles.valueGreen}>{processed.computeMs}ms</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.row}>
        <span className={styles.label}>TOP SPEED</span>
        <span className={styles.valueRed}>{topSpeed} km/h</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>MIN SPEED</span>
        <span className={styles.valueGreen}>{minSpeed} km/h</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>BRAKING ZONES</span>
        <span className={styles.valueRed}>{processed.brakingZones.length}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>THROTTLE ZONES</span>
        <span className={styles.valueGreen}>{processed.throttleZones.length}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.row}>
        <span className={styles.label}>EST. LAP TIME</span>
        <span className={styles.valueBig}>{formatLap(strategy.lapTimeSeconds)}</span>
      </div>

      <div className={styles.divider} />
      <div className={styles.tireSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className={styles.label}>TIRE HEALTH</span>
          <span className={styles.value} style={{ color: getTireColor(tireWear) }}>{Math.round(tireWear)}%</span>
        </div>
        <div className={styles.tireBarBg}>
          <div 
            className={styles.tireBarFill} 
            style={{ 
              width: `${tireWear}%`,
              backgroundColor: getTireColor(tireWear)
            }} 
          />
        </div>
      </div>
    </div>
  );
}

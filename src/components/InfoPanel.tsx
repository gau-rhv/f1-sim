'use client';

import { useAppStore } from '@/lib/store';
import { TrackData, tracks } from '@/lib/tracks';
import { ProcessedTrack } from '@/lib/useProcessedTrack';
import styles from './InfoPanel.module.css';

export default function InfoPanel({
  track,
  processed,
}: {
  track: TrackData;
  processed: ProcessedTrack;
}) {
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
        <span className={styles.valueRed}>{processed.maxSpeed} km/h</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>MIN SPEED</span>
        <span className={styles.valueGreen}>{processed.minSpeed} km/h</span>
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
        <span className={styles.valueBig}>{processed.lapTime}</span>
      </div>
    </div>
  );
}

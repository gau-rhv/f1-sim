'use client';

import { useAppStore } from '@/lib/store';
import { ProcessedTrack } from '@/lib/useProcessedTrack';
import styles from './SpeedLegend.module.css';

export default function SpeedLegend({ processed }: { processed: ProcessedTrack }) {
  const showGradient = useAppStore((s) => s.filters.speedGradient);

  if (!showGradient) return null;

  return (
    <div className={styles.legend}>
      <div className={styles.bar} />
      <div className={styles.labels}>
        <span>{processed.minSpeed} km/h</span>
        <span>{Math.round((processed.minSpeed + processed.maxSpeed) / 2)} km/h</span>
        <span>{processed.maxSpeed} km/h</span>
      </div>
    </div>
  );
}

'use client';

import { useAppStore } from '@/lib/store';
import styles from './FilterStrip.module.css';

const filters = [
  { key: 'racingLine' as const, label: 'RACING LINE', color: '#ffffff' },
  { key: 'speedGradient' as const, label: 'SPEED GRADIENT', color: '#FF8C00' },
  { key: 'brakeZones' as const, label: 'BRAKE ZONES', color: '#FF4444' },
  { key: 'throttleZones' as const, label: 'THROTTLE ZONES', color: '#44FF44' },
  { key: 'apexPoints' as const, label: 'APEX POINTS', color: '#FFD700' },
  { key: 'drsZones' as const, label: 'DRS ZONES', color: '#00D2FF' },
  { key: 'fastZones' as const, label: 'FAST ZONES', color: '#39FF14' },
  { key: 'slowZones' as const, label: 'SLOW ZONES', color: '#7030FF' },
];

export default function FilterStrip() {
  const state = useAppStore((s) => s.filters);
  const toggle = useAppStore((s) => s.toggleFilter);

  return (
    <div className={styles.strip}>
      {filters.map((f) => (
        <button
          key={f.key}
          className={`${styles.btn} ${state[f.key] ? styles.active : ''}`}
          onClick={() => toggle(f.key)}
          style={{ '--dot-color': f.color } as React.CSSProperties}
        >
          <span className={styles.dot} />
          {f.label}
        </button>
      ))}
    </div>
  );
}

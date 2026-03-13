'use client';

import { useAppStore } from '@/lib/store';
import styles from './ControlsHint.module.css';

export default function ControlsHint() {
  const isZoomed = useAppStore((s) => s.isZoomed);
  const setZoomed = useAppStore((s) => s.setZoomed);
  const currentSpeed = useAppStore((s) => s.currentSpeed);
  const currentLap = useAppStore((s) => s.currentLap);

  return (
    <div className={styles.container}>
      {isZoomed && (
        <div className={styles.telemetry}>
          <div className={styles.lapDisplay}>
            <span className={styles.lapLabel}>LAP</span>
            <span className={styles.lapValue}>{currentLap}</span>
            <span className={styles.lapTotal}>/ 70</span>
          </div>
          <div className={styles.speedLabel}>LIVE SPEED</div>
          <div className={styles.speedValue}>
            {Math.round(currentSpeed)}
            <span className={styles.unit}>KM/H</span>
          </div>
          <button className={styles.exitBtn} onClick={() => setZoomed(false)}>
            EXIT ZOOM ✕
          </button>
        </div>
      )}
      <div className={styles.hints}>
        <div className={styles.row}>
          <span className={styles.key}>CLICK TRACK</span>
          <span className={styles.desc}>→ zoom to corner</span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>SCROLL</span>
          <span className={styles.desc}>→ zoom in/out</span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>DRAG</span>
          <span className={styles.desc}>→ rotate view</span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>ESC</span>
          <span className={styles.desc}>→ exit zoom</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAppStore } from '@/lib/store';
import styles from './ControlsHint.module.css';

export default function ControlsHint() {
  const isZoomed = useAppStore((s) => s.isZoomed);
  const setZoomed = useAppStore((s) => s.setZoomed);

  return (
    <div className={styles.container}>
      {isZoomed && (
        <button className={styles.exitBtn} onClick={() => setZoomed(false)}>
          EXIT ZOOM ✕
        </button>
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

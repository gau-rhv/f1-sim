'use client';

import { useAppStore } from '@/lib/store';
import { tracks } from '@/lib/tracks';
import styles from './TrackSelector.module.css';

export default function TrackSelector() {
  const activeTrack = useAppStore((s) => s.activeTrack);
  const setActiveTrack = useAppStore((s) => s.setActiveTrack);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>SELECT CIRCUIT</h2>
      <div className={styles.list}>
        {tracks.map((t) => (
          <button
            key={t.id}
            className={`${styles.item} ${activeTrack === t.name ? styles.active : ''}`}
            onClick={() => setActiveTrack(t.name)}
          >
            <div className={styles.trackInfo}>
              <span className={styles.flag}>{t.flag}</span>
              <div>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.meta}>
                  {t.lengthKm} km · {t.corners} corners
                </span>
              </div>
            </div>
            <span className={styles.lapRecord}>{t.lapRecord}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

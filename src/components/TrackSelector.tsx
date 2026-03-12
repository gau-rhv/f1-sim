'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { tracks } from '@/lib/tracks';
import styles from './TrackSelector.module.css';

export default function TrackSelector() {
  const activeTrack = useAppStore((s) => s.activeTrack);
  const setActiveTrack = useAppStore((s) => s.setActiveTrack);

  return (
    <div className={styles.panel}>
      <div className={styles.list}>
        {tracks.map((t) => {
          const isActive = activeTrack === t.name;
          return (
            <button
              key={t.id}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => setActiveTrack(t.name)}
            >
              <span style={{ marginRight: '6px', fontSize: '13px' }}>{t.flag}</span>
              {t.name}
              
              {isActive && (
                <>
                  <motion.div
                    layoutId="trackSelectorPill"
                    className={styles.activeBg}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                  <motion.div
                    layoutId="trackSelectorIndicator"
                    className={styles.activeIndicator}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

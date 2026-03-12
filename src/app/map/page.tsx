'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { tracks, TrackData } from '@/lib/tracks';
import { processTrack, ProcessedTrack } from '@/lib/useProcessedTrack';
import TrackSelector from '@/components/TrackSelector';
import FilterStrip from '@/components/FilterStrip';
import InfoPanel from '@/components/InfoPanel';
import SpeedLegend from '@/components/SpeedLegend';
import ControlsHint from '@/components/ControlsHint';
import styles from './page.module.css';

const Track3DScene = dynamic(() => import('@/components/Track3DScene'), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <div className={styles.loadingBar} />
      <span className={styles.loadingText}>COMPUTING RACING LINE...</span>
    </div>
  ),
});

export default function MapPage() {
  const activeTrack = useAppStore((s) => s.activeTrack);
  const setZoomed = useAppStore((s) => s.setZoomed);

  const currentTrack: TrackData = useMemo(() => {
    return tracks.find((t) => t.name === activeTrack) || tracks[0];
  }, [activeTrack]);

  const [processed, setProcessed] = useState<ProcessedTrack | null>(null);

  useEffect(() => {
    setProcessed(null);
    const timer = setTimeout(() => {
      setProcessed(processTrack(currentTrack));
    }, 10);
    return () => clearTimeout(timer);
  }, [currentTrack]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setZoomed]);

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <TrackSelector />
        <div className={styles.sceneContainer}>
          {processed ? (
            <>
              <Track3DScene processed={processed} />
              <InfoPanel track={currentTrack} processed={processed} />
              <FilterStrip />
              <SpeedLegend processed={processed} />
            </>
          ) : (
            <div className={styles.loading}>
              <div className={styles.loadingBar} />
              <span className={styles.loadingText}>COMPUTING RACING LINE...</span>
            </div>
          )}
          <ControlsHint />
        </div>
      </div>
    </main>
  );
}
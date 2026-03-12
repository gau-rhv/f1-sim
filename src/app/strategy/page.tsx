'use client';

import { useMemo } from 'react';
import { Gauge, Thermometer, Flag, Timer } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  TRACKS,
  TYRES,
  Track,
  TyreCompound,
  predictStrategy,
  formatLap,
  formatRaceTime,
} from '@/lib/strategyEngine';
import styles from './page.module.css';

const DRY_TYRES: TyreCompound[] = ['dry-soft', 'dry-medium', 'dry-hard'];
const WET_TYRES: TyreCompound[] = ['wet-fullwet', 'wet-intermediate'];

export default function StrategyPage() {
  const activeTrackName = useAppStore((s) => s.activeTrack);
  const setActiveTrackName = useAppStore((s) => s.setActiveTrack);

  const trackMapAppToStrategy: Record<string, Track> = {
    'SPA-FRANCORCHAMPS': 'spa',
    'SILVERSTONE': 'silverstone',
    'BAHRAIN': 'bahrain',
    'MONZA': 'monza',
  };

  const trackMapStrategyToApp: Record<Track, string> = {
    spa: 'SPA-FRANCORCHAMPS',
    silverstone: 'SILVERSTONE',
    bahrain: 'BAHRAIN',
    monza: 'MONZA',
  };

  const track: Track = trackMapAppToStrategy[activeTrackName] || 'spa';
  const tyre = useAppStore((s) => s.tyre);
  const setTyre = useAppStore((s) => s.setTyre);
  const temperature = useAppStore((s) => s.temperature);
  const setTemperature = useAppStore((s) => s.setTemperature);

  const currentTrack = TRACKS[track];

  const result = useMemo(() => {
    return predictStrategy({ track, tyre, temperature });
  }, [track, tyre, temperature]);

  const setPresetTemp = (mode: 'cool' | 'mid' | 'hot') => {
    if (mode === 'cool') setTemperature(currentTrack.tempMin);
    if (mode === 'mid') setTemperature(Math.round((currentTrack.tempMin + currentTrack.tempMax) / 2));
    if (mode === 'hot') setTemperature(currentTrack.tempMax);
  };

  return (
    <main className={styles.main}>
      <div className={styles.backdrop} />

      <section className={styles.header}>
        <p className={styles.kicker}>F1 Strategy Predictor</p>
        <h1>Race Setup Intelligence</h1>
        <p className={styles.headerText}>
          Configure track, tyre and temperature to generate an optimal race strategy profile.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <h2>Configuration</h2>

          <label className={styles.label}>Track</label>
          <select
            className={styles.select}
            value={track}
            onChange={(e) => {
              const nextTrack = e.target.value as Track;
              setActiveTrackName(trackMapStrategyToApp[nextTrack]);
              setTemperature(Math.round((TRACKS[nextTrack].tempMin + TRACKS[nextTrack].tempMax) / 2));
            }}
          >
            {(Object.keys(TRACKS) as Track[]).map((key) => (
              <option key={key} value={key}>
                {TRACKS[key].name}
              </option>
            ))}
          </select>

          <div className={styles.tyreBlock}>
            <label className={styles.label}>Dry Tyres</label>
            <div className={styles.chips}>
              {DRY_TYRES.map((compound) => (
                <button
                  key={compound}
                  type="button"
                  className={`${styles.chip} ${tyre === compound ? styles.chipActive : ''}`}
                  onClick={() => setTyre(compound)}
                >
                  {TYRES[compound].name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tyreBlock}>
            <label className={styles.label}>Wet Tyres</label>
            <div className={styles.chips}>
              {WET_TYRES.map((compound) => (
                <button
                  key={compound}
                  type="button"
                  className={`${styles.chip} ${tyre === compound ? styles.chipActive : ''}`}
                  onClick={() => setTyre(compound)}
                >
                  {TYRES[compound].name}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.label}>Track Temperature: {temperature}C</label>
          <div className={styles.sliderContainer}>
            <span className={styles.sliderLabel}>{currentTrack.tempMin}C</span>
            <input
              className={styles.slider}
              type="range"
              min={currentTrack.tempMin}
              max={currentTrack.tempMax}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
            <span className={styles.sliderLabel}>{currentTrack.tempMax}C</span>
          </div>

          <div className={styles.presets}>
            <button type="button" onClick={() => setPresetTemp('cool')}>
              Cool
            </button>
            <button type="button" onClick={() => setPresetTemp('mid')}>
              Mid
            </button>
            <button type="button" onClick={() => setPresetTemp('hot')}>
              Hot
            </button>
          </div>
        </article>

        <div className={styles.carWrapper}>
          <img 
            src="/f1car.png" 
            alt="F1 Car" 
            className={styles.carImage} 
          />
        </div>

        <article className={styles.panel}>
          <h2>Simulation Output</h2>
          <p className={styles.strategyLabel}>{result.strategyLabel}</p>

          <div className={styles.metrics}>
            <div className={styles.metricCard}>
              <Timer size={16} />
              <span>Lap Time</span>
              <strong>{formatLap(result.lapTimeSeconds)}</strong>
            </div>

            <div className={styles.metricCard}>
              <Flag size={16} />
              <span>Race Time</span>
              <strong>{formatRaceTime(result.raceTimeSeconds)}</strong>
            </div>

            <div className={styles.metricCard}>
              <Gauge size={16} />
              <span>Top Speed</span>
              <strong>{result.topSpeed} km/h</strong>
            </div>

            <div className={styles.metricCard}>
              <Thermometer size={16} />
              <span>Temperature Window</span>
              <strong>
                {currentTrack.tempMin}C to {currentTrack.tempMax}C
              </strong>
            </div>
          </div>

          <div className={styles.recommendation}>
            <p className={styles.label}>Strategy Recommendation</p>
            <p>{result.recommendation}</p>
          </div>
        </article>
      </section>
    </main>
  );
}
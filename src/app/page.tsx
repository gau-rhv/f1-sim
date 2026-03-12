"use client";

import RotatingText from '@/components/RotatingText';
import StrategySection from '@/components/StrategySection';
import MapSection from '@/components/MapSection';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* Hero / Tracks Section */}
      <section id="tracks" className={styles.main}>
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden="true"
        >
          <source src="/Video Project.mp4" type="video/mp4" />
        </video>

        <div className={styles.overlay} />

        <div className={styles.heroCard}>
          <RotatingText
            lines={[
              'Precision Racing Line',
              'Master Every Turn',
              'Optimal Lap Analysis',
              'Real Physics Simulation',
              'Advanced Track Intelligence'
            ]}
            delay={4000}
            className={styles.title}
          />
          <p className={styles.subtitle}>
            Precision racing-line intelligence, cinematic telemetry, and track-first analytics.
          </p>
          <a
            href="#map"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={styles.cta}
          >
            Open Race Map
          </a>
        </div>
      </section>

      {/* Strategy Section */}
      <StrategySection />

      {/* Map Section */}
      <MapSection />
    </div>
  );
}

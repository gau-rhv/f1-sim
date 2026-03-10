'use client';

import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoMain}>RACELINE</span>
        <span className={styles.logoAccent}>IQ</span>
        <span className={styles.logoDot}>•</span>
      </div>
      <div className={styles.links}>
        <span className={styles.linkActive}>TRACKS</span>
      </div>
      <div className={styles.session}>
        <span className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          LIVE
        </span>
      </div>
    </nav>
  );
}

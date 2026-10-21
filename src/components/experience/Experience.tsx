import styles from './Experience.module.css';

export default function Experience() {
  return (
    <div className={styles.stage}>
      <div className={styles.loading} role="status">
        <div className={styles.loader} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Preparing the stand…</p>
        <span>
          The interactive scene is being set up. Your work navigation is ready.
        </span>
      </div>
    </div>
  );
}

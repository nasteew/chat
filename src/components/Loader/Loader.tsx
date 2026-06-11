import styles from './Loader.module.css';

export function Loader() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.text}>Loading…</p>
    </div>
  );
}

import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): React.ReactElement {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <img src="/assets/Logo.svg" alt="Logo" />
      </Link>
    </header>
  );
}

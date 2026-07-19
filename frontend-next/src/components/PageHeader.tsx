import Image from 'next/image';
import { BLUR } from '@/lib/blur';
import styles from './PageHeader.module.scss';

export default function PageHeader({ title, image }: { title: string; image?: string }) {
  return (
    <header className={styles.header}>
      {image && (
        <div className={styles.bg} aria-hidden>
          <Image src={image} alt="" fill priority sizes="100vw" placeholder="blur" blurDataURL={BLUR} />
        </div>
      )}
      <div className={styles.overlay} aria-hidden />
      <div className="container">
        <h1 className={styles.title}>{title}</h1>
      </div>
    </header>
  );
}

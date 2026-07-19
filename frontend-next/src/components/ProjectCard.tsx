import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Project, Locale } from '@/lib/types';
import { t } from '@/lib/i18n';
import { projectHref } from '@/lib/utils';
import { BLUR } from '@/lib/blur';
import styles from './ProjectCard.module.scss';

export default function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const href = projectHref(project, locale);
  const dict = t(locale).projects;
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.image}>
        {project.coverSmall ? (
          <Image
            src={project.coverSmall}
            alt={project.title}
            fill
            sizes="(max-width: 700px) 100vw, 380px"
            placeholder="blur"
            blurDataURL={BLUR}
          />
        ) : (
          <span className={styles.placeholder} aria-hidden>
            {project.title.charAt(0)}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{project.title}</h2>
        {project.summary && <p className={styles.summary}>{project.summary}</p>}
        <span className={styles.more}>
          {dict.learnMore} <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

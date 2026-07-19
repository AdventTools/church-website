import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import ProjectSections from '@/components/ProjectSections';
import { getProjectBySlug, getProjectByOldSlug, getProject, getAllProjects } from '@/lib/strapi';
import { detailSeg, legacyId } from '@/lib/utils';
import { pageMetadata, absoluteUrl, SITE_URL, SITE_NAME } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { t, localePath, isLocale } from '@/lib/i18n';
import { BLUR } from '@/lib/blur';
import type { Project, Locale } from '@/lib/types';
import styles from './project.module.scss';

export const revalidate = 60;

// Rezolvă din segment: slug curat (canonic) sau id vechi „{id}-{titlu}” → redirect 301 la slug.
async function resolveProject(seg: string, locale: Locale): Promise<{ project: Project | null; redirectTo: string | null }> {
  const bySlug = await getProjectBySlug(seg, locale);
  if (bySlug) return { project: bySlug, redirectTo: null };
  const byOld = await getProjectByOldSlug(seg, locale);
  if (byOld?.slug) return { project: byOld, redirectTo: `/proiecte/${byOld.slug}` };
  const id = legacyId(seg);
  if (id) {
    const byId = await getProject(id);
    if (byId) return { project: byId, redirectTo: byId.slug ? `/proiecte/${byId.slug}` : null };
  }
  return { project: null, redirectTo: null };
}

function projectLanguages(p: Project, locale: Locale): Record<string, string> {
  const seg = detailSeg(p);
  const self = p.locale ?? locale;
  const urls: Record<string, string> = { [self]: absoluteUrl(localePath(self, `/proiecte/${seg}`)) };
  if (p.alt) urls[p.alt.locale] = absoluteUrl(localePath(p.alt.locale, `/proiecte/${p.alt.slug || seg}`));
  return { ...urls, 'x-default': urls.ro ?? urls[self] };
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const locale: Locale = isLocale(params.lang) ? params.lang : 'ro';
  const projects = await getAllProjects(locale);
  return projects.map((p) => ({ idAndTitle: detailSeg(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; idAndTitle: string }>;
}): Promise<Metadata> {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const { project } = await resolveProject(idAndTitle, locale);
  if (!project) {
    return { title: locale === 'en' ? 'Project' : 'Proiect', robots: { index: false, follow: false } };
  }
  const description = (project.summary || project.content || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  return pageMetadata({
    locale,
    title: project.title,
    description,
    path: `/proiecte/${detailSeg(project)}`,
    image: project.coverLarge || project.coverSmall,
    type: 'article',
    languages: projectLanguages(project, locale),
  });
}

export default async function ProjectDetail({ params }: { params: Promise<{ lang: string; idAndTitle: string }> }) {
  const { lang, idAndTitle } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'ro';
  const dict = t(locale);
  const { project, redirectTo } = await resolveProject(idAndTitle, locale);
  if (!project) notFound();
  if (redirectTo) permanentRedirect(localePath(locale, redirectTo));

  const seg = detailSeg(project);
  const cover = project.coverLarge || project.coverSmall;
  const backText = locale === 'en' ? 'Back to projects' : 'Înapoi la proiecte';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Project',
    name: project.title,
    description: (project.summary || project.content).replace(/\s+/g, ' ').trim().slice(0, 500),
    ...(cover ? { image: absoluteUrl(cover) } : {}),
    ...(project.externalUrl ? { url: project.externalUrl } : {}),
    parentOrganization: { '@type': 'Church', '@id': `${SITE_URL}/#church`, name: SITE_NAME },
  };

  return (
    <>
      <JsonLd
        data={[
          jsonLd,
          breadcrumbJsonLd([
            { name: dict.nav.home, path: localePath(locale, '/') },
            { name: dict.projects.title, path: localePath(locale, '/proiecte') },
            { name: project.title, path: localePath(locale, `/proiecte/${seg}`) },
          ]),
        ]}
      />

      <header className={styles.head}>
        <div className="container">
          <Link href={localePath(locale, '/proiecte')} className={styles.back}>
            <ArrowLeft size={18} /> {backText}
          </Link>
          <h1 className={styles.title}>{project.title}</h1>
          {project.summary && <p className={styles.summary}>{project.summary}</p>}
        </div>
      </header>

      {cover && (
        <div className={styles.coverWrap}>
          <div className="container">
            <Image
              className={styles.cover}
              src={cover}
              alt={project.title}
              width={project.coverWidth ?? 1200}
              height={project.coverHeight ?? 800}
              sizes="(max-width: 820px) 100vw, 820px"
              placeholder="blur"
              blurDataURL={BLUR}
              priority
            />
          </div>
        </div>
      )}

      <article className={`container ${styles.article}`}>
        {project.content && <div className={styles.content}>{project.content}</div>}
        {project.externalUrl && (
          <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className={`btn ${styles.cta}`}>
            {dict.projects.visitSite} <ExternalLink size={18} />
          </a>
        )}
      </article>

      {project.ensembles && project.ensembles.length > 0 && (
        <div className={`container ${styles.article}`}>
          <ProjectSections sections={project.ensembles} locale={locale} />
        </div>
      )}
    </>
  );
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './Markdown.module.scss';

// Randează conținutul scris în editorul din CMS (Markdown: titluri, îngroșat, liste, citate, poze, tabele).
export default function Markdown({ children }: { children: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* eslint-disable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
          img: ({ node, ...props }: any) => <img loading="lazy" decoding="async" {...props} alt={props.alt || ''} />,
          a: ({ node, ...props }: any) => {
            const external = typeof props.href === 'string' && /^https?:\/\//.test(props.href);
            return <a {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />;
          },
          /* eslint-enable @typescript-eslint/no-explicit-any, jsx-a11y/alt-text */
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

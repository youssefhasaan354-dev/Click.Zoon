import { useEffect } from 'react';

/**
 * Reusable hook to set <meta name="robots" content="noindex,nofollow"> while mounted,
 * optionally sets a page title, and restores previous robots meta and title on unmount.
 */
export function useNoIndex(title?: string) {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const createdByUs = !meta;
    const previousContent = meta?.getAttribute('content') ?? null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex,nofollow');

    const previousTitle = document.title;
    if (title) {
      document.title = title;
    }

    return () => {
      if (createdByUs && meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      } else if (meta && previousContent !== null) {
        meta.setAttribute('content', previousContent);
      } else if (meta) {
        meta.removeAttribute('content');
      }

      if (title) {
        document.title = previousTitle;
      }
    };
  }, [title]);
}

/**
 * Reusable hook to set document.title while mounted and restore previous title on unmount.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export default useNoIndex;

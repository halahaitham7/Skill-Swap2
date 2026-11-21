import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top on page change, or to the #hash target when there is one. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section has rendered.
      const id = decodeURIComponent(hash.slice(1));
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(frame);
    }
    // "instant" bypasses the global smooth-scroll so new pages open at the top.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return undefined;
  }, [pathname, hash]);

  return null;
}

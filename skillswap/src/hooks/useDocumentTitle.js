import { useEffect } from 'react';

/** Sets the browser tab title while a page is mounted. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – SkillSwap` : 'SkillSwap – Learn, Teach & Grow Together';
  }, [title]);
}

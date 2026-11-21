import { MATCH_LABELS } from '../utils/matching.js';

/** Butter Yellow is reserved for perfect matches; everything else is quiet. */
export default function MatchTag({ type }) {
  const cls = type === 'perfect' ? 'tag tag-match' : type === 'other' ? 'tag tag-quiet' : 'tag tag-soft';
  return <span className={cls}>{MATCH_LABELS[type]}</span>;
}

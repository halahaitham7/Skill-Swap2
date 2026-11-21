import { Link } from 'react-router-dom';

/** Wordmark: two arrows (teach out, learn back) plus "skillswap". */
export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="SkillSwap home">
      <svg className="logo-mark" width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="14" fill="#203B3A" />
        <g fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 23h28l-8-8" stroke="#3D9B8F" />
          <path d="M46 41H18l8 8" stroke="#F2D27A" />
        </g>
      </svg>
      <span className="logo-text">
        skill<span>swap</span>
      </span>
    </Link>
  );
}

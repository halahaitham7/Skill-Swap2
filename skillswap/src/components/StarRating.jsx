const WORDS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

function Star({ size, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"
        fill={filled ? '#F2D27A' : 'none'}
        stroke="#203B3A"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Read-only when `onChange` is omitted; otherwise five accessible star buttons. */
export default function StarRating({ value, onChange, size = 30 }) {
  if (!onChange) {
    const rounded = Math.round(value);
    return (
      <span className="row" style={{ gap: 2 }} role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} filled={n <= rounded} />
        ))}
      </span>
    );
  }

  return (
    <div role="group" aria-label="Rating" className="row" style={{ gap: 0 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" className="icon-btn" aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={value === n} onClick={() => onChange(n)}>
          <Star size={size} filled={n <= value} />
        </button>
      ))}
      <span style={{ marginLeft: 8, fontWeight: 700 }}>{WORDS[value]}</span>
    </div>
  );
}

/** Small inline "★ 4.9 (32)" summary. */
export function RatingSummary({ rating, count }) {
  return (
    <span className="row small" style={{ gap: 4, fontWeight: 600 }}>
      <Star size={16} filled />
      {Number(rating).toFixed(1)}
      {count != null && <span className="muted" style={{ fontWeight: 400 }}>({count})</span>}
    </span>
  );
}

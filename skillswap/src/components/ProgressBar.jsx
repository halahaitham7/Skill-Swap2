export default function ProgressBar({ value, label, onDark = false }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`progress${onDark ? ' on-dark' : ''}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

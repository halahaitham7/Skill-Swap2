/**
 * A group of toggle buttons. Single-select when `value` is a string or number,
 * multi-select when it is an array. Styling comes from aria-pressed.
 */
export default function ToggleGroup({ options, value, onChange, label, size = '', className = '' }) {
  const multiple = Array.isArray(value);
  const items = options.map((opt) => (typeof opt === 'object' ? opt : { value: opt, label: String(opt) }));
  const isOn = (v) => (multiple ? value.includes(v) : value === v);

  const handle = (v) => {
    if (!multiple) return onChange(v);
    return onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div role="group" aria-label={label} className={`row ${className}`} style={{ gap: 8 }}>
      {items.map((item) => (
        <button key={item.value} type="button" className={`toggle ${size}`} aria-pressed={isOn(item.value)} onClick={() => handle(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

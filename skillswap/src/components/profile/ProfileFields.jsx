import { useState } from 'react';
import Avatar from '../Avatar.jsx';
import Icon from '../Icon.jsx';
import ToggleGroup from '../ToggleGroup.jsx';
import { DAYS, LEVELS, SUGGESTED_SKILLS, TIMES } from '../../data/skills.js';
import { useApp } from '../../context/AppContext.jsx';

/** Resizes an uploaded image to fit inside 512 px so it fits in browser storage. */
function resizeImage(file, max = 512) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoField({ name, palette, value, onChange }) {
  const { notify } = useApp();

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file (JPG or PNG).', 'warning');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify('That image is over 8 MB. Please choose a smaller one.', 'warning');
      return;
    }
    try {
      onChange(await resizeImage(file));
    } catch {
      notify("We couldn't read that image. Please try another.", 'warning');
    }
  };

  return (
    <div className="row" style={{ gap: 20 }}>
      <Avatar name={name || '?'} palette={palette} src={value} size={96} />
      <div className="stack" style={{ gap: 8 }}>
        <div className="row" style={{ gap: 8 }}>
          <label className="btn btn-secondary file-button">
            <input type="file" accept="image/*" className="sr-only" onChange={pick} />
            <Icon name="upload" size={18} /> {value ? 'Change photo' : 'Upload a photo'}
          </label>
          {value && (
            <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>
              Remove
            </button>
          )}
        </div>
        <span className="field-hint">A clear photo of your face helps people trust you. JPG or PNG.</span>
      </div>
    </div>
  );
}

/** Add skills (suggestions or typed), each with a level. */
export function SkillEditor({ kind, skills, onChange, exclude = [] }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const teach = kind === 'teach';
  const has = (name) => skills.some((s) => s.name.toLowerCase() === name.toLowerCase());

  const add = (raw) => {
    const name = raw.trim();
    if (!name) {
      setError('Type a skill first.');
      return;
    }
    if (has(name)) {
      setError('You already added that one.');
      return;
    }
    if (exclude.some((x) => x.toLowerCase() === name.toLowerCase())) {
      setError(teach ? "That's on your learning list. Remove it there first." : "That's on your teaching list. Remove it there first.");
      return;
    }
    onChange([...skills, { name, level: teach ? 'Intermediate' : 'Beginner' }]);
    setDraft('');
    setError('');
  };

  const suggestions = SUGGESTED_SKILLS.filter((s) => !has(s) && !exclude.some((x) => x.toLowerCase() === s.toLowerCase())).slice(0, 10);

  return (
    <div className="stack" style={{ gap: 16 }}>
      {skills.length > 0 && (
        <ul className="skill-list">
          {skills.map((skill, index) => (
            <li key={skill.name}>
              <span className={`chip ${teach ? 'chip-teach hit' : 'chip-learn hit'}`} style={{ fontSize: 16 }}>
                <span className="arrow" aria-hidden="true">
                  {teach ? '↗' : '↙'}
                </span>
                {skill.name}
              </span>
              <div className="row" style={{ gap: 6 }}>
                <span className="sr-only">{teach ? 'Your level' : 'Your current level'} in {skill.name}</span>
                <ToggleGroup
                  label={`${skill.name} level`}
                  options={LEVELS}
                  value={skill.level}
                  size="sm"
                  onChange={(level) => onChange(skills.map((s, i) => (i === index ? { ...s, level } : s)))}
                />
                <button type="button" className="icon-btn" aria-label={`Remove ${skill.name}`} onClick={() => onChange(skills.filter((_, i) => i !== index))}>
                  <Icon name="close" size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <span className="field-label">Popular choices</span>
          <div className="row" style={{ gap: 8 }}>
            {suggestions.map((s) => (
              <button key={s} type="button" className="toggle sm" onClick={() => add(s)}>
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="row" style={{ alignItems: 'flex-end', gap: 8 }}>
        <label className="field" style={{ flex: '1 1 240px' }}>
          <span className="field-label">Something else?</span>
          <input
            className="input"
            type="text"
            placeholder={teach ? 'e.g. Calligraphy' : 'e.g. Public speaking'}
            value={draft}
            aria-invalid={!!error}
            onChange={(e) => {
              setDraft(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add(draft);
              }
            }}
          />
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => add(draft)}>
          Add
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export const METHOD_OPTIONS = [
  { value: 'Online', label: 'Online' },
  { value: 'In person', label: 'In person (offline)' },
  { value: 'Both', label: 'Either is fine' },
];

export function AvailabilityFields({ days, times, method, onChange }) {
  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="stack" style={{ gap: 8 }}>
        <span className="field-label">Which days usually work?</span>
        <ToggleGroup label="Available days" options={DAYS} value={days} onChange={(v) => onChange({ days: v })} />
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <span className="field-label">What time of day?</span>
        <ToggleGroup label="Available times" options={TIMES} value={times} onChange={(v) => onChange({ times: v })} />
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <span className="field-label">How would you like to meet?</span>
        <ToggleGroup label="Preferred learning method" options={METHOD_OPTIONS} value={method} onChange={(v) => onChange({ method: v })} />
      </div>
    </div>
  );
}

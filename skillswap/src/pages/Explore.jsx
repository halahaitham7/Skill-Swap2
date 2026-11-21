import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import PersonRow from '../components/PersonRow.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useMatches } from '../hooks/useMatches.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CATEGORIES, LEVELS, WHEN_FILTERS } from '../data/skills.js';
import { createSeedState } from '../data/seed.js';
import { USERS } from '../data/users.js';
import { availableWhen, describeAvailability, explainMatch, rankUsers, teachesAtLevel, userCategories } from '../utils/matching.js';
import './Explore.css';

const CATEGORY_OPTIONS = ['All skills', ...CATEGORIES.map((c) => c.name)];
const LEVEL_OPTIONS = ['Any level', ...LEVELS];
const METHOD_OPTIONS = ['Online or in person', 'Online', 'In person'];
const MAX_COMPARE = 3;
const SAMPLE_PROFILE = createSeedState().profile;

function CompareDialog({ rows, onClose, viewer }) {
  return (
    <Modal title="Compare side by side" onClose={onClose}>
      <div style={{ overflowX: 'auto' }}>
        <table className="compare-table" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Detail</span>
              </th>
              {rows.map(({ user }) => (
                <th key={user.id} scope="col">
                  <Link to={`/profile/${user.id}`} onClick={onClose}>
                    {user.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Teaches', (u) => u.teaches.map((s) => `${s.name} (${s.level})`).join(', ')],
              ['Wants', (u) => u.wants.map((s) => s.name).join(', ')],
              ['Why', (u, m) => explainMatch(u, m, viewer)],
              ['Meets', (u) => (u.method === 'Both' ? 'Online or in person' : u.method)],
              ['Free', (u) => describeAvailability(u.availability)],
              ['Rating', (u) => `${u.rating.toFixed(1)} from ${u.reviewCount} reviews`],
            ].map(([label, get]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {rows.map(({ user, match }) => (
                  <td key={user.id}>{get(user, match)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export default function Explore() {
  useDocumentTitle('Explore Skills');
  const { state } = useApp();
  const member = state.signedIn && state.profile.onboarded;
  const memberRanked = useMatches();
  // Visitors browse with example match labels from the sample member's point of view.
  const ranked = useMemo(() => (member ? memberRanked : rankUsers(SAMPLE_PROFILE, USERS)), [member, memberRanked]);

  const [params, setParams] = useSearchParams();
  const [level, setLevel] = useState('Any level');
  const [when, setWhen] = useState('Any time');
  const [method, setMethod] = useState('Online or in person');
  const [perfectOnly, setPerfectOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [compare, setCompare] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = params.get('q') || '';
  const category = CATEGORY_OPTIONS.includes(params.get('category')) ? params.get('category') : 'All skills';

  const setParam = (key, value, fallback) => {
    const next = new URLSearchParams(params);
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter(({ user, match }) => {
      if (category !== 'All skills' && !userCategories(user).includes(category)) return false;
      if (!teachesAtLevel(user, level)) return false;
      if (!availableWhen(user, when)) return false;
      if (method !== 'Online or in person' && user.method !== method && user.method !== 'Both') return false;
      if (perfectOnly && !match.perfect) return false;
      if (savedOnly && !state.favorites.includes(user.id)) return false;
      if (q) {
        const hay = [user.name, user.location, ...user.teaches.map((s) => s.name), ...user.wants.map((s) => s.name)].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ranked, query, category, level, when, method, perfectOnly, savedOnly, state.favorites]);

  const activeFilters = [category !== 'All skills', level !== 'Any level', when !== 'Any time', method !== 'Online or in person', perfectOnly, savedOnly, !!query].filter(Boolean).length;

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true });
    setLevel('Any level');
    setWhen('Any time');
    setMethod('Online or in person');
    setPerfectOnly(false);
    setSavedOnly(false);
  };

  const toggleCompare = (id) => setCompare((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length >= MAX_COMPARE ? list : [...list, id]));
  const compareRows = ranked.filter(({ user }) => compare.includes(user.id));

  return (
    <div className="container page">
      <div className="page-head">
        <div className="stack">
          <h1 className="h1">Explore Skills</h1>
          <p className="muted">
            {member ? (
              <>
                Best matches first, based on what you teach ({state.profile.teach.map((s) => s.name).join(', ')}) and want to learn (
                {state.profile.learn.map((s) => s.name).join(', ')}).
              </>
            ) : (
              <>
                Browse freely. Match labels show an example for Sara. <Link to="/signup">Sign up</Link> to see your own.
              </>
            )}
          </p>
        </div>
      </div>

      <section className={`filter-bar${filtersOpen ? '' : ' collapsed'}`} aria-label="Search and filters">
        <div className="filter-grid">
          <label className="field search-field">
            <span className="field-label">Search</span>
            <span className="input-icon">
              <Icon name="search" size={20} />
              <input className="input" type="search" placeholder="Skill or name, e.g. Python" value={query} onChange={(e) => setParam('q', e.target.value, '')} />
            </span>
          </label>
          <label className="field filter-more">
            <span className="field-label">Category</span>
            <select className="input" value={category} onChange={(e) => setParam('category', e.target.value, 'All skills')}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field filter-more">
            <span className="field-label">Their level</span>
            <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVEL_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field filter-more">
            <span className="field-label">When</span>
            <select className="input" value={when} onChange={(e) => setWhen(e.target.value)}>
              {WHEN_FILTERS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field filter-more">
            <span className="field-label">Meet</span>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHOD_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c === 'In person' ? 'In person (offline)' : c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter-extras">
          <button type="button" className="btn btn-ghost btn-sm filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}>
            <Icon name="filter" size={18} /> {filtersOpen ? 'Hide filters' : 'More filters'}
          </button>
          {member && (
            <label className="checkbox filter-more">
              <input type="checkbox" checked={perfectOnly} onChange={(e) => setPerfectOnly(e.target.checked)} />
              Perfect matches only
            </label>
          )}
          {member && (
            <label className="checkbox filter-more">
              <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
              Saved people only
            </label>
          )}
        </div>
      </section>

      <div className="results-head">
        <p aria-live="polite">
          <strong>
            {results.length} {results.length === 1 ? 'person' : 'people'}
          </strong>{' '}
          <span className="muted">· best match first</span>
        </p>
        {activeFilters > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div>
          {results.map(({ user, match }) => (
            <PersonRow key={user.id} user={user} match={match} viewer={member ? undefined : 'Sara'} comparing={compare.includes(user.id)} compareDisabled={compare.length >= MAX_COMPARE} onToggleCompare={toggleCompare} />
          ))}
        </div>
      ) : (
        <div className="empty center">
          <strong className="h3">Nobody matches those filters yet</strong>
          <p className="muted">Try another category or time, or clear the filters to see everyone.</p>
          <button type="button" className="btn btn-secondary" onClick={reset}>
            Clear filters
          </button>
        </div>
      )}

      {compare.length > 0 && (
        <div className="compare-dock" role="region" aria-label="Comparison">
          <span>
            <strong>{compare.length}</strong> of {MAX_COMPARE} selected to compare
          </span>
          <span className="row" style={{ gap: 6 }}>
            <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--cream)', textDecorationColor: 'var(--butter)' }} onClick={() => setCompare([])}>
              Clear
            </button>
            <button type="button" className="btn btn-on-dark btn-sm" disabled={compare.length < 2} onClick={() => setComparing(true)}>
              Compare{compare.length < 2 ? ' (pick 2+)' : ''}
            </button>
          </span>
        </div>
      )}
      {comparing && <CompareDialog rows={compareRows} viewer={member ? undefined : 'Sara'} onClose={() => setComparing(false)} />}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import SkillChip from '../components/SkillChip.jsx';
import { AvailabilityFields, PhotoField, SkillEditor } from '../components/profile/ProfileFields.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { DAYS, TIMES } from '../data/skills.js';
import { getUser } from '../data/users.js';
import './Auth.css';
import './MyProfile.css';

export default function MyProfile() {
  useDocumentTitle('My Profile');
  const { state, updateProfile, notify, unblockUser } = useApp();
  const [form, setForm] = useState(() => ({ ...state.profile }));
  const [errors, setErrors] = useState({});

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(state.profile), [form, state.profile]);
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  const save = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.teach.length) next.teach = 'Add at least one skill you can teach.';
    if (!form.learn.length) next.learn = 'Add at least one skill you want to learn.';
    if (!form.days.length || !form.times.length) next.availability = 'Pick at least one day and one time of day.';
    setErrors(next);
    if (Object.keys(next).length) {
      notify('Please fix the highlighted sections.', 'warning');
      return;
    }
    updateProfile({ ...form, name: form.name.trim() });
    notify('Profile saved. Your matches have been updated.');
  };

  const days = DAYS.filter((d) => form.days.includes(d));
  const times = TIMES.filter((t) => form.times.includes(t));

  return (
    <div className="container page">
      <div className="page-head">
        <div className="stack">
          <h1 className="h1">My Profile</h1>
          <p className="muted">This is what other members see. Changes update your matches straight away.</p>
        </div>
      </div>

      <form className="split" onSubmit={save} noValidate>
        <div className="main" style={{ gap: 0 }}>
          <section className="edit-section" aria-labelledby="sec-you">
            <h2 id="sec-you" className="h2">
              About you
            </h2>
            <PhotoField name={form.name} palette={form.palette} value={form.avatar} onChange={(avatar) => patch({ avatar })} />
            <div className="grid-fit" style={{ '--min': '220px' }}>
              <label className="field">
                <span className="field-label">Full name</span>
                <input className="input" value={form.name} aria-invalid={!!errors.name} onChange={(e) => patch({ name: e.target.value })} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </label>
              <label className="field">
                <span className="field-label">
                  City <span className="optional">(optional)</span>
                </span>
                <input className="input" value={form.location} placeholder="City, Country" onChange={(e) => patch({ location: e.target.value })} />
              </label>
            </div>
            <label className="field">
              <span className="field-label">Short bio</span>
              <textarea className="input" rows={3} maxLength={280} value={form.bio} onChange={(e) => patch({ bio: e.target.value })} />
              <span className="field-hint">{280 - form.bio.length} characters left</span>
            </label>
          </section>

          <section className="edit-section" aria-labelledby="sec-teach">
            <h2 id="sec-teach" className="h2">
              Skills I can teach
            </h2>
            <SkillEditor kind="teach" skills={form.teach} onChange={(teach) => patch({ teach })} exclude={form.learn.map((s) => s.name)} />
            {errors.teach && <span className="field-error">{errors.teach}</span>}
          </section>

          <section className="edit-section" aria-labelledby="sec-learn">
            <h2 id="sec-learn" className="h2">
              Skills I want to learn
            </h2>
            <SkillEditor kind="learn" skills={form.learn} onChange={(learn) => patch({ learn })} exclude={form.teach.map((s) => s.name)} />
            {errors.learn && <span className="field-error">{errors.learn}</span>}
          </section>

          <section className="edit-section" aria-labelledby="sec-when">
            <h2 id="sec-when" className="h2">
              Availability
            </h2>
            <AvailabilityFields days={form.days} times={form.times} method={form.method} onChange={patch} />
            {errors.availability && <span className="field-error">{errors.availability}</span>}
          </section>

          <div className="save-bar">
            <span className="small muted">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
            <div className="row" style={{ gap: 8 }}>
              {dirty && (
                <button type="button" className="btn btn-ghost" onClick={() => setForm({ ...state.profile })}>
                  Discard
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={!dirty}>
                Save changes
              </button>
            </div>
          </div>
        </div>

        <aside className="side">
          <section className="profile-preview" aria-label="Preview of your profile">
            <span className="label">How others see you</span>
            <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
              <Avatar name={form.name} palette={form.palette} src={form.avatar} size={64} />
              <span className="stack" style={{ gap: 0 }}>
                <strong className="h3">{form.name || 'Your name'}</strong>
                <span className="small muted">
                  {form.location || 'City not shown'} · {form.method === 'Both' ? 'Online or in person' : form.method}
                </span>
              </span>
            </div>
            {form.bio && <p className="small">{form.bio}</p>}
            <div className="row" style={{ gap: 6 }}>
              {form.teach.map((s) => (
                <SkillChip key={s.name} name={s.name} kind="teach" level={s.level} hit />
              ))}
              {form.learn.map((s) => (
                <SkillChip key={s.name} name={s.name} kind="learn" level={s.level} hit />
              ))}
            </div>
            <span className="small muted">
              Free: {days.length ? days.join(', ') : 'no days yet'}
              {times.length ? ` · ${times.join(', ').toLowerCase()}` : ''}
            </span>
          </section>

          <section className="stack" style={{ gap: 8 }} id="blocked">
            <h2 className="h3">Blocked members</h2>
            {state.blocked.length === 0 && <p className="small muted">You haven't blocked anyone.</p>}
            {state.blocked.map((id) => {
              const u = getUser(id);
              return (
                <div key={id} className="row-between">
                  <span className="row" style={{ gap: 8 }}>
                    <Avatar name={u.name} palette={u.palette} size={32} />
                    <span className="small">{u.name}</span>
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => unblockUser(id)}>
                    Unblock
                  </button>
                </div>
              );
            })}
          </section>

          <section className="stack" style={{ gap: 8 }}>
            <h2 className="h3">Account</h2>
            <p className="small">
              Signed in as <strong>{state.account?.email}</strong>
            </p>
            <p className="tiny muted">
              Demo mode: your account lives only in this browser. <Link to="/about#demo">What this means</Link>
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}

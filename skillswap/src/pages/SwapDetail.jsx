import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import CompleteSwapDialog from '../components/CompleteSwapDialog.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StarRating from '../components/StarRating.jsx';
import SwapAction from '../components/SwapAction.jsx';
import SwapTicket, { ticketFor } from '../components/SwapTicket.jsx';
import ToggleGroup from '../components/ToggleGroup.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getUser } from '../data/users.js';
import { DURATIONS, START_TIMES } from '../data/skills.js';
import { computeMatch, profileSlots, userSlots } from '../utils/matching.js';
import { addDays, dayOfWeek, formatLong, formatShort, fromISODate, monthDay, toISODate } from '../utils/dates.js';
import { completedSessions, sessionsWithPartner, upcomingSessions } from '../utils/progress.js';
import NotFound from './NotFound.jsx';
import './Swaps.css';

function ScheduleForm({ user }) {
  const { state, scheduleSession } = useApp();
  const [params] = useSearchParams();
  const first = user.name.split(' ')[0];
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => toISODate(addDays(new Date(), i + 1))), []);
  const mine = profileSlots(state.profile);
  const theirs = userSlots(user);
  const freeDays = new Set(days.filter((d) => mine.some((s) => s.startsWith(`${dayOfWeek(d)}-`) && theirs.includes(s))));

  const [focus, setFocus] = useState('Both, 50/50');
  const [date, setDate] = useState(days.includes(params.get('date')) ? params.get('date') : [...freeDays][0] || days[0]);
  const [time, setTime] = useState(START_TIMES.includes(params.get('time')) ? params.get('time') : '18:00');
  const [duration, setDuration] = useState(60);
  const [mode, setMode] = useState(user.method === 'In person' ? 'In person' : 'Online');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(null);

  useEffect(() => setError(''), [date, time, mode, place]);

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'In person' && !place.trim()) return setError('Add a public place to meet, like a café or library.');
    if (state.sessions.some((s) => s.status === 'upcoming' && s.date === date && s.time === time)) return setError('You already have a session at that time. Pick another time.');
    scheduleSession({ partnerId: user.id, focus, date, time, duration, mode, place: place.trim(), note: note.trim() });
    setBooked({ date, time });
    setNote('');
    return undefined;
  };

  return (
    <form className="session-form" onSubmit={submit} noValidate>
      <div className="stack" style={{ gap: 8 }}>
        <span className="field-label">What will you focus on?</span>
        <ToggleGroup label="Session focus" options={['Both, 50/50', `${user.teaches[0].name} first`, `${user.wants[0].name} first`]} value={focus} onChange={setFocus} size="sm" />
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <div className="row-between">
          <span className="field-label">Pick a day</span>
          <span className="row tiny muted" style={{ gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', display: 'inline-block' }} />
            You're both usually free
          </span>
        </div>
        <div className="day-grid" role="group" aria-label="Day">
          {days.map((d) => (
            <button key={d} type="button" className="day-btn" aria-pressed={date === d} aria-label={`${formatLong(d)}${freeDays.has(d) ? ', you are both usually free' : ''}`} onClick={() => setDate(d)}>
              <span className="dow">{dayOfWeek(d)}</span>
              <span className="num">{fromISODate(d).getDate()}</span>
              <span className={`free${freeDays.has(d) ? ' on' : ''}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid-fit" style={{ '--min': '240px', '--gap': '20px' }}>
        <div className="stack" style={{ gap: 8 }}>
          <span className="field-label">Start time</span>
          <ToggleGroup label="Start time" options={START_TIMES} value={time} onChange={setTime} size="sm" />
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <span className="field-label">How long?</span>
          <ToggleGroup label="Duration" options={DURATIONS.map((d) => ({ value: d, label: `${d} min` }))} value={duration} onChange={setDuration} size="sm" />
        </div>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <span className="field-label">Where?</span>
        <ToggleGroup label="Meeting type" options={[{ value: 'Online', label: 'Online (video call)' }, { value: 'In person', label: 'In person (offline)' }]} value={mode} onChange={setMode} size="sm" />
        {mode === 'In person' && (
          <label className="field">
            <span className="field-label">Meeting place</span>
            <input className="input" value={place} placeholder="A café or library near you both" onChange={(e) => setPlace(e.target.value)} aria-invalid={!!error && !place.trim()} />
            <span className="field-hint">Meet somewhere public for your first sessions.</span>
          </label>
        )}
      </div>
      <label className="field">
        <span className="field-label">
          Note for {first} <span className="optional">(optional)</span>
        </span>
        <textarea className="input" rows={2} value={note} placeholder="What would you like to cover?" onChange={(e) => setNote(e.target.value)} />
      </label>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {booked && !error && (
        <p className="notice success" role="status">
          Booked for {formatLong(booked.date)} at {booked.time}. {first} can see it in your chat.
        </p>
      )}
      <div className="row-between panel-tint" style={{ padding: '14px 16px' }}>
        <strong className="small">
          {formatShort(date)} · {time} · {duration} min · {mode}
        </strong>
        <button type="submit" className="btn btn-primary">
          Book session
        </button>
      </div>
    </form>
  );
}

export default function SwapDetail() {
  const { userId } = useParams();
  const user = getUser(userId);
  useDocumentTitle(user ? `Swap with ${user.name}` : 'Swap not found');
  const { state, completeSession, cancelSession, reviewSession } = useApp();
  const [completing, setCompleting] = useState(false);

  if (!user) return <NotFound />;
  const first = user.name.split(' ')[0];
  const connection = state.connections.find((c) => c.userId === user.id);
  const match = computeMatch(state.profile, user);

  if (!connection || state.blocked.includes(user.id)) {
    return (
      <div className="container page">
        <div className="empty">
          <strong className="h3">You don't have a swap with {first} yet</strong>
          <p className="muted">Sessions and progress appear here once a swap request is accepted.</p>
          <div className="row">
            <SwapAction user={user} match={match} />
            <Link className="btn btn-ghost" to={`/profile/${user.id}`}>
              View profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const done = sessionsWithPartner(state, user.id);
  const upcoming = upcomingSessions(state, user.id);
  const history = completedSessions(state)
    .filter((s) => s.partnerId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const active = connection.status === 'active';
  const t = ticketFor(state.profile, user, match, { withPeople: true });

  return (
    <div className="container page">
      <Link to="/swaps" className="small" style={{ alignSelf: 'flex-start' }}>
        ← My Swaps
      </Link>
      <div className="page-head">
        <div className="row" style={{ gap: 14 }}>
          <Avatar name={user.name} palette={user.palette} size={56} />
          <div className="stack" style={{ gap: 2 }}>
            <h1 className="h1">Swap with {first}</h1>
            <span className="muted small">{active ? 'Active swap' : 'Completed swap'}</span>
          </div>
        </div>
        <div className="row">
          <Link className="btn btn-secondary" to={`/messages/${user.id}`}>
            Message {first}
          </Link>
          {active && (
            <button type="button" className="btn btn-dark" onClick={() => setCompleting(true)}>
              Complete swap
            </button>
          )}
        </div>
      </div>

      <SwapTicket left={t.left} right={t.right} perfect={t.perfect} reason={connection.goal ? `${first}'s goal: ${connection.goal}` : undefined} />

      <div className="split">
        <div className="main">
          {active ? (
            <section className="stack" aria-labelledby="book-title">
              <h2 id="book-title" className="h2">
                Book a session
              </h2>
              <ScheduleForm user={user} />
            </section>
          ) : (
            <div className="notice success">
              <span>
                You completed this swap{connection.review ? ` and gave ${first} ${connection.review.rating} stars` : ''}. Thank you for sharing what you know.
              </span>
            </div>
          )}
        </div>

        <aside className="side">
          <section className="stack" style={{ gap: 8 }}>
            <h2 className="h3">Progress</h2>
            <span className="small">
              {Math.min(done, connection.total)} of {connection.total} sessions done
            </span>
            <ProgressBar value={(done / connection.total) * 100} label="Swap progress" />
            {active && done >= connection.total && <p className="notice highlight small">You've reached your goal. Complete the swap when you're both ready.</p>}
          </section>

          <section className="stack" style={{ gap: 4 }}>
            <h2 className="h3">Upcoming</h2>
            {upcoming.length === 0 && <p className="small muted">No sessions booked.</p>}
            <ul className="session-list">
              {upcoming.map((s) => {
                const d = monthDay(s.date);
                return (
                  <li key={s.id}>
                    <span className="date-chip" style={{ border: '1.5px solid var(--teal)', borderRadius: 8, textAlign: 'center', padding: '4px 0', lineHeight: 1.1 }}>
                      <small style={{ display: 'block', fontSize: 11, fontWeight: 700 }}>{d.dow}</small>
                      <b style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>{d.day}</b>
                    </span>
                    <span className="stack small" style={{ gap: 0 }}>
                      <strong>
                        {s.time} · {s.duration} min
                      </strong>
                      <span className="muted">
                        {s.mode}
                        {s.place ? ` · ${s.place}` : ''} · {s.focus}
                      </span>
                    </span>
                    <span className="row" style={{ gap: 4 }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => completeSession(s.id)}>
                        Mark done
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          if (window.confirm(`Cancel your session with ${first} on ${formatShort(s.date)}?`)) cancelSession(s.id);
                        }}
                      >
                        Cancel
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="stack" style={{ gap: 4 }}>
            <h2 className="h3">Past sessions</h2>
            {history.length === 0 && <p className="small muted">No sessions completed yet.</p>}
            <ul className="session-list">
              {history.map((s) => {
                const d = monthDay(s.date);
                return (
                  <li key={s.id}>
                    <span className="date-chip" style={{ border: '1.5px solid var(--line-strong)', borderRadius: 8, textAlign: 'center', padding: '4px 0', lineHeight: 1.1 }}>
                      <small style={{ display: 'block', fontSize: 11, fontWeight: 700 }}>{d.dow}</small>
                      <b style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>{d.day}</b>
                    </span>
                    <span className="stack small" style={{ gap: 0 }}>
                      <strong>{s.note || s.focus}</strong>
                      <span className="muted">
                        {s.duration} min · {s.mode}
                      </span>
                    </span>
                    {s.review ? (
                      <StarRating value={s.review.rating} size={14} />
                    ) : (
                      <span className="stack" style={{ gap: 0 }}>
                        <span className="tiny muted">Rate this session</span>
                        <StarRating value={0} size={20} onChange={(n) => reviewSession(s.id, { rating: n, tags: [], text: '' })} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      {completing && <CompleteSwapDialog user={user} onClose={() => setCompleting(false)} />}
    </div>
  );
}

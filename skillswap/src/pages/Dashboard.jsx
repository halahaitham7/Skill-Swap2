import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import MatchTag from '../components/MatchTag.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SkillChip from '../components/SkillChip.jsx';
import SwapAction from '../components/SwapAction.jsx';
import SwapTicket, { ticketFor } from '../components/SwapTicket.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useMatches } from '../hooks/useMatches.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getUser } from '../data/users.js';
import { formatLong, formatShort, monthDay, todayISO } from '../utils/dates.js';
import { learningStats, sessionsWithPartner, skillProgress, upcomingSessions, weeklyHours } from '../utils/progress.js';
import { swapStatus } from '../utils/matching.js';
import './Dashboard.css';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Picks the single most useful next step for this member right now. */
function nextStep(state, ranked) {
  if (state.incomingRequests.length) {
    const r = state.incomingRequests[0];
    const u = getUser(r.userId);
    return {
      title: `${u.name.split(' ')[0]} wants to swap with you`,
      text: `${u.name.split(' ')[0]} would teach you ${r.teach} and learn ${r.learn} from you.`,
      action: { to: '/swaps?tab=incoming', label: 'Review request' },
    };
  }
  const ready = state.connections.find((c) => c.status === 'active' && sessionsWithPartner(state, c.userId) >= c.total);
  if (ready) {
    const u = getUser(ready.userId);
    return { title: `You've finished your sessions with ${u.name.split(' ')[0]}`, text: 'Complete the swap and leave a review to help others.', action: { to: `/swaps/${u.id}`, label: 'Complete swap' } };
  }
  const soon = upcomingSessions(state)[0];
  if (soon) {
    const u = getUser(soon.partnerId);
    return {
      title: `Next session: ${formatLong(soon.date)} at ${soon.time}`,
      text: `${soon.duration} minutes with ${u.name.split(' ')[0]}, ${soon.mode === 'Online' ? 'online' : 'in person'}. Check the chat for anything to prepare.`,
      action: { to: `/messages/${u.id}`, label: 'Open chat' },
    };
  }
  const best = ranked.find(({ user }) => swapStatus(state, user.id) === 'none');
  if (best) {
    return {
      title: `Your best match is ${best.user.name}`,
      text: 'Send a swap request to get started. Most people reply within two days.',
      action: { to: `/profile/${best.user.id}`, label: `View ${best.user.name.split(' ')[0]}'s profile` },
    };
  }
  return { title: 'Add more skills to widen your matches', text: 'The more you can teach, the more people you can swap with.', action: { to: '/me', label: 'Edit my skills' } };
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { state } = useApp();
  const ranked = useMatches();
  const { profile } = state;

  const matches = useMemo(() => ranked.filter(({ user, match }) => match.type !== 'other' && swapStatus(state, user.id) === 'none').slice(0, 4), [ranked, state]);
  const active = state.connections.filter((c) => c.status === 'active' && !state.blocked.includes(c.userId));
  const upcoming = upcomingSessions(state);
  const stats = learningStats(state);
  const weeks = weeklyHours(state);
  const maxWeek = Math.max(1, ...weeks);
  const step = nextStep(state, ranked);

  return (
    <div className="container page">
      <div className="page-head">
        <div className="stack">
          <span className="small muted">{formatLong(todayISO())}</span>
          <h1 className="h1">
            {greeting()}, {profile.name.split(' ')[0]}
          </h1>
        </div>
        <Link className="btn btn-secondary" to="/explore">
          Explore skills
        </Link>
      </div>

      {/* The one most important action */}
      <section className="next-band" aria-labelledby="next-title">
        <div className="stack">
          <span className="label">Do this next</span>
          <h2 id="next-title" className="h2">
            {step.title}
          </h2>
          <p className="muted">{step.text}</p>
        </div>
        <Link className="btn btn-primary" to={step.action.to}>
          {step.action.label}
        </Link>
      </section>

      <div className="split">
        <div className="main">
          {/* Recommended matches */}
          <section className="stack" style={{ gap: 20 }} aria-labelledby="matches-title">
            <div className="row-between">
              <h2 id="matches-title" className="h2">
                Recommended matches
              </h2>
              <Link to="/explore">See all</Link>
            </div>
            {matches.length ? (
              <div className="match-list">
                {matches.map(({ user, match }) => {
                  const t = ticketFor(profile, user, match);
                  return (
                    <article key={user.id} className="match-item">
                      <div className="row-between" style={{ flexWrap: 'nowrap' }}>
                        <Link to={`/profile/${user.id}`} className="row" style={{ gap: 10, textDecoration: 'none', flexWrap: 'nowrap' }}>
                          <Avatar name={user.name} palette={user.palette} size={40} />
                          <strong>{user.name}</strong>
                        </Link>
                        <MatchTag type={match.type} />
                      </div>
                      <SwapTicket compact left={t.left} right={t.right} perfect={t.perfect} />
                      <div className="row" style={{ gap: 8 }}>
                        <SwapAction user={user} match={match} size="sm" />
                        <Link className="btn btn-ghost btn-sm" to={`/profile/${user.id}`}>
                          Profile
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty">
                <strong>No new matches right now</strong>
                <p className="muted small">You're already swapping with your best matches. Add another skill to meet new people.</p>
                <Link className="btn btn-secondary btn-sm" to="/me">
                  Edit my skills
                </Link>
              </div>
            )}
          </section>

          {/* Active swaps */}
          <section className="stack" style={{ gap: 8 }} aria-labelledby="active-title">
            <div className="row-between">
              <h2 id="active-title" className="h2">
                Active swaps
              </h2>
              <Link to="/swaps?tab=active">My Swaps</Link>
            </div>
            {active.length ? (
              <div className="list-rows">
                {active.map((c) => {
                  const u = getUser(c.userId);
                  const done = sessionsWithPartner(state, c.userId);
                  const next = upcomingSessions(state, c.userId)[0];
                  return (
                    <div key={c.userId} className="swap-line">
                      <Avatar name={u.name} palette={u.palette} size={48} />
                      <div className="stack" style={{ gap: 2 }}>
                        <Link to={`/swaps/${u.id}`} style={{ fontWeight: 700, textDecoration: 'none' }}>
                          {u.name}
                        </Link>
                        <span className="small muted">{next ? `Next: ${formatShort(next.date)} · ${next.time}` : 'No session booked yet'}</span>
                      </div>
                      <div className="stack" style={{ gap: 4 }}>
                        <span className="tiny muted">
                          {Math.min(done, c.total)} of {c.total} sessions
                        </span>
                        <ProgressBar value={(done / c.total) * 100} label={`Progress with ${u.name}`} />
                      </div>
                      <Link className="btn btn-secondary btn-sm" to={`/swaps/${u.id}`}>
                        Open
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">
                <strong>No active swaps yet</strong>
                <p className="muted small">When someone accepts your request, the swap appears here.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="side">
          <div className="side-block">
            <div className="row-between">
              <h2 className="h3">Skills I can teach</h2>
              <Link to="/me" className="small">
                Edit
              </Link>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {profile.teach.map((s) => (
                <SkillChip key={s.name} name={s.name} kind="teach" level={s.level} hit />
              ))}
            </div>
          </div>

          <div className="side-block">
            <div className="row-between">
              <h2 className="h3">Skills I want to learn</h2>
              <Link to="/me" className="small">
                Edit
              </Link>
            </div>
            {profile.learn.map((s) => {
              const p = skillProgress(state, s.name);
              return (
                <div key={s.name} className="skill-progress">
                  <div className="row-between">
                    <SkillChip name={s.name} kind="learn" level={s.level} hit />
                    <span className="tiny muted">
                      {p.done} of {p.goal} sessions
                    </span>
                  </div>
                  <ProgressBar value={p.percent} label={`${s.name} progress`} />
                </div>
              );
            })}
          </div>

          <div className="side-block">
            <div className="row-between">
              <h2 className="h3">Pending requests</h2>
              <Link to="/swaps" className="small">
                View all
              </Link>
            </div>
            {state.incomingRequests.length + state.sentRequests.length === 0 ? (
              <p className="small muted">No pending requests.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="list-rows">
                {state.incomingRequests.map((r) => {
                  const u = getUser(r.userId);
                  return (
                    <li key={r.userId} className="row" style={{ padding: '10px 0', flexWrap: 'nowrap' }}>
                      <Avatar name={u.name} palette={u.palette} size={36} />
                      <span className="small" style={{ flex: '1 1 auto' }}>
                        <strong>{u.name}</strong> wants to swap
                      </span>
                      <span className="tag tag-new">New</span>
                    </li>
                  );
                })}
                {state.sentRequests.map((id) => {
                  const u = getUser(id);
                  return (
                    <li key={id} className="row" style={{ padding: '10px 0', flexWrap: 'nowrap' }}>
                      <Avatar name={u.name} palette={u.palette} size={36} />
                      <span className="small" style={{ flex: '1 1 auto' }}>
                        You asked <strong>{u.name}</strong>
                      </span>
                      <span className="tag tag-quiet">Waiting</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="side-block">
            <h2 className="h3">Learning progress</h2>
            <div className="stats">
              <div className="stat">
                <strong>{stats.sessions}</strong>
                <span className="tiny muted">sessions done</span>
              </div>
              <div className="stat">
                <strong>{stats.hours}</strong>
                <span className="tiny muted">hours swapped</span>
              </div>
              <div className="stat">
                <strong>{stats.streak}</strong>
                <span className="tiny muted">week streak</span>
              </div>
              <div className="stat">
                <strong>{stats.swapsDone}</strong>
                <span className="tiny muted">swaps completed</span>
              </div>
            </div>
            <div className="bars" role="img" aria-label={`Hours per week, last 8 weeks: ${weeks.join(', ')}`}>
              {weeks.map((h, i) => (
                <span key={i} className={i === weeks.length - 1 ? 'now' : ''} style={{ height: `${(h / maxWeek) * 100}%` }} title={`${h} h`} />
              ))}
            </div>
            <span className="tiny muted">Hours per week · last 8 weeks</span>
          </div>

          <div className="side-block">
            <h2 className="h3">Upcoming sessions</h2>
            {upcoming.length === 0 && <p className="small muted">Nothing booked yet.</p>}
            {upcoming.slice(0, 3).map((s) => {
              const u = getUser(s.partnerId);
              const d = monthDay(s.date);
              return (
                <Link key={s.id} to={`/swaps/${u.id}`} className="session-line">
                  <span className="date-chip">
                    <small>{d.dow}</small>
                    <b>{d.day}</b>
                  </span>
                  <span className="stack small" style={{ gap: 0 }}>
                    <strong>With {u.name.split(' ')[0]}</strong>
                    <span className="muted">
                      {s.time} · {s.duration} min · {s.mode === 'Online' ? 'Online' : 'In person'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

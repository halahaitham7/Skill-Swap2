import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icon.jsx';
import MatchTag from '../components/MatchTag.jsx';
import ReportDialog from '../components/ReportDialog.jsx';
import StarRating, { RatingSummary } from '../components/StarRating.jsx';
import SwapAction from '../components/SwapAction.jsx';
import SwapTicket, { ticketFor } from '../components/SwapTicket.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getUser } from '../data/users.js';
import { DAYS } from '../data/skills.js';
import { availabilityGrid, computeMatch, explainMatch } from '../utils/matching.js';
import { formatLong, monthYear } from '../utils/dates.js';
import NotFound from './NotFound.jsx';
import './Profile.css';

export default function Profile() {
  const { userId } = useParams();
  const user = getUser(userId);
  useDocumentTitle(user ? user.name : 'Profile not found');
  const navigate = useNavigate();
  const { state, toggleFavorite, unblockUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [allReviews, setAllReviews] = useState(false);
  const menuRef = useRef(null);
  const member = state.signedIn && state.profile.onboarded;

  const match = useMemo(() => (user ? computeMatch(state.profile, user) : null), [state.profile, user]);
  const grid = useMemo(() => (user ? availabilityGrid(state.profile, user) : []), [state.profile, user]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  if (!user) return <NotFound />;
  const first = user.name.split(' ')[0];

  if (member && state.blocked.includes(user.id)) {
    return (
      <div className="container page">
        <div className="empty center">
          <strong className="h3">You blocked {user.name}</strong>
          <p className="muted">They can't message you or see your profile, and they won't appear in your matches.</p>
          <div className="row">
            <Link className="btn btn-secondary" to="/explore">
              Back to Explore
            </Link>
            <button type="button" className="btn btn-dark" onClick={() => unblockUser(user.id)}>
              Unblock {first}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const saved = state.favorites.includes(user.id);
  const connection = state.connections.find((c) => c.userId === user.id);
  const myName = `${state.profile.name.split(' ')[0]} (you)`;
  const myReviews = [
    ...(member && connection?.review ? [{ author: myName, avatarName: state.profile.name, palette: state.profile.palette, swap: 'Completed swap', date: connection.completedAt ? monthYear(new Date(connection.completedAt).toISOString().slice(0, 10)) : '', rating: connection.review.rating, text: connection.review.text || connection.review.tags.join(', ') }] : []),
    ...(member
      ? state.sessions
          .filter((s) => s.partnerId === user.id && s.review?.text)
          .map((s) => ({ author: myName, avatarName: state.profile.name, palette: state.profile.palette, swap: 'Session', date: formatLong(s.date), rating: s.review.rating, text: s.review.text }))
      : []),
  ];
  const reviews = [...myReviews, ...user.reviews];
  const shown = allReviews ? reviews : reviews.slice(0, 3);
  const ticket = ticketFor(state.profile, user, match, { withPeople: true });

  const fits = [
    [match.theyWantFromMe.length > 0, `${first} wants to learn what you teach`, `${first} isn't looking for your skills yet`],
    [match.theyTeachForMe.length > 0, `${first} teaches what you want to learn`, `${first} doesn't teach what you want yet`],
    [match.overlap.length > 0, `You share ${match.overlap.length} free time slot${match.overlap.length === 1 ? '' : 's'} a week`, 'Your free times don’t overlap yet'],
    [match.methodOk, 'You both like to meet the same way', 'You prefer different ways to meet'],
  ];

  return (
    <div className="container page">
      <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', paddingLeft: 0 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <header className="profile-head">
        <Avatar name={user.name} palette={user.palette} size={112} />
        <div className="stack" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 10 }}>
            <h1 className="h1">{user.name}</h1>
            {member && <MatchTag type={match.type} />}
          </div>
          <div className="profile-meta">
            <span>
              <Icon name="pin" size={16} /> {user.location}
            </span>
            <span>
              <Icon name="monitor" size={16} /> {user.method === 'Both' ? 'Online or in person' : user.method === 'Online' ? 'Online' : 'In person (offline)'}
            </span>
            <RatingSummary rating={user.rating} count={user.reviewCount} />
            <span>Member since {user.memberSince}</span>
          </div>
        </div>
        <div className="profile-actions">
          <SwapAction user={user} match={match} />
          {member && (
            <button type="button" className="icon-btn bordered save-btn" aria-pressed={saved} aria-label={saved ? `Remove ${first} from saved` : `Save ${first}`} onClick={() => toggleFavorite(user.id)}>
              <Icon name="bookmark" size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
          {member && (
            <div className="dropdown" ref={menuRef}>
              <button type="button" className="icon-btn bordered" aria-label="More options" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
                <Icon name="menu" size={20} />
              </button>
              {menuOpen && (
                <div className="menu" role="menu" style={{ width: 220 }}>
                  <button type="button" role="menuitem" className="menu-item" onClick={() => { setMenuOpen(false); setDialog('report'); }}>
                    <Icon name="flag" size={18} /> Report profile
                  </button>
                  <button type="button" role="menuitem" className="menu-item" onClick={() => { setMenuOpen(false); setDialog('block'); }}>
                    <Icon name="block" size={18} /> Block {first}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Compatibility first */}
      <section className="stack" style={{ gap: 16 }} aria-labelledby="fit-title">
        <h2 id="fit-title" className="h2">
          {member ? `How you and ${first} fit` : `What ${first} offers`}
        </h2>
        {member ? (
          <>
            <SwapTicket left={ticket.left} right={ticket.right} perfect={ticket.perfect} reason={explainMatch(user, match)} />
            <ul className="fit-list">
              {fits.map(([ok, yes, no]) => (
                <li key={yes} className={ok ? 'yes' : 'no'}>
                  <span className="mark-icon" aria-hidden="true">
                    <Icon name={ok ? 'check' : 'close'} size={14} strokeWidth={3} />
                  </span>
                  {ok ? yes : no}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="panel-mint row-between">
            <p>
              <strong>Want to know if you're a match?</strong> Create a free profile and we'll show you exactly what you and {first} could teach each other.
            </p>
            <Link className="btn btn-primary" to="/signup">
              Sign up free
            </Link>
          </div>
        )}
      </section>

      <div className="split">
        <div className="main">
          <section className="stack" aria-labelledby="about-title">
            <h2 id="about-title" className="h2">
              About {first}
            </h2>
            <p style={{ maxWidth: 680 }}>{user.bio}</p>
            <div className="facts">
              <div>
                <span className="tiny muted">Teaching style</span>
                <strong>{user.teachingStyle}</strong>
              </div>
              <div>
                <span className="tiny muted">Session length</span>
                <strong>{user.sessionLength}</strong>
              </div>
              <div>
                <span className="tiny muted">Speaks</span>
                <strong>{user.languages}</strong>
              </div>
            </div>
          </section>

          <section className="stack" aria-labelledby="avail-title">
            <div className="row-between">
              <h2 id="avail-title" className="h2">
                {member ? "When you're both free" : `When ${first} is free`}
              </h2>
              <div className="row tiny muted" style={{ gap: 14 }} aria-hidden="true">
                {member ? (
                  <>
                    <span className="legend">
                      <i style={{ background: 'var(--butter)' }} /> Both free
                    </span>
                    <span className="legend">
                      <i style={{ background: 'var(--mint-tint-strong)' }} /> {first} only
                    </span>
                    <span className="legend">
                      <i style={{ border: '1.5px dashed var(--line-strong)' }} /> You only
                    </span>
                  </>
                ) : (
                  <span className="legend">
                    <i style={{ background: 'var(--mint-tint-strong)' }} /> {first} is free
                  </span>
                )}
              </div>
            </div>
            <div>
              <table className="avail-table">
                <caption className="sr-only">Weekly availability</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Time of day</span>
                    </th>
                    {DAYS.map((d) => (
                      <th key={d} scope="col">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row) => (
                    <tr key={row.time}>
                      <th scope="row">{row.time}</th>
                      {row.cells.map((c) => {
                        const st = member ? c.state : c.state === 'both' || c.state === 'them' ? 'them' : 'none';
                        return (
                          <td key={c.day} className={st}>
                            {/* On narrow screens the words hide and the legend colours carry the meaning; screen readers still hear them. */}
                            <span className="cell-text">{st === 'both' ? 'Both' : st === 'them' ? first : st === 'you' ? 'You' : 'Not free'}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="stack" style={{ gap: 0 }} aria-labelledby="reviews-title">
            <div className="row-between" style={{ paddingBottom: 12 }}>
              <h2 id="reviews-title" className="h2">
                Reviews
              </h2>
              <RatingSummary rating={user.rating} count={user.reviewCount + myReviews.length} />
            </div>
            {reviews.length === 0 && (
              <p className="muted" style={{ paddingTop: 12 }}>
                No written reviews yet.
              </p>
            )}
            {shown.map((r, i) => (
              <article key={`${r.author}-${i}`} className="review">
                <Avatar name={r.avatarName || r.author} palette={r.palette} size={44} />
                <div className="stack" style={{ gap: 4 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{r.author}</strong>
                    <StarRating value={r.rating} size={15} />
                  </div>
                  <span className="tiny muted">
                    {r.swap} · {r.date}
                  </span>
                  <p className="small">{r.text}</p>
                </div>
              </article>
            ))}
            {reviews.length > 3 && (
              <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', paddingLeft: 0 }} onClick={() => setAllReviews((v) => !v)}>
                {allReviews ? 'Show fewer' : `Show all ${reviews.length} reviews`}
              </button>
            )}
          </section>
        </div>

        <aside className="side">
          <section className="stack" style={{ gap: 8 }}>
            <h2 className="h3">{first} can teach</h2>
            <table className="skill-table">
              <tbody>
                {user.teaches.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <strong>↗ {s.name}</strong>
                    </td>
                    <td>{s.note ? `${s.level} · ${s.note}` : s.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="stack" style={{ gap: 8 }}>
            <h2 className="h3">{first} wants to learn</h2>
            <table className="skill-table">
              <tbody>
                {user.wants.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <strong>↙ {s.name}</strong>
                    </td>
                    <td>Currently {s.level.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="panel-tint stack" style={{ gap: 10 }}>
            <h2 className="h3">Trust &amp; safety</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }} className="small">
              <li>{user.verified ? 'Email and phone verified' : 'Email verified'}</li>
              <li>{user.exchanges} completed swaps</li>
              <li>{user.responseTime}</li>
            </ul>
            <p className="tiny muted">Meet on video first. If something feels wrong, report or block from the ··· menu.</p>
          </section>
        </aside>
      </div>

      {dialog && <ReportDialog user={user} mode={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

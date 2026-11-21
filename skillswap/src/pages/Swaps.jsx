import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import StarRating from '../components/StarRating.jsx';
import SwapTicket from '../components/SwapTicket.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getUser } from '../data/users.js';
import { formatShort, relativeTime } from '../utils/dates.js';
import { sessionsWithPartner, upcomingSessions } from '../utils/progress.js';
import './Swaps.css';

const TABS = [
  { id: 'incoming', label: 'Incoming requests', short: 'Incoming' },
  { id: 'sent', label: 'Sent requests', short: 'Sent' },
  { id: 'active', label: 'Active swaps', short: 'Active' },
  { id: 'completed', label: 'Completed', short: 'Done' },
];

function Who({ user, sub }) {
  return (
    <Link to={`/profile/${user.id}`} className="who" style={{ textDecoration: 'none' }}>
      <Avatar name={user.name} palette={user.palette} size={48} />
      <span className="stack" style={{ gap: 0 }}>
        <strong>{user.name}</strong>
        <span className="small muted">{sub}</span>
      </span>
    </Link>
  );
}

function Empty({ title, text, to, cta }) {
  return (
    <div className="empty">
      <strong className="h3">{title}</strong>
      <p className="muted small">{text}</p>
      {to && (
        <Link className="btn btn-secondary btn-sm" to={to}>
          {cta}
        </Link>
      )}
    </div>
  );
}

export default function Swaps() {
  useDocumentTitle('My Swaps');
  const { state, acceptRequest, declineRequest, cancelRequest } = useApp();
  const [params, setParams] = useSearchParams();
  const counts = {
    incoming: state.incomingRequests.length,
    sent: state.sentRequests.length,
    active: state.connections.filter((c) => c.status === 'active').length,
    completed: state.connections.filter((c) => c.status === 'completed').length,
  };
  const fallback = counts.incoming ? 'incoming' : 'active';
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : fallback;
  const select = (id) => setParams({ tab: id }, { replace: true });

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
      select(next.id);
      document.getElementById(`tab-${next.id}`)?.focus();
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div className="stack">
          <h1 className="h1">My Swaps</h1>
          <p className="muted">Requests waiting for an answer, and the swaps you're part of.</p>
        </div>
        <Link className="btn btn-secondary" to="/explore">
          Find someone new
        </Link>
      </div>

      <ScrollArea className="tabs" role="tablist" aria-label="Swap lists" onKeyDown={onKeyDown}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => select(t.id)}
          >
            <span className="label-long">{t.label}</span>
            <span className="label-short">{t.short}</span>
            {counts[t.id] > 0 && <span className={t.id === 'incoming' ? 'count' : 'tag tag-quiet'}>{counts[t.id]}</span>}
          </button>
        ))}
      </ScrollArea>

      <section id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'incoming' &&
          (state.incomingRequests.length ? (
            state.incomingRequests.map((r) => {
              const u = getUser(r.userId);
              return (
                <article key={r.userId} className="swap-card">
                  <div className="stack" style={{ gap: 14 }}>
                    <Who user={u} sub={`Asked ${relativeTime(r.createdAt).toLowerCase()}`} />
                    <SwapTicket compact perfect left={{ label: 'You teach', skill: r.learn }} right={{ label: `${u.name.split(' ')[0]} teaches`, skill: r.teach }} />
                    {r.message && <blockquote>“{r.message}”</blockquote>}
                  </div>
                  <div className="actions">
                    <button type="button" className="btn btn-secondary" onClick={() => declineRequest(u.id)}>
                      Decline
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => acceptRequest(u.id)}>
                      Accept
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <Empty title="No incoming requests" text="When someone asks to swap with you, their request appears here so you can accept or decline it." to="/explore" cta="Find people to swap with" />
          ))}

        {tab === 'sent' &&
          (state.sentRequests.length ? (
            state.sentRequests.map((id) => {
              const u = getUser(id);
              const note = state.requestNotes?.[id];
              return (
                <article key={id} className="swap-card">
                  <div className="stack" style={{ gap: 14 }}>
                    <Who user={u} sub={note?.at ? `Sent ${relativeTime(note.at).toLowerCase()} · waiting for a reply` : 'Waiting for a reply'} />
                    {note?.teach && <SwapTicket compact left={{ label: 'You teach', skill: note.teach }} right={{ label: `${u.name.split(' ')[0]} teaches`, skill: note.learn }} />}
                    {note?.message && <blockquote>“{note.message}”</blockquote>}
                    <p className="tiny muted">Demo mode: sample members don't reply to requests.</p>
                  </div>
                  <div className="actions">
                    <button type="button" className="btn btn-secondary" onClick={() => cancelRequest(id)}>
                      Withdraw request
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <Empty title="You haven't sent any requests" text="Find someone whose skills fit yours and press “Request a swap”." to="/explore" cta="Explore skills" />
          ))}

        {tab === 'active' &&
          (counts.active ? (
            state.connections
              .filter((c) => c.status === 'active')
              .map((c) => {
                const u = getUser(c.userId);
                const done = sessionsWithPartner(state, c.userId);
                const next = upcomingSessions(state, c.userId)[0];
                return (
                  <article key={c.userId} className="swap-card">
                    <div className="stack" style={{ gap: 12 }}>
                      <Who user={u} sub={next ? `Next session ${formatShort(next.date)} at ${next.time}` : 'No session booked yet'} />
                      <div className="stack" style={{ gap: 6, maxWidth: 420 }}>
                        <span className="small">
                          {Math.min(done, c.total)} of {c.total} sessions done
                        </span>
                        <ProgressBar value={(done / c.total) * 100} label={`Progress with ${u.name}`} />
                      </div>
                    </div>
                    <div className="actions">
                      <Link className="btn btn-secondary" to={`/messages/${u.id}`}>
                        Message
                      </Link>
                      <Link className="btn btn-dark" to={`/swaps/${u.id}`}>
                        Open swap
                      </Link>
                    </div>
                  </article>
                );
              })
          ) : (
            <Empty title="No active swaps yet" text="Accept an incoming request, or send one, to start your first swap." to="/explore" cta="Explore skills" />
          ))}

        {tab === 'completed' &&
          (counts.completed ? (
            state.connections
              .filter((c) => c.status === 'completed')
              .map((c) => {
                const u = getUser(c.userId);
                return (
                  <article key={c.userId} className="swap-card">
                    <div className="stack" style={{ gap: 10 }}>
                      <Who user={u} sub={`${sessionsWithPartner(state, c.userId)} sessions · completed ${c.completedAt ? relativeTime(c.completedAt).toLowerCase() : ''}`} />
                      {c.review && (
                        <div className="row small" style={{ gap: 10 }}>
                          <span>Your review:</span>
                          <StarRating value={c.review.rating} size={16} />
                          {c.review.text && <span className="muted">“{c.review.text}”</span>}
                        </div>
                      )}
                    </div>
                    <div className="actions">
                      <Link className="btn btn-secondary" to={`/profile/${u.id}`}>
                        View profile
                      </Link>
                    </div>
                  </article>
                );
              })
          ) : (
            <Empty title="No completed swaps yet" text="When you and a partner finish, complete the swap from its page and leave a review." />
          ))}
      </section>
    </div>
  );
}

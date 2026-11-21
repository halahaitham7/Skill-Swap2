import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icon.jsx';
import ReportDialog from '../components/ReportDialog.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import SwapAction from '../components/SwapAction.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getUser } from '../data/users.js';
import { clockTime, formatLong, relativeTime } from '../utils/dates.js';
import { computeMatch } from '../utils/matching.js';
import './Messages.css';

const QUICK_REPLIES = ['Sounds great, see you then!', 'Can we move it 30 minutes later?', 'Here’s what I want to cover next time:'];

// DEMO MODE: sample members "reply" with one of these so the chat can be tried out.
const DEMO_REPLIES = ['Sounds good to me!', 'Great idea, let’s do that.', 'Thanks for sharing! I’ll look at it before our session.', 'Perfect. I’ll prepare a few exercises.', 'Talk soon!'];

function previewOf(m) {
  if (!m) return 'Say hello';
  if (m.type === 'resource') return `Shared a file: ${m.fileName}`;
  if (m.type === 'proposal') return 'Session proposal';
  return m.text;
}

function formatSize(bytes) {
  return bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function MessageItem({ m, first, onRespond }) {
  if (m.from === 'system') return <div className="system-msg">{m.text}</div>;
  const mine = m.from === 'me';
  let body;
  if (m.type === 'resource') {
    body = (
      <div className="attachment">
        <span className="file-icon" aria-hidden="true">
          <Icon name="file" size={20} />
        </span>
        <span className="stack" style={{ gap: 0 }}>
          <strong className="small">{m.fileName}</strong>
          <span className="tiny muted">Shared file · {m.size}</span>
        </span>
      </div>
    );
  } else if (m.type === 'proposal') {
    const p = m.proposal;
    body = (
      <div className="proposal">
        <span className="label">{mine ? 'Session booked' : 'Session proposal'}</span>
        <strong>
          {formatLong(p.date)} · {p.time}
        </strong>
        <span className="small muted">
          {p.mode === 'Online' ? 'Online' : 'In person'} · {p.duration} min · {p.focus}
        </span>
        {!mine && p.status === 'open' && (
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onRespond(m.id, 'declined')}>
              Decline
            </button>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => onRespond(m.id, 'accepted')}>
              Accept
            </button>
          </div>
        )}
        {p.status === 'accepted' && <span className="notice success small">Added to both calendars</span>}
        {p.status === 'declined' && <span className="notice info small">You declined this time</span>}
      </div>
    );
  } else {
    body = <div className="bubble">{m.text}</div>;
  }
  return (
    <div className={`msg ${mine ? 'me' : 'them'}`}>
      {body}
      <span className="meta">
        {mine ? '' : `${first} · `}
        {clockTime(m.at)}
      </span>
    </div>
  );
}

export default function Messages() {
  const { userId } = useParams();
  const { state, sendMessage, receiveMessage, markConversationRead, respondToProposal } = useApp();
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [dialog, setDialog] = useState(null);
  const bodyRef = useRef(null);
  const fileRef = useRef(null);
  const replyIndex = useRef(0);

  // Chat is only available inside a swap (active or completed).
  const conversations = useMemo(
    () =>
      state.connections
        .filter((c) => !state.blocked.includes(c.userId))
        .map((c) => {
          const thread = state.conversations[c.userId] || [];
          const last = [...thread].reverse().find((m) => m.from !== 'system');
          return { id: c.userId, user: getUser(c.userId), status: c.status, last, at: last ? last.at : c.startedAt || 0 };
        })
        .sort((a, b) => b.at - a.at),
    [state.connections, state.conversations, state.blocked],
  );

  const user = userId ? getUser(userId) : null;
  const unlocked = !!(user && conversations.some((c) => c.id === user.id));
  const thread = useMemo(() => (user && unlocked ? state.conversations[user.id] || [] : []), [state.conversations, user, unlocked]);
  const connection = user ? state.connections.find((c) => c.userId === user.id) : null;
  const first = user ? user.name.split(' ')[0] : '';
  useDocumentTitle(user ? `Messages · ${user.name}` : 'Messages');

  useEffect(() => {
    if (user && unlocked) markConversationRead(user.id);
  }, [user, unlocked, thread.length, markConversationRead]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, typing, userId]);

  // Demo-mode reply so the conversation can be tried end to end.
  useEffect(() => {
    const last = thread[thread.length - 1];
    if (!user || !unlocked || connection?.status !== 'active' || !last || last.from !== 'me') {
      setTyping(false);
      return undefined;
    }
    setTyping(true);
    const timer = setTimeout(() => {
      receiveMessage(user.id, { type: 'text', text: DEMO_REPLIES[replyIndex.current % DEMO_REPLIES.length] });
      replyIndex.current += 1;
      setTyping(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [thread, user, unlocked, connection, receiveMessage]);

  const send = (text) => {
    const value = text.trim();
    if (!value || !user) return;
    sendMessage(user.id, { type: 'text', text: value });
    setDraft('');
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file && user) sendMessage(user.id, { type: 'resource', fileName: file.name, size: formatSize(file.size) });
    e.target.value = '';
  };

  const filtered = conversations.filter((c) => c.user.name.toLowerCase().includes(search.trim().toLowerCase()));
  const resources = thread.filter((m) => m.type === 'resource');

  return (
    <div className="container page" style={{ gap: 16 }}>
      <h1 className="h1 sr-only">Messages</h1>
      <div className={`chat${user ? ' has-thread' : ''}`}>
        <section className="chat-list" aria-label="Conversations">
          <div className="chat-list-head">
            <h2 className="h3">Messages</h2>
            <label className="input-icon">
              <Icon name="search" size={18} />
              <span className="sr-only">Search conversations</span>
              <input className="input" type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
          </div>
          <nav aria-label="Conversation list">
            {filtered.length === 0 && (
              <div className="stack" style={{ padding: 16, gap: 10 }}>
                <p className="small muted">{conversations.length ? 'No conversations match.' : 'Chats appear here once a swap is accepted.'}</p>
                {!conversations.length && (
                  <Link className="btn btn-secondary btn-sm" to="/explore">
                    Find a partner
                  </Link>
                )}
              </div>
            )}
            {filtered.map((c) => {
              const unread = state.unread[c.id];
              return (
                <Link key={c.id} to={`/messages/${c.id}`} className={`convo${c.id === userId ? ' active' : ''}`} aria-current={c.id === userId ? 'page' : undefined}>
                  <Avatar name={c.user.name} palette={c.user.palette} size={44} />
                  <span className="stack" style={{ gap: 0, minWidth: 0 }}>
                    <strong className="small">{c.user.name}</strong>
                    <span className={`preview${unread ? ' unread' : ''}`}>{previewOf(c.last)}</span>
                  </span>
                  <span className="stack" style={{ gap: 4, alignItems: 'flex-end' }}>
                    <span className="tiny muted" style={{ whiteSpace: 'nowrap' }}>
                      {c.last ? relativeTime(c.last.at) : ''}
                    </span>
                    {unread > 0 && <span className="count">{unread}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>
        </section>

        <section className="thread" aria-label={user ? `Conversation with ${user.name}` : 'Conversation'}>
          {!user && (
            <div className="empty center" style={{ margin: 'auto', border: 0 }}>
              <strong className="h3">Pick a conversation</strong>
              <p className="muted small">Your chats with swap partners appear on the left.</p>
            </div>
          )}

          {user && !unlocked && (
            <div className="empty center" style={{ margin: 'auto', border: 0, maxWidth: 420 }}>
              <Icon name="lock" size={28} />
              <strong className="h3">Chat opens after a swap is accepted</strong>
              <p className="muted small">
                {state.sentRequests.includes(user.id)
                  ? `Your request is waiting for ${first}. You can talk as soon as they accept.`
                  : state.incomingRequests.some((r) => r.userId === user.id)
                    ? `${first} asked to swap with you. Accept the request to start chatting.`
                    : `This keeps messages friendly and relevant. Request a swap with ${first}, and you can talk as soon as they accept.`}
              </p>
              <SwapAction user={user} match={computeMatch(state.profile, user)} />
              <Link to="/messages" className="small">
                Back to messages
              </Link>
            </div>
          )}

          {user && unlocked && (
            <>
              <div className="thread-head">
                <div className="row who" style={{ gap: 10, flexWrap: 'nowrap' }}>
                  <Link to="/messages" className="icon-btn back-link" aria-label="Back to conversations">
                    <Icon name="arrowLeft" size={20} />
                  </Link>
                  <Avatar name={user.name} palette={user.palette} size={40} />
                  <span className="stack" style={{ gap: 0, minWidth: 0 }}>
                    <Link to={`/profile/${user.id}`} style={{ fontWeight: 700, textDecoration: 'none' }}>
                      {user.name}
                    </Link>
                    <span className="tiny muted">{typing ? 'typing…' : connection?.status === 'completed' ? 'Swap completed' : 'Active swap'}</span>
                  </span>
                </div>
                {connection?.status === 'active' && (
                  <Link className="btn btn-secondary btn-sm" to={`/swaps/${user.id}`}>
                    <Icon name="calendar" size={18} /> <span className="btn-text">Schedule</span>
                  </Link>
                )}
              </div>

              <div className="thread-body" ref={bodyRef} aria-live="polite">
                {thread.length === 0 && <div className="system-msg">Say hello to {first} and share what you'd like to learn first.</div>}
                {thread.map((m) => (
                  <MessageItem key={m.id} m={m} first={first} onRespond={(id, status) => respondToProposal(user.id, id, status)} />
                ))}
                {typing && (
                  <div className="typing" aria-label={`${first} is typing`}>
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>

              <div className="thread-foot">
                {connection?.status === 'active' && (
                  <ScrollArea className="quick-replies" label="Quick replies">
                    {QUICK_REPLIES.map((q) => (
                      <button key={q} type="button" className="toggle sm" onClick={() => send(q)}>
                        {q}
                      </button>
                    ))}
                  </ScrollArea>
                )}
                <form
                  className="composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                  }}
                >
                  <input ref={fileRef} type="file" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFile} />
                  <button type="button" className="icon-btn bordered" aria-label="Share a file" onClick={() => fileRef.current?.click()}>
                    <Icon name="clip" size={20} />
                  </button>
                  <label style={{ flex: '1 1 auto', display: 'flex' }}>
                    <span className="sr-only">Message {user.name}</span>
                    <input className="input" placeholder="Message…" value={draft} onChange={(e) => setDraft(e.target.value)} />
                  </label>
                  <button type="submit" className="btn btn-dark" aria-label="Send message" disabled={!draft.trim()}>
                    <Icon name="send" size={18} />
                    <span className="hide-mobile">Send</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </section>

        <aside className="chat-side" aria-label="Swap details">
          {user && unlocked ? (
            <>
              <section className="stack" style={{ gap: 10 }}>
                <h2 className="h3">Learning goals</h2>
                {state.profile.learn[0] && (
                  <div className="panel-tint" style={{ padding: 12 }}>
                    <span className="label" style={{ fontSize: 11 }}>
                      You · {state.profile.learn[0].name}
                    </span>
                    <p className="small">{state.profile.learn[0].goal || `Reach the next level in ${state.profile.learn[0].name}.`}</p>
                  </div>
                )}
                <div className="panel-tint" style={{ padding: 12 }}>
                  <span className="label" style={{ fontSize: 11 }}>
                    {first} · {user.wants[0].name}
                  </span>
                  <p className="small">{connection?.goal || `Get started with ${user.wants[0].name}.`}</p>
                </div>
              </section>
              <section className="stack" style={{ gap: 6 }}>
                <h2 className="h3">Shared files</h2>
                {resources.length === 0 && <p className="small muted">Use the paperclip to share notes or exercises.</p>}
                {resources.map((r) => (
                  <span key={r.id} className="row small" style={{ gap: 8, flexWrap: 'nowrap' }}>
                    <Icon name="file" size={18} />
                    <span>
                      {r.fileName}
                      <span className="muted"> · {r.from === 'me' ? 'you' : first}</span>
                    </span>
                  </span>
                ))}
              </section>
              <section className="stack" style={{ gap: 6 }}>
                <h2 className="h3">Safety</h2>
                <div className="row" style={{ gap: 4 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDialog('report')}>
                    Report
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDialog('block')}>
                    Block
                  </button>
                </div>
              </section>
            </>
          ) : (
            <p className="small muted">Swap details appear here.</p>
          )}
        </aside>
      </div>
      <p className="tiny muted chat-note">Demo mode: messages are saved in this browser, and replies from sample members are simulated.</p>
      {dialog && user && <ReportDialog user={user} mode={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

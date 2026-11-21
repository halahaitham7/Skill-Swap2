import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import Icon from '../components/Icon.jsx';
import ToggleGroup from '../components/ToggleGroup.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import { RatingSummary } from '../components/StarRating.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { USERS } from '../data/users.js';
import { relativeTime } from '../utils/dates.js';
import './Community.css';

const TYPES = ['Tip', 'Success story', 'Question'];
const TABS = [{ value: 'All', label: 'All posts' }, { value: 'Tip', label: 'Tips' }, { value: 'Success story', label: 'Success stories' }, { value: 'Question', label: 'Questions' }];
const TRENDING = ['Photography', 'Spanish', 'Python', 'Baking', 'Figma', 'Guitar'];

function Post({ post, member }) {
  const { state, toggleLike, addReply, hidePost } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const liked = state.likedPosts.includes(post.id);
  const needLogin = () => navigate('/login?next=%2Fcommunity');

  return (
    <article className="post">
      <div className="row-between">
        <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
          <Avatar name={post.author} palette={post.palette} src={post.mine ? state.profile.avatar : undefined} size={40} />
          <span className="stack" style={{ gap: 0 }}>
            <strong className="small">{post.author}</strong>
            <span className="tiny muted">
              {post.swap} · {relativeTime(post.createdAt)}
            </span>
          </span>
        </div>
        <span className={post.type === 'Success story' ? 'tag tag-match' : 'tag tag-soft'}>{post.type}</span>
      </div>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <div className="post-actions">
        <button type="button" className="btn btn-ghost btn-sm like-btn" aria-pressed={liked} onClick={() => (member ? toggleLike(post.id) : needLogin())}>
          <Icon name="heart" size={18} fill={liked ? 'currentColor' : 'none'} /> {post.likes + (liked ? 1 : 0)}
          <span className="sr-only">likes</span>
        </button>
        <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Icon name="message" size={18} /> {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
        </button>
        {member && !post.mine && (
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => hidePost(post.id)}>
            <Icon name="flag" size={16} /> Report
          </button>
        )}
      </div>
      {open && (
        <div className="replies">
          {post.replies.length === 0 && <p className="small muted">No replies yet.</p>}
          {post.replies.map((r, i) => (
            <p key={`${r.author}-${i}`} className="small">
              <strong>{r.author}</strong> {r.text}
            </p>
          ))}
          {member ? (
            <form
              className="row"
              style={{ gap: 8, flexWrap: 'nowrap' }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                addReply(post.id, { author: state.profile.name, text: reply.trim() });
                setReply('');
              }}
            >
              <label style={{ flex: '1 1 auto', display: 'flex' }}>
                <span className="sr-only">Write a reply</span>
                <input className="input" placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
              </label>
              <button type="submit" className="btn btn-dark" disabled={!reply.trim()}>
                Reply
              </button>
            </form>
          ) : (
            <Link to="/login?next=%2Fcommunity" className="small">
              Log in to reply
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

export default function Community() {
  useDocumentTitle('Community');
  const { state, addPost, toggleChallenge, notify } = useApp();
  const navigate = useNavigate();
  const member = state.signedIn && state.profile.onboarded;
  const [tab, setTab] = useState('All');
  const [type, setType] = useState('Tip');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { profile } = state;

  const posts = state.posts.filter((p) => !state.hiddenPosts.includes(p.id) && (tab === 'All' || p.type === tab));
  const top = [...USERS].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 3);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      notify('Add a title and a few words before posting.', 'warning');
      return;
    }
    addPost({
      author: profile.name,
      palette: profile.palette,
      mine: true,
      swap: `${profile.teach[0]?.name || 'Learner'} ⇄ ${profile.learn[0]?.name || 'Anything'}`,
      type,
      title: title.trim(),
      body: body.trim(),
      tags: [],
    });
    setTitle('');
    setBody('');
    setTab('All');
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div className="stack">
          <h1 className="h1">Community</h1>
          <p className="muted">Tips, wins and questions from people learning together.</p>
        </div>
      </div>

      <div className="split">
        <div className="main" style={{ gap: 20 }}>
          {member ? (
            <form className="composer-box" onSubmit={submit} aria-label="Write a post">
              <ToggleGroup label="Post type" options={TYPES} value={type} onChange={setType} size="sm" />
              <label className="field">
                <span className="sr-only">Title</span>
                <input className="input" placeholder="Give your post a title" maxLength={90} value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="field">
                <span className="sr-only">Post</span>
                <textarea className="input" rows={3} maxLength={600} placeholder="Share a tip, a win or a question…" value={body} onChange={(e) => setBody(e.target.value)} />
              </label>
              <div className="row-between">
                <span className="tiny muted">Be kind and specific.</span>
                <button type="submit" className="btn btn-dark">
                  Post
                </button>
              </div>
            </form>
          ) : (
            <div className="panel-mint row-between">
              <span>Join to post, like and reply.</span>
              <button type="button" className="btn btn-dark btn-sm" onClick={() => navigate('/signup')}>
                Sign up free
              </button>
            </div>
          )}

          <ScrollArea className="tabs" role="group" aria-label="Filter posts">
            {TABS.map((t) => (
              <button key={t.value} type="button" className="tab" aria-pressed={tab === t.value} onClick={() => setTab(t.value)}>
                {t.label}
              </button>
            ))}
          </ScrollArea>

          <div>
            {posts.length === 0 && (
              <div className="empty" style={{ marginTop: 16 }}>
                <strong>No posts here yet</strong>
                <p className="small muted">Be the first to share one.</p>
              </div>
            )}
            {posts.map((p) => (
              <Post key={p.id} post={p} member={member} />
            ))}
          </div>
        </div>

        <aside className="side">
          <section className="panel-butter stack" style={{ gap: 10 }}>
            <span className="label">This month's challenge</span>
            <h2 className="h3">Teach something in 15 minutes</h2>
            <p className="small">Record a short lesson of your skill and post it here. The most helpful ones are featured on the home page.</p>
            <button type="button" className="btn btn-dark btn-sm" style={{ alignSelf: 'flex-start' }} aria-pressed={state.challengeJoined} onClick={() => (member ? toggleChallenge() : navigate('/signup'))}>
              {state.challengeJoined && member ? 'Joined · Leave' : 'Join the challenge'}
            </button>
          </section>

          <section className="stack" style={{ gap: 8 }}>
            <h2 className="h3">Trending skills</h2>
            <div className="row" style={{ gap: 6 }}>
              {TRENDING.map((s) => (
                <Link key={s} to={`/explore?q=${encodeURIComponent(s)}`} className="chip chip-plain" style={{ textDecoration: 'none' }}>
                  {s}
                </Link>
              ))}
            </div>
          </section>

          <section className="stack" style={{ gap: 4 }}>
            <h2 className="h3">Top-rated teachers</h2>
            <ul className="side-list">
              {top.map((u) => (
                <li key={u.id}>
                  <Link to={`/profile/${u.id}`} className="row" style={{ gap: 10, textDecoration: 'none', flexWrap: 'nowrap' }}>
                    <Avatar name={u.name} palette={u.palette} size={36} />
                    <span className="stack" style={{ gap: 0, flex: '1 1 auto' }}>
                      <strong className="small">{u.name}</strong>
                      <span className="tiny muted">{u.teaches.map((s) => s.name).join(' · ')}</span>
                    </span>
                    <RatingSummary rating={u.rating} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section id="guidelines" className="stack" style={{ gap: 6 }}>
            <h2 className="h3">Community guidelines</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }} className="small">
              <li>Swap fairly: give as much time as you receive.</li>
              <li>Be on time, and cancel early if plans change.</li>
              <li>Keep feedback kind, honest and specific.</li>
            </ul>
          </section>

          <section id="safety" className="stack" style={{ gap: 6 }}>
            <h2 className="h3">Staying safe</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }} className="small">
              <li>Start with a video call before meeting in person.</li>
              <li>Meet in public places and tell a friend.</li>
              <li>Never share bank details. SkillSwap is always free.</li>
            </ul>
            <p className="tiny muted">Every profile, chat and post has Report and Block options. We review reports within 24 hours.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import CategoryArt from '../components/CategoryArt.jsx';
import MatchTag from '../components/MatchTag.jsx';
import Photo from '../components/Photo.jsx';
import ScrollArea from '../components/ScrollArea.jsx';
import { PHOTOS } from '../data/photos.js';
import SwapTicket, { ticketFor } from '../components/SwapTicket.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CATEGORIES } from '../data/skills.js';
import { USERS } from '../data/users.js';
import { createSeedState } from '../data/seed.js';
import { rankUsers, userCategories } from '../utils/matching.js';
import './Home.css';

const STEPS = [
  { title: 'Share your skills', text: 'Tell people what you can teach, from sourdough to Spanish, and how well you know it.' },
  { title: 'Choose what to learn', text: "Add the skills you'd love to improve, plus when you're free and how you like to meet." },
  { title: 'Find your match', text: 'We show you people who teach what you want and want what you teach.' },
  { title: 'Swap and grow', text: 'Request a swap, agree a time in chat, meet, and leave a review when you finish.' },
];

// Visitors see example matches from the sample member Sara's point of view.
const SAMPLE_PROFILE = createSeedState().profile;

export default function Home() {
  useDocumentTitle('');
  const { state } = useApp();
  const member = state.signedIn && state.profile.onboarded;
  const viewer = member ? state.profile : SAMPLE_PROFILE;

  const recommended = useMemo(
    () => rankUsers(viewer, USERS.filter((u) => !state.blocked.includes(u.id))).filter(({ match }) => match.type !== 'other').slice(0, 5),
    [viewer, state.blocked],
  );
  const teacherCount = (cat) => USERS.filter((u) => userCategories(u).includes(cat)).length;
  const latestPosts = state.posts.filter((p) => !state.hiddenPosts.includes(p.id)).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="container hero">
        <div className="hero-copy">
          <span className="label">Free skill exchange · No money changes hands</span>
          <h1 className="display">
            Everyone knows something. <span className="mark">Everyone has something to learn.</span>
          </h1>
          <p className="lead" style={{ maxWidth: 560 }}>
            SkillSwap connects you with people who want what you can teach, and who can teach what you want to learn. You teach each other. Nobody pays.
          </p>
          <div className="row">
            <Link className="btn btn-primary" to="/explore">
              Find Your Skill Partner
            </Link>
            <Link className="btn btn-secondary" to={member ? '/me' : '/signup'}>
              Share Your Skills
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <Photo name="hero" priority credit={false} ratio="4 / 3" sizes="(max-width: 1023px) 100vw, 42vw" />
          <SwapTicket
            perfect
            left={{ label: 'Sara teaches', skill: 'Photography', meta: 'Advanced' }}
            right={{ label: 'Ahmed teaches', skill: 'English', meta: 'Native speaker' }}
            reason="Each teaches what the other wants to learn."
          />
          <p className="photo-credit">
            Photo:{' '}
            <a href={PHOTOS.hero.page} target="_blank" rel="noopener noreferrer">
              {PHOTOS.hero.credit} on Unsplash
            </a>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="section" aria-labelledby="how-title" id="how">
        <div className="container stack" style={{ gap: 40 }}>
          <div className="row-between" style={{ alignItems: 'flex-end' }}>
            <div className="stack" style={{ gap: 8 }}>
              <span className="label">How it works</span>
              <h2 id="how-title" className="h1">
                Four steps from "I know this" to "I learned that"
              </h2>
            </div>
            <Link to="/how-it-works">Read the full guide</Link>
          </div>
          <ol className="timeline">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="num">{i + 1}</span>
                <h3 className="h3">{s.title}</h3>
                <p className="muted small">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Popular skills */}
      <section className="section" aria-labelledby="skills-title" id="skills">
        <div className="container stack" style={{ gap: 32 }}>
          <div className="row-between" style={{ alignItems: 'flex-end' }}>
            <div className="stack" style={{ gap: 8 }}>
              <span className="label">Popular skills</span>
              <h2 id="skills-title" className="h1">
                What people are swapping
              </h2>
            </div>
            <Link to="/explore">Explore all skills</Link>
          </div>
          <div className="mosaic">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.name} to={`/explore?category=${encodeURIComponent(cat.name)}`} className={i === 0 ? 'feature' : ''}>
                <CategoryArt motif={cat.motif} tint={cat.tint} height={i === 0 ? 300 : 130} />
                <span className="row-between" style={{ gap: 8 }}>
                  <strong style={{ fontSize: i === 0 ? 22 : 17 }}>{cat.name}</strong>
                  <span className="tiny muted">{teacherCount(cat.name)} teaching</span>
                </span>
                <span className="small muted">{cat.examples}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended partners */}
      <section className="section" aria-labelledby="partners-title">
        <div className="container stack" style={{ gap: 32 }}>
          <div className="row-between" style={{ alignItems: 'flex-end' }}>
            <div className="stack" style={{ gap: 8 }}>
              <span className="label">{member ? 'Recommended for you' : 'Recommended partners'}</span>
              <h2 id="partners-title" className="h1">
                {member ? 'People who fit your skills' : 'See how a match looks'}
              </h2>
              {!member && <p className="muted">Example matches for Sara, who teaches Photography and wants to learn English.</p>}
            </div>
            <Link to="/explore">See everyone</Link>
          </div>
          <ScrollArea className="ticket-row" label="Recommended partners">
            {recommended.map(({ user, match }) => {
              const t = ticketFor(viewer, user, match);
              return (
                <article key={user.id} className="partner-card">
                  <div className="row-between" style={{ flexWrap: 'nowrap' }}>
                    <Link to={`/profile/${user.id}`} className="row" style={{ gap: 10, textDecoration: 'none', flexWrap: 'nowrap' }}>
                      <Avatar name={user.name} palette={user.palette} size={44} />
                      <span className="stack" style={{ gap: 0 }}>
                        <strong>{user.name}</strong>
                        <span className="tiny muted">
                          {user.location} · {user.method === 'In person' ? 'In person' : user.method === 'Both' ? 'Online or in person' : 'Online'}
                        </span>
                      </span>
                    </Link>
                    <MatchTag type={match.type} />
                  </div>
                  <SwapTicket compact left={t.left} right={t.right} perfect={t.perfect} />
                  <Link to={`/profile/${user.id}`} className="small">
                    View {user.name.split(' ')[0]}'s profile
                  </Link>
                </article>
              );
            })}
          </ScrollArea>
        </div>
      </section>

      {/* Community */}
      <section className="section" aria-labelledby="community-title">
        <div className="container stack" style={{ gap: 32 }}>
          <div className="stack" style={{ gap: 8 }}>
            <span className="label">Community</span>
            <h2 id="community-title" className="h1">
              Learning is better with people
            </h2>
          </div>
          <div className="spread">
            <figure className="pull-quote">
              <Photo name="community" ratio="16 / 10" sizes="(max-width: 1023px) 100vw, 55vw" />
              <blockquote>“I taught Mei how to bake bread and she redesigned the logo for my supper club. Best trade I've ever made.”</blockquote>
              <figcaption className="row" style={{ gap: 10 }}>
                <Avatar name="Omar Farouk" palette={4} size={40} />
                <span className="stack small" style={{ gap: 0 }}>
                  <strong>Omar Farouk</strong>
                  <span className="muted">Cooking ⇄ Graphic Design</span>
                </span>
              </figcaption>
            </figure>
            <div className="notes">
              <span className="label" style={{ paddingBottom: 12 }}>
                From the community board
              </span>
              {latestPosts.map((p) => (
                <Link key={p.id} to="/community">
                  <span className="tiny muted">
                    {p.type} · {p.author}
                  </span>
                  <strong>{p.title}</strong>
                </Link>
              ))}
              <Link to="/community" style={{ borderBottom: '1px solid var(--line)' }}>
                <strong>Visit the community →</strong>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="container" style={{ paddingTop: 32 }}>
        <div className="cta-band">
          <div className="stack" style={{ gap: 12 }}>
            <h2 className="h1">Don't pay to learn everything.</h2>
            <p style={{ fontSize: 19 }}>Exchange what you know for what you want to learn. Setting up your profile takes about two minutes.</p>
          </div>
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <Link className="btn btn-primary" to={member ? '/explore' : '/signup'}>
              {member ? 'Find a partner' : 'Sign up free'}
            </Link>
            <Link className="btn btn-on-dark" to="/how-it-works">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

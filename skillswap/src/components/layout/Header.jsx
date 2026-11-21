import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Logo.jsx';
import Icon from '../Icon.jsx';
import Avatar from '../Avatar.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { relativeTime } from '../../utils/dates.js';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore Skills' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
];

export const APP_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'search' },
  { to: '/swaps', label: 'My Swaps', icon: 'swap' },
  { to: '/messages', label: 'Messages', icon: 'message' },
];

/** Closes a menu on outside click or Escape. */
function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && close();
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, close]);
}

export function useBadges() {
  const { state } = useApp();
  return {
    swaps: state.incomingRequests.length,
    messages: Object.values(state.unread).reduce((a, b) => a + b, 0),
    notes: state.notifications.filter((n) => !n.read).length,
  };
}

function Notifications() {
  const { state, markNotificationRead, markAllNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const unread = state.notifications.filter((n) => !n.read).length;
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="icon-btn" aria-label={`Notifications${unread ? `, ${unread} new` : ''}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="bell" size={22} />
        {unread > 0 && <span className="count dot-count">{unread}</span>}
      </button>
      {open && (
        <div className="menu" role="menu" aria-label="Notifications">
          <div className="menu-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={markAllNotificationsRead}>
                Mark all as read
              </button>
            )}
          </div>
          {state.notifications.length === 0 && <p className="muted small" style={{ padding: '6px 12px 12px' }}>You're all caught up.</p>}
          {state.notifications.slice(0, 8).map((n) => (
            <button
              key={n.id}
              type="button"
              role="menuitem"
              className={`menu-item${n.read ? '' : ' unread'}`}
              onClick={() => {
                markNotificationRead(n.id);
                setOpen(false);
                if (n.link) navigate(n.link);
              }}
            >
              {n.read ? <span style={{ width: 8, flex: 'none' }} /> : <span className="unread-dot" aria-hidden="true" />}
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{n.text}</span>
                <span className="tiny muted">{relativeTime(n.createdAt)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { state, logOut, resetDemo } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="avatar-button" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Avatar name={state.profile.name} palette={state.profile.palette} src={state.profile.avatar} size={40} />
      </button>
      {open && (
        <div className="menu" role="menu" aria-label="Account" style={{ width: 260 }}>
          <div className="menu-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
            <strong>{state.profile.name}</strong>
            <span className="tiny muted">{state.account?.email}</span>
          </div>
          <Link role="menuitem" className="menu-item" to="/me" onClick={() => setOpen(false)}>
            <Icon name="user" size={18} /> My Profile
          </Link>
          <Link role="menuitem" className="menu-item" to="/community" onClick={() => setOpen(false)}>
            <Icon name="message" size={18} /> Community
          </Link>
          <Link role="menuitem" className="menu-item" to="/how-it-works" onClick={() => setOpen(false)}>
            <Icon name="swap" size={18} /> How it works
          </Link>
          {state.account?.demoSample && (
            <button
              type="button"
              role="menuitem"
              className="menu-item"
              onClick={() => {
                resetDemo();
                setOpen(false);
              }}
            >
              <Icon name="refresh" size={18} /> Reset demo data
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            onClick={() => {
              setOpen(false);
              logOut();
              navigate('/');
            }}
          >
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { state } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const badges = useBadges();
  const signedIn = state.signedIn && state.profile.onboarded;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <nav aria-label="Main" className="container nav">
        <Logo to={signedIn ? '/dashboard' : '/'} />

        {signedIn ? (
          <div className="nav-links app-links">
            {APP_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {link.label}
                {link.to === '/swaps' && badges.swaps > 0 && <span className="count">{badges.swaps}</span>}
                {link.to === '/messages' && badges.messages > 0 && <span className="count">{badges.messages}</span>}
              </NavLink>
            ))}
          </div>
        ) : (
          <div id="public-links" className={`nav-links public-links${menuOpen ? ' open' : ''}`}>
            {PUBLIC_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {link.label}
              </NavLink>
            ))}
            <div className="nav-auth-mobile">
              <Link className="btn btn-secondary btn-block" to="/login">
                Log in
              </Link>
              <Link className="btn btn-dark btn-block" to="/signup">
                Sign up
              </Link>
            </div>
          </div>
        )}

        <div className="nav-actions">
          {signedIn ? (
            <>
              <Notifications />
              <AccountMenu />
            </>
          ) : (
            <>
              <Link className="nav-link hide-mobile" to="/login">
                Log in
              </Link>
              <Link className="btn btn-dark hide-mobile" to="/signup">
                Sign up
              </Link>
              <button
                type="button"
                className="icon-btn menu-toggle"
                aria-expanded={menuOpen}
                aria-controls="public-links"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

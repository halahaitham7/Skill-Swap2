import { NavLink } from 'react-router-dom';
import Icon from '../Icon.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useBadges } from './Header.jsx';

const TABS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'search' },
  { to: '/swaps', label: 'Swaps', icon: 'swap', badge: 'swaps' },
  { to: '/messages', label: 'Chat', icon: 'message', badge: 'messages' },
  { to: '/me', label: 'Me', icon: 'user' },
];

/** Phone-only bottom navigation for signed-in members (thumb-reachable). */
export default function TabBar() {
  const { state } = useApp();
  const badges = useBadges();
  if (!state.signedIn || !state.profile.onboarded) return null;

  return (
    <nav className="tabbar" aria-label="App sections">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}>
          <span className="tab-icon">
            <Icon name={tab.icon} size={22} />
            {tab.badge && badges[tab.badge] > 0 && <span className="count dot-count">{badges[tab.badge]}</span>}
          </span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

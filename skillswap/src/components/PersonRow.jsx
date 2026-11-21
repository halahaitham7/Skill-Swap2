import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';
import MatchTag from './MatchTag.jsx';
import SkillChip from './SkillChip.jsx';
import SwapAction from './SwapAction.jsx';
import { RatingSummary } from './StarRating.jsx';
import { useApp } from '../context/AppContext.jsx';
import { explainMatch } from '../utils/matching.js';

/** One person in Explore results: who they are, what they teach/want, and why they match. */
export default function PersonRow({ user, match, comparing, onToggleCompare, compareDisabled, viewer }) {
  const { state, toggleFavorite } = useApp();
  const saved = state.favorites.includes(user.id);

  return (
    <article className={`person-row${match.perfect ? ' perfect' : ''}`}>
      <Link to={`/profile/${user.id}`} className="person-avatar" aria-label={`${user.name}'s profile`}>
        <Avatar name={user.name} palette={user.palette} size={64} />
      </Link>
      <div className="person-body">
        <div className="row" style={{ gap: 10 }}>
          <h3 className="h3">
            <Link to={`/profile/${user.id}`} className="person-name">
              {user.name}
            </Link>
          </h3>
          <MatchTag type={match.type} />
        </div>
        <div className="row small muted" style={{ gap: 12 }}>
          <span>{user.location}</span>
          <span>{user.method === 'In person' ? 'In person (offline)' : user.method === 'Both' ? 'Online or in person' : 'Online'}</span>
          <RatingSummary rating={user.rating} count={user.reviewCount} />
        </div>
        <div className="row" style={{ gap: 6 }}>
          {user.teaches.map((s) => (
            <SkillChip key={s.name} name={s.name} kind="teach" level={s.level} hit={match.theyTeachForMe.includes(s.name)} />
          ))}
          {user.wants.map((s) => (
            <SkillChip key={s.name} name={s.name} kind="learn" hit={match.theyWantFromMe.includes(s.name)} />
          ))}
        </div>
        <p className="small">{explainMatch(user, match, viewer)}</p>
      </div>
      <div className="person-actions">
        <SwapAction user={user} match={match} size="sm" />
        <div className="row" style={{ gap: 4 }}>
          <Link className="btn btn-ghost btn-sm" to={`/profile/${user.id}`}>
            View profile
          </Link>
          <button
            type="button"
            className="icon-btn save-btn"
            aria-pressed={saved}
            aria-label={saved ? `Remove ${user.name} from saved` : `Save ${user.name}`}
            onClick={() => toggleFavorite(user.id)}
          >
            <Icon name="bookmark" size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <label className="checkbox tiny" style={{ minHeight: 44, padding: '0 6px' }}>
            <input type="checkbox" checked={comparing} disabled={!comparing && compareDisabled} onChange={() => onToggleCompare(user.id)} />
            Compare
          </label>
        </div>
      </div>
    </article>
  );
}

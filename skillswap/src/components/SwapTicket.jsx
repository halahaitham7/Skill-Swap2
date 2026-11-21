import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';

function Half({ side, align }) {
  if (side.empty) {
    return (
      <div className={`ticket-half ghost ${align}`}>
        <span className="label">{side.label}</span>
        <span className="ticket-empty">{side.text}</span>
      </div>
    );
  }
  return (
    <div className={`ticket-half ${align}`}>
      <span className="label">{side.label}</span>
      <span className="ticket-skill">{side.skill}</span>
      {side.meta && <span className="small muted">{side.meta}</span>}
      {side.person && (
        <span className="ticket-person">
          <Avatar name={side.person.name} palette={side.person.palette} src={side.person.src} size={32} />
          <span className="small">{side.person.name}</span>
        </span>
      )}
    </div>
  );
}

/**
 * The swap ticket: what you give on one side, what you get on the other,
 * joined by a perforation. The single most important explanatory element.
 */
export default function SwapTicket({ left, right, perfect = false, reason, compact = false }) {
  return (
    <div className="ticket-host">
      <div className={`ticket${compact ? ' compact' : ''}${perfect ? ' perfect' : ''}`}>
        <Half side={left} align="start" />
        <div className="ticket-join" aria-hidden="true">
          <Icon name="swap" size={compact ? 20 : 26} strokeWidth={2.2} />
          {perfect && !compact && <span>Perfect match</span>}
        </div>
        <Half side={right} align="end" />
        {reason && <p className="ticket-reason">{reason}</p>}
      </div>
    </div>
  );
}

/** Builds the two halves from the viewer's point of view. */
export function ticketFor(profile, user, match, { withPeople = false } = {}) {
  const first = user.name.split(' ')[0];
  const youTeach = match.theyWantFromMe[0];
  const theyTeach = match.theyTeachForMe[0];
  const myLevel = profile.teach.find((s) => s.name === youTeach)?.level;
  const theirSkill = user.teaches.find((s) => s.name === theyTeach);

  const left = youTeach
    ? { label: 'You teach', skill: youTeach, meta: myLevel, person: withPeople ? { name: profile.name || 'You', palette: profile.palette, src: profile.avatar } : null }
    : { label: 'You teach', empty: true, text: `${first} doesn't need your skills yet` };
  const right = theyTeach
    ? { label: `${first} teaches`, skill: theyTeach, meta: theirSkill?.note || theirSkill?.level, person: withPeople ? { name: user.name, palette: user.palette } : null }
    : { label: `${first} teaches`, skill: user.teaches[0].name, meta: 'Not on your learning list' };

  return { left, right, perfect: match.perfect };
}

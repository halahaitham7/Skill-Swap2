/**
 * Teach chips show ↗ and a solid/tinted fill; learn chips show ↙ and a dashed
 * outline. The arrow and outline keep the difference clear without relying on
 * colour. `hit` means the skill matches the viewer's own profile.
 */
export default function SkillChip({ name, kind = 'teach', level, hit = false }) {
  const teach = kind === 'teach';
  return (
    <span className={`chip ${teach ? 'chip-teach' : 'chip-learn'}${hit ? ' hit' : ''}`}>
      <span className="arrow" aria-hidden="true">
        {teach ? '↗' : '↙'}
      </span>
      <span className="sr-only">{teach ? 'Teaches' : 'Wants to learn'}</span>
      {name}
      {level && <span className="level">· {level}</span>}
    </span>
  );
}

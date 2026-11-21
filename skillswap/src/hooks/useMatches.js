import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { USERS } from '../data/users.js';
import { rankUsers } from '../utils/matching.js';

/** Returns every non-blocked member ranked by match quality for the current profile. */
export function useMatches() {
  const { state } = useApp();
  const { profile, blocked } = state;
  return useMemo(
    () => rankUsers(profile, USERS.filter((u) => !blocked.includes(u.id))),
    [profile, blocked],
  );
}

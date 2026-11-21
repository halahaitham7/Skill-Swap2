// Derived learning statistics, computed from the swap and session history.

import { getUser } from '../data/users.js';
import { addDays, fromISODate, todayISO } from './dates.js';

export const LEARN_GOAL_SESSIONS = 20;

export function completedSessions(state) {
  return state.sessions.filter((s) => s.status === 'completed');
}

export function upcomingSessions(state, partnerId) {
  const today = todayISO();
  return state.sessions
    .filter((s) => s.status === 'upcoming' && s.date >= today && (!partnerId || s.partnerId === partnerId))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

/** Sessions completed with a partner, including history from before the demo. */
export function sessionsWithPartner(state, partnerId) {
  return (state.completedBefore[partnerId] || 0) + completedSessions(state).filter((s) => s.partnerId === partnerId).length;
}

/**
 * Progress towards a skill you want to learn: every completed session with
 * someone who teaches that skill counts as one step towards the goal.
 */
export function skillProgress(state, skillName) {
  const key = skillName.toLowerCase();
  const done = state.connections
    .filter((c) => getUser(c.userId)?.teaches.some((t) => t.name.toLowerCase() === key))
    .reduce((sum, c) => sum + sessionsWithPartner(state, c.userId), 0);
  return { done, goal: LEARN_GOAL_SESSIONS, percent: Math.min(100, Math.round((done / LEARN_GOAL_SESSIONS) * 100)) };
}

export function learningStats(state) {
  const completed = completedSessions(state);
  const minutes = completed.reduce((sum, s) => sum + Number(s.duration), 0);
  return {
    sessions: completed.length,
    hours: Math.round((minutes / 60) * 10) / 10,
    streak: state.profile.streakWeeks || 0,
    swapsDone: state.connections.filter((c) => c.status === 'completed').length,
  };
}

/** Hours per week for the last 8 weeks (7 stored weeks + this week from sessions). */
export function weeklyHours(state) {
  const weekAgo = addDays(new Date(), -7);
  const thisWeek = completedSessions(state)
    .filter((s) => fromISODate(s.date) >= weekAgo)
    .reduce((sum, s) => sum + Number(s.duration) / 60, 0);
  const history = state.profile.weeklyHours || [];
  return [...history.slice(-7), Math.round(thisWeek * 10) / 10];
}

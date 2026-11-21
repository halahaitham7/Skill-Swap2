// Initial demo state. Dates are generated relative to "today" so the demo
// always shows upcoming sessions in the future and history in the past.
//
// DEMO MODE: there is no backend. Accounts, swaps and messages are stored in
// this browser only, and sample members never answer requests for real.

import { isoInDays } from '../utils/dates.js';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

export const STATE_VERSION = 2;

/** Shared community content that exists for every account. */
function communityPosts(now) {
  return [
    { id: 'p1', author: 'Mei Chen', palette: 1, swap: 'Design ⇄ Cooking', type: 'Tip', title: 'Write a 3-line plan before every session', body: 'I list what I want to teach, one exercise, and one thing to practise before next time. It keeps 45 minutes from turning into small talk, and my partners say they remember more.', tags: ['TeachingTips', 'GraphicDesign'], likes: 48, createdAt: now - 2 * HOUR, replies: [{ author: 'Omar Farouk', text: 'Stealing this for my cooking sessions!' }] },
    { id: 'p2', author: 'Lucía Romero', palette: 4, swap: 'Spanish ⇄ Python', type: 'Success story', title: 'Shipped my first script after 6 swaps!', body: 'Lukas helped me automate my shop inventory spreadsheet. In return he can now order food and argue about football in Spanish. Two-way learning really works.', tags: ['Python', 'Spanish'], likes: 132, createdAt: now - 5 * HOUR, replies: [{ author: 'Lukas Weber', text: '¡Gracias, Lucía! Best student ever.' }] },
    { id: 'p3', author: 'Kenji Watanabe', palette: 2, swap: 'English ⇄ Photography', type: 'Question', title: 'How do you split time fairly in one session?', body: 'My partner and I keep running over on the first half. Do you alternate whole sessions or split each one 50/50? What works for you?', tags: ['Scheduling', 'Photography'], likes: 21, createdAt: now - DAY, replies: [{ author: 'Ahmed Mansour', text: 'We set a timer for 30 + 30. Works every time.' }, { author: 'Priya Nair', text: 'Alternating whole sessions helps us go deeper.' }] },
    { id: 'p4', author: 'Amira Hassan', palette: 3, swap: 'Arabic ⇄ Photography', type: 'Tip', title: 'Share resources the day before', body: 'Send your partner a short video or cheat sheet a day ahead. They arrive with questions instead of starting cold, so you get through twice as much together.', tags: ['Languages', 'LearningResources'], likes: 76, createdAt: now - 2 * DAY, replies: [] },
  ];
}

export const EMPTY_PROFILE = {
  name: '',
  location: '',
  bio: '',
  avatar: null,
  palette: 0,
  teach: [],
  learn: [],
  method: 'Online',
  days: [],
  times: [],
  agreed: false,
  onboarded: false,
  streakWeeks: 0,
  weeklyHours: [0, 0, 0, 0, 0, 0, 0],
};

/** A brand-new local account with nothing in it yet. */
export function createFreshState({ name, email }) {
  const now = Date.now();
  return {
    version: STATE_VERSION,
    account: { name, email, demoSample: false },
    signedIn: true,
    profile: { ...EMPTY_PROFILE, name, palette: Math.floor(Math.random() * 6) },
    favorites: [],
    sentRequests: [],
    requestNotes: {},
    incomingRequests: [],
    connections: [],
    blocked: [],
    reported: [],
    notifications: [
      { id: 'welcome', type: 'info', text: `Welcome to SkillSwap, ${name.split(' ')[0]}! Finish your profile to see your matches.`, link: '/welcome/1', createdAt: now, read: false },
    ],
    conversations: {},
    unread: {},
    sessions: [],
    completedBefore: {},
    posts: communityPosts(now),
    likedPosts: [],
    hiddenPosts: [],
    challengeJoined: false,
  };
}

/** The sample account "Sara", with swaps, messages and history to explore. */
export function createSeedState({ signedIn = false } = {}) {
  const now = Date.now();

  return {
    version: STATE_VERSION,
    account: { name: 'Sara Malik', email: 'sara@demo.skillswap', demoSample: true },
    signedIn,
    profile: {
      name: 'Sara Malik',
      location: 'Lisbon, Portugal',
      bio: "Freelance portrait photographer. I'd love to get confident speaking English for international clients.",
      avatar: null,
      palette: 0,
      teach: [
        { name: 'Photography', level: 'Advanced' },
        { name: 'Photo editing', level: 'Intermediate' },
      ],
      learn: [{ name: 'English', level: 'Beginner', goal: 'Chat comfortably with clients on set and over email.' }],
      method: 'Online',
      days: ['Tue', 'Thu', 'Sat'],
      times: ['Afternoon', 'Evening'],
      agreed: true,
      onboarded: true,
      streakWeeks: 5,
      weeklyHours: [0.5, 1, 1, 1.5, 1, 1.5, 1.5],
    },
    favorites: ['ana', 'amira', 'kenji'],
    sentRequests: ['lukas'],
    requestNotes: {
      lukas: { teach: 'Photo editing', learn: 'Python', message: 'Hi Lukas! Happy to help with Lightroom. Could you show me some Python basics?', at: now - 2 * DAY },
    },
    incomingRequests: [
      { userId: 'ana', teach: 'English', learn: 'Photo editing', message: "Hi Sara! I'd love help with Lightroom. Happy to do English practice on weekends.", createdAt: now - 5 * HOUR },
    ],
    connections: [
      { userId: 'ahmed', kind: 'exchange', status: 'active', total: 10, startedAt: now - 30 * DAY, goal: 'Shoot in manual mode and light a portrait indoors.' },
      { userId: 'lea', kind: 'buddy', status: 'active', total: 8, startedAt: now - 20 * DAY, goal: 'Practise English conversation together.' },
      {
        userId: 'mei',
        kind: 'exchange',
        status: 'completed',
        total: 6,
        startedAt: now - 120 * DAY,
        completedAt: now - 60 * DAY,
        goal: 'Photograph her studio work for a portfolio.',
        review: { rating: 5, tags: ['Well prepared', 'Fun to learn with'], text: 'Mei made design theory click for me. Our sessions were the highlight of my week.' },
      },
    ],
    blocked: [],
    reported: [],
    notifications: [
      { id: 'n1', type: 'match', text: 'New match: Kenji Watanabe teaches English and wants Photography.', link: '/profile/kenji', createdAt: now - 2 * HOUR, read: false },
      { id: 'n2', type: 'request', text: 'Ana Ribeiro sent you a swap request.', link: '/swaps', createdAt: now - 5 * HOUR, read: false },
      { id: 'n3', type: 'reminder', text: 'Reminder: your next session with Ahmed is coming up this week.', link: '/swaps/ahmed', createdAt: now - DAY, read: false },
    ],
    conversations: {
      ahmed: [
        { id: 'm1', from: 'system', type: 'text', text: 'Swap started · English ⇄ Photography', at: now - 30 * DAY },
        { id: 'm2', from: 'them', type: 'text', text: "Hi Sara! For our next English session I'd like to focus on small talk with clients. Booking shoots, giving directions on set, that kind of thing.", at: now - 3 * HOUR },
        { id: 'm3', from: 'me', type: 'text', text: "Perfect, that's exactly what I need. In return I'll cover manual mode: aperture, shutter and ISO.", at: now - 2.9 * HOUR },
        { id: 'm4', from: 'me', type: 'resource', fileName: 'Exposure triangle cheat sheet.pdf', size: '1.2 MB', at: now - 2.85 * HOUR },
        { id: 'm5', from: 'them', type: 'proposal', proposal: { date: isoInDays(6), time: '19:00', duration: 60, mode: 'Online', focus: 'Both, 50/50', status: 'open' }, at: now - 2.5 * HOUR },
        { id: 'm6', from: 'them', type: 'text', text: "Thursday works for me! I'll bring my camera.", at: now - 2.4 * HOUR },
        { id: 'm7', from: 'them', type: 'resource', fileName: 'Phrases for photo shoots.docx', size: '84 KB', at: now - 2.3 * HOUR },
      ],
      lea: [
        { id: 'l1', from: 'me', type: 'text', text: 'That was fun! My pronunciation is getting better.', at: now - 4 * DAY },
        { id: 'l2', from: 'them', type: 'text', text: 'Same time next Friday?', at: now - 4 * DAY + HOUR },
      ],
      mei: [
        { id: 'c1', from: 'them', type: 'text', text: 'Thank you for six great sessions, Sara! Good luck with the portfolio.', at: now - 60 * DAY },
      ],
    },
    unread: { ahmed: 1 },
    sessions: [
      { id: 's1', partnerId: 'ahmed', focus: 'Both, 50/50', date: isoInDays(6), time: '19:00', duration: 60, mode: 'Online', place: '', note: "Let's do client small talk first, then manual mode.", status: 'upcoming' },
      { id: 's2', partnerId: 'ahmed', focus: 'Photography first', date: isoInDays(8), time: '15:00', duration: 45, mode: 'Online', place: '', note: '', status: 'upcoming' },
      { id: 's3', partnerId: 'lea', focus: 'English first', date: isoInDays(14), time: '18:00', duration: 30, mode: 'Online', place: '', note: '', status: 'upcoming' },
      { id: 's4', partnerId: 'ahmed', focus: 'English first', date: isoInDays(-1), time: '19:00', duration: 45, mode: 'Online', place: '', note: 'Ordering & small talk', status: 'completed', review: null },
      { id: 's5', partnerId: 'ahmed', focus: 'Photography first', date: isoInDays(-6), time: '15:00', duration: 60, mode: 'Online', place: '', note: 'Composition basics', status: 'completed', review: { rating: 5, tags: ['Patient'], text: 'Great session.' } },
      { id: 's6', partnerId: 'ahmed', focus: 'English first', date: isoInDays(-8), time: '19:00', duration: 45, mode: 'Online', place: '', note: 'Pronunciation', status: 'completed', review: { rating: 4.5, tags: ['Well prepared'], text: 'Very useful drills.' } },
      { id: 's7', partnerId: 'lea', focus: 'English first', date: isoInDays(-4), time: '18:00', duration: 30, mode: 'Online', place: '', note: 'Study buddy chat', status: 'completed', review: { rating: 5, tags: ['Fun to learn with'], text: '' } },
    ],
    completedBefore: { ahmed: 3, lea: 2, mei: 6 },
    posts: communityPosts(now),
    likedPosts: ['p2'],
    hiddenPosts: [],
    challengeJoined: false,
  };
}

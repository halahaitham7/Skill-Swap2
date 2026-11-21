// Skill categories, levels and scheduling constants shared across the app.

// Each category has its own drawn motif (see components/CategoryArt.jsx)
// on a tint of Mint Teal or Butter Yellow.
export const CATEGORIES = [
  { name: 'Photography', motif: 'photography', tint: 'butter', examples: 'Portraits · Lightroom · Street' },
  { name: 'Languages', motif: 'languages', tint: 'mint', examples: 'English · Spanish · Arabic' },
  { name: 'Programming', motif: 'programming', tint: 'mint', examples: 'Python · JavaScript · SQL' },
  { name: 'Graphic Design', motif: 'design', tint: 'butter', examples: 'Figma · Branding · Illustration' },
  { name: 'Cooking', motif: 'cooking', tint: 'butter', examples: 'Baking · Vegan · Middle Eastern' },
  { name: 'Music', motif: 'music', tint: 'mint', examples: 'Guitar · Piano · Music theory' },
  { name: 'Marketing', motif: 'marketing', tint: 'mint', examples: 'Social media · SEO · Copywriting' },
  { name: 'Video Editing', motif: 'video', tint: 'butter', examples: 'Premiere · DaVinci · Reels' },
];

// Popular skills offered as one-tap choices during onboarding.
export const SUGGESTED_SKILLS = [
  'Photography', 'English', 'Spanish', 'Arabic', 'Python', 'JavaScript', 'Graphic Design',
  'Cooking', 'Baking', 'Guitar', 'Piano', 'Marketing', 'Video Editing', 'Photo editing',
];

// Maps a (lower-cased) skill name to its category. Unknown skills fall back to "Other".
const SKILL_CATEGORY = {
  photography: 'Photography',
  'photo editing': 'Photography',
  lightroom: 'Photography',
  'film photography': 'Photography',
  english: 'Languages',
  spanish: 'Languages',
  arabic: 'Languages',
  french: 'Languages',
  portuguese: 'Languages',
  japanese: 'Languages',
  german: 'Languages',
  'public speaking': 'Languages',
  python: 'Programming',
  javascript: 'Programming',
  sql: 'Programming',
  react: 'Programming',
  'graphic design': 'Graphic Design',
  illustration: 'Graphic Design',
  figma: 'Graphic Design',
  branding: 'Graphic Design',
  cooking: 'Cooking',
  baking: 'Cooking',
  sourdough: 'Cooking',
  guitar: 'Music',
  piano: 'Music',
  'music theory': 'Music',
  music: 'Music',
  marketing: 'Marketing',
  seo: 'Marketing',
  copywriting: 'Marketing',
  'social media': 'Marketing',
  'video editing': 'Video Editing',
  premiere: 'Video Editing',
};

export function categoryOf(skillName = '') {
  return SKILL_CATEGORY[skillName.trim().toLowerCase()] || 'Other';
}

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const METHODS = ['Online', 'In person', 'Both'];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const TIMES = ['Morning', 'Afternoon', 'Evening'];
export const DURATIONS = [30, 45, 60, 90];
export const START_TIMES = ['09:00', '12:00', '15:00', '17:30', '18:00', '19:00', '20:00'];

// Availability filter options used on Explore.
export const WHEN_FILTERS = ['Any time', 'Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];

// Avatar fills, built only from the approved palette (and its tints).
// Initials are always Deep Teal or Cream so they stay readable.
export const AVATAR_PALETTES = [
  { bg: '#F2D27A', fg: '#203B3A' },
  { bg: 'rgba(61, 155, 143, 0.28)', fg: '#203B3A' },
  { bg: 'rgba(242, 139, 112, 0.38)', fg: '#203B3A' },
  { bg: '#203B3A', fg: '#F8F6F0' },
  { bg: 'rgba(242, 210, 122, 0.5)', fg: '#203B3A' },
  { bg: 'rgba(32, 59, 58, 0.12)', fg: '#203B3A' },
];

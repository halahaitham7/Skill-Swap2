# SkillSwap – Learn, Teach & Grow Together

SkillSwap is a skill-exchange platform where people trade knowledge without money.

> **Everyone knows something. Everyone has something to learn.**

Sara knows photography and wants to learn English. Ahmed knows English and wants to learn photography. SkillSwap matches them, and they teach each other.

---

## ⚠️ Demo mode

This version runs **without a server**. Everything is real React functionality, but it is stored locally:

| What | How it works today |
| --- | --- |
| Sign up / Log in | Validates name, email and password, and creates an account **in this browser only**. Passwords are never stored. |
| Matching | Runs on 10 built-in sample members. |
| Swap requests | You can send, withdraw, accept and decline. Sample members never answer requests you send. |
| Messages | Saved locally. Replies from sample members are **simulated** so you can try the chat. |
| Photos | Resized to 512 px and stored in `localStorage`. |

Use **"Explore the demo as Sara"** on the Log in or Sign up page to see an account with active swaps, messages and history.

### Needs a backend (not built yet)

Real multi-user accounts, matching between real people, request delivery, real-time chat and file storage need a server, for example Supabase (auth, Postgres, Realtime, Storage) or Firebase. The UI is ready for them. The data layer lives in `src/context/AppContext.jsx`, so its actions can be swapped for API calls without changing the pages.

---

## Design system: "Fresh & Creative"

Only these five colours are used. Tints are the same colours at lower opacity.

| Token | Hex | Use |
| --- | --- | --- |
| `--cream` | `#F8F6F0` | Page background |
| `--teal` | `#203B3A` | Headings, important text, dark elements |
| `--mint` | `#3D9B8F` | Primary buttons and interactive elements |
| `--coral` | `#F28B70` | Small accents and important highlights (badges, "new", error markers) |
| `--butter` | `#F2D27A` | Highlighting selected content and perfect matches |

- **Type:** Plus Jakarta Sans (headings), DM Sans (body, buttons, labels, forms).
- **Spacing:** 4 px base (`--s-1` 4 … `--s-9` 96).
- **Radius:** 8 px for buttons and inputs, 12 px for panels, 16 px for dialogs.
- **Shadows:** only on overlays (menus, dialogs, toasts).
- **Breakpoints:** phone < 640, tablet 640–1023, laptop 1024+. Signed-in phones get a bottom tab bar below 760 px.
- **Teach vs learn:** teach chips are solid Deep Teal with ↗. Learn chips are dashed outlines with ↙.
- **Swap ticket:** the signature component (`SwapTicket.jsx`). It shows what each person would teach the other.
- **Category motifs:** `CategoryArt.jsx` draws one motif per skill category: viewfinder, glyphs, code, shapes, staff lines, recipe card, bars and film strip.

**Accessibility note:** Mint Teal doesn't reach the 4.5:1 contrast that normal-size text needs. Primary buttons therefore use large bold labels (19 px, 700), which meet WCAG AA's large-text rule. Hover switches the button to Deep Teal, and small text is always Deep Teal.

All tokens live in `src/styles/global.css`.

---

## Pages & routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/explore` | Explore Skills (search, category, level, time, online/in-person) | Public |
| `/how-it-works` | How It Works + FAQ | Public |
| `/about` | About Us + demo-mode explanation | Public |
| `/profile/:userId` | Member profile with compatibility | Public (actions need login) |
| `/community` | Community posts | Public (posting needs login) |
| `/signup`, `/login` | Authentication | Public |
| `/welcome/1–4` | 4-step onboarding | Signed in |
| `/dashboard` | Dashboard with "Do this next" | Signed in |
| `/swaps` | My Swaps: Incoming, Sent, Active, Completed | Signed in |
| `/swaps/:userId` | One swap: book sessions, mark done, rate, complete and review | Signed in |
| `/messages`, `/messages/:userId` | Messages (only for accepted swaps) | Signed in |
| `/me` | My Profile (edit everything, blocked members) | Signed in |

Old links still work: `/match` → `/explore` and `/sessions` → `/swaps`.

---

## Tech stack

- **React 18** with hooks (`useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`, `useContext`)
- **React Router 6**
- **Vite 5**
- Plain CSS with design tokens. No UI framework.

## Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build at http://localhost:4173
```

## Project structure

```
src/
├── main.jsx, App.jsx            # Entry and route table
├── styles/                      # global.css (tokens, primitives), components.css
├── context/AppContext.jsx       # All state and actions (demo: localStorage)
├── data/                        # users.js, seed.js, skills.js
├── hooks/                       # useMatches, useDocumentTitle
├── utils/                       # matching.js, progress.js, dates.js
├── components/
│   ├── layout/                  # Header, TabBar, Footer, layouts
│   ├── profile/ProfileFields.jsx# Photo, skills and availability editors
│   ├── SwapTicket, PersonRow, SwapAction, CategoryArt, MatchTag, SkillChip, Photo, ScrollArea
│   ├── RequestDialog, CompleteSwapDialog, ReportDialog, Modal, Toasts
│   └── Avatar, Icon, Logo, ProgressBar, StarRating, ToggleGroup, RequireAuth
└── pages/                       # One file (+ CSS) per page
```

## Photography

Photos are free to use under the [Unsplash License](https://unsplash.com/license) and load from the Unsplash CDN in responsive sizes (`src/components/Photo.jsx`, `src/data/photos.js`):

| Where | Photo | Photographer |
| --- | --- | --- |
| Home hero | [Friends gather around a camera](https://unsplash.com/photos/friends-gather-around-a-camera-looking-at-photos-U_v2LK2V6aM) | Justin Min |
| Home community | [People preparing food in a kitchen](https://unsplash.com/photos/a-group-of-people-preparing-food-in-a-kitchen-ANY9TweFHNI) | Sweet Life |
| About Us | [Pottery class with instructor and students](https://unsplash.com/photos/pottery-class-with-instructor-and-students-kzI4aXD1a2Y) | Vitaly Gariev |

To use your own photos, change the entries in `src/data/photos.js`. Every photo uses a fixed `aspect-ratio` with `object-fit: cover`, so any size works without stretching.

## Content to supply

- **About Us story:** the "Our story" section on `/about` is intentionally empty until you provide it.

## UI quality checks

These rules keep the layout clean at every width (see `src/styles/global.css`):

- **Hover only on real pointers:** every `:hover` rule sits inside `@media (hover: hover)`, so taps on phones don't leave buttons stuck in their hover style. Touch gets a short `:active` pressed state instead.
- **One z-index scale:** `--z-raised`, `--z-page-menu`, `--z-header`, `--z-tabbar`, `--z-toast` and `--z-modal`. Page menus sit below the sticky header, so nothing slides over the navigation.
- **No hidden clipping:** anything that scrolls sideways uses `ScrollArea.jsx`, which fades only the edge where more content is hidden.
- **No mid-word breaks:** swap-ticket text is sized with container query units (`cqi`), and tickets stack when narrow. Headings use `text-wrap: balance`.
- **Contrast:** every text and background pair was measured at 320, 768, 1024 and 1440 px. The lowest is 4.64:1, which passes WCAG AA.

## Deploying

The app uses client-side routing. Configure your host to serve `index.html` for all routes:

- **Vercel:** works out of the box for Vite projects.
- **Netlify:** add `public/_redirects` containing `/*  /index.html  200`.
- **GitHub Pages:** set `base` in `vite.config.js`, or switch to `HashRouter`.

People who used the previous version will start fresh: the stored state version changed to 2, so their old demo data is replaced by the new sample data on first load.

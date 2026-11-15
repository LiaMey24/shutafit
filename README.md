# Shutafit — MVP prototype

A roommate-matching web app (Hebrew, RTL, mobile-sized). Data stays in your browser (localStorage), with 20 demo profiles.

## Run
```
npm install
npm run dev      # http://localhost:5173
npm test         # matching-engine tests
```

## What's in v1
- 4-step onboarding: profile, deal-breakers (layer 1), behavioral habit scenarios (layer 2), personality and vibe (layer 3)
- Hard filtering: clashing profiles never appear (`src/matching/hardFilters.ts`)
- Match score: 60% habits + 40% personality (`src/matching/score.ts`)
- Shared points and friction points on every card (`src/matching/insights.ts`)
- Swipe deck, full profile, mutual match, chat with conversation starters from the gaps
- Freemium demo: 10 swipes a day, simulated Premium

Phase 2: roommate groups and house profiles with group compatibility.

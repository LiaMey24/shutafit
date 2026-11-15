# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Shutafit is a university MVP prototype of a roommate-matching app: people are matched by lifestyle compatibility *before* looking for an apartment. It is a client-only web app (React 18 + TypeScript + Vite + Tailwind 3 + Zustand + Framer Motion). There is no backend: all state lives in `localStorage`, and the "other users" are 20 hard-coded demo profiles. The UI is **Hebrew, right-to-left** (`<html dir="rtl" lang="he">`), sized for mobile (max width 430px).

## Commands

```bash
npm run dev                                  # dev server on http://localhost:5173
npm run build                                # tsc -b type-check, then vite build
npm test                                     # vitest run (all tests)
npx vitest run src/matching/matching.test.ts # one file
npx vitest run -t "gives 100"                # tests whose name matches
```

There is no linter. `npm run build` is the type check (strict mode, `noUnusedLocals`/`noUnusedParameters` on).

Node.js was installed via winget during setup. Shells started before that install may not have it on PATH. If `node` isn't found, refresh PATH first: `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`. `.claude/launch.json` points at `C:\Program Files\nodejs\npm.cmd` for the same reason.

## Architecture

The product spec's "3-layer questionnaire" drives the whole data model and matching engine:

- **Layer 1, hard filters** (`Profile.filters`): budget, areas, smoking, pets, kosher, Shabbat. `src/matching/hardFilters.ts` applies them **symmetrically**: each side's deal-breakers are checked against the other. A clash means the profiles never see each other. Kosher/Shabbat only block when the user marks them as a deal-breaker.
- **Layer 2, living habits** (`Profile.habits`): five 1–5 scales.
- **Layer 3, personality** (`Profile.personality`): social battery (1–5), weekend style, and tag lists (hobbies, shows, music).

`src/matching/score.ts` computes the 0–100 score: 60% weighted habit similarity (`1 - |a-b|/4`) and 40% personality (Jaccard overlap on tags, neutral 0.5 when a list is empty). The weights are exported constants. `src/matching/insights.ts` produces "shared" strings and "gap" items (a habit difference of ≥ 2 points). These appear on the swipe card, the profile detail page and the chat header.

`src/data/questions.ts` is the single source for every option list and Hebrew label. Each scale question has two label arrays: `options` (the long behavioral scenario answers shown in onboarding) and `levels` (short labels used on cards and in gap text). The option at index *i* is value *i + 1*. Adding a habit means updating the `Habits` type, `HABIT_QUESTIONS`, `HABIT_WEIGHTS` (keep the sum at 1), and the seed profiles.

`src/data/seedProfiles.ts` builds demo users with the compact helper `p(...)`. Habits are a 5-digit string, and deal-breakers are a flags string (`S/s` smoking, `P/p` pets, `k/K` kosher, `b/B` Shabbat, where the uppercase letter of kosher/Shabbat means deal-breaker). See the comment at the top of that file.

`src/store/useApp.ts` is the one Zustand store, persisted under the localStorage key `shutafit-v1` (change the key if the state shape changes incompatibly). It also exports `buildDeck` (hard filter → remove already-swiped → sort by score) and the demo behavior: seed users "like back" with a probability tied to the match score, and the chat sends a canned reply after a delay. Zustand v5 is in use: selectors must not return a new object or array on every call, or rendering loops. Select primitives separately.

Routing uses `HashRouter` (`src/App.tsx`). Routes other than `/onboarding` are wrapped in `RequireProfile`, which redirects to onboarding when there is no `me`. Onboarding also serves as "edit profile" (it starts from the existing `me`).

## Scope

Done (phase 1): onboarding, hard filters, score, shared/friction insights, swipe deck, profile detail, mutual match, chat, and the simulated freemium limit of 10 swipes a day.

Phase 2, planned and not built: roommate groups and a "house profile" (group compatibility = pairwise scores of all members; a house profile = members' habits averaged, so a candidate gets one score against it). Per the spec, auto-generated ice-breaker sentences, advanced pet profiles, and verification are out of scope.

UI text is Hebrew, using slash forms for gender (`מחפש/ת`). Keep new strings consistent with that.

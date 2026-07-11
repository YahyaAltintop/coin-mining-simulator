# Contributing

Thanks for your interest! This is a small hobby project — the bar is low and PRs are appreciated.

## Setup

```bash
npm install
npm run dev
```

## Before you open a PR

1. **`npm run build` must pass** — it runs `vue-tsc` type-checking plus the production build. There is no separate lint/test step (yet).
2. **Keep translations in sync** — every UI string lives in `src/i18n/index.ts` with both `tr` and `en` entries. If you add or change a key, update both dictionaries.
3. **Balance values belong in `src/data/`** — GPU stats, coins, facility tiers and difficulty multipliers are data tables. Don't hard-code tuning numbers inside components or the store.
4. **Migrate old saves** — if you change the shape of `GameState` (see `src/types.ts`), extend `migrate()` in `src/stores/game.ts` so existing `localStorage` saves keep loading.
5. **Respect the edit-pause contract** — any new action that mutates the player's rig should route through `beginEdit()` / `endEdit()` so the day counter pauses during changes.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, browser + OS, and (if relevant) an exported copy of the save (`localStorage` keys starting with `cms_`). No personal data is ever in a save.

## Ideas / roadmap

Sound effects, achievements, random events (power outages, coin crashes), moving GPUs between facilities, auto-sell dead cards, cooling upgrades, more coins/GPUs. Grab anything that sounds fun.

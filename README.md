# ⛏️ Coin Mining Simulator

> 🇹🇷 Türkçe dokümantasyon için: **[README.tr.md](README.tr.md)**

A real-time crypto-mining tycoon game that runs entirely in your browser. Start in a shack with $1,000, build GPU rigs, chase volatile coin prices, and grow into a warehouse-scale mining empire — all on an open, zoomable terrain inspired by simulation games like [k8sgames.com](https://k8sgames.com/).

Built with **Vue 3 + TypeScript + Vite**. No backend, no accounts, no tracking — every byte of game state lives in your browser's `localStorage`.

**🎮 Play it live: [coinminer.web.app](https://coinminer.web.app)**

<!-- TODO: drop a screenshot / GIF here, e.g. docs/screenshot.png -->

## ✨ Features

- 🗺️ **Open terrain** — a large pannable, zoomable world (wheel-zoom toward cursor, drag to pan, fit-all button). Drag your facilities anywhere; the camera view is saved per game.
- 🏘️ **Multiple facilities** — own any number of shacks, houses, villas and warehouses at once. Each has its own GPU slots and electricity rate; every GPU belongs to a specific building.
- 🎴 **15 real-world GPUs** (RTX 3060 → RTX 5090, RX 6600 XT → RX 7900 XTX) rendered as detailed SVGs with spinning fans, RGB strips and per-brand accents. Market prices random-walk daily.
- 🪙 **14 mineable coins** (BTC, XMR, KAS, DOGE…) with per-coin volatility, 60-day price history, sparklines and an interactive price chart. Switch coins at any time.
- ⚡ **Power limit strategy** — set each card between 10–100%. Full throttle mines fastest but wears the card out; below ~20% the electricity bill eats your income.
- 🔥 **Wear & resale** — cards age realistically (hot cards like the RTX 3090 die first). Barely-used cards resell near market price; dead ones go for scrap. One-click *"sell all dead cards"*.
- 🎮 **Difficulty modes** — Easy / Normal / Hard scale electricity cost (×0.7 / ×1 / ×1.4) and GPU wear (×0.7 / ×1 / ×1.5).
- 💱 **Coin exchange & HODL** — turn off auto-sell and mined coins pile up in your wallet while bills are paid in cash. Buy and sell any coin at market price on the exchange (0.5% fee) and ride the volatility for real trading profits.
- 🏆 **World rich list** — your live net worth (cash + wallet + card resale + facilities) is ranked against the world's 50 richest people (2026 figures, Musk at $1.1T). Climb into the top 50, the top 10, and dethrone #1 to become the richest person on Earth. (Current gameplay is the *offline* mode — an online mode is planned.)
- ⏱️ **Real-time simulation** — 1 in-game day ≈ 1.5 s, with 1×/2×/4× speed. Opening any management panel (or touching a power slider) pauses the clock; resume exactly where you left off.
- 🫧 **Living stage** — while running, GPUs dock in miniature next to their building with fans spinning; hover a building to pop them out in a bubble. Pause and they spread out, become selectable, and get an in-world quick-edit popover (power slider + sell).
- 💾 **Multiple save slots** — autosaved to `localStorage` every in-game day and on tab close. Mandatory storage-consent screen on first launch; nothing ever leaves the browser.
- 🌗 **Dark & light themes** (system default) · 🌍 **Turkish & English** (browser-language default).

## 🚀 Getting started

```bash
git clone <your-repo-url>
cd coin-mining-simulator
npm install
npm run dev      # dev server (default port 3969)
npm run build    # type-check (vue-tsc) + production bundle in dist/
npm run preview  # serve the production build locally
```

Requirements: Node 20+ (developed on Node 25). The only runtime dependencies are Vue 3 and the self-hosted Inter font — state management is plain Vue reactivity, i18n is hand-rolled, charts are raw SVG.

## 🎮 How to play

1. Grant the (local-only) storage permission and start a new game — pick a name and a difficulty.
2. You begin with **$1,000** and a free shack (2 GPU slots). Buy a card from the **Market** (🛒) — cheap efficient cards like the RTX 4060 are great starters.
3. Press **▶** and watch the days tick by: `balance += mined coins × price − electricity`.
4. Tune each card's **power limit**: high = more profit + faster wear, too low = the bill wins.
5. Watch the coin market — switch to whatever pays best for your risk appetite (volatile coins pay more on average).
6. Expand: buy more facilities (🏘️), fill them with cards, sell aging cards before they hit scrap value.
7. Go bankrupt with negative balance and no cards left? Restart and try a different strategy.

## ⚙️ Simulation internals

All tuning constants live in [`src/data/`](src/data/) — balance patches are one-line changes.

| Mechanic | Formula |
|---|---|
| Hashrate | `base × (power)^1.5` — efficiency collapses at low power |
| Power draw | `base watts × (0.45 + 0.55 × power)` — idle draw never sleeps |
| Daily wear | `(100 / lifespanDays) × (0.2 + 0.8 × power²) × difficulty` |
| Resale price | `market price × (0.12 + 0.78 × condition)` |
| Coin prices | geometric random walk `p × exp(σ·N(0,1))` with mild mean reversion, clamped |
| GPU market | mean-reverting walk around MSRP (±80% / −45% bounds) |

Facility tiers:

| Tier | Price | Slots | Electricity |
|---|---|---|---|
| 🛖 Shack | $900 *(first one free)* | 2 | $0.160/kWh |
| 🏠 House | $2,800 | 5 | $0.140/kWh |
| 🏡 Villa | $14,000 | 12 | $0.120/kWh |
| 🏭 Warehouse | $60,000 | 28 | $0.085/kWh |

GPU lifespans are game-balanced (~1–1.5 years of 24/7 mining at 100% power, ~2+ years tuned down), loosely derived from real mining-longevity data.

## 🧱 Architecture

```
src/
├── data/            # tuning tables: GPUs, coins, facility tiers, difficulties
├── i18n/            # hand-rolled TR/EN dictionary + date/number/currency helpers
├── stores/
│   ├── game.ts      # reactive game state, day-tick engine, economy, saves
│   └── settings.ts  # theme / language / storage consent
├── components/
│   ├── StagePanel.vue    # pan+zoom world, draggable buildings, GPU docking
│   ├── GpuCard3D.vue     # SVG GPU with animated fans
│   ├── MiningPanel.vue   # coin, price chart, live stats
│   ├── RigPanel.vue      # per-building GPU management
│   ├── MarketModal.vue / HousingModal.vue / CoinModal.vue
│   └── ...menu, topbar, consent, confirm dialogs
└── types.ts         # all shared interfaces
```

Design decisions worth knowing before contributing:

- **No state library** — a single `reactive()` store module (`stores/game.ts`) with exported action functions. The clock is a 100 ms `setInterval` with an accumulator, so background-tab throttling can't snowball days.
- **Saves are versionless but migrated** — `migrate()` in `game.ts` upgrades old save shapes (single-building era, missing difficulty, …) on load. If you change `GameState`, extend `migrate()`.
- **Edit-pause contract** — anything that mutates the rig goes through `beginEdit()` / `endEdit()` so the day counter never runs while the player is mid-change.
- **The stage is an isolated stacking context** — modals rendered inside it need the existing `z-index` override; pointer handlers deliberately ignore `.modal-backdrop` (see the pan-gesture guard in `StagePanel.vue`).

## 🤝 Contributing

Issues and PRs are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md). Quick rules: run `npm run build` before pushing (it type-checks), keep both `tr`/`en` dictionaries in sync when touching UI text, and put balance changes in `src/data/` rather than hard-coding numbers in components.

Some ideas on the roadmap: sound effects, achievements, random events (power outages, market crashes), moving cards between buildings, auto-sell-on-death toggle, cooling upgrades.

## 📄 License

[MIT](LICENSE) © 2026 Yahya

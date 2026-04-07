# Builder Module Blueprint v1 — dashboard_cards

## Purpose
Reusable module for showing key stats, summaries, health indicators, or status overviews in compact card form.

This module is not tied to RV only.
It should work for:
- dashboard home screens
- admin panels
- RV status pages
- SaaS overviews
- analytics summaries
- tool result overviews
- saved data summaries
- maintenance status panels

---

## Core Responsibility
The module must surface the most important information at a glance.

It should answer:
- what matters right now
- what is the current status
- what numbers or summaries should the user notice first
- what deserves visual priority

This module turns raw state into fast-scanning insight.

---

## Mandatory Subparts

### 1. Card Container
Handles:
- consistent card layout
- spacing
- responsive behavior
- hover/tap affordance if needed

### 2. Primary Value Area
Handles:
- headline number or status
- unit or label
- visual emphasis
- optional trend or state marker

### 3. Supporting Context
Handles:
- subtitle
- small explanation
- delta/trend
- last updated text
- warning or positive note

### 4. Card Priority Logic
Handles:
- which cards appear first
- which cards are primary vs secondary
- grouping if needed

### 5. Empty / Placeholder State
Handles:
- no data yet
- setup prompt
- waiting for first calculation or sync

---

## Files It Usually Touches

### Frontend
- dashboard/home page
- reusable stat card component
- optional card group wrapper
- optional formatter/helper for values

### Backend
Optional in v1, but may later support:
- dashboard summary endpoints
- aggregate metrics
- usage counts
- health/status APIs

### Shared Contracts
Optional if the card data is built from structured summary objects

---

## Generic vs Specific

### Generic
- card shell
- title
- primary value
- subtitle
- trend slot
- badge/status slot
- ordering

### Specific to Domain
- displayed metrics
- units
- threshold colors
- warning text
- business meaning of the values

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach dashboard_cards whenever a project includes:
- dashboard home screen
- summary overview
- status page
- admin-like reporting
- “at a glance” UX

Prompts that should often activate this module:
- add dashboard cards
- show stats
- add overview
- build status page
- make home more informative
- add summary tiles

---

## Official Rules for dashboard_cards v1

1. Show the most important cards first.
2. Keep labels short and values prominent.
3. Always include context, not just raw numbers.
4. Avoid too many equal-priority cards.
5. Support both numeric and text-based status values.
6. Must work on both mobile and desktop.
7. Keep visual style reusable across domains.

---

## Standard Dashboard Card Structure
A reusable dashboard card should usually define:

### A. Title
Example:
- Battery health
- Saved plans
- Usage today
- Revenue
- Open tasks

### B. Primary Value
Example:
- 232 Ah
- 14
- 94%
- Healthy
- 3 pending

### C. Supporting Context
Example:
- based on latest calculation
- updated 5 min ago
- +12% vs last week
- ready for export

### D. Optional Badge/Trend
Example:
- Good
- Warning
- New
- Pro
- Increasing

---

## Relationship to Other Modules

### Works directly with:
- quick_actions_grid
- save_results
- results_summary
- ai_panel

### Does not replace:
- full analytics pages
- navigation system
- result detail screens
- backend business logic

---

## First Practical Extraction Goal
From the current Replit app and screenshots, separate:

### A. stat/summary cards
Headline numbers or statuses

### B. reusable card shell
Title, value, subtitle, badge/trend slot

### C. ordering logic
Most important summaries first

### D. empty state
What to show before data exists

Those together become dashboard_cards.

---

## What Success Looks Like
You know dashboard_cards is correct when:
- a dashboard becomes useful immediately
- a second app can reuse the same summary structure
- only labels, values, and meaning change
- users understand system state without reading long text

---

## Recommended v1 Behavior
- 2 to 6 main cards per section
- strong headline number/text
- small supporting subtitle
- optional badge or trend marker
- responsive card grid

---

## Next Recommended Blueprint
ai_panel

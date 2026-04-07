# Builder Module Blueprint v1 — quick_actions_grid

## Purpose
Reusable module for showing a grid of action-oriented shortcuts that help the user jump quickly into useful features.

This module is not tied to RV only.
It should work for:
- dashboard home screens
- tool launchers
- quick utility panels
- admin dashboards
- mobile home screens
- AI action menus
- maintenance shortcuts
- feature hubs

---

## Core Responsibility
The module must present a clear set of high-value actions in a compact, easy-to-scan layout.

It should answer:
- what are the main things the user can do here
- what should be easy to access first
- how do we reduce friction from the home screen

This module turns a plain home page into a usable action hub.

---

## Mandatory Subparts

### 1. Grid Layout
Handles:
- card-based layout
- responsive arrangement
- spacing
- grouping of quick actions

### 2. Action Card
Handles:
- title
- short description
- icon slot
- status badge optional
- tap/click behavior

### 3. Priority Ordering
Handles:
- placing the most important actions first
- separating primary actions from secondary ones
- limiting overload

### 4. Optional Category Grouping
Handles:
- tools
- saved items
- AI actions
- utilities
- premium features

### 5. Empty / Placeholder State
Handles:
- no actions configured
- starter guidance
- setup prompt if needed

---

## Files It Usually Touches

### Frontend
- dashboard/home page
- reusable action card component
- optional icon mapping helper
- optional section wrapper

### Backend
Usually not required in v1

### Shared Contracts
Optional if actions are defined through structured config

---

## Generic vs Specific

### Generic
- card layout
- title
- subtitle
- icon slot
- badge slot
- ordering
- click/tap behavior

### Specific to Domain
- action names
- descriptions
- icons
- status labels
- navigation targets

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach quick_actions_grid whenever a project includes:
- dashboard-like home screen
- multiple user tools
- utility launcher behavior
- feature hub
- mobile-first shortcut UX

Prompts that should often activate this module:
- add quick actions
- add home shortcuts
- build dashboard home
- add tool launcher
- make the home screen more useful

---

## Official Rules for quick_actions_grid v1

1. Keep the number of primary actions limited.
2. Show the most useful actions first.
3. Use short labels and clear descriptions.
4. Keep actions tappable/clickable with strong visual affordance.
5. Support optional badges like Pro, New, Saved, Recommended.
6. Never overload the screen with too many equal-priority items.
7. Must work on both desktop and mobile layouts.

---

## Standard Quick Actions Structure
A reusable quick actions grid should usually define:

### A. Section Title
Example:
- Quick actions
- Start here
- Tools
- Shortcuts

### B. Action Cards
Each card usually includes:
- title
- one-line description
- icon
- optional badge
- target action

### C. Optional Categories
Example:
- Core tools
- Saved items
- AI tools
- Premium tools

---

## Relationship to Other Modules

### Works directly with:
- dashboard_cards
- ai_panel
- save_results
- affiliate_block

### Does not replace:
- navigation system
- full dashboard pages
- results summary
- backend routes

---

## First Practical Extraction Goal
From the current Replit app and screenshots, separate:

### A. quick-access tool cards
Main entry points to features

### B. reusable action card layout
Card title, subtitle, icon, badge, click area

### C. ordering logic
Most-used tools appear first

### D. optional premium markers
Badge area for Pro/New/Recommended

Those together become quick_actions_grid.

---

## What Success Looks Like
You know quick_actions_grid is correct when:
- a home screen feels useful immediately
- a second app can reuse the same shortcut structure
- only the action labels and targets change
- users can start tasks faster without digging through menus

---

## Recommended v1 Behavior
- 4 to 8 quick actions max in the primary grid
- card layout with title + short description
- optional badges
- responsive grid
- reusable card component

---

## Next Recommended Blueprint
dashboard_cards

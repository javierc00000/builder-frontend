# Builder Registry v1 — module_registry

## Purpose
This file is the master list of all reusable modules known by the builder.

It answers:
- what modules exist
- what each module is for
- when each module should be activated
- what other modules it commonly works with

This is the first real control layer that turns isolated blueprints into a system.

---

## Rule of the Builder
The builder should not think:
- "I am writing an app from zero"

The builder should think:
- "I am assembling a project from reusable modules"

---

## Current Registered Modules

### 1. calculator_engine
**Purpose**
Reusable input → backend calculation → result flow.

**Use when**
- calculators
- planners
- estimators
- tools with numeric inputs and structured outputs

**Common pairings**
- results_summary
- save_results
- backend_endpoint
- export_report
- affiliate_block

---

### 2. results_summary
**Purpose**
Reusable summary layer for outputs, cards, and recommendation display.

**Use when**
- calculator results
- planner outputs
- AI analysis summaries
- recommendation screens

**Common pairings**
- calculator_engine
- save_results
- export_report
- affiliate_block

---

### 3. save_results
**Purpose**
Reusable save/load/history layer for results and inputs.

**Use when**
- repeatable calculations
- saved reports
- analysis history
- user workflows with persistence value

**Common pairings**
- calculator_engine
- results_summary
- export_report
- ai_panel

---

### 4. backend_endpoint
**Purpose**
Reusable backend route pattern for real logic and real responses.

**Use when**
- calculation must be real
- export needs server support
- AI calls need backend routing
- future save-to-cloud is needed

**Common pairings**
- calculator_engine
- ai_panel
- export_report
- auth_starter (future)

---

### 5. export_report
**Purpose**
Reusable export flow for downloadable reports/files.

**Use when**
- result should be portable
- summary should be saved externally
- app has PDF/report style outputs

**Common pairings**
- results_summary
- save_results
- backend_endpoint
- affiliate_block

---

### 6. affiliate_block
**Purpose**
Reusable monetization layer that maps results into relevant recommendation CTAs.

**Use when**
- tool gives buying advice
- setup planning exists
- result can suggest products
- app should monetize through recommendations

**Common pairings**
- results_summary
- export_report
- calculator_engine
- save_results

---

### 7. quick_actions_grid
**Purpose**
Reusable home/action launcher grid.

**Use when**
- dashboard home screen
- tool launcher
- utility menu
- feature hub

**Common pairings**
- dashboard_cards
- ai_panel
- save_results

---

### 8. dashboard_cards
**Purpose**
Reusable summary card system for at-a-glance metrics and statuses.

**Use when**
- dashboard app
- status overview
- summary-heavy home
- RV state or admin overview

**Common pairings**
- quick_actions_grid
- save_results
- results_summary

---

### 9. ai_panel
**Purpose**
Reusable AI chat / prompt / analysis interface.

**Use when**
- assistant app
- chat tool
- AI analysis flow
- smart help system

**Common pairings**
- backend_endpoint
- save_results
- results_summary

---

## Future Modules (not yet defined)
These are likely next:
- auth_starter
- navigation_system
- bottom_nav
- paywall_module
- reminder_module
- history_timeline
- settings_panel
- product_database_bridge

---

## Activation Principle
A module should only activate if it clearly adds value to the project.

The builder should avoid:
- attaching every module automatically
- overloading projects with unnecessary complexity
- mixing UI-only modules with no purpose

---

## Composition Principle
Modules are designed to be combined.

Examples:
- calculator_engine + results_summary + backend_endpoint
- dashboard_cards + quick_actions_grid
- ai_panel + backend_endpoint + save_results
- results_summary + affiliate_block + export_report

---

## Reuse Principle
If a second app needs the same structural behavior, the builder must reuse an existing module before inventing a new one.

Rule:
**No new module unless the behavior is truly new.**

---

## Builder Decision Priority
When parsing a prompt, the builder should decide in this order:

1. project mode
2. required core module
3. supporting modules
4. optional monetization modules
5. optional polish modules

---

## First Builder-Ready Module Set
This is the first stable reusable set:

- calculator_engine
- results_summary
- save_results
- backend_endpoint
- export_report
- affiliate_block
- quick_actions_grid
- dashboard_cards
- ai_panel

This is enough to build:
- calculator apps
- dashboard apps
- AI utility apps
- recommendation tools

---

## Next Required Registry File
project_modes.md

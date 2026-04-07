# App.jsx Integration Execution Plan v1

## Goal
Translate the builder architecture into actual execution steps inside App.jsx.

This file is not a blueprint for modules.
It is the execution plan for wiring the builder brain into the current app.

The first target is:
### calculator_app only

---

## Main Principle
App.jsx should stop acting like:
- prompt in
- random generation out

App.jsx should start acting like:
- prompt in
- detect mode
- select modules
- apply modules in order
- render decision log
- build/update project

---

## Stage 1 — Add Builder Brain State

App.jsx should gain explicit state for:

### 1. detectedMode
Stores the detected project mode.
Examples:
- calculator_app
- dashboard_app
- ai_tool_app
- content_tool_app

### 2. selectedModules
Stores the module names chosen for the current prompt.

### 3. appliedModulesLog
Stores the order of module application.

### 4. buildDecisionSummary
Stores a short explanation such as:
- "Detected calculator_app from planner/calculation keywords"
- "Selected modules from project_modes"

These must be visible in the UI.

---

## Stage 2 — Prompt Understanding Layer

Create a dedicated decision function inside App.jsx.

Its responsibility:
- analyze prompt
- detect one project mode only
- return the detected mode

For v1, support:
### calculator_app only

Meaning:
If prompt includes things like:
- calculator
- planner
- battery
- solar
- estimate
- inverter
- usage

Then:
### detectedMode = calculator_app

All other prompts can stay on fallback/manual behavior for now.

---

## Stage 3 — Module Selection Layer

After mode detection, create a second step:

### getModulesForMode(mode)

For v1:
If mode == calculator_app
return:
- calculator_engine
- results_summary
- backend_endpoint
- save_results
- export_report
- affiliate_block

This is not freeform.
This is controlled and comes from project_modes.md.

---

## Stage 4 — Module Validation Layer

Before applying modules, App.jsx should verify:

- module exists in module registry
- module is allowed for this mode
- module is not duplicated

For v1, this can be simple:
- use an internal whitelist array/object

The markdown files remain source of truth,
but App.jsx uses a hardcoded execution version of those rules.

---

## Stage 5 — Module Application Layer

Each module should map to one explicit apply function.

Example structure:
- applyCalculatorEngine()
- applyResultsSummary()
- applyBackendEndpoint()
- applySaveResults()
- applyExportReport()
- applyAffiliateBlock()

For v1, these functions can call the mutation logic you already built.

Important:
### App.jsx should apply modules in order

For calculator_app, order is:

1. calculator_engine
2. results_summary
3. backend_endpoint
4. save_results
5. export_report
6. affiliate_block

---

## Stage 6 — Build Flow Update

Current build flow should change to this:

### old
prompt -> generate

### new
prompt
-> detect mode
-> choose modules
-> apply modules
-> generate/update project
-> show builder reasoning

This makes the builder feel intelligent and consistent.

---

## Stage 7 — UI Additions Required

App.jsx should render 3 builder brain panels:

### A. Detected Mode Panel
Show:
- detected mode
- short explanation

Example:
- Mode: calculator_app
- Reason: prompt included planner/calculation keywords

### B. Selected Modules Panel
Show module badges:
- calculator_engine
- results_summary
- backend_endpoint
- save_results
- export_report
- affiliate_block

### C. Module Application Log
Ordered list:
1. calculator_engine applied
2. results_summary applied
3. backend_endpoint applied
4. save_results applied
5. export_report applied
6. affiliate_block applied

These panels should live near the build result / workspace area.

---

## Stage 8 — Scope Control

For this first integration, do NOT:
- read markdown files dynamically
- implement all project modes
- invent modules automatically
- support unlimited prompt interpretation
- replace the entire app architecture

The goal is only:
### make calculator_app intelligent and structured

---

## Stage 9 — First Working Success Condition

You know App.jsx integration is working when:

Input:
"build RV battery planner"

Builder visibly shows:
- Mode: calculator_app
- Modules selected:
  - calculator_engine
  - results_summary
  - backend_endpoint
  - save_results
  - export_report
  - affiliate_block
- Module application order
- Resulting project reflects those modules

At that point, the builder has crossed from ad hoc generation to guided modular construction.

---

## Stage 10 — What Comes Immediately After

Once calculator_app works:

### next mode:
dashboard_app

Then later:
- ai_tool_app
- content_tool_app

But not before calculator_app is stable.

---

## Immediate Next Coding Mission
The first actual integration task in App.jsx should be:

### "Add builder brain state + calculator_app detection + selected module rendering"

Do not try to apply all modules in one step.
Make the builder first:
1. detect
2. select
3. display

Then wire application logic after that.

---

## Checkpoint Philosophy
The builder should get smarter in layers:

### Layer 1
mode detection

### Layer 2
module selection

### Layer 3
module application

### Layer 4
module-aware generation/update

That layering is what prevents chaos.

---

## Final Rule
Do not ask:
- "what app should I generate"

Ask:
- "what mode is this"
- "what modules belong here"
- "in what order do I apply them"

That is the actual beginning of a real builder system.

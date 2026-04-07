# Builder Integration Plan v1 — connect App.jsx to module_registry + project_modes

## Goal
Make the builder stop behaving like a loose generator and start behaving like a real decision system.

After this integration, App.jsx should follow this flow:

prompt -> detect project mode -> choose modules -> apply modules -> build/update project

---

## Phase 1 — Add a Builder Brain Layer

Create one new concept inside your builder:

### builder brain
This is the part of App.jsx that decides:
- what kind of app the user wants
- which modules belong to that app
- which modules are required
- which modules are optional

App.jsx should stop making decisions ad hoc.

It should start using:
- module_registry.md
- project_modes.md

---

## Phase 2 — Add Internal Decision Objects

Inside the builder logic, define three internal ideas:

### 1. detectedMode
Examples:
- calculator_app
- dashboard_app
- ai_tool_app
- content_tool_app

### 2. selectedModules
Examples:
- calculator_engine
- results_summary
- backend_endpoint
- save_results
- export_report
- affiliate_block

### 3. buildPlan
This already exists in your app in some form.
Now it should be shaped by selectedModules instead of only prompt text.

---

## Phase 3 — New Decision Flow in App.jsx

Your App.jsx should begin using this sequence:

### Step A
Read prompt

### Step B
Detect project mode from prompt keywords

### Step C
Get module set from project_modes

### Step D
Validate selected modules against module_registry

### Step E
Apply each module to the project in order

### Step F
Show:
- detected mode
- selected modules
- resulting build changes

---

## Phase 4 — Required New UI Sections

Add these builder-facing UI areas:

### 1. Detected Project Mode
A small card showing:
- calculator_app
- dashboard_app
- ai_tool_app
- content_tool_app

### 2. Selected Modules
A visible list or badges showing what modules were chosen

### 3. Module Application Log
A simple ordered list like:
- calculator_engine applied
- results_summary applied
- backend_endpoint applied
- save_results applied

This will make the builder feel intelligent instead of random.

---

## Phase 5 — Integration Rules

### Rule 1
Prompt does not directly generate files anymore.

Prompt first generates:
- mode
- module set

### Rule 2
Only registered modules can be applied.

### Rule 3
Each module should have one application handler.

Example:
- applyCalculatorEngine()
- applyResultsSummary()
- applySaveResults()
- applyBackendEndpoint()

### Rule 4
App.jsx must separate:
- prompt understanding
- module selection
- module application
- UI rendering

---

## Phase 6 — First Working Integration Target

Use only one mode first:

### calculator_app

And wire these modules:
- calculator_engine
- results_summary
- backend_endpoint
- save_results
- export_report
- affiliate_block

Do not try to wire all project modes at once.

The goal is:
- prompt says battery planner
- builder detects calculator_app
- builder selects correct modules
- builder applies them in order

Once this works, do dashboard_app next.

---

## Phase 7 — Application Order

For calculator_app, use this order:

1. calculator_engine
2. results_summary
3. backend_endpoint
4. save_results
5. export_report
6. affiliate_block

Reason:
- first create core flow
- then output
- then real backend
- then persistence
- then export
- then monetization

---

## Phase 8 — What App.jsx Needs to Learn

Your builder should learn to answer:

### What mode is this?
using project_modes.md

### What modules do I need?
using project_modes.md

### Are these modules valid?
using module_registry.md

### In what order do I apply them?
using hardcoded module application order for v1

### What did I apply?
show in UI

---

## Phase 9 — V1 Scope (important)

Do not attempt in v1:
- dynamic reading of .md files at runtime
- AI freeform module invention
- universal stack detection
- all project modes at once

For now, use the registry documents as design source and encode the rules into App.jsx manually.

The documents are the source of truth.
App.jsx is the executor.

---

## Phase 10 — Immediate Next Build Task

The next actual build task is:

### connect App.jsx to calculator_app mode only

Meaning:
- detect calculator prompts
- assign calculator module set
- apply modules in order
- render selected modules visibly

When that works, your builder becomes meaningfully smarter.

---

## First Checkpoint of Success

You know this integration is working when:

Input:
"build RV battery planner"

Builder shows:
- Mode: calculator_app
- Modules:
  - calculator_engine
  - results_summary
  - backend_endpoint
  - save_results
  - export_report
  - affiliate_block

And the generated project clearly reflects those modules.

---

## After This File
The next step is not another blueprint.

The next step is:
### App.jsx integration execution plan

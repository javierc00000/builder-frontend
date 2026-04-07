# Builder Module Blueprint v1 — save_results

## Purpose
Reusable module for storing and restoring results, user inputs, or completed tool runs.

This module is not tied to RV only.
It should work for:
- battery planners
- solar planners
- inverter tools
- maintenance logs
- AI outputs
- saved drafts
- report histories
- calculators with repeat use

---

## Core Responsibility
The module must let a user keep useful output instead of losing it after one calculation or one session.

It should answer:
- can I save this?
- can I see past runs?
- can I load one again?
- can I clear history if I want?

It makes a tool feel like a real app.

---

## Mandatory Subparts

### 1. Save Action
Handles:
- storing latest result
- storing matching input state
- creating a saved item title
- attaching timestamp
- generating stable id

### 2. Saved List View
Handles:
- list of saved items
- summary per item
- timestamp
- short description
- ordering (newest first)

### 3. Load Action
Handles:
- restoring saved inputs
- restoring saved result
- letting the user continue from previous work

### 4. Clear / Delete Action
Handles:
- deleting all saved items
- optional delete single item
- safe reset behavior

### 5. Empty State
Handles:
- no saved items yet
- guidance text
- instruction to save a result first

---

## Storage Levels

### v1
Local storage only

### later
Cloud storage / backend persistence

The module should start with local storage but be designed so it can evolve without changing the UI concept.

---

## Files It Usually Touches

### Frontend
- save action button
- saved results/history section
- local storage helper
- load result button
- delete / clear controls

### Backend
Usually not required in v1

### Shared Contracts
Optional, if the app wants a standard saved item shape

---

## Generic vs Specific

### Generic
- storage key
- id
- timestamp
- title
- summary
- input snapshot
- result snapshot
- load behavior
- clear behavior

### Specific to Domain
- title generation
- summary wording
- which inputs matter most
- which result values should be shown

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach save_results whenever the project includes:
- calculator_engine
- AI analysis result
- report generation
- repeated workflows
- recommendation outputs
- logs or user history

Prompts that should often activate this module:
- save results
- keep history
- add saved calculations
- load previous result
- keep last output
- add history

---

## Official Rules for save_results v1

1. Always save both inputs and output together.
2. Always include timestamp.
3. Always keep newest items first.
4. Always support loading a saved item back into the app.
5. Always support clearing saved data.
6. Always render a clean empty state.
7. Must work even without backend persistence.

---

## Standard Saved Item Shape
A saved item should usually include:

- id
- createdAt
- title
- summary
- inputs
- result

Optional:
- tags
- mode
- toolType

---

## Relationship to Other Modules

### Works directly with:
- calculator_engine
- results_summary
- export_report
- affiliate_block

### Does not replace:
- backend persistence
- auth
- analytics
- dashboard cards

---

## First Practical Extraction Goal
From the current RV Battery Planner, separate:

### A. Save current result
Store latest calculation plus payload

### B. Show saved list
Display recent saved calculations

### C. Load a saved run
Restore result and input fields

### D. Clear saved list
Reset saved history

Those together become save_results.

---

## What Success Looks Like
You know save_results is correct when:
- the user can calculate, save, leave, and come back
- a second tool can reuse the same save pattern
- only labels and summaries change between apps
- the tool feels persistent instead of disposable

---

## Recommended v1 Behavior
- localStorage key per tool
- max saved items cap
- newest first
- manual load button
- clear all button

---

## Next Recommended Blueprint
backend_endpoint

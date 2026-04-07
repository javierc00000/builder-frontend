# Builder Module Blueprint v1 — results_summary

## Purpose
Reusable module for displaying calculation, recommendation, or analysis results in a clean, structured way.

This module is not tied to RV only.
It should work for:
- battery planners
- solar planners
- inverter tools
- maintenance summaries
- AI analysis outputs
- comparison tools
- any app that needs a clear result layer

---

## Core Responsibility
The module must take a structured result object and render it into a useful, readable summary for the user.

It should answer:
- what happened
- what the main numbers are
- what the user should do next

It is the output companion to calculator_engine.

---

## Mandatory Subparts

### 1. Summary Header
Handles:
- title
- success state
- high-level summary sentence
- optional status label

### 2. Key Result Cards
Handles:
- core numeric values
- main recommendations
- units
- priority ordering of information

### 3. Supporting Details
Handles:
- secondary values
- assumptions
- notes
- warnings
- context for the result

### 4. Action Area
Handles:
- save result
- export result
- affiliate recommendation CTA
- retry / recalculate button

This is optional depending on app type, but the module should support it.

### 5. Empty / No Result State
Handles:
- no result yet
- prompt to run calculation or action
- guidance to next step

---

## Files It Usually Touches

### Frontend
- Results page
- result cards component
- summary component
- optional action buttons

### Backend
Usually does not own backend logic, but depends on structured backend output.

### Shared Contracts
Should prefer shared result types/schemas if they exist.

---

## Generic vs Specific

### Generic
- card layout
- title and subtitle
- main numbers
- supporting notes
- action slots
- empty state

### Specific to Domain
- labels
- units
- explanation text
- warnings
- recommendation wording

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach results_summary whenever a project includes:
- calculator_engine
- recommendation flow
- analytics summary
- AI output summary
- report-style result

Prompts that should often activate this module:
- add results
- show summary
- make output clearer
- add recommendation cards
- build planner
- build calculator

---

## Official Rules for results_summary v1

1. Always show the most important values first.
2. Always keep labels and units clear.
3. Always support an empty state.
4. Always allow optional actions under the result.
5. Never own business logic or formulas.
6. Never depend on one specific domain only.
7. Must be compatible with save_results and export_report.

---

## Standard Output Structure
A results_summary should usually contain:

### A. Summary sentence
Example:
- "For this setup, plan for about 232Ah of battery and 348W of solar."

### B. Primary cards
Example:
- Daily usage
- Battery needed
- Solar needed

### C. Secondary details
Example:
- assumptions
- losses
- autonomy days
- sun hours

### D. Actions
Example:
- Save
- Export PDF
- View recommendation
- Start over

---

## Relationship to Other Modules

### Works directly with:
- calculator_engine
- save_results
- export_report
- affiliate_block

### Does not replace:
- backend_endpoint
- calculator_engine
- domain adapters

---

## First Practical Extraction Goal
From the current RV Battery Planner, separate:

### A. Summary sentence
The recommendation text

### B. Primary cards
Battery, solar, adjusted daily use

### C. Action area
Save and export

Those together become results_summary.

---

## What Success Looks Like
You know results_summary is correct when:
- different tools can reuse the same output structure
- only labels, units, and wording change
- save/export can plug in easily
- the result page is understandable without reading the raw JSON

---

## Next Recommended Blueprint
save_results

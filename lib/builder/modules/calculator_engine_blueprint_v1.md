# Builder Module Blueprint v1 — calculator_engine

## Purpose
Reusable module for any app that follows this pattern:

inputs -> backend calculation -> result -> optional save/export

It is not an RV-only calculator.
It should power many tool types, including:
- RV battery planner
- solar planner
- inverter calculator
- water usage estimator
- fuel planner
- any form-to-result tool

---

## Core Responsibility
The module must provide a working calculator flow without hardcoding domain-specific business logic into the UI.

The builder should use this module whenever a project needs:
- structured inputs
- a calculation action
- a backend request
- a rendered result
- optional save/export hooks

---

## Mandatory Subparts

### 1. Input UI
Handles:
- dynamic input rows
- numeric fields
- add/remove item behavior
- basic validation
- main calculate action

This is generic and should not include domain formulas.

### 2. Request Builder
Handles:
- transforming UI state into clean payload
- number normalization
- default values
- field naming for backend request

### 3. Backend Action
Handles:
- real endpoint
- calculation logic
- validation
- response JSON

This should live in backend code, not in the view.

### 4. Result Mapper
Handles:
- transforming backend response into UI-friendly values
- labels
- cards
- summary text inputs

### 5. Result State
Handles:
- loading
- success
- error
- latest result
- optional saved result reference

### 6. Optional Hooks
This module should be easy to connect with:
- save_results
- export_report
- affiliate_block

---

## Files It Usually Touches

### Frontend
- Calculator page
- API/service file
- optional helper/mapper
- optional Results page

### Backend
- calculation endpoint
- request schema/model
- response shape
- calculation function

### Shared Contracts
If shared types/schemas exist, the module should prefer them over duplicated definitions.

---

## Generic vs Specific

### Generic
- input rows
- numeric fields
- calculate button
- loading and error states
- API request
- result rendering skeleton
- save/export compatibility

### Specific to Domain
- field labels
- formulas
- units
- summary wording
- recommendation rules

The builder must keep those separated.

---

## Builder Activation Logic
When the builder receives prompts like:
- build a battery planner
- build a solar calculator
- build an inverter estimator
- build a water usage planner

It should classify the project as calculator_app and attach calculator_engine first.

Then it may attach:
- results_summary
- save_results
- backend_endpoint
- export_report
- affiliate_block

---

## Official Rules for calculator_engine v1

1. Never put domain-specific formulas directly in the view layer.
2. Always use a backend endpoint or domain adapter for calculation logic.
3. Always expose loading, success, and error states.
4. Always return a result object that can be saved or exported.
5. Always support reuse across multiple domains.
6. Never mix auth, dashboard, AI chat, or affiliate logic directly into the engine.
7. Keep the engine stable and let domain adapters provide specialization.

---

## First Practical Extraction Goal
Convert the current RV Battery Planner into three separate ideas:

### A. calculator_engine
Reusable input-submit-result structure

### B. rv_energy_adapter
Battery/solar-specific fields and formulas

### C. results_summary
Reusable display cards and result summary layer

That separation is what makes the builder reusable.

---

## What Success Looks Like
You know calculator_engine is correct when:
- a second calculator-type app is much faster to build than the first
- only the labels/formulas change
- the engine structure stays the same
- save/export plug in without redesign
- backend contract remains predictable

---

## Next Recommended Blueprint
results_summary

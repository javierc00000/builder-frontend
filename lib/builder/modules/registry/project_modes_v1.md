# Builder Registry v1 — project_modes

## Purpose
Defines how the builder chooses and combines modules based on the type of project.

This file answers:
- what type of app is this
- which modules should be used
- which modules are optional
- how to structure the build

---

## Core Rule
The builder must:
1. Detect project type (mode)
2. Apply base modules
3. Add supporting modules
4. Add optional enhancements

---

## Project Modes

### 1. calculator_app

**Use when**
- planners
- estimators
- tools with inputs + result

**Core modules**
- calculator_engine
- results_summary
- backend_endpoint

**Supporting modules**
- save_results
- export_report

**Optional modules**
- affiliate_block

---

### 2. dashboard_app

**Use when**
- home screens
- admin panels
- status overview

**Core modules**
- dashboard_cards
- quick_actions_grid

**Supporting modules**
- save_results

**Optional modules**
- ai_panel

---

### 3. ai_tool_app

**Use when**
- chat tools
- AI assistants
- analysis tools

**Core modules**
- ai_panel
- backend_endpoint

**Supporting modules**
- results_summary
- save_results

**Optional modules**
- export_report

---

### 4. content_tool_app

**Use when**
- editors
- generators
- content-based tools

**Core modules**
- ai_panel

**Supporting modules**
- save_results
- export_report

**Optional modules**
- affiliate_block

---

## Mode Detection Logic

The builder should analyze prompt keywords:

### calculator_app triggers:
- calculate
- planner
- estimator
- battery
- solar
- usage

### dashboard_app triggers:
- dashboard
- overview
- stats
- status
- home

### ai_tool_app triggers:
- AI
- chat
- assistant
- analyze
- explain

### content_tool_app triggers:
- generate
- write
- content
- editor

---

## Combination Rules

- Never overload with all modules
- Always start with core modules
- Add supporting modules if needed
- Add optional modules only if useful

---

## Example Decisions

### Input:
"build RV battery planner"

→ Mode: calculator_app  
→ Modules:
- calculator_engine
- results_summary
- backend_endpoint
- save_results
- export_report
- affiliate_block

---

### Input:
"build dashboard for RV status"

→ Mode: dashboard_app  
→ Modules:
- dashboard_cards
- quick_actions_grid
- save_results

---

### Input:
"build AI assistant for troubleshooting"

→ Mode: ai_tool_app  
→ Modules:
- ai_panel
- backend_endpoint
- results_summary
- save_results

---

## Builder Execution Flow

prompt → detect mode → select modules → apply modules → generate/update project

---

## Next Step
Connect this logic inside App.jsx (builder brain)

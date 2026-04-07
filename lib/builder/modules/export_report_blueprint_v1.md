# Builder Module Blueprint v1 — export_report

## Purpose
Reusable module for exporting useful output from the app into a downloadable file or shareable report.

This module is not tied to RV only.
It should work for:
- battery planners
- solar planners
- maintenance summaries
- AI analysis outputs
- saved reports
- comparison tools
- checklists
- recommendation summaries

---

## Core Responsibility
The module must let the app turn result data into something portable.

It should answer:
- can I export this result
- what file format is supported
- what content goes into the report
- how does the user trigger download

At v1, this does not need perfect PDF rendering.
It must provide a reliable export action.

---

## Mandatory Subparts

### 1. Export Action Trigger
Handles:
- export button
- action placement
- disabled/loading state
- retry behavior

### 2. Export Payload Builder
Handles:
- gathering result data
- formatting title
- formatting summary
- preparing printable/exportable content

### 3. Backend Export Route (preferred when available)
Handles:
- route definition
- request shape
- response shape
- optional file metadata
- future report generation support

### 4. Local Fallback Export (optional in v1)
Handles:
- simple client-side file creation
- fallback when backend export is unavailable

### 5. Export Status UI
Handles:
- preparing export
- success
- failure
- fallback used

---

## Files It Usually Touches

### Frontend
- export button component
- API client/service
- results page or result action area
- export helper

### Backend
- export route
- payload schema/model
- response shape
- optional report generator

### Shared Contracts
Optional, but preferred when shared request/response contracts exist

---

## Generic vs Specific

### Generic
- export trigger
- content gathering
- file naming
- status state
- route calling
- success/failure feedback

### Specific to Domain
- report title
- sections included
- units
- wording
- recommendations inside report

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach export_report whenever the app includes:
- results_summary
- saved results
- planner output
- AI output worth keeping
- summary/recommendation screens

Prompts that should often activate this module:
- add export
- export PDF
- export report
- download summary
- save as file

---

## Official Rules for export_report v1

1. Always export meaningful content, not raw placeholder text.
2. Always include a title and summary in exported content.
3. Always expose export status to the user.
4. Prefer backend route when available.
5. Support fallback export if the backend is unavailable.
6. Never tie export behavior to one domain only.
7. Must plug into results_summary cleanly.

---

## Standard Export Structure
A reusable export module should usually define:

### A. Trigger
- export button
- status text
- disabled while running

### B. Payload
- title
- content
- metadata if needed

### C. Route or fallback
- backend route preferred
- client-side fallback allowed

### D. Result
- downloaded file
- success/failure feedback

---

## Relationship to Other Modules

### Works directly with:
- results_summary
- save_results
- backend_endpoint
- affiliate_block

### Does not replace:
- results UI
- save/history
- backend contracts
- report-specific domain adapters

---

## First Practical Extraction Goal
From the current RV Battery Planner, separate:

### A. export action button
User-triggered export action

### B. export payload
Battery, solar, adjusted daily use, summary

### C. export route
Server-side export endpoint

### D. fallback export
Basic downloadable file when server export is unavailable

Those together become export_report.

---

## What Success Looks Like
You know export_report is correct when:
- the user can export without leaving the result flow
- a second tool can reuse the same export pattern
- only title/content formatting changes between apps
- the exported file reflects real result data

---

## Recommended v1 Behavior
- export button under result summary
- title + summary + key values
- backend route if available
- fallback local download if needed
- visible success/failure status

---

## Next Recommended Blueprint
affiliate_block

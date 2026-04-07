# Builder Module Blueprint v1 — affiliate_block

## Purpose
Reusable module for turning useful app output into monetizable product recommendations, calls to action, or buying guidance.

This module is not tied to RV only.
It should work for:
- RV battery planners
- solar planners
- inverter tools
- maintenance tools
- AI recommendation outputs
- product comparison tools
- buying guides
- setup planners

---

## Core Responsibility
The module must translate a result into a relevant next action the user can take.

It should answer:
- what should the user buy or consider next
- where should the recommendation appear
- how should the CTA be presented
- how can this be reused without hardcoding one niche

This module is where utility becomes monetization.

---

## Mandatory Subparts

### 1. Recommendation Trigger
Handles:
- deciding when affiliate recommendations should appear
- deciding whether the user has enough context to see a product suggestion

Example:
- after result is shown
- after summary cards
- after recommendation output

### 2. Recommendation Mapping
Handles:
- mapping result values to product categories
- choosing which block to show
- selecting the right recommendation tier

Example:
- 200Ah+ -> battery recommendations
- 300W+ -> solar kit recommendations
- export/report use case -> accessory recommendations

### 3. Product Display Block
Handles:
- title
- product/category summary
- CTA text
- optional price area
- optional feature bullets

### 4. Affiliate Link Slot
Handles:
- external link
- tracking link
- local redirect slug
- CTA button target

### 5. Disclosure / Trust Layer
Handles:
- short affiliate disclosure
- recommendation framing
- user trust language

### 6. Empty / No Match State
Handles:
- no recommendation available
- fallback recommendation
- hide module when not useful

---

## Files It Usually Touches

### Frontend
- results page
- summary page
- recommendation cards
- CTA buttons
- optional product section component

### Backend
Optional in v1, but may later support:
- product lookup
- rule mapping
- slug redirects
- analytics

### Shared Contracts
Optional, but useful when recommendations are structured

---

## Generic vs Specific

### Generic
- recommendation block
- CTA layout
- disclosure
- link slot
- conditional rendering
- result-to-recommendation mapping structure

### Specific to Domain
- product categories
- thresholds
- wording
- affiliate sources
- buying advice

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach affiliate_block whenever the app includes:
- results_summary
- recommendation-style output
- planning tools
- product-fit calculations
- setup estimators
- buying decision support

Prompts that should often activate this module:
- add affiliate recommendations
- recommend products
- show what to buy
- monetize this tool
- add product cards

---

## Official Rules for affiliate_block v1

1. Only show recommendations when the result provides enough context.
2. Always keep recommendations relevant to the result.
3. Always make the block optional and easy to hide.
4. Always include a short trust/disclosure line.
5. Never interrupt the core calculation flow.
6. Never hardcode one niche into the generic block.
7. Must plug cleanly into results_summary.

---

## Standard Affiliate Block Structure
A reusable affiliate module should usually define:

### A. Trigger
- appears after results
- appears after summary sentence
- appears only when recommendation conditions match

### B. Recommendation Title
Example:
- Suggested next steps
- Recommended setup
- Products to consider

### C. Product Cards or CTA Rows
Example:
- Battery recommendation
- Solar kit recommendation
- Inverter recommendation

### D. Disclosure
Example:
- "Some links may be affiliate links."
- "Recommendations are based on the result shown above."

### E. CTA
Example:
- View recommended battery
- See solar options
- Compare setups

---

## Relationship to Other Modules

### Works directly with:
- results_summary
- calculator_engine
- export_report
- save_results

### Does not replace:
- product database
- SEO content engine
- backend analytics
- monetization dashboard

---

## First Practical Extraction Goal
From the current RV Battery Planner, separate:

### A. result-driven recommendation area
Show products after battery/solar summary

### B. threshold mapping
Map output ranges to product categories

### C. CTA block
Display recommended next action

### D. disclosure line
Short trust note

Those together become affiliate_block.

---

## What Success Looks Like
You know affiliate_block is correct when:
- a result can naturally show a relevant recommendation
- a second tool can reuse the same recommendation structure
- only thresholds, categories, and wording change
- the monetization layer feels helpful, not spammy

---

## Recommended v1 Behavior
- place below results_summary
- one to three relevant recommendation cards
- simple CTA buttons
- disclosure line
- easy to disable

---

## Next Recommended Blueprint
quick_actions_grid

# Builder Module Blueprint v1 — backend_endpoint

## Purpose
Reusable module for defining, creating, and connecting real backend routes that support app functionality.

This module is not tied to RV only.
It should work for:
- calculators
- planners
- save/load flows
- AI tools
- dashboards
- exports
- validation flows
- small SaaS features

---

## Core Responsibility
The module must let the builder create predictable backend functionality instead of fake frontend-only actions.

It should answer:
- what endpoint is needed
- what payload it accepts
- what response it returns
- how the frontend should call it
- how errors should be handled

It is the main bridge between UI and real application logic.

---

## Mandatory Subparts

### 1. Route Definition
Handles:
- endpoint name
- HTTP method
- purpose of the route
- route path

Example:
- POST /battery-plan
- POST /export/pdf
- GET /saved-results

### 2. Request Contract
Handles:
- request fields
- validation model/schema
- defaults
- required vs optional fields

### 3. Response Contract
Handles:
- structured JSON response
- success fields
- output fields
- summary string if needed
- error response shape

### 4. Backend Handler
Handles:
- actual business logic
- calculations
- transformations
- persistence calls
- service calls

### 5. Frontend API Client
Handles:
- fetch wrapper or service function
- request serialization
- response parsing
- error handling

### 6. Error State Contract
Handles:
- predictable frontend error message
- bad input
- network failure
- internal failure

---

## Files It Usually Touches

### Backend
- route file or server file
- request model/schema
- response model/schema
- business logic function

### Frontend
- API service/client file
- page or component calling the route
- loading/error state handling

### Shared Contracts
If shared types/schemas exist, the module should prefer shared request/response definitions.

---

## Generic vs Specific

### Generic
- HTTP method
- route shape
- request/response contract
- client call
- loading/error pattern

### Specific to Domain
- field names
- formulas
- transformations
- summaries
- recommendation rules

The builder must keep those separated.

---

## Builder Activation Logic
The builder should attach backend_endpoint whenever the app needs:
- real calculations
- saved data
- export
- AI request handling
- authenticated actions
- anything beyond static UI

Prompts that should often activate this module:
- add backend
- add api route
- connect to backend
- calculate with backend
- save to backend
- export from server

---

## Official Rules for backend_endpoint v1

1. Every endpoint must have a clear purpose.
2. Every endpoint must define request and response shape.
3. Every endpoint must have a matching frontend client call if used by UI.
4. Every endpoint must expose predictable success and error behavior.
5. Never hide business logic in the frontend when a backend route exists.
6. Prefer shared contracts when possible.
7. Keep domain-specific calculations outside generic route helpers.

---

## Standard Endpoint Pattern
A reusable backend endpoint should usually define:

### A. Route
- method
- path
- purpose

### B. Request shape
- fields
- defaults
- validation

### C. Handler
- business logic
- calculation or persistence

### D. Response shape
- structured result
- summary text if relevant
- error message if relevant

### E. Client caller
- frontend function
- typed payload
- typed response

---

## Relationship to Other Modules

### Works directly with:
- calculator_engine
- save_results (later cloud version)
- export_report
- ai_panel
- auth_starter

### Does not replace:
- domain adapters
- result UI
- dashboard UI
- storage UI

---

## First Practical Extraction Goal
From the current RV Battery Planner, separate:

### A. battery-plan route
Real backend calculation endpoint

### B. request payload contract
Appliances, voltage, autonomy days, sun hours, system loss

### C. response contract
daily_wh, adjusted_daily_wh, battery_ah, solar_watts, summary

### D. frontend caller
calculateBatteryPlan()

Those together become backend_endpoint.

---

## What Success Looks Like
You know backend_endpoint is correct when:
- frontend depends on real API responses
- the app breaks clearly if backend is down
- request/response structures are predictable
- the same pattern can be reused for export, AI, auth, and other features

---

## Recommended v1 Behavior
- simple route per feature
- clean request shape
- clean response shape
- frontend service call per route
- visible loading/error state in UI

---

## Next Recommended Blueprint
export_report

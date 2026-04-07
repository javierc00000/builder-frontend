# Builder Module Blueprint v1 — ai_panel

## Purpose
Reusable module for adding AI-powered interaction inside an app.

This module enables:
- chat assistants
- analysis tools
- prompt → response workflows
- guided help systems

It is not tied to one domain.

---

## Core Responsibility
Provide a simple and consistent way for users to:
- ask something
- send input (text, image later)
- receive structured AI output
- continue interaction

---

## Mandatory Subparts

### 1. Input Area
- text input
- submit action
- loading state

### 2. Message / Output Area
- user messages
- AI responses
- structured blocks (text, lists, suggestions)

### 3. AI Action Handler
- send request to backend
- include context if needed
- handle response

### 4. State Management
- messages history
- loading
- error

### 5. Optional Enhancements
- suggestions
- quick prompts
- retry button

---

## Files It Usually Touches

### Frontend
- chat panel component
- input component
- message renderer

### Backend
- AI route (e.g. /ai/chat)
- prompt handling
- model call

---

## Generic vs Specific

### Generic
- chat UI
- message flow
- request/response handling

### Specific
- prompt content
- domain instructions
- response formatting

---

## Builder Activation Logic
Use this module when user asks:
- add AI
- add chat
- analyze with AI
- assistant
- help system

---

## Rules

1. Always show loading state
2. Always allow multiple messages
3. Never hardcode one prompt
4. Keep UI simple and reusable
5. Must work with backend_endpoint

---

## Relationship

Works with:
- backend_endpoint
- results_summary
- save_results

---

## Extraction Goal

From your app:
- chat UI
- scan/analyze flow
- response rendering

---

## Success

- reusable across tools
- works with any prompt
- feels like assistant

---

## Next
navigation_system

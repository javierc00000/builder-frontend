import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "https://builder-backend-092s.onrender.com";
const STORAGE_KEYS = {
  results: "builder_saved_results_v5",
  commandHistory: "builder_command_history_v5",
  mutationLog: "builder_mutation_log_v5",
  layout: "builder_layout_state_v5",
  modules: "builder_active_modules_v5",
  featureState: "builder_feature_state_v5",
  prompt: "builder_last_prompt_v5",
  reportCounter: "builder_report_counter_v5",
  generatedBlocks: "builder_generated_blocks_v7",
  generatedBlockState: "builder_generated_block_state_v2",
  blueprint: "builder_blueprint_state_v1",
  editorFiles: "builder_editor_files_v1",
  uiMode: "builder_ui_mode_v1",
};

const MODULE_LIBRARY = {
  calculator_engine: {
    label: "Calculator Engine",
    description: "Runs battery planning calculations through the backend.",
    category: "core",
  },
  results_summary: {
    label: "Results Summary",
    description: "Creates readable summaries from output.",
    category: "core",
  },
  affiliate_suggestions: {
    label: "Affiliate Suggestions",
    description: "Shows monetization ideas tied to the current result.",
    category: "growth",
  },
  export_report: {
    label: "Export Report",
    description: "Lets you export a builder report locally.",
    category: "utility",
  },
  save_results: {
    label: "Save Results",
    description: "Stores calculations and mutations in localStorage.",
    category: "utility",
  },
  sidebar_navigation: {
    label: "Sidebar Navigation",
    description: "Adds a left workspace rail with smart sections.",
    category: "layout",
  },
  dashboard_shell: {
    label: "Dashboard Shell",
    description: "Turns the canvas into a dashboard style workspace.",
    category: "layout",
  },
  split_workspace: {
    label: "Split Workspace",
    description: "Separates controls and preview into two columns.",
    category: "layout",
  },
  quick_actions: {
    label: "Quick Actions",
    description: "Adds action pills for common builder mutations.",
    category: "ui",
  },
  notes_panel: {
    label: "Notes Panel",
    description: "Adds a sticky notes area for builder planning.",
    category: "ui",
  },
  blueprint_engine: {
    label: "Blueprint Engine",
    description: "Generates schemas, routes, starter files, and config for app packs.",
    category: "core",
  },
  live_preview: {
    label: "Live Preview",
    description: "Shows a live structural preview of the current builder layout.",
    category: "ui",
  },
  active_features_panel: {
    label: "Active Features Panel",
    description: "Lists currently enabled behavior modules.",
    category: "ui",
  },
  status_panel: {
    label: "Status Panel",
    description: "Explains what the builder has activated.",
    category: "ui",
  },
};

const DEFAULT_MODULES = [
  "calculator_engine",
  "results_summary",
  "affiliate_suggestions",
  "export_report",
  "save_results",
  "active_features_panel",
  "status_panel",
  "live_preview",
  "quick_actions",
  "blueprint_engine",
];


const WORKSPACE_VIEWS = {
  build: {
    label: "Build Mode",
    subtitle: "Prompt, mutate, and shape the workspace shell.",
    visiblePanels: ["brain", "command", "builder", "quickActions", "modules", "workspaceMap", "generated", "preview", "status", "mutations"],
  },
  test: {
    label: "Test Mode",
    subtitle: "Run live modules, validate output, and inspect results.",
    visiblePanels: ["planner", "results", "preview", "affiliate", "status", "history", "notes", "generated"],
  },
  blueprint: {
    label: "Blueprint Mode",
    subtitle: "Work on files, routes, schemas, and scaffold relationships.",
    visiblePanels: ["blueprint", "files", "editor", "compositePacks", "workspaceMap", "mutations", "history", "status"],
  },
};


const FOCUS_VIEW_CONFIG = {
  builder: {
    label: "Builder",
    icon: "🧠",
    panelId: "brain",
    accent: "builder",
    description: "Prompt analysis, mode detection, and workspace shaping.",
    companions: ["command", "quickActions"],
  },
  layout: {
    label: "Layout",
    icon: "🧩",
    panelId: "workspaceMap",
    accent: "layout",
    description: "Zone map, shell structure, and panel placement.",
    companions: ["preview", "command"],
  },
  mutations: {
    label: "Mutations",
    icon: "⚡",
    panelId: "command",
    accent: "mutations",
    description: "Run targeted commands and mutate the app shell live.",
    companions: ["mutations", "history"],
  },
  planner: {
    label: "Planner",
    icon: "🔋",
    panelId: "planner",
    accent: "planner",
    description: "Your live backend-connected battery planning module.",
    companions: ["results", "status"],
  },
  preview: {
    label: "Preview",
    icon: "🖥️",
    panelId: "preview",
    accent: "preview",
    description: "See the shell react as commands mutate layout and modules.",
    companions: ["results", "affiliate"],
  },
  files: {
    label: "Files",
    icon: "📁",
    panelId: "files",
    accent: "files",
    description: "Blueprint files, tree navigation, and generated artifacts.",
    companions: ["editor", "blueprint"],
  },
  blueprint: {
    label: "Blueprint",
    icon: "📦",
    panelId: "blueprint",
    accent: "blueprint",
    description: "Schemas, routes, models, starter files, and app config.",
    companions: ["files", "editor"],
  },
  generated: {
    label: "Blocks",
    icon: "✨",
    panelId: "generated",
    accent: "generated",
    description: "Generated blocks and composite packs created from intent.",
    companions: ["compositePacks", "mutations"],
  },
  results: {
    label: "Results",
    icon: "📊",
    panelId: "results",
    accent: "results",
    description: "Run output, exports, saves, and affiliate follow-up.",
    companions: ["affiliate", "history"],
  },
};

const INSPECTOR_CONTEXT_MAP = {
  builder: ["status", "mutations", "history"],
  layout: ["workspaceMap", "preview", "status"],
  mutations: ["mutations", "history", "status"],
  planner: ["results", "status", "history"],
  preview: ["results", "affiliate", "status"],
  files: ["editor", "blueprint", "history"],
  blueprint: ["files", "editor", "mutations"],
  generated: ["compositePacks", "mutations", "history"],
  results: ["affiliate", "history", "status"],
};

const DEFAULT_LAYOUT = {
  mode: "workspace",
  shell: "classic",
  sidebar: false,
  split: false,
  topbar: true,
  inspector: false,
  cards: true,
  dense: false,
  previewStyle: "wireframe",
  widths: {
    sidebar: 240,
    inspector: 320,
    splitRatio: 0.58,
  },
  tabs: {
    active: "builder-workspace",
    open: ["builder-workspace", "layout-map", "battery-module"],
  },
  panels: {
    sidebar: ["builder", "results", "modules", "mutations"],
    mainTop: ["brain", "command", "quickActions", "compositePacks"],
    mainBottom: ["planner", "results", "preview"],
    inspector: ["status", "affiliate", "notes"],
  },
};

const DEFAULT_FEATURE_STATE = {
  builderMode: "battery-planner",
  appType: "tool app",
  summaryStyle: "concise",
  themeTone: "dark glass",
  quickIdea: "Battery planner with smart layout mutations",
  notes: "",
};

const QUICK_COMMANDS = [
  "make dashboard",
  "add sidebar",
  "split layout",
  "add notes panel",
  "add inspector",
  "make ide layout",
  "make crm dashboard",
  "make analytics page",
  "make saas landing",
  "make support cockpit",
  "materialize files",
  "regenerate routes",
  "regenerate page",
  "regenerate schema",
  "make it dense",
  "return to classic layout",
  "focus preview",
];

const APPLIANCE_PRESETS = [
  { name: "RV Fridge", watts: 180, hours: 8 },
  { name: "Lights", watts: 40, hours: 5 },
  { name: "Water Pump", watts: 84, hours: 0.5 },
  { name: "Laptop", watts: 90, hours: 4 },
  { name: "Fan", watts: 50, hours: 6 },
  { name: "Microwave", watts: 1000, hours: 0.3 },
];

const AFFILIATE_LIBRARY = [
  {
    title: "100Ah LiFePO4 Battery",
    fit: "Best match when battery size grows past 150Ah",
    trigger: (result) => result.battery_ah >= 150,
  },
  {
    title: "200W Solar Panel Kit",
    fit: "Good starter solar recommendation for moderate demand",
    trigger: (result) => result.solar_watts >= 180 && result.solar_watts < 500,
  },
  {
    title: "400W+ Solar Expansion Bundle",
    fit: "Useful for heavier off-grid setups",
    trigger: (result) => result.solar_watts >= 500,
  },
  {
    title: "Pure Sine Wave Inverter",
    fit: "Makes sense when adding microwaves, laptops, and electronics",
    trigger: (result) => result.daily_wh >= 1000,
  },
];


const FILE_TREE = [
  {
    id: "workspace",
    label: "workspace",
    kind: "folder",
    children: [
      { id: "builder-workspace", label: "App.jsx", kind: "file", hint: "Main builder shell" },
      { id: "layout-map", label: "layout.engine.ts", kind: "file", hint: "Zones + mutations" },
      { id: "brain-rules", label: "builder.brain.json", kind: "file", hint: "Intent detection rules" },
      { id: "battery-module", label: "modules/batteryPlanner.tsx", kind: "file", hint: "Sample runnable tool" },
      { id: "notes-doc", label: "notes/next-steps.md", kind: "file", hint: "Builder roadmap" },
    ],
  },
  {
    id: "backend",
    label: "backend",
    kind: "folder",
    children: [
      { id: "api-health", label: "main.py", kind: "file", hint: "FastAPI endpoints" },
    ],
  },
];

const EDITOR_DOCUMENTS = {
  "builder-workspace": {
    title: "App.jsx",
    type: "React shell",
    summary: "Top-level builder workspace, shell modes, topbar, and multi-zone render orchestration.",
    bullets: [
      "Reads prompt mutations and maps them into layout state.",
      "Keeps runnable modules docked inside the workspace.",
      "Acts as the mini IDE shell instead of a single calculator app.",
    ],
  },
  "layout-map": {
    title: "layout.engine.ts",
    type: "Mutation engine",
    summary: "Normalizes panel names, moves zones, swaps blocks, and remembers workspace widths.",
    bullets: [
      "Supports sidebar, mainTop, mainBottom, and inspector.",
      "Will evolve into drag/drop + prompt-driven rearrangement.",
      "Stores split ratio and rail widths in localStorage.",
    ],
  },
  "brain-rules": {
    title: "builder.brain.json",
    type: "Ruleset",
    summary: "Infers app type, builder mode, and summary style from user language.",
    bullets: [
      "Battery / solar language activates the live module path.",
      "Dashboard language activates richer shells and card-heavy previews.",
      "Future step: learn from successful prompts and keep score.",
    ],
  },
  "battery-module": {
    title: "batteryPlanner.tsx",
    type: "Sample tool module",
    summary: "A demo runnable block proving the builder can host real functionality from your backend.",
    bullets: [
      "Calls /battery-plan with appliance rows.",
      "Feeds results into summary, save, export, and affiliate layers.",
      "Should stay secondary while Builder Workspace remains primary.",
    ],
  },
  "notes-doc": {
    title: "next-steps.md",
    type: "Planning note",
    summary: "Roadmap for turning the current builder into a more Replit-like mini IDE.",
    bullets: [
      "Resizable zones with memory.",
      "Editor tabs + fake file tree + inspector actions.",
      "Eventually drag panels with prompt correction on top.",
    ],
  },
  "api-health": {
    title: "main.py",
    type: "Backend endpoint",
    summary: "Health and battery planner routes used by the current sample module.",
    bullets: [
      "GET /health for connection check.",
      "POST /battery-plan for solar + battery sizing.",
      "This is the live backend tether keeping the builder grounded.",
    ],
  },
};



const COMPOSITE_WORKSPACE_TEMPLATES = [
  {
    id: "crm-dashboard",
    label: "CRM Dashboard Pack",
    keywords: /(make|build|create).*(crm dashboard|sales dashboard|crm workspace|sales workspace)|crm dashboard|sales dashboard/,
    description: "Pipeline-focused workspace with metrics, deals, activity, and account tracking.",
    layoutPrompt: "make ide layout add sidebar add inspector split layout move results to sidebar put notes in inspector",
    appType: "admin panel",
    builderMode: "crm-builder",
    blocks: [
      { type: "hero", label: "Hero Block", title: "CRM Command Center", description: "Top banner for the sales workspace.", zone: "mainTop" },
      { type: "metrics", label: "Metrics Row", title: "Pipeline Metrics", description: "KPIs for deals, stages, and wins.", zone: "mainTop" },
      { type: "kanban", label: "Kanban Board", title: "Deals Board", description: "Track opportunities by stage.", zone: "mainBottom" },
      { type: "table", label: "Data Table", title: "Accounts Table", description: "Track accounts and owners.", zone: "mainBottom" },
      { type: "activity", label: "Activity Feed", title: "Sales Activity", description: "Recent deal updates and movement.", zone: "inspector" },
      { type: "form", label: "Settings Form", title: "Deal Properties", description: "Quick settings for pipeline objects.", zone: "inspector" },
    ],
  },
  {
    id: "analytics-page",
    label: "Analytics Page Pack",
    keywords: /(make|build|create).*(analytics page|analytics dashboard|reporting page|bi page)|analytics page|analytics dashboard/,
    description: "Metrics-heavy reporting page with tables and activity context.",
    layoutPrompt: "make dashboard add sidebar split layout add inspector put notes in inspector move results to main top",
    appType: "admin panel",
    builderMode: "analytics-builder",
    blocks: [
      { type: "hero", label: "Hero Block", title: "Analytics Overview", description: "High-level intro for reporting.", zone: "mainTop" },
      { type: "metrics", label: "Metrics Row", title: "KPI Strip", description: "Top metrics for the workspace.", zone: "mainTop" },
      { type: "table", label: "Data Table", title: "Insights Table", description: "Structured records behind the KPIs.", zone: "mainBottom" },
      { type: "activity", label: "Activity Feed", title: "Report Activity", description: "Recent queries and UI changes.", zone: "inspector" },
      { type: "chat", label: "Chat Panel", title: "Analyst Copilot", description: "Prompt surface for analytics follow-ups.", zone: "mainBottom" },
    ],
  },
  {
    id: "saas-landing",
    label: "SaaS Landing Pack",
    keywords: /(make|build|create).*(saas landing|landing page|marketing page|pricing page)|saas landing|landing page/,
    description: "Marketing-oriented landing shell with hero, metrics, social proof, and CTA blocks.",
    layoutPrompt: "make dashboard split layout focus preview add hero add metrics",
    appType: "content app",
    builderMode: "site-builder",
    blocks: [
      { type: "hero", label: "Hero Block", title: "Launch Hero", description: "Headline, subcopy, and primary CTA.", zone: "mainTop" },
      { type: "metrics", label: "Metrics Row", title: "Trust Metrics", description: "Proof points for the landing page.", zone: "mainTop" },
      { type: "table", label: "Data Table", title: "Pricing Table", description: "Starter pricing / plan comparison.", zone: "mainBottom" },
      { type: "activity", label: "Activity Feed", title: "Launch Updates", description: "Changelog-style launch feed.", zone: "inspector" },
      { type: "chat", label: "Chat Panel", title: "CTA Console", description: "Prompt surface for generating sections.", zone: "mainBottom" },
    ],
  },
  {
    id: "support-cockpit",
    label: "Support Cockpit Pack",
    keywords: /(make|build|create).*(support cockpit|support dashboard|helpdesk|customer support workspace)|support cockpit|support dashboard|helpdesk/,
    description: "Operational support cockpit with inbox-like context, activity, and ticket controls.",
    layoutPrompt: "make ide layout add sidebar add inspector split layout put history in inspector move results to sidebar",
    appType: "assistant app",
    builderMode: "support-builder",
    blocks: [
      { type: "metrics", label: "Metrics Row", title: "Support KPIs", description: "Queue health, resolution, and SLA numbers.", zone: "mainTop" },
      { type: "chat", label: "Chat Panel", title: "Agent Console", description: "Assistant-style side chat for agents.", zone: "mainBottom" },
      { type: "table", label: "Data Table", title: "Ticket Queue", description: "Ticket rows and triage state.", zone: "mainBottom" },
      { type: "activity", label: "Activity Feed", title: "Ticket Activity", description: "Recent escalations and notes.", zone: "inspector" },
      { type: "form", label: "Settings Form", title: "Ticket Properties", description: "Agent-side ticket controls.", zone: "inspector" },
    ],
  },
  {
    id: "project-planner",
    label: "Project Planner Pack",
    keywords: /(make|build|create).*(project planner|project board|planning workspace|roadmap page)|project planner|project board|roadmap page/,
    description: "Planning workspace with board, notes, activity, and roadmap structure.",
    layoutPrompt: "make ide layout add sidebar add inspector split layout move notes to inspector",
    appType: "tool app",
    builderMode: "planning-builder",
    blocks: [
      { type: "hero", label: "Hero Block", title: "Project Overview", description: "Top banner with current initiative summary.", zone: "mainTop" },
      { type: "kanban", label: "Kanban Board", title: "Roadmap Board", description: "Tasks staged by status.", zone: "mainBottom" },
      { type: "activity", label: "Activity Feed", title: "Project Activity", description: "Mutation log mirrored as project feed.", zone: "inspector" },
      { type: "form", label: "Settings Form", title: "Project Properties", description: "Name, owner, and mode inputs.", zone: "inspector" },
      { type: "table", label: "Data Table", title: "Milestones Table", description: "Milestones and state tracking.", zone: "mainBottom" },
    ],
  },
  {
    id: "dev-workspace",
    label: "Dev Workspace Pack",
    keywords: /(make|build|create).*(dev workspace|developer workspace|coding workspace|mini ide)|dev workspace|developer workspace|mini ide/,
    description: "Coding-oriented shell with file flow, metrics, activity, and copilot block.",
    layoutPrompt: "make ide layout add sidebar add inspector split layout open backend open layout",
    appType: "assistant app",
    builderMode: "dev-builder",
    blocks: [
      { type: "metrics", label: "Metrics Row", title: "Build Metrics", description: "Files, tabs, mutations, and modules.", zone: "mainTop" },
      { type: "chat", label: "Chat Panel", title: "Builder Copilot", description: "Command-capable copilot block.", zone: "mainBottom" },
      { type: "table", label: "Data Table", title: "File State Table", description: "Open tabs and generated assets.", zone: "mainBottom" },
      { type: "activity", label: "Activity Feed", title: "Build Activity", description: "Mutation history as build events.", zone: "inspector" },
      { type: "form", label: "Settings Form", title: "Environment Panel", description: "Workspace config and modes.", zone: "inspector" },
    ],
  },
];

const APP_BLUEPRINT_TEMPLATES = {
  "crm-dashboard": {
    key: "crm-dashboard",
    label: "CRM Dashboard Blueprint",
    routePrefix: "/app",
    routes: [
      { path: "/app", method: "GET", purpose: "workspace shell" },
      { path: "/app/leads", method: "GET", purpose: "lead list" },
      { path: "/app/deals", method: "GET", purpose: "deal pipeline" },
      { path: "/app/deals", method: "POST", purpose: "create deal" },
      { path: "/app/activities", method: "GET", purpose: "activity feed" },
    ],
    models: [
      { name: "Lead", fields: ["id", "name", "company", "email", "stage", "ownerId"] },
      { name: "Deal", fields: ["id", "accountId", "title", "value", "stage", "closeDate"] },
      { name: "Activity", fields: ["id", "dealId", "type", "authorId", "createdAt"] },
    ],
    schemas: [
      { name: "leadSchema", fields: ["name:string", "email:string", "stage:enum"] },
      { name: "dealSchema", fields: ["title:string", "value:number", "stage:enum", "closeDate:date"] },
    ],
    files: [
      "src/pages/CrmDashboard.jsx",
      "src/components/PipelineBoard.jsx",
      "src/components/DealTable.jsx",
      "src/lib/crmMockData.ts",
      "src/routes/crmRoutes.ts",
    ],
    config: { auth: true, billing: false, multiTenant: true, seedData: true },
  },
  "analytics-page": {
    key: "analytics-page",
    label: "Analytics Blueprint",
    routePrefix: "/analytics",
    routes: [
      { path: "/analytics", method: "GET", purpose: "analytics shell" },
      { path: "/analytics/reports", method: "GET", purpose: "report index" },
      { path: "/analytics/queries", method: "POST", purpose: "saved query execution" },
      { path: "/analytics/export", method: "POST", purpose: "export report" },
    ],
    models: [
      { name: "MetricCard", fields: ["id", "label", "value", "delta", "period"] },
      { name: "Report", fields: ["id", "name", "ownerId", "updatedAt", "status"] },
      { name: "QueryRun", fields: ["id", "reportId", "durationMs", "createdAt"] },
    ],
    schemas: [
      { name: "reportFilterSchema", fields: ["range:string", "segment:string", "compare:boolean"] },
      { name: "exportSchema", fields: ["reportId:string", "format:enum", "includeCharts:boolean"] },
    ],
    files: [
      "src/pages/AnalyticsPage.jsx",
      "src/components/MetricsStrip.jsx",
      "src/components/InsightsTable.jsx",
      "src/routes/analyticsRoutes.ts",
      "src/lib/reportFactory.ts",
    ],
    config: { auth: true, billing: true, multiTenant: false, seedData: true },
  },
  "saas-landing": {
    key: "saas-landing",
    label: "SaaS Landing Blueprint",
    routePrefix: "/",
    routes: [
      { path: "/", method: "GET", purpose: "landing page" },
      { path: "/pricing", method: "GET", purpose: "pricing page" },
      { path: "/waitlist", method: "POST", purpose: "capture leads" },
      { path: "/contact", method: "POST", purpose: "contact CTA" },
    ],
    models: [
      { name: "LeadCapture", fields: ["id", "email", "source", "createdAt"] },
      { name: "Plan", fields: ["id", "name", "price", "billingPeriod", "features"] },
      { name: "Testimonial", fields: ["id", "quote", "author", "role"] },
    ],
    schemas: [
      { name: "waitlistSchema", fields: ["email:string", "source:string"] },
      { name: "contactSchema", fields: ["name:string", "email:string", "message:string"] },
    ],
    files: [
      "src/pages/LandingPage.jsx",
      "src/components/HeroSection.jsx",
      "src/components/PricingGrid.jsx",
      "src/components/TestimonialStrip.jsx",
      "src/routes/marketingRoutes.ts",
    ],
    config: { auth: false, billing: true, multiTenant: false, seedData: true },
  },
  "support-cockpit": {
    key: "support-cockpit",
    label: "Support Cockpit Blueprint",
    routePrefix: "/support",
    routes: [
      { path: "/support", method: "GET", purpose: "support shell" },
      { path: "/support/tickets", method: "GET", purpose: "ticket queue" },
      { path: "/support/tickets/:id", method: "PATCH", purpose: "update ticket" },
      { path: "/support/macros", method: "GET", purpose: "agent macros" },
    ],
    models: [
      { name: "Ticket", fields: ["id", "subject", "priority", "status", "assigneeId", "customerId"] },
      { name: "Macro", fields: ["id", "name", "body", "team"] },
      { name: "Conversation", fields: ["id", "ticketId", "sender", "body", "createdAt"] },
    ],
    schemas: [
      { name: "ticketUpdateSchema", fields: ["status:enum", "priority:enum", "assigneeId:string"] },
      { name: "macroSchema", fields: ["name:string", "body:text", "team:string"] },
    ],
    files: [
      "src/pages/SupportCockpit.jsx",
      "src/components/TicketQueue.jsx",
      "src/components/AgentConsole.jsx",
      "src/routes/supportRoutes.ts",
      "src/lib/supportSeed.ts",
    ],
    config: { auth: true, billing: false, multiTenant: true, seedData: true },
  },
  "project-planner": {
    key: "project-planner",
    label: "Project Planner Blueprint",
    routePrefix: "/projects",
    routes: [
      { path: "/projects", method: "GET", purpose: "project board" },
      { path: "/projects/:id", method: "GET", purpose: "project detail" },
      { path: "/projects/:id/tasks", method: "POST", purpose: "create task" },
      { path: "/projects/:id/activity", method: "GET", purpose: "timeline" },
    ],
    models: [
      { name: "Project", fields: ["id", "name", "ownerId", "status", "dueDate"] },
      { name: "Task", fields: ["id", "projectId", "title", "status", "assigneeId", "points"] },
      { name: "Milestone", fields: ["id", "projectId", "title", "targetDate", "status"] },
    ],
    schemas: [
      { name: "projectSchema", fields: ["name:string", "status:enum", "dueDate:date"] },
      { name: "taskSchema", fields: ["title:string", "status:enum", "points:number"] },
    ],
    files: [
      "src/pages/ProjectPlanner.jsx",
      "src/components/RoadmapBoard.jsx",
      "src/components/MilestoneTable.jsx",
      "src/routes/projectRoutes.ts",
      "src/lib/plannerSeed.ts",
    ],
    config: { auth: true, billing: false, multiTenant: true, seedData: true },
  },
  "dev-workspace": {
    key: "dev-workspace",
    label: "Dev Workspace Blueprint",
    routePrefix: "/dev",
    routes: [
      { path: "/dev", method: "GET", purpose: "workspace shell" },
      { path: "/dev/files", method: "GET", purpose: "file explorer" },
      { path: "/dev/build", method: "POST", purpose: "trigger build" },
      { path: "/dev/logs", method: "GET", purpose: "build logs" },
    ],
    models: [
      { name: "WorkspaceFile", fields: ["id", "path", "kind", "status", "updatedAt"] },
      { name: "BuildJob", fields: ["id", "status", "durationMs", "createdAt"] },
      { name: "EnvVar", fields: ["id", "key", "scope", "masked"] },
    ],
    schemas: [
      { name: "fileSchema", fields: ["path:string", "kind:enum", "content:text"] },
      { name: "buildSchema", fields: ["target:string", "optimize:boolean", "env:string"] },
    ],
    files: [
      "src/pages/DevWorkspace.jsx",
      "src/components/FileExplorer.jsx",
      "src/components/BuildConsole.jsx",
      "src/routes/devRoutes.ts",
      "src/lib/workspaceSeed.ts",
    ],
    config: { auth: true, billing: true, multiTenant: false, seedData: true },
  },
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function inferBlueprintKeyFromCommand(command, matchedTemplate, featureState) {
  if (matchedTemplate?.id && APP_BLUEPRINT_TEMPLATES[matchedTemplate.id]) return matchedTemplate.id;
  const lower = String(command || "").toLowerCase();
  if (/crm|sales/.test(lower)) return "crm-dashboard";
  if (/analytics|report|bi/.test(lower)) return "analytics-page";
  if (/landing|marketing|pricing|saas/.test(lower)) return "saas-landing";
  if (/support|helpdesk|ticket/.test(lower)) return "support-cockpit";
  if (/project|roadmap|planner/.test(lower)) return "project-planner";
  if (/dev|developer|ide|code/.test(lower)) return "dev-workspace";
  if (featureState?.builderMode === "crm-builder") return "crm-dashboard";
  if (featureState?.builderMode === "analytics-builder") return "analytics-page";
  if (featureState?.builderMode === "site-builder") return "saas-landing";
  if (featureState?.builderMode === "support-builder") return "support-cockpit";
  if (featureState?.builderMode === "planning-builder") return "project-planner";
  if (featureState?.builderMode === "dev-builder") return "dev-workspace";
  return "dev-workspace";
}

function buildBlueprint(key, command) {
  const base = APP_BLUEPRINT_TEMPLATES[key] || APP_BLUEPRINT_TEMPLATES["dev-workspace"];
  return {
    id: uid("blueprint"),
    key: base.key,
    label: base.label,
    sourceCommand: command,
    createdAt: nowLabel(),
    routes: deepClone(base.routes),
    models: deepClone(base.models),
    schemas: deepClone(base.schemas),
    files: deepClone(base.files),
    config: deepClone(base.config),
  };
}

function inferDocTypeFromPath(path) {
  if (/\.jsx?$/.test(path)) return "component";
  if (/\.tsx?$/.test(path)) return "typescript";
  if (/\.json$/.test(path)) return "json";
  if (/\.css$/.test(path)) return "styles";
  if (/\.md$/.test(path)) return "notes";
  return "file";
}

function toPascalCase(value = "") {
  return String(value)
    .replace(/\.[^.]+$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toCamelCase(value = "") {
  const pascal = toPascalCase(value);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "generatedValue";
}

function getBlueprintHeadline(blueprint) {
  const firstRoute = blueprint?.routes?.[0]?.path || "/";
  return `${blueprint?.label || "Generated App"} · ${firstRoute}`;
}

function getPrimaryModel(blueprint) {
  return blueprint?.models?.[0] || { name: "Entity", fields: ["id", "name", "status"] };
}

function getPrimarySchema(blueprint) {
  return blueprint?.schemas?.[0] || { name: "entitySchema", fields: ["name:string", "status:string"] };
}

function getBlueprintComponentPaths(blueprint) {
  return (blueprint?.files || []).filter((item) => /src\/components\/.*\.jsx$/i.test(item));
}

function getBlueprintPagePaths(blueprint) {
  return (blueprint?.files || []).filter((item) => /src\/pages\/.*\.jsx$/i.test(item));
}

function buildRelativeImport(fromPath, toPath) {
  const fromParts = String(fromPath || "").split("/");
  fromParts.pop();
  const toParts = String(toPath || "").split("/");

  while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }

  const backtrack = fromParts.map(() => "..");
  const joined = [...backtrack, ...toParts].join("/").replace(/\.(jsx|tsx|js|ts)$/i, "");
  return joined.startsWith(".") ? joined : `./${joined}`;
}

function buildDependencyMap(blueprint) {
  const pagePaths = getBlueprintPagePaths(blueprint);
  const componentPaths = getBlueprintComponentPaths(blueprint);
  const routePaths = (blueprint?.files || []).filter((item) => /src\/routes\/.*\.(ts|js)$/i.test(item));
  return {
    blueprint: blueprint?.key || "generated-app",
    pages: pagePaths.map((pagePath) => ({
      path: pagePath,
      imports: componentPaths.slice(0, 2),
    })),
    routes: routePaths.map((routePath) => ({
      path: routePath,
      pointsTo: pagePaths[0] || null,
    })),
    components: componentPaths.map((componentPath) => ({
      path: componentPath,
      model: getPrimaryModel(blueprint).name,
    })),
  };
}

function buildJsxPageTemplate(blueprint, path) {
  const componentName = toPascalCase(path.split("/").pop() || "GeneratedPage");
  const primaryModel = getPrimaryModel(blueprint);
  const primarySchema = getPrimarySchema(blueprint);
  const componentPaths = getBlueprintComponentPaths(blueprint);
  const importedComponents = componentPaths.slice(0, 2).map((componentPath) => ({
    name: toPascalCase(componentPath.split("/").pop() || "GeneratedComponent"),
    importPath: buildRelativeImport(path, componentPath),
  }));
  const pageImports = importedComponents
    .map((item) => `import ${item.name} from "${item.importPath}";`)
    .join("\n");
  const firstRoutePath = (blueprint?.files || []).find((item) => /src\/routes\/.*\.(ts|js)$/i.test(item));
  const routeImportLine = firstRoutePath
    ? `import { ${toCamelCase(firstRoutePath.split("/").pop() || "generatedRoutes")}Config } from "${buildRelativeImport(path, firstRoutePath)}";`
    : "";
  const routeSummary = (blueprint?.routes || [])
    .slice(0, 4)
    .map((route) => `        <li key="${route.method}-${route.path}"><strong>${route.method}</strong> ${route.path} — ${route.purpose}</li>`)
    .join("\n");
  const metricCards = (primaryModel.fields || [])
    .slice(0, 4)
    .map((field, index) => `        <div key="${field}" style={cardStyle}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Field ${index + 1}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{field}</div>
        </div>`)
    .join("\n");
  const embeddedComponents = importedComponents.length
    ? importedComponents
        .map((item) => `        <div style={cardStyle}>
          <${item.name} />
        </div>`)
        .join("\n")
    : '        <div style={cardStyle}>No linked components yet.</div>';
  const safeRouteSummary = routeSummary || '          <li>No routes generated yet.</li>';
  const linkedRouteCount = blueprint?.routes?.length || 0;
  return `import React from "react";
${pageImports ? `${pageImports}
` : ""}${routeImportLine ? `${routeImportLine}
` : ""}
const pageStyle = {
  padding: 24,
  display: "grid",
  gap: 18,
  color: "#e5eefc",
  background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  minHeight: "100%",
};

const rowStyle = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
};

const cardStyle = {
  border: "1px solid rgba(148, 163, 184, 0.25)",
  borderRadius: 14,
  padding: 16,
  background: "rgba(15, 23, 42, 0.7)",
};

export default function ${componentName}() {
  return (
    <div style={pageStyle}>
      <header>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
          Builder Generated Page
        </div>
        <h1 style={{ margin: "8px 0 6px", fontSize: 30 }}>{getBlueprintHeadline(blueprint)}</h1>
        <p style={{ margin: 0, opacity: 0.84 }}>
          Primary model: ${primaryModel.name} · Primary schema: ${primarySchema.name}
        </p>
        <p style={{ margin: "8px 0 0", opacity: 0.72 }}>
          Linked routes: ${linkedRouteCount}${routeImportLine ? ' · Route config imported' : ''}${pageImports ? ' · Components imported' : ''}
        </p>
      </header>

      <section style={rowStyle}>
${metricCards}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Route Map</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
${safeRouteSummary}
        </ul>
      </section>

      <section>
        <h2 style={{ margin: "0 0 12px" }}>Linked Components</h2>
        <div style={rowStyle}>
${embeddedComponents}
        </div>
      </section>
    </div>
  );
}
`;
}

function buildJsxComponentTemplate(blueprint, path) {
  const componentName = toPascalCase(path.split("/").pop() || "GeneratedComponent");
  const model = getPrimaryModel(blueprint);
  const chips = (model.fields || [])
    .slice(0, 5)
    .map((field) => `        <span key="${field}" style={chipStyle}>{field}</span>`)
    .join("\n");
  return `import React from "react";

const wrapStyle = {
  border: "1px solid rgba(148, 163, 184, 0.22)",
  borderRadius: 14,
  padding: 16,
  background: "rgba(15, 23, 42, 0.82)",
  color: "#e2e8f0",
};

const chipRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
};

const chipStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(96, 165, 250, 0.35)",
  background: "rgba(30, 41, 59, 0.9)",
};

export default function ${componentName}() {
  return (
    <section style={wrapStyle}>
      <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7 }}>Generated component</div>
      <h3 style={{ margin: "8px 0" }}>${componentName}</h3>
      <p style={{ margin: 0, opacity: 0.84 }}>
        This component is scaffolded for ${blueprint?.label || "the current app"} and is centered around the ${model.name} model.
      </p>
      <div style={chipRow}>
${chips}
      </div>
    </section>
  );
}
`;
}

function buildRoutesTemplate(blueprint, path) {
  const constName = `${toCamelCase(path.split("/").pop() || "generatedRoutes")}Config`;
  const pagePaths = getBlueprintPagePaths(blueprint);
  const firstPagePath = pagePaths[0];
  const firstPageName = toPascalCase(firstPagePath?.split("/").pop() || "GeneratedPage");
  const pageImport = firstPagePath
    ? `import ${firstPageName} from "${buildRelativeImport(path, firstPagePath)}";`
    : "";
  const routes = (blueprint?.routes || [])
    .map((route, index) => `  { id: "route-${index + 1}", method: "${route.method}", path: "${route.path}", purpose: "${route.purpose}", requiresAuth: ${blueprint?.config?.auth ? "true" : "false"}, page: ${firstPagePath ? firstPageName : "null"} }`)
    .join(",\n");
  return `${pageImport ? `${pageImport}

` : ""}export const ${constName} = [
${routes}
];

export function findRoute(pathname) {
  return ${constName}.find((route) => route.path === pathname);
}

export function createRouteView(pathname) {
  const matched = findRoute(pathname);
  if (!matched) return null;
  return matched.page;
}
`;
}

function buildSeedTemplate(blueprint) {
  const model = getPrimaryModel(blueprint);
  const seedName = `${toCamelCase(model.name)}Seed`;
  const fields = (model.fields || []).slice(0, 5);
  const objects = [1, 2, 3]
    .map((idx) => `  { ${fields.map((field, i) => `${field}: ${i === 0 ? idx : `"${field}-${idx}"`}`).join(", ")} }`)
    .join(",\n");
  return `export const ${seedName} = [
${objects}
];

export function get${toPascalCase(model.name)}Seed() {
  return ${seedName};
}
`;
}

function buildSchemaTemplate(blueprint) {
  return (blueprint?.schemas || [])
    .map((schema) => `export const ${toCamelCase(schema.name)} = {
${(schema.fields || [])
      .map((field) => {
        const parts = String(field).split(":");
        return `  ${parts[0]}: "${parts[1] || "string"}",`;
      })
      .join("\n")}
};
`)
    .join("\n");
}

function buildProvidersTemplate(blueprint) {
  return `import React from "react";

export function AppProviders({ children }) {
  return (
    <div data-auth="${blueprint?.config?.auth ? "enabled" : "disabled"}" data-billing="${blueprint?.config?.billing ? "enabled" : "disabled"}" data-tenant="${blueprint?.config?.multiTenant ? "multi" : "single"}">
      {children}
    </div>
  );
}
`;
}

function buildStylesTemplate(blueprint) {
  return `/* Generated shell styles for ${blueprint?.label || "workspace"} */
.app-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  gap: 16px;
  min-height: 100vh;
}

.workspace-panel {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.82);
  padding: 16px;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
`;
}

function makeMaterializedFileContent(blueprint, path) {
  const routes = (blueprint?.routes || []).map((route) => `${route.method} ${route.path} — ${route.purpose}`).join("\n");
  const models = (blueprint?.models || []).map((model) => `${model.name}: ${(model.fields || []).join(", ")}`).join("\n");
  const schemas = (blueprint?.schemas || []).map((schema) => `${schema.name}: ${(schema.fields || []).join(", ")}`).join("\n");
  if (/src\/pages\/.*\.jsx$/i.test(path)) return buildJsxPageTemplate(blueprint, path);
  if (/src\/components\/.*\.jsx$/i.test(path)) return buildJsxComponentTemplate(blueprint, path);
  if (/src\/routes\/.*\.(ts|js)$/i.test(path)) return buildRoutesTemplate(blueprint, path);
  if (/schema/i.test(path)) return buildSchemaTemplate(blueprint) || `// Validation schema draft
${schemas || "// No schemas yet"}`;
  if (/seed/i.test(path)) return buildSeedTemplate(blueprint);
  if (/model/i.test(path)) return `// Data model draft
${models || "// No models yet"}`;
  if (/dependency-map/i.test(path)) return JSON.stringify(buildDependencyMap(blueprint), null, 2);
  if (/providers/i.test(path)) return buildProvidersTemplate(blueprint);
  if (/app-shell|styles/i.test(path)) return buildStylesTemplate(blueprint);
  if (/client\.(ts|js)$/i.test(path)) {
    return `export async function apiClient(path, options = {}) {
  return fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
}
`;
  }
  if (/routes/i.test(path)) {
    return `// Generated from ${blueprint?.label || "Blueprint"}
export const routes = [
${(blueprint?.routes || []).map((route) => `  { method: "${route.method}", path: "${route.path}", purpose: "${route.purpose}" }`).join(",\n")}
];`;
  }
  return `// Starter file generated from ${blueprint?.label || "Blueprint"}
// Source command: ${blueprint?.sourceCommand || "builder-generated"}

// Routes
${routes || "// No routes"}

// Models
${models || "// No models"}

// Schemas
${schemas || "// No schemas"}`;
}

function getIntentDrivenTabOrder(blueprint, fileMap = {}) {
  if (!blueprint) return [];
  const desiredPaths = [
    ...(blueprint.files || []).filter((item) => /src\/pages\//i.test(item)),
    ...(blueprint.files || []).filter((item) => /src\/routes\//i.test(item)),
    ...(blueprint.files || []).filter((item) => /src\/components\//i.test(item)),
    ...(blueprint.files || []).filter((item) => /providers|client|styles/i.test(item)),
    `blueprints/${blueprint.key}.blueprint.json`,
    `blueprints/${blueprint.key}.dependency-map.json`,
  ];
  return Array.from(new Set(desiredPaths))
    .map((path) => `generated:${path}`)
    .filter((id) => fileMap[id]);
}

function materializeBlueprintFiles(blueprint, existingFiles = {}) {
  if (!blueprint) {
    return { files: existingFiles || {}, created: [] };
  }

  const nextFiles = { ...(existingFiles || {}) };
  const created = [];
  const inferredFiles = [
    ...(blueprint.files || []),
    `blueprints/${blueprint.key}.blueprint.json`,
    `blueprints/${blueprint.key}.routes.txt`,
    `blueprints/${blueprint.key}.models.txt`,
    `blueprints/${blueprint.key}.dependency-map.json`,
  ];

  Array.from(new Set(inferredFiles)).forEach((path) => {
    const id = `generated:${path}`;
    const exists = !!nextFiles[id];
    nextFiles[id] = {
      id,
      label: path.split("/").pop() || path,
      fullPath: path,
      type: inferDocTypeFromPath(path),
      source: "blueprint",
      content:
        path.endsWith(".blueprint.json")
          ? JSON.stringify(blueprint, null, 2)
          : path.endsWith(".routes.txt")
            ? (blueprint.routes || []).map((route) => `${route.method} ${route.path} — ${route.purpose}`).join("\n")
            : path.endsWith(".models.txt")
              ? (blueprint.models || []).map((model) => `${model.name}: ${(model.fields || []).join(", ")}`).join("\n")
              : makeMaterializedFileContent(blueprint, path),
      updatedAt: nowLabel(),
    };
    if (!exists) created.push(nextFiles[id]);
  });

  return { files: nextFiles, created };
}


function ensureBlueprintFilesForRegeneration(blueprint, command) {
  if (!blueprint) return { blueprint, added: [] };
  const lower = String(command || "").toLowerCase();
  const next = deepClone(blueprint);
  const added = [];
  const pushFile = (filePath) => {
    if (!next.files.includes(filePath)) {
      next.files.push(filePath);
      added.push(filePath);
    }
  };

  if (/regenerate route|regenerate routes|refresh route|refresh routes|rebuild route|rebuild routes/.test(lower)) {
    pushFile(`src/routes/${toCamelCase(next.key)}Routes.ts`);
  }
  if (/regenerate page|regenerate pages|refresh page|refresh pages|rebuild page|rebuild pages/.test(lower)) {
    const fallbackPage = `src/pages/${toPascalCase(next.key)}Page.jsx`;
    const hasPage = (next.files || []).some((item) => /src\/pages\/.*\.jsx$/i.test(item));
    if (!hasPage) pushFile(fallbackPage);
  }
  if (/regenerate schema|regenerate schemas|refresh schema|refresh schemas|rebuild schema|rebuild schemas/.test(lower)) {
    pushFile(`src/schemas/${toCamelCase(next.key)}Schema.ts`);
  }
  if (/regenerate component|regenerate components|refresh component|refresh components/.test(lower)) {
    pushFile(`src/components/${toPascalCase(next.key)}Panel.jsx`);
  }

  return { blueprint: next, added };
}

function getRegenerationTargetPaths(blueprint, command, activeTab = "", fileMap = {}) {
  if (!blueprint) return [];
  const lower = String(command || "").toLowerCase();
  const allPaths = Array.from(
    new Set([
      ...(blueprint.files || []),
      `blueprints/${blueprint.key}.blueprint.json`,
      `blueprints/${blueprint.key}.routes.txt`,
      `blueprints/${blueprint.key}.models.txt`,
      `blueprints/${blueprint.key}.dependency-map.json`,
    ])
  );

  const matchers = {
    routes: (item) => /src\/routes\/.*\.(ts|js)$/i.test(item) || item.endsWith(".routes.txt"),
    pages: (item) => /src\/pages\/.*\.jsx$/i.test(item),
    schemas: (item) => /schema/i.test(item),
    models: (item) => /models\.txt$/i.test(item),
    components: (item) => /src\/components\/.*\.jsx$/i.test(item),
    support: (item) => /providers|client|styles/i.test(item),
  };

  let targets = [];
  if (/regenerate all|regenerate everything|refresh all|rebuild all/.test(lower)) {
    targets = allPaths;
  } else {
    if (/route/.test(lower)) targets.push(...allPaths.filter(matchers.routes));
    if (/page/.test(lower)) targets.push(...allPaths.filter(matchers.pages));
    if (/schema/.test(lower)) targets.push(...allPaths.filter(matchers.schemas));
    if (/model/.test(lower)) targets.push(...allPaths.filter(matchers.models));
    if (/component/.test(lower)) targets.push(...allPaths.filter(matchers.components));
    if (/provider|client|style/.test(lower)) targets.push(...allPaths.filter(matchers.support));
  }

  if (!targets.length && activeTab && fileMap[activeTab]?.fullPath) {
    targets.push(fileMap[activeTab].fullPath);
  }

  if (!targets.length) {
    targets = [
      ...allPaths.filter(matchers.pages),
      ...allPaths.filter(matchers.routes),
      `blueprints/${blueprint.key}.dependency-map.json`,
    ];
  }

  targets.push(`blueprints/${blueprint.key}.blueprint.json`);
  targets.push(`blueprints/${blueprint.key}.dependency-map.json`);

  return Array.from(new Set(targets));
}

function createMaterializedTree(editorFiles = {}) {
  const generatedChildren = Object.values(editorFiles)
    .sort((a, b) => String(a.fullPath).localeCompare(String(b.fullPath)))
    .map((file) => ({
      id: file.id,
      label: file.label,
      kind: "file",
      hint: file.fullPath,
    }));

  if (!generatedChildren.length) return FILE_TREE;

  return [
    ...FILE_TREE,
    {
      id: "generated-artifacts",
      label: "generated",
      kind: "folder",
      children: generatedChildren,
    },
  ];
}

function applyBlueprintFlags(blueprint, command) {
  const lower = String(command || "").toLowerCase();
  const next = deepClone(blueprint);
  if (/add auth|with auth|authentication/.test(lower)) {
    next.config.auth = true;
    if (!next.routes.some((route) => route.path === "/auth/login")) {
      next.routes.unshift({ path: "/auth/login", method: "POST", purpose: "sign in" });
      next.routes.unshift({ path: "/auth/me", method: "GET", purpose: "session check" });
    }
    if (!next.schemas.some((schema) => schema.name === "loginSchema")) {
      next.schemas.unshift({ name: "loginSchema", fields: ["email:string", "password:string"] });
    }
  }
  if (/add billing|with billing|subscriptions|payments/.test(lower)) {
    next.config.billing = true;
    if (!next.routes.some((route) => route.path.includes("billing"))) {
      next.routes.push({ path: "/billing/checkout", method: "POST", purpose: "start checkout" });
      next.routes.push({ path: "/billing/subscription", method: "GET", purpose: "current subscription" });
    }
    if (!next.models.some((model) => model.name === "Subscription")) {
      next.models.push({ name: "Subscription", fields: ["id", "accountId", "planId", "status", "renewalDate"] });
    }
  }
  if (/multi tenant|multitenant|multi-tenant|teams/.test(lower)) {
    next.config.multiTenant = true;
    if (!next.models.some((model) => model.name === "Workspace")) {
      next.models.unshift({ name: "Workspace", fields: ["id", "name", "slug", "plan", "ownerId"] });
    }
  }
  if (/seed data|mock data|demo data/.test(lower)) {
    next.config.seedData = true;
  }
  if (/generate routes|add routes/.test(lower)) {
    next.files = Array.from(new Set([...(next.files || []), `src/routes/${next.key.replace(/-/g, '')}ExtraRoutes.ts`]));
  }
  if (/generate schema|add schema|schemas/.test(lower)) {
    if (!next.schemas.some((schema) => schema.name === "uiStateSchema")) {
      next.schemas.push({ name: "uiStateSchema", fields: ["layout:string", "theme:string", "density:boolean"] });
    }
  }
  if (/starter files|generate files|starter project/.test(lower)) {
    next.files = Array.from(new Set([...(next.files || []), "src/app/providers/AppProviders.jsx", "src/lib/api/client.ts", "src/styles/app-shell.css"]));
  }
  return next;
}

function resolveBlueprintMutation(command, currentBlueprint, matchedTemplate, featureState) {
  const lower = String(command || "").toLowerCase();
  const wantsBlueprint = /(schema|routes|starter files|data model|models|blueprint|auth|billing|multi tenant|multitenant|teams|project structure|generate files)/.test(lower) || matchedTemplate?.id;
  if (!wantsBlueprint && currentBlueprint) {
    return { blueprint: currentBlueprint, created: false, updated: false, notes: [] };
  }
  const key = inferBlueprintKeyFromCommand(command, matchedTemplate, featureState);
  const base = currentBlueprint && currentBlueprint.key === key ? currentBlueprint : buildBlueprint(key, command);
  const next = applyBlueprintFlags(base, command);
  return {
    blueprint: next,
    created: !currentBlueprint || currentBlueprint.key !== key,
    updated: true,
    notes: [
      `${!currentBlueprint || currentBlueprint.key !== key ? 'Generated' : 'Updated'} blueprint: ${next.label}.`,
      `Routes: ${next.routes.length} • Models: ${next.models.length} • Schemas: ${next.schemas.length} • Files: ${next.files.length}`,
    ],
  };
}

const GENERATED_BLOCK_TEMPLATES = [
  {
    type: "hero",
    label: "Hero Block",
    keywords: /(hero|landing|headline|marketing banner|welcome section)/,
    title: "Builder Hero",
    description: "High-impact intro area for the current workspace concept.",
    zone: "mainTop",
  },
  {
    type: "metrics",
    label: "Metrics Row",
    keywords: /(metrics|stats|analytics cards|kpi|dashboard cards)/,
    title: "Metrics Row",
    description: "Quick KPI strip with top metrics and summary numbers.",
    zone: "mainTop",
  },
  {
    type: "kanban",
    label: "Kanban Board",
    keywords: /(kanban|task board|todo board|board view|sprint board)/,
    title: "Kanban Board",
    description: "Three-column planning board to stage work inside the builder.",
    zone: "mainBottom",
  },
  {
    type: "activity",
    label: "Activity Feed",
    keywords: /(activity feed|timeline|updates|recent activity|audit trail)/,
    title: "Activity Feed",
    description: "Recent actions stream so the UI starts feeling like a real product shell.",
    zone: "inspector",
  },
  {
    type: "chat",
    label: "Chat Panel",
    keywords: /(chat panel|assistant panel|copilot|chat ui|conversation)/,
    title: "Chat Panel",
    description: "Builder-side chat block for prompt conversations and guided actions.",
    zone: "mainBottom",
  },
  {
    type: "form",
    label: "Settings Form",
    keywords: /(form|settings|preferences|config panel|inputs)/,
    title: "Settings Form",
    description: "Configuration surface with inputs, toggles, and submit CTA.",
    zone: "inspector",
  },
  {
    type: "table",
    label: "Data Table",
    keywords: /(table|grid|rows|data list|records)/,
    title: "Data Table",
    description: "Structured list block for records, files, or generated items.",
    zone: "mainBottom",
  },
  {
    type: "empty-state",
    label: "Empty State",
    keywords: /(empty state|onboarding|getting started|starter panel)/,
    title: "Empty State",
    description: "Guided placeholder that explains what the user should do next.",
    zone: "mainTop",
  },
];

function dedupeGeneratedBlocks(blocks) {
  const seen = new Set();
  return (blocks || []).filter((block) => {
    const key = `${block.type}::${slugify(block.title)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}


function mergeGeneratedBlocks(existingBlocks = [], incomingBlocks = []) {
  return dedupeGeneratedBlocks([...(existingBlocks || []), ...(incomingBlocks || [])]);
}

function createCompositeWorkspaceFromCommand(command, currentBlocks = []) {
  const lower = String(command || "").toLowerCase();
  const matched = COMPOSITE_WORKSPACE_TEMPLATES.find((template) => template.keywords.test(lower));

  if (!matched) {
    return {
      template: null,
      blocks: currentBlocks || [],
      created: [],
      notes: [],
      layoutPrompt: "",
      featurePatch: null,
    };
  }

  const nextBlocks = [...(currentBlocks || [])];
  const created = [];

  (matched.blocks || []).forEach((entry) => {
    const block = {
      id: uid("block"),
      type: entry.type,
      label: entry.label,
      title: entry.title,
      description: entry.description,
      zone: entry.zone,
      sourceCommand: command,
      createdAt: nowLabel(),
      packId: matched.id,
      packLabel: matched.label,
    };
    const exists = nextBlocks.some(
      (item) => item.type === block.type && slugify(item.title) === slugify(block.title)
    );
    if (!exists) {
      nextBlocks.push(block);
      created.push(block);
    }
  });

  return {
    template: matched,
    blocks: mergeGeneratedBlocks([], nextBlocks),
    created,
    notes: [
      `Loaded composite pack: ${matched.label}.`,
      `Created coordinated workspace blocks for ${matched.id}.`,
    ],
    layoutPrompt: matched.layoutPrompt || "",
    featurePatch: {
      appType: matched.appType,
      builderMode: matched.builderMode,
      quickIdea: command,
    },
  };
}

function createGeneratedBlocksFromCommand(command, currentBlocks = []) {
  const lower = String(command || "").toLowerCase();
  let nextBlocks = [...(currentBlocks || [])];
  const created = [];
  const removed = [];

  if (/(clear generated|remove generated|reset generated|clear custom blocks)/.test(lower)) {
    removed.push(...nextBlocks.map((block) => block.title));
    nextBlocks = [];
  }

  GENERATED_BLOCK_TEMPLATES.forEach((template) => {
    if (template.keywords.test(lower)) {
      const block = {
        id: uid("block"),
        type: template.type,
        label: template.label,
        title: template.title,
        description: template.description,
        zone: template.zone,
        sourceCommand: command,
        createdAt: nowLabel(),
      };
      const exists = nextBlocks.some((item) => item.type === block.type && item.title === block.title);
      if (!exists) {
        nextBlocks.push(block);
        created.push(block);
      }
    }
  });

  if (/(generate ui block|add custom block|new ui block|component block)/.test(lower) && !created.length) {
    const generic = {
      id: uid("block"),
      type: "custom",
      label: "Custom Block",
      title: "Custom UI Block",
      description: "Prompt-generated placeholder block ready for later real component logic.",
      zone: "mainBottom",
      sourceCommand: command,
      createdAt: nowLabel(),
    };
    nextBlocks.push(generic);
    created.push(generic);
  }

  return {
    blocks: dedupeGeneratedBlocks(nextBlocks),
    created,
    removed,
  };
}

function createDefaultGeneratedBlockState(block) {
  const base = {
    hero: {
      ctaClicks: 0,
    },
    metrics: {
      metrics: [
        { label: "Runs", value: 12 },
        { label: "Panels", value: 8 },
        { label: "Blocks", value: 3 },
      ],
    },
    kanban: {
      columns: {
        backlog: ["Idea parser", "Prompt memory"],
        building: ["Zone mutation"],
        done: ["IDE tabs"],
      },
      counter: 1,
    },
    activity: {
      entries: ["Builder workspace created", "Prompt mutation logged", "Preview zone refreshed"],
    },
    chat: {
      messages: [
        { role: "assistant", text: "Builder copilot online." },
        { role: "user", text: "Add smarter UI blocks." },
      ],
      draft: "",
    },
    form: {
      values: {
        projectName: "My Builder",
        mode: "workspace",
      },
      saved: false,
    },
    table: {
      rows: [
        { name: "App.jsx", type: "shell", status: "active" },
        { name: "layout.engine.ts", type: "layout", status: "active" },
      ],
      counter: 1,
    },
    "empty-state": {
      launched: false,
    },
    custom: {
      notes: ["Generated from prompt"],
    },
  };
  return base[block?.type] ? JSON.parse(JSON.stringify(base[block.type])) : {};
}

function ensureGeneratedBlockState(blocks, currentState) {
  const nextState = { ...(currentState || {}) };
  let changed = false;
  (blocks || []).forEach((block) => {
    if (!nextState[block.id]) {
      nextState[block.id] = createDefaultGeneratedBlockState(block);
      changed = true;
    }
  });
  Object.keys(nextState).forEach((key) => {
    if (!(blocks || []).some((block) => block.id === key)) {
      delete nextState[key];
      changed = true;
    }
  });
  return { state: nextState, changed };
}

function safeJSONParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  return safeJSONParse(window.localStorage.getItem(key), fallback);
}

function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowLabel() {
  return new Date().toLocaleString();
}

function inferAppType(prompt) {
  const p = prompt.toLowerCase();
  if (/(admin|dashboard|analytics|panel)/.test(p)) return "admin panel";
  if (/(assistant|chat|copilot|agent)/.test(p)) return "assistant app";
  if (/(content|editor|blog|cms|writer)/.test(p)) return "content app";
  return "tool app";
}

function inferBuilderMode(prompt) {
  const p = prompt.toLowerCase();
  if (/(battery|solar|power|inverter|camping)/.test(p)) return "battery-planner";
  if (/(dashboard|analytics|cards|insights)/.test(p)) return "dashboard-builder";
  if (/(landing|website|marketing)/.test(p)) return "site-builder";
  return "general-builder";
}

function inferSummaryStyle(prompt) {
  const p = prompt.toLowerCase();
  if (/(detail|deeper|full|complete|advanced)/.test(p)) return "detailed";
  if (/(simple|quick|fast|short)/.test(p)) return "concise";
  return "balanced";
}

function analyzePrompt(prompt) {
  const lower = prompt.toLowerCase();
  const detectedModes = [];
  const detectedModules = [];

  if (/(battery|solar|power|appliance|ah|watts)/.test(lower)) {
    detectedModes.push("battery planner");
    detectedModules.push("calculator_engine", "results_summary");
  }
  if (/(export|report|download)/.test(lower)) {
    detectedModules.push("export_report");
  }
  if (/(affiliate|amazon|monetize|suggest)/.test(lower)) {
    detectedModules.push("affiliate_suggestions");
  }
  if (/(sidebar|navigation|rail)/.test(lower)) {
    detectedModules.push("sidebar_navigation");
  }
  if (/(preview|canvas|live)/.test(lower)) {
    detectedModules.push("live_preview");
  }
  if (/(notes|brainstorm|scratch)/.test(lower)) {
    detectedModules.push("notes_panel");
  }
  if (/(dashboard)/.test(lower)) {
    detectedModules.push("dashboard_shell");
  }
  if (/(split|two column|2 column|2-column)/.test(lower)) {
    detectedModules.push("split_workspace");
  }

  const uniqueModes = [...new Set(detectedModes)];
  const uniqueModules = [...new Set(detectedModules)];

  return {
    appType: inferAppType(prompt),
    builderMode: inferBuilderMode(prompt),
    summaryStyle: inferSummaryStyle(prompt),
    detectedModes: uniqueModes,
    recommendedModules: uniqueModules,
  };
}

function computeSummary(result, style) {
  if (!result) return "No calculation yet.";
  const base = `Plan for about ${result.battery_ah}Ah of battery and ${result.solar_watts}W of solar.`;
  if (style === "detailed") {
    return `${base} Your raw daily load is ${result.daily_wh}Wh and the adjusted load with losses is ${result.adjusted_daily_wh}Wh.`;
  }
  if (style === "balanced") {
    return `${base} Adjusted demand: ${result.adjusted_daily_wh}Wh/day.`;
  }
  return base;
}

function getActiveAffiliateSuggestions(result) {
  if (!result) return [];
  return AFFILIATE_LIBRARY.filter((item) => item.trigger(result));
}

function makeReportPayload({ prompt, result, layout, activeModules, mutationLog, featureState }) {
  return {
    generatedAt: nowLabel(),
    prompt,
    featureState,
    layout,
    activeModules,
    result,
    mutationLog,
  };
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


const PANEL_ALIASES = {
  brain: "brain",
  builder: "builder",
  workspace: "builder",
  command: "command",
  commands: "command",
  quickactions: "quickActions",
  "quick actions": "quickActions",
  planner: "planner",
  calculator: "planner",
  "battery planner": "planner",
  results: "results",
  result: "results",
  summary: "results",
  preview: "preview",
  canvas: "preview",
  livepreview: "preview",
  modules: "modules",
  features: "modules",
  dock: "modules",
  files: "files",
  filetree: "files",
  "file tree": "files",
  editor: "editor",
  tabs: "editor",
  mutations: "mutations",
  log: "mutations",
  logs: "mutations",
  history: "history",
  status: "status",
  affiliate: "affiliate",
  notes: "notes",
  blueprint: "blueprint",
  blueprints: "blueprint",
  schema: "blueprint",
  routes: "blueprint",
  inspector: "status",
};

const ZONE_ALIASES = {
  sidebar: "sidebar",
  rail: "sidebar",
  left: "sidebar",
  inspector: "inspector",
  right: "inspector",
  maintop: "mainTop",
  "main top": "mainTop",
  header: "mainTop",
  mainbottom: "mainBottom",
  "main bottom": "mainBottom",
  main: "mainBottom",
  workspace: "mainBottom",
  center: "mainBottom",
};

function normalizePanelId(raw) {
  const clean = String(raw || "").toLowerCase().replace(/[^a-z ]/g, "").trim();
  return PANEL_ALIASES[clean] || PANEL_ALIASES[clean.replace(/\s+/g, "")] || null;
}

function normalizeZoneId(raw) {
  const clean = String(raw || "").toLowerCase().replace(/[^a-z ]/g, "").trim();
  return ZONE_ALIASES[clean] || ZONE_ALIASES[clean.replace(/\s+/g, "")] || null;
}

function clonePanels(panels) {
  return {
    sidebar: [...(panels?.sidebar || [])],
    mainTop: [...(panels?.mainTop || [])],
    mainBottom: [...(panels?.mainBottom || [])],
    inspector: [...(panels?.inspector || [])],
  };
}

function removePanelEverywhere(panels, panelId) {
  const next = clonePanels(panels);
  Object.keys(next).forEach((zone) => {
    next[zone] = next[zone].filter((item) => item !== panelId);
  });
  return next;
}

function movePanelToZone(panels, panelId, zoneId, position = "end") {
  const next = removePanelEverywhere(panels, panelId);
  if (!next[zoneId]) return next;
  if (position === "start") {
    next[zoneId] = [panelId, ...next[zoneId]];
  } else {
    next[zoneId] = [...next[zoneId], panelId];
  }
  return next;
}

function swapPanelsInLayout(panels, firstId, secondId) {
  const next = clonePanels(panels);
  Object.keys(next).forEach((zone) => {
    next[zone] = next[zone].map((item) => {
      if (item === firstId) return "__swap__";
      if (item === secondId) return firstId;
      return item;
    }).map((item) => (item === "__swap__" ? secondId : item));
  });
  return next;
}

function makeStatusText(layout, modules, result) {
  const activeLayout = [
    layout.shell,
    layout.sidebar ? "sidebar" : null,
    layout.split ? "split" : null,
    layout.inspector ? "inspector" : null,
    layout.dense ? "dense" : "spacious",
  ]
    .filter(Boolean)
    .join(" · ");

  const resultText = result
    ? `Live calculation ready (${result.battery_ah}Ah / ${result.solar_watts}W).`
    : "Waiting for calculation.";

  return `Builder is running with ${modules.length} active modules. Layout: ${activeLayout}. ${resultText}`;
}

function applyLayoutCommand(command, prevLayout, activeModules) {
  const nextLayout = {
    ...prevLayout,
    panels: clonePanels(prevLayout.panels),
  };
  const moduleAdds = [];
  const notes = [];
  const lower = command.toLowerCase();

  if (/(make dashboard|dashboard mode|turn into dashboard)/.test(lower)) {
    nextLayout.mode = "dashboard";
    nextLayout.shell = "dashboard";
    nextLayout.cards = true;
    nextLayout.previewStyle = "dashboard";
    moduleAdds.push("dashboard_shell");
    notes.push("Switched workspace into dashboard shell.");
  }

  if (/(add sidebar|show sidebar|left sidebar|sidebar navigation)/.test(lower)) {
    nextLayout.sidebar = true;
    moduleAdds.push("sidebar_navigation");
    notes.push("Enabled sidebar navigation.");
  }

  if (/(remove sidebar|hide sidebar)/.test(lower)) {
    nextLayout.sidebar = false;
    notes.push("Removed sidebar from layout.");
  }

  if (/(split layout|split workspace|two column|2 column|2-column|make a 3-panel ide layout|three panel ide)/.test(lower)) {
    nextLayout.split = true;
    nextLayout.mode = nextLayout.mode === "focus" ? "workspace" : nextLayout.mode;
    moduleAdds.push("split_workspace");
    notes.push("Split workspace into control and preview columns.");
  }

  if (/(single column|stack layout|stacked layout)/.test(lower)) {
    nextLayout.split = false;
    notes.push("Returned to single column workspace.");
  }

  if (/(make ide layout|ide mode|replit layout|cursor layout|open files|show file tree|open editor)/.test(lower)) {
    nextLayout.mode = "workspace";
    nextLayout.shell = "dashboard";
    nextLayout.sidebar = true;
    nextLayout.split = true;
    nextLayout.inspector = true;
    nextLayout.previewStyle = "dashboard";
    nextLayout.panels.sidebar = ["files", "modules", "mutations"];
    nextLayout.panels.mainTop = ["brain", "command", "editor", "compositePacks"];
    nextLayout.panels.mainBottom = ["builder", "planner", "preview", "results"];
    nextLayout.panels.inspector = ["status", "notes", "affiliate", "history"];
    if (!nextLayout.tabs.open.includes("builder-workspace")) {
      nextLayout.tabs.open = ["builder-workspace", ...nextLayout.tabs.open];
    }
    moduleAdds.push("dashboard_shell", "sidebar_navigation", "split_workspace", "notes_panel");
    notes.push("Switched into IDE-style workspace with file tree, editor tabs, and inspector.");
  }

  if (/(wider sidebar|grow sidebar|expand sidebar)/.test(lower)) {
    nextLayout.sidebar = true;
    nextLayout.widths.sidebar = Math.min((nextLayout.widths?.sidebar || 240) + 36, 420);
    notes.push(`Sidebar width increased to ${nextLayout.widths.sidebar}px.`);
  }

  if (/(narrow sidebar|shrink sidebar)/.test(lower)) {
    nextLayout.widths.sidebar = Math.max((nextLayout.widths?.sidebar || 240) - 36, 180);
    notes.push(`Sidebar width reduced to ${nextLayout.widths.sidebar}px.`);
  }

  if (/(wider inspector|grow inspector|expand inspector)/.test(lower)) {
    nextLayout.inspector = true;
    nextLayout.widths.inspector = Math.min((nextLayout.widths?.inspector || 320) + 36, 460);
    notes.push(`Inspector width increased to ${nextLayout.widths.inspector}px.`);
  }

  if (/(narrow inspector|shrink inspector)/.test(lower)) {
    nextLayout.widths.inspector = Math.max((nextLayout.widths?.inspector || 320) - 36, 220);
    notes.push(`Inspector width reduced to ${nextLayout.widths.inspector}px.`);
  }

  if (/(more space for preview|preview wider|wider preview)/.test(lower)) {
    nextLayout.split = true;
    nextLayout.widths.splitRatio = 0.42;
    notes.push("Preview column got more space in the split workspace.");
  }

  if (/(more space for planner|planner wider|wider planner|more space for builder)/.test(lower)) {
    nextLayout.split = true;
    nextLayout.widths.splitRatio = 0.66;
    notes.push("Planner / builder side got more space in the split workspace.");
  }

  if (/(add inspector|show inspector|right panel)/.test(lower)) {
    nextLayout.inspector = true;
    if (!nextLayout.panels.inspector.includes("notes")) {
      nextLayout.panels.inspector.push("notes");
    }
    moduleAdds.push("notes_panel");
    notes.push("Enabled inspector panel on the right.");
  }

  if (/(remove inspector|hide inspector)/.test(lower)) {
    nextLayout.inspector = false;
    notes.push("Removed inspector panel.");
  }

  if (/(make it dense|dense mode|compact)/.test(lower)) {
    nextLayout.dense = true;
    notes.push("Activated dense layout spacing.");
  }

  if (/(make it spacious|comfortable|relaxed)/.test(lower)) {
    nextLayout.dense = false;
    notes.push("Returned to spacious layout spacing.");
  }

  if (/(focus preview|preview mode|canvas focus|make preview full width)/.test(lower)) {
    nextLayout.mode = "focus";
    nextLayout.shell = "focus";
    nextLayout.split = false;
    nextLayout.sidebar = false;
    nextLayout.inspector = false;
    nextLayout.previewStyle = "spotlight";
    nextLayout.panels.mainTop = nextLayout.panels.mainTop.filter((item) => item !== "preview");
    nextLayout.panels.mainBottom = ["preview", ...nextLayout.panels.mainBottom.filter((item) => item !== "preview")];
    notes.push("Focused the workspace on preview-first mode.");
  }

  if (/(return to classic layout|classic layout|reset layout|default layout)/.test(lower)) {
    return {
      layout: {
        ...DEFAULT_LAYOUT,
        panels: clonePanels(DEFAULT_LAYOUT.panels),
      },
      moduleAdds: [],
      notes: ["Reset workspace back to classic layout."],
    };
  }

  if (/(wireframe|simple preview)/.test(lower)) {
    nextLayout.previewStyle = "wireframe";
    notes.push("Preview switched to wireframe style.");
  }

  if (/(dashboard cards|card mode)/.test(lower)) {
    nextLayout.previewStyle = "dashboard";
    notes.push("Preview switched to dashboard card style.");
  }

  const moveMatch = lower.match(/(?:move|put|send|pin)\s+(.+?)\s+(?:to|in|into)\s+(sidebar|inspector|main top|main bottom|main|workspace|left|right|center)/);
  if (moveMatch) {
    const panelId = normalizePanelId(moveMatch[1]);
    const zoneId = normalizeZoneId(moveMatch[2]);
    if (panelId && zoneId) {
      nextLayout.panels = movePanelToZone(nextLayout.panels, panelId, zoneId, /pin|prioritize/.test(lower) ? "start" : "end");
      if (zoneId === "sidebar") nextLayout.sidebar = true;
      if (zoneId === "inspector") nextLayout.inspector = true;
      notes.push(`Moved ${panelId} to ${zoneId}.`);
    }
  }

  const leftRightMatch = lower.match(/put\s+(.+?)\s+left\s+and\s+(.+?)\s+right/);
  if (leftRightMatch) {
    const leftId = normalizePanelId(leftRightMatch[1]);
    const rightId = normalizePanelId(leftRightMatch[2]);
    if (leftId && rightId) {
      const rest = nextLayout.panels.mainBottom.filter((item) => item !== leftId && item !== rightId);
      nextLayout.panels.mainBottom = [leftId, rightId, ...rest];
      nextLayout.split = true;
      notes.push(`Placed ${leftId} left and ${rightId} right in the main workspace.`);
    }
  }

  const swapMatch = lower.match(/swap\s+(.+?)\s+and\s+(.+)/);
  if (swapMatch) {
    const firstId = normalizePanelId(swapMatch[1]);
    const secondId = normalizePanelId(swapMatch[2]);
    if (firstId && secondId) {
      nextLayout.panels = swapPanelsInLayout(nextLayout.panels, firstId, secondId);
      notes.push(`Swapped ${firstId} and ${secondId}.`);
    }
  }

  const prioritizeMatch = lower.match(/(?:prioritize|focus|promote)\s+(.+)/);
  if (prioritizeMatch) {
    const panelId = normalizePanelId(prioritizeMatch[1]);
    if (panelId) {
      nextLayout.panels.mainTop = movePanelToZone(nextLayout.panels, panelId, "mainTop", "start").mainTop;
      nextLayout.panels = movePanelToZone(nextLayout.panels, panelId, "mainTop", "start");
      notes.push(`Prioritized ${panelId} near the top of the workspace.`);
    }
  }

  const openTabMatch = lower.match(/(?:open|focus)\s+(app|layout|brain|battery|notes|backend|main\.py|editor)/);
  if (openTabMatch) {
    const targetMap = {
      app: "builder-workspace",
      layout: "layout-map",
      brain: "brain-rules",
      battery: "battery-module",
      notes: "notes-doc",
      backend: "api-health",
      "main.py": "api-health",
      editor: "builder-workspace",
    };
    const tabId = targetMap[openTabMatch[1]];
    if (tabId) {
      const existing = nextLayout.tabs?.open || [];
      nextLayout.tabs = {
        active: tabId,
        open: existing.includes(tabId) ? existing : [...existing, tabId],
      };
      notes.push(`Focused editor tab: ${tabId}.`);
    }
  }

  const closeTabMatch = lower.match(/close\s+(layout|brain|battery|notes|backend|app)/);
  if (closeTabMatch) {
    const targetMap = {
      app: "builder-workspace",
      layout: "layout-map",
      brain: "brain-rules",
      battery: "battery-module",
      notes: "notes-doc",
      backend: "api-health",
    };
    const tabId = targetMap[closeTabMatch[1]];
    const remaining = (nextLayout.tabs?.open || []).filter((id) => id !== tabId);
    nextLayout.tabs = {
      active: remaining[0] || "builder-workspace",
      open: remaining.length ? remaining : ["builder-workspace"],
    };
    notes.push(`Closed editor tab: ${tabId}.`);
  }

  const uniqueAdds = [...new Set(moduleAdds)].filter((m) => !activeModules.includes(m));

  return {
    layout: nextLayout,
    moduleAdds: uniqueAdds,
    notes,
  };
}

function extractModuleMutations(command) {
  const lower = command.toLowerCase();
  const add = [];
  const remove = [];

  const addMap = [
    [/(add notes panel|enable notes|notes panel)/, "notes_panel"],
    [/(add quick actions|quick actions)/, "quick_actions"],
    [/(add preview|live preview)/, "live_preview"],
    [/(add status|status panel)/, "status_panel"],
    [/(add features panel|active features)/, "active_features_panel"],
    [/(add affiliate|affiliate block)/, "affiliate_suggestions"],
    [/(export|report)/, "export_report"],
  ];

  const removeMap = [
    [/(remove notes panel|hide notes)/, "notes_panel"],
    [/(remove quick actions|hide quick actions)/, "quick_actions"],
    [/(remove preview|hide preview)/, "live_preview"],
    [/(remove affiliate|hide affiliate)/, "affiliate_suggestions"],
    [/(remove status|hide status panel)/, "status_panel"],
  ];

  addMap.forEach(([pattern, key]) => {
    if (pattern.test(lower)) add.push(key);
  });

  removeMap.forEach(([pattern, key]) => {
    if (pattern.test(lower)) remove.push(key);
  });

  return {
    add: [...new Set(add)],
    remove: [...new Set(remove)],
  };
}

function getLayoutLabel(layout) {
  return [
    layout.shell,
    layout.sidebar ? "sidebar" : null,
    layout.split ? "split" : null,
    layout.inspector ? "inspector" : null,
    layout.dense ? "dense" : "spacious",
  ]
    .filter(Boolean)
    .join(" / ");
}

function StatCard({ label, value, hint, accent = "var(--accent)" }) {
  return (
    <div className="panel-card stat-card">
      <div className="stat-top">
        <span className="dot" style={{ background: accent }} />
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
}

function Panel({ title, subtitle, actions, children, compact = false, defaultCollapsed = false, collapsible = true }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className={`panel-card ${compact ? "compact" : ""} ${collapsed ? "collapsed" : ""}`}>
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="panel-actions">
          {actions ? actions : null}
          {collapsible ? (
            <button className="mini-btn panel-toggle" onClick={() => setCollapsed((prev) => !prev)}>
              {collapsed ? "Expand" : "Collapse"}
            </button>
          ) : null}
        </div>
      </div>
      {!collapsed ? <div>{children}</div> : null}
    </section>
  );
}

function PreviewCanvas({ layout, activeModules, featureState, result, prompt }) {
  const previewTitle =
    layout.mode === "dashboard"
      ? "Builder Dashboard"
      : layout.mode === "focus"
      ? "Focused Canvas"
      : "Workspace Preview";

  if (layout.previewStyle === "dashboard") {
    return (
      <div className="preview-dashboard">
        <div className="preview-banner">
          <div>
            <div className="eyebrow">Live UI mutation preview</div>
            <h2>{previewTitle}</h2>
          </div>
          <div className="preview-chip">{getLayoutLabel(layout)}</div>
        </div>
        <div className="preview-grid">
          <div className="mini-card tall">
            <span>Primary Builder</span>
            <strong>{featureState.appType}</strong>
            <small>{featureState.builderMode}</small>
          </div>
          <div className="mini-card">
            <span>Modules</span>
            <strong>{activeModules.length}</strong>
          </div>
          <div className="mini-card">
            <span>Prompt state</span>
            <strong>{prompt ? "Loaded" : "Waiting"}</strong>
          </div>
          <div className="mini-card wide">
            <span>Result snapshot</span>
            <strong>
              {result ? `${result.battery_ah}Ah · ${result.solar_watts}W` : "No result yet"}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  if (layout.previewStyle === "spotlight") {
    return (
      <div className="preview-spotlight">
        <div className="spotlight-header">
          <div className="eyebrow">Preview first mode</div>
          <h2>{previewTitle}</h2>
          <p>The builder is currently emphasizing the visual workspace instead of stacked controls.</p>
        </div>
        <div className="spotlight-stage">
          <div className="spot-card large">
            <div className="fake-window-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="spot-body">
              <div className="spot-sidebar" />
              <div className="spot-main">
                <div className="spot-line long" />
                <div className="spot-line medium" />
                <div className="spot-grid">
                  <div className="spot-box" />
                  <div className="spot-box" />
                  <div className="spot-box" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-wireframe">
      <div className="wireframe-shell">
        {layout.topbar ? <div className="wire-topbar">Topbar</div> : null}
        <div className="wire-body">
          {layout.sidebar ? <div className="wire-sidebar">Sidebar</div> : null}
          <div className="wire-main">
            <div className="wire-row">Builder brain</div>
            <div className="wire-row">Command mutation input</div>
            {layout.split ? (
              <div className="wire-split">
                <div>Controls column</div>
                <div>Preview column</div>
              </div>
            ) : (
              <div className="wire-row large">Main workspace</div>
            )}
          </div>
          {layout.inspector ? <div className="wire-inspector">Inspector</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState(() => loadFromStorage(STORAGE_KEYS.prompt, ""));
  const [activeModules, setActiveModules] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.modules, DEFAULT_MODULES);
    return Array.isArray(stored) && stored.length ? stored : DEFAULT_MODULES;
  });
  const [layoutState, setLayoutState] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.layout, DEFAULT_LAYOUT);
    return {
      ...DEFAULT_LAYOUT,
      ...stored,
      panels: {
        sidebar: stored?.panels?.sidebar || [...DEFAULT_LAYOUT.panels.sidebar],
        mainTop: stored?.panels?.mainTop || [...DEFAULT_LAYOUT.panels.mainTop],
        mainBottom: stored?.panels?.mainBottom || [...DEFAULT_LAYOUT.panels.mainBottom],
        inspector: stored?.panels?.inspector || [...DEFAULT_LAYOUT.panels.inspector],
      },
    };
  });
  const [featureState, setFeatureState] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.featureState, DEFAULT_FEATURE_STATE);
    return { ...DEFAULT_FEATURE_STATE, ...stored };
  });
  const [generatedBlocks, setGeneratedBlocks] = useState(() => loadFromStorage(STORAGE_KEYS.generatedBlocks, []));
  const [generatedBlockState, setGeneratedBlockState] = useState(() => loadFromStorage(STORAGE_KEYS.generatedBlockState, {}));
  const [blueprintState, setBlueprintState] = useState(() => loadFromStorage(STORAGE_KEYS.blueprint, null));
  const [editorFiles, setEditorFiles] = useState(() => loadFromStorage(STORAGE_KEYS.editorFiles, {}));
  const [mutationLog, setMutationLog] = useState(() => loadFromStorage(STORAGE_KEYS.mutationLog, []));
  const [commandHistory, setCommandHistory] = useState(() => loadFromStorage(STORAGE_KEYS.commandHistory, []));
  const [appliances, setAppliances] = useState([
    { id: uid("app"), name: "RV Fridge", watts: 180, hours: 8 },
    { id: uid("app"), name: "Lights", watts: 40, hours: 5 },
  ]);
  const [batteryVoltage, setBatteryVoltage] = useState(12);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [sunHours, setSunHours] = useState(4);
  const [systemLoss, setSystemLoss] = useState(0.2);
  const [result, setResult] = useState(null);
  const [savedResults, setSavedResults] = useState(() => loadFromStorage(STORAGE_KEYS.results, []));
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Builder ready.");
  const [builderInsight, setBuilderInsight] = useState("Waiting for your next mutation command.");
  const [activeFocusView, setActiveFocusView] = useState("builder");
  const [selectedEntity, setSelectedEntity] = useState({ type: "view", id: "builder", label: "Builder" });
  const [workspaceView, setWorkspaceView] = useState("build");
  const [uiMode, setUiMode] = useState(() => loadFromStorage(STORAGE_KEYS.uiMode, "simple"));
  const [sidebarCompact, setSidebarCompact] = useState(true);
  const [inspectorTab, setInspectorTab] = useState("status");
  const [commandPhase, setCommandPhase] = useState("idle");
  const [commandFlowLabel, setCommandFlowLabel] = useState("Ready for the next command.");
  const [showSuggestionDeck, setShowSuggestionDeck] = useState(true);
  const [commandPulse, setCommandPulse] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [resizeDrag, setResizeDrag] = useState(null);
  const commandInputRef = useRef(null);
  const activeEditorTab = layoutState.tabs?.active || "builder-workspace";
  const openEditorTabs = layoutState.tabs?.open || ["builder-workspace"];
  const reportCounterRef = useRef(loadFromStorage(STORAGE_KEYS.reportCounter, 1));

  useEffect(() => saveToStorage(STORAGE_KEYS.prompt, prompt), [prompt]);
  useEffect(() => saveToStorage(STORAGE_KEYS.modules, activeModules), [activeModules]);
  useEffect(() => saveToStorage(STORAGE_KEYS.layout, layoutState), [layoutState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.featureState, featureState), [featureState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedBlocks, generatedBlocks), [generatedBlocks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedBlockState, generatedBlockState), [generatedBlockState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.blueprint, blueprintState), [blueprintState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.editorFiles, editorFiles), [editorFiles]);
  useEffect(() => saveToStorage(STORAGE_KEYS.mutationLog, mutationLog), [mutationLog]);
  useEffect(() => saveToStorage(STORAGE_KEYS.commandHistory, commandHistory), [commandHistory]);
  useEffect(() => saveToStorage(STORAGE_KEYS.results, savedResults), [savedResults]);
  useEffect(() => saveToStorage(STORAGE_KEYS.uiMode, uiMode), [uiMode]);

  useEffect(() => {
    if (commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleGlobalHotkeys(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        requestAnimationFrame(() => commandInputRef.current?.focus());
      }
      if (event.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setResizeDrag(null);
      }
    }
    window.addEventListener("keydown", handleGlobalHotkeys);
    return () => window.removeEventListener("keydown", handleGlobalHotkeys);
  }, []);

  useEffect(() => {
    if (!resizeDrag) return undefined;
    function onMove(event) {
      const x = event.clientX || 0;
      const viewport = Math.max(window.innerWidth || 1280, 960);
      if (resizeDrag.type === "sidebar") {
        updateWorkspaceWidth("sidebar", Math.min(420, Math.max(180, x - 28)));
      } else if (resizeDrag.type === "inspector") {
        const width = Math.min(460, Math.max(220, viewport - x - 28));
        updateWorkspaceWidth("inspector", width);
      } else if (resizeDrag.type === "split") {
        const ratio = Math.min(0.7, Math.max(0.35, x / viewport));
        updateWorkspaceWidth("splitRatio", ratio);
      }
    }
    function onUp() {
      setResizeDrag(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizeDrag]);

  useEffect(() => {
    if (commandHistory.length) {
      setShowSuggestionDeck(false);
    }
  }, [commandHistory.length]);

  useEffect(() => {
    const ensured = ensureGeneratedBlockState(generatedBlocks, generatedBlockState);
    if (ensured.changed) {
      setGeneratedBlockState(ensured.state);
    }
  }, [generatedBlocks]);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error("health check failed");
        setApiStatus("connected");
      } catch {
        setApiStatus("offline");
      }
    }
    checkHealth();
  }, []);

  const analysis = useMemo(() => analyzePrompt(prompt), [prompt]);
  const computedSummary = useMemo(
    () => computeSummary(result, featureState.summaryStyle),
    [result, featureState.summaryStyle],
  );
  const affiliateSuggestions = useMemo(() => getActiveAffiliateSuggestions(result), [result]);
  const activeModuleMeta = useMemo(
    () => activeModules.map((key) => ({ key, ...(MODULE_LIBRARY[key] || { label: key, description: "Custom module", category: "custom" }) })),
    [activeModules],
  );
  const statusText = useMemo(() => makeStatusText(layoutState, activeModules, result), [layoutState, activeModules, result]);
  const materializedTree = useMemo(() => createMaterializedTree(editorFiles), [editorFiles]);
  const activeEditorDoc = editorFiles[activeEditorTab]
    ? {
        title: editorFiles[activeEditorTab].label,
        type: `generated ${editorFiles[activeEditorTab].type}`,
        summary: editorFiles[activeEditorTab].fullPath,
        bullets: [
          `Source: ${editorFiles[activeEditorTab].source}`,
          `Updated: ${editorFiles[activeEditorTab].updatedAt}`,
          "This file is editable inside the builder workspace.",
        ],
      }
    : (EDITOR_DOCUMENTS[activeEditorTab] || EDITOR_DOCUMENTS["builder-workspace"]);
  const liveWorkspaceContext = useMemo(() => {
    const zoneEntries = Object.entries(layoutState.panels || {});
    const zoneCount = zoneEntries.length;
    const panelCount = zoneEntries.reduce((sum, [, items]) => sum + (items?.length || 0), 0);
    const latestMutation = mutationLog?.[0];
    const latestCommand = commandHistory?.[0];
    return {
      zoneCount,
      panelCount,
      openTabs: openEditorTabs,
      savedResultCount: savedResults.length,
      mutationCount: mutationLog.length,
      commandCount: commandHistory.length,
      activeModuleCount: activeModules.length,
      generatedCount: generatedBlocks.length,
      latestMutation: latestMutation ? latestMutation.summary || latestMutation.type || "Mutation logged" : "No mutations yet",
      latestCommand: latestCommand?.prompt || "No commands yet",
      result,
      activityEntries: [
        ...(mutationLog || []).slice(0, 4).map((item) => `${item.time}: ${item.summary || item.type || "Mutation"}`),
        ...(commandHistory || []).slice(0, 2).map((item) => `Prompt: ${item.prompt}`),
      ].slice(0, 6),
      fileRows: [
        ...openEditorTabs.map((tabId) => ({
          name: EDITOR_DOCUMENTS[tabId]?.title || tabId,
          type: EDITOR_DOCUMENTS[tabId]?.type || "tab",
          status: tabId === activeEditorTab ? "open" : "ready",
        })),
        { name: `generated_blocks_${generatedBlocks.length}.json`, type: "workspace", status: generatedBlocks.length ? "synced" : "idle" },
        { name: `materialized_files_${Object.keys(editorFiles).length}.json`, type: "artifact", status: Object.keys(editorFiles).length ? "generated" : "idle" },
        { name: `saved_results_${savedResults.length}.json`, type: "data", status: savedResults.length ? "saved" : "empty" },
      ].slice(0, 8),
    };
  }, [layoutState.panels, mutationLog, commandHistory, openEditorTabs, savedResults, activeModules.length, generatedBlocks.length, result, activeEditorTab, editorFiles]);

  const activeWorkspaceView = WORKSPACE_VIEWS[workspaceView] || WORKSPACE_VIEWS.build;
  const visiblePanelIds = activeWorkspaceView.visiblePanels || [];
  const hiddenPanelsByZone = useMemo(() => {
    const next = {};
    Object.entries(layoutState.panels || {}).forEach(([zone, items]) => {
      next[zone] = (items || []).filter((item) => !visiblePanelIds.includes(item));
    });
    return next;
  }, [layoutState.panels, visiblePanelIds]);

  const visibleInspectorPanels = useMemo(() => {
    return (layoutState.panels?.inspector || []).filter((item) => visiblePanelIds.includes(item));
  }, [layoutState.panels, visiblePanelIds]);

  const availableFocusViews = useMemo(() => {
    return Object.entries(FOCUS_VIEW_CONFIG).filter(([, config]) => visiblePanelIds.includes(config.panelId));
  }, [visiblePanelIds]);

  const activeFocusConfig = useMemo(() => {
    const requested = FOCUS_VIEW_CONFIG[activeFocusView];
    if (requested && visiblePanelIds.includes(requested.panelId)) return requested;
    const fallback = availableFocusViews[0]?.[1];
    return fallback || FOCUS_VIEW_CONFIG.builder;
  }, [activeFocusView, visiblePanelIds, availableFocusViews]);

  const inspectorContextPanels = useMemo(() => {
    const requested = INSPECTOR_CONTEXT_MAP[activeFocusView] || [];
    const deduped = [];
    requested.forEach((panelId) => {
      if (!deduped.includes(panelId)) deduped.push(panelId);
    });
    if (!deduped.length) {
      return (layoutState.panels?.inspector || []).slice(0, 3);
    }
    return deduped;
  }, [activeFocusView, layoutState.panels]);

  const companionPanels = useMemo(() => {
    const items = activeFocusConfig?.companions || [];
    return items.filter((panelId) => panelId !== activeFocusConfig.panelId && visiblePanelIds.includes(panelId)).slice(0, 2);
  }, [activeFocusConfig, visiblePanelIds]);

  useEffect(() => {
    if (!visibleInspectorPanels.length) return;
    if (!visibleInspectorPanels.includes(inspectorTab)) {
      setInspectorTab(visibleInspectorPanels[0]);
    }
  }, [visibleInspectorPanels, inspectorTab]);

  useEffect(() => {
    if (!availableFocusViews.length) return;
    const allowed = availableFocusViews.map(([key]) => key);
    if (!allowed.includes(activeFocusView)) {
      setActiveFocusView(allowed[0]);
    }
  }, [availableFocusViews, activeFocusView]);

  useEffect(() => {
    setSelectedEntity((prev) => ({
      type: "view",
      id: activeFocusView,
      label: FOCUS_VIEW_CONFIG[activeFocusView]?.label || activeFocusView,
      panelId: activeFocusConfig?.panelId || FOCUS_VIEW_CONFIG[activeFocusView]?.panelId || "builder",
    }));
  }, [activeFocusView, activeFocusConfig]);

  useEffect(() => {
    if (!inspectorContextPanels.length) return;
    if (!inspectorContextPanels.includes(inspectorTab)) {
      setInspectorTab(inspectorContextPanels[0]);
    }
  }, [inspectorContextPanels, inspectorTab]);

  function appendMutationLog(entry) {
    setMutationLog((prev) => [
      {
        id: uid("mut"),
        time: nowLabel(),
        ...entry,
      },
      ...prev,
    ]);
  }

  function ensureModules(modulesToAdd) {
    if (!modulesToAdd?.length) return;
    setActiveModules((prev) => [...new Set([...prev, ...modulesToAdd])]);
  }

  function removeModules(modulesToRemove) {
    if (!modulesToRemove?.length) return;
    setActiveModules((prev) => prev.filter((item) => !modulesToRemove.includes(item)));
  }

  function syncMaterializedFiles(blueprint, sourceCommand = "materialize files") {
    if (!blueprint) {
      setBuilderInsight("Generate a blueprint first, then materialize starter files into the editor.");
      return [];
    }

    const built = materializeBlueprintFiles(blueprint, editorFiles);
    const createdIds = built.created.map((file) => file.id);

    setEditorFiles(built.files);

    const preferredTabs = getIntentDrivenTabOrder(blueprint, built.files);
    const tabsToOpen = preferredTabs.length ? preferredTabs.slice(0, 6) : createdIds.slice(0, 6);

    if (tabsToOpen.length) {
      setLayoutState((prev) => {
        const currentOpen = prev.tabs?.open || ["builder-workspace"];
        const nextOpen = Array.from(new Set([...currentOpen, ...tabsToOpen]));
        return {
          ...prev,
          tabs: {
            active: tabsToOpen[0] || prev.tabs?.active || "builder-workspace",
            open: nextOpen,
          },
        };
      });
    }

    appendMutationLog({
      type: "file-materialization",
      command: sourceCommand,
      details: createdIds.length
        ? `Materialized ${createdIds.length} blueprint file(s) into the editor tree.`
        : "Blueprint files were already materialized; synced latest content instead.",
      summary: createdIds.length
        ? `Generated ${createdIds.length} editable file(s).`
        : "Synced editable blueprint files.",
    });

    setBuilderInsight(
      createdIds.length
        ? `Materialized ${createdIds.length} editable starter file(s) into the IDE tree.`
        : "Blueprint artifacts were already present, so the builder synced them."
    );
    setStatusMessage("Blueprint files materialized.");
    return createdIds;
  }


  function regenerateBlueprintFiles(command, blueprintOverride = null) {
    const baseBlueprint = blueprintOverride || blueprintState;
    if (!baseBlueprint) {
      setBuilderInsight("Generate a blueprint first, then use regenerate routes/page/schema.");
      setStatusMessage("No blueprint available yet.");
      return { targetIds: [], blueprint: null, addedFiles: [] };
    }

    const ensured = ensureBlueprintFilesForRegeneration(baseBlueprint, command);
    const workingBlueprint = ensured.blueprint;
    if (ensured.added.length) {
      setBlueprintState(workingBlueprint);
    }

    const built = materializeBlueprintFiles(workingBlueprint, editorFiles);
    const targetPaths = getRegenerationTargetPaths(workingBlueprint, command, activeEditorTab, built.files);
    const targetIds = targetPaths.map((path) => `generated:${path}`);
    const nextFiles = { ...built.files };

    targetPaths.forEach((path) => {
      const id = `generated:${path}`;
      nextFiles[id] = {
        ...(nextFiles[id] || {
          id,
          label: path.split("/").pop() || path,
          fullPath: path,
          type: inferDocTypeFromPath(path),
          source: "blueprint",
        }),
        content:
          path.endsWith(".blueprint.json")
            ? JSON.stringify(workingBlueprint, null, 2)
            : makeMaterializedFileContent(workingBlueprint, path),
        updatedAt: nowLabel(),
      };
    });

    setEditorFiles(nextFiles);

    if (targetIds.length) {
      setLayoutState((prev) => {
        const currentOpen = prev.tabs?.open || ["builder-workspace"];
        return {
          ...prev,
          tabs: {
            active: targetIds[0],
            open: Array.from(new Set([...currentOpen, ...targetIds])),
          },
        };
      });
    }

    appendMutationLog({
      type: "file-regeneration",
      command,
      details: [
        ensured.added.length ? `Added missing blueprint file(s): ${ensured.added.join(", ")}` : null,
        `Regenerated ${targetIds.length} artifact(s): ${targetPaths.join(", ")}`,
      ]
        .filter(Boolean)
        .join(" | "),
      summary: `Regenerated ${targetIds.length} blueprint artifact(s).`,
    });

    setBuilderInsight(
      [
        ensured.added.length ? `Added ${ensured.added.length} missing scaffold path(s).` : null,
        `Regenerated ${targetIds.length} blueprint artifact(s) and reopened the related editor tabs.`,
      ]
        .filter(Boolean)
        .join(" ")
    );
    setStatusMessage("Blueprint artifacts regenerated.");
    return { targetIds, blueprint: workingBlueprint, addedFiles: ensured.added };
  }

  function updateEditorFileContent(fileId, nextContent) {
    setEditorFiles((prev) => ({
      ...prev,
      [fileId]: {
        ...(prev[fileId] || {}),
        content: nextContent,
        updatedAt: nowLabel(),
      },
    }));
  }

  function executeCommandFlow(action, customPrompt) {
    const sourcePrompt = String(customPrompt ?? prompt ?? "").trim();
    if (!sourcePrompt) {
      setBuilderInsight("Type a command so the builder can mutate the workspace.");
      setCommandPhase("idle");
      setCommandFlowLabel("Waiting for a command.");
      return;
    }

    setCommandPulse(true);
    setShowSuggestionDeck(false);
    setStatusMessage("Executing command...");
    setCommandPhase("parsing");
    setCommandFlowLabel(`Parsing intent for "${sourcePrompt}"...`);

    window.clearTimeout(window.__builderFlowStep1);
    window.clearTimeout(window.__builderFlowStep2);
    window.clearTimeout(window.__builderFlowStep3);
    window.__builderFlowStep1 = window.setTimeout(() => {
      setCommandPhase("mutating");
      setCommandFlowLabel("Applying mutations and activating modules...");
    }, 180);
    window.__builderFlowStep2 = window.setTimeout(() => {
      setCommandPhase("updating");
      setCommandFlowLabel("Updating layout, generated blocks, and blueprint...");
    }, 360);
    window.__builderFlowStep3 = window.setTimeout(() => {
      action(sourcePrompt);
      setCommandPhase("complete");
      setCommandFlowLabel("Workspace updated.");
      setStatusMessage("Command applied.");
      window.setTimeout(() => setCommandPulse(false), 450);
    }, 560);
  }

  function runBuilderBrain(customPrompt) {
    const sourcePrompt = (customPrompt ?? prompt).trim();
    if (!sourcePrompt) {
      setBuilderInsight("Type a command so the builder can mutate the workspace.");
      return;
    }

    const nextAnalysis = analyzePrompt(sourcePrompt);
    ensureModules(nextAnalysis.recommendedModules);
    setFeatureState((prev) => ({
      ...prev,
      builderMode: nextAnalysis.builderMode,
      appType: nextAnalysis.appType,
      summaryStyle: nextAnalysis.summaryStyle,
      quickIdea: sourcePrompt,
    }));

    const layoutMutation = applyLayoutCommand(sourcePrompt, layoutState, activeModules);
    let nextLayout = layoutMutation.layout;
    let nextModuleAdds = [...layoutMutation.moduleAdds];

    const generatedMutation = createGeneratedBlocksFromCommand(sourcePrompt, generatedBlocks);
    const compositeMutation = createCompositeWorkspaceFromCommand(sourcePrompt, generatedMutation.blocks);

    if (compositeMutation.layoutPrompt) {
      const compositeLayoutMutation = applyLayoutCommand(compositeMutation.layoutPrompt, nextLayout, activeModules);
      nextLayout = compositeLayoutMutation.layout;
      nextModuleAdds = [...new Set([...nextModuleAdds, ...compositeLayoutMutation.moduleAdds])];
      layoutMutation.notes.push(...compositeLayoutMutation.notes);
    }

    setLayoutState(nextLayout);
    ensureModules(nextModuleAdds);

    setGeneratedBlocks(compositeMutation.blocks);
    const allCreatedBlocks = [...generatedMutation.created, ...compositeMutation.created];
    if (allCreatedBlocks.length) {
      setLayoutState((prev) => {
        let nextPanels = clonePanels(prev.panels);
        allCreatedBlocks.forEach((block) => {
          nextPanels = movePanelToZone(nextPanels, "generated", block.zone || "mainBottom", "end");
        });
        return { ...prev, panels: nextPanels, inspector: prev.inspector || allCreatedBlocks.some((block) => block.zone === "inspector") };
      });
    }

    if (compositeMutation.featurePatch) {
      setFeatureState((prev) => ({ ...prev, ...compositeMutation.featurePatch }));
    }

    const blueprintMutation = resolveBlueprintMutation(sourcePrompt, blueprintState, compositeMutation.template, { ...featureState, ...(compositeMutation.featurePatch || {}), builderMode: nextAnalysis.builderMode });
    if (blueprintMutation.blueprint) {
      setBlueprintState(blueprintMutation.blueprint);
      ensureModules(["blueprint_engine"]);
    }

    if (/(materialize files|scaffold files|sync blueprint files|open generated files|create starter files in editor)/i.test(sourcePrompt)) {
      syncMaterializedFiles(blueprintMutation.blueprint || blueprintState, sourcePrompt);
    }

    if (/(regenerate|refresh|rebuild) (routes?|pages?|schemas?|models?|components?|all|everything)/i.test(sourcePrompt)) {
      regenerateBlueprintFiles(sourcePrompt, blueprintMutation.blueprint || blueprintState);
    }

    setCommandHistory((prev) => [
      {
        id: uid("cmd"),
        prompt: sourcePrompt,
        time: nowLabel(),
        appType: nextAnalysis.appType,
        builderMode: nextAnalysis.builderMode,
      },
      ...prev,
    ]);

    appendMutationLog({
      type: "brain-sync",
      command: sourcePrompt,
      details: [
        `App type → ${nextAnalysis.appType}`,
        `Builder mode → ${nextAnalysis.builderMode}`,
        `Summary style → ${nextAnalysis.summaryStyle}`,
        ...layoutMutation.notes,
        ...(generatedMutation.created.length ? [`Generated blocks → ${generatedMutation.created.map((block) => block.title).join(", ")}`] : []),
        ...(compositeMutation.created.length ? [`Composite pack → ${compositeMutation.template?.label}: ${compositeMutation.created.map((block) => block.title).join(", ")}`] : []),
      ].join(" | "),
    });

    setBuilderInsight(
      compositeMutation.created.length
        ? `Builder brain detected ${compositeMutation.featurePatch?.appType || nextAnalysis.appType} in ${compositeMutation.featurePatch?.builderMode || nextAnalysis.builderMode} mode, loaded ${compositeMutation.template?.label}, restructured the workspace to ${getLayoutLabel(nextLayout)}, and generated ${allCreatedBlocks.length} coordinated UI block(s).`
        : generatedMutation.created.length
        ? `Builder brain detected ${nextAnalysis.appType} in ${nextAnalysis.builderMode} mode, restructured the workspace to ${getLayoutLabel(nextLayout)}, and generated ${generatedMutation.created.length} new UI block(s).`
        : `Builder brain detected ${nextAnalysis.appType} in ${nextAnalysis.builderMode} mode and restructured the workspace to ${getLayoutLabel(nextLayout)}.`
    );
    setStatusMessage("Builder brain updated modules and layout.");
  }

  function handleMutationCommand(rawCommand) {
    const command = String(rawCommand || prompt).trim();
    if (!command) return;

    const { add, remove } = extractModuleMutations(command);
    const layoutMutation = applyLayoutCommand(command, layoutState, activeModules);
    let nextLayout = layoutMutation.layout;
    let nextModuleAdds = [...layoutMutation.moduleAdds];
    const generatedMutation = createGeneratedBlocksFromCommand(command, generatedBlocks);
    const compositeMutation = createCompositeWorkspaceFromCommand(command, generatedMutation.blocks);

    if (compositeMutation.layoutPrompt) {
      const compositeLayoutMutation = applyLayoutCommand(compositeMutation.layoutPrompt, nextLayout, activeModules);
      nextLayout = compositeLayoutMutation.layout;
      nextModuleAdds = [...new Set([...nextModuleAdds, ...compositeLayoutMutation.moduleAdds])];
      layoutMutation.notes.push(...compositeLayoutMutation.notes);
    }

    ensureModules(add);
    ensureModules(nextModuleAdds);
    removeModules(remove);
    setLayoutState(nextLayout);
    setGeneratedBlocks(compositeMutation.blocks);

    const allCreatedBlocks = [...generatedMutation.created, ...compositeMutation.created];

    if (allCreatedBlocks.length) {
      setLayoutState((prev) => {
        let nextPanels = clonePanels(prev.panels);
        allCreatedBlocks.forEach((block) => {
          nextPanels = movePanelToZone(nextPanels, "generated", block.zone || "mainBottom", "end");
        });
        return { ...prev, panels: nextPanels, inspector: prev.inspector || allCreatedBlocks.some((block) => block.zone === "inspector") };
      });
    }

    if (compositeMutation.featurePatch) {
      setFeatureState((prev) => ({ ...prev, ...compositeMutation.featurePatch }));
    }

    const blueprintMutation = resolveBlueprintMutation(command, blueprintState, compositeMutation.template, { ...featureState, ...(compositeMutation.featurePatch || {}) });
    if (blueprintMutation.blueprint) {
      setBlueprintState(blueprintMutation.blueprint);
      ensureModules(["blueprint_engine"]);
    }

    if (generatedMutation.removed.length) {
      setLayoutState((prev) => ({
        ...prev,
        panels: removePanelEverywhere(prev.panels, "generated"),
      }));
    }

    if (/(dashboard)/i.test(command)) {
      setFeatureState((prev) => ({ ...prev, appType: "admin panel" }));
    }

    if (/(calculator|battery|solar)/i.test(command)) {
      setFeatureState((prev) => ({ ...prev, builderMode: "battery-planner" }));
    }

    setCommandHistory((prev) => [
      {
        id: uid("cmd"),
        prompt: command,
        time: nowLabel(),
        appType: featureState.appType,
        builderMode: featureState.builderMode,
      },
      ...prev,
    ]);

    appendMutationLog({
      type: "command-mutation",
      command,
      details: [
        add.length ? `Added modules: ${add.join(", ")}` : null,
        remove.length ? `Removed modules: ${remove.join(", ")}` : null,
        layoutMutation.notes.length ? layoutMutation.notes.join(" | ") : null,
        generatedMutation.created.length ? `Generated UI blocks: ${generatedMutation.created.map((block) => block.title).join(", ")}` : null,
        compositeMutation.created.length ? `Composite pack: ${compositeMutation.template?.label} → ${compositeMutation.created.map((block) => block.title).join(", ")}` : null,
        blueprintMutation.notes?.length ? blueprintMutation.notes.join(" | ") : null,
        /(regenerate|refresh|rebuild) (routes?|pages?|schemas?|models?|components?|all|everything)/i.test(command) ? "Triggered targeted blueprint regeneration." : null,
        generatedMutation.removed.length ? `Removed generated blocks: ${generatedMutation.removed.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | ") || "No direct mutations matched, but command was logged.",
    });

    setBuilderInsight(
      [
        layoutMutation.notes.length ? layoutMutation.notes.join(" ") : null,
        generatedMutation.created.length ? `Created ${generatedMutation.created.length} prompt-driven UI block(s).` : null,
        compositeMutation.created.length ? `Loaded ${compositeMutation.template?.label} with ${compositeMutation.created.length} coordinated block(s).` : null,
        blueprintMutation.updated ? `${blueprintMutation.created ? "Generated" : "Updated"} app blueprint.` : null,
        /(regenerate|refresh|rebuild) (routes?|pages?|schemas?|models?|components?|all|everything)/i.test(command) ? "Regenerated targeted scaffold files." : null,
        generatedMutation.removed.length ? `Removed ${generatedMutation.removed.length} generated block(s).` : null,
      ].filter(Boolean).join(" ") || "Command logged. No major layout mutation matched yet."
    );
    setStatusMessage("Command mutation applied.");
  }

  async function runBatteryPlan() {
    if (!activeModules.includes("calculator_engine")) {
      setStatusMessage("Calculator engine is not active. Add it back before running.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Running backend battery plan...");

    try {
      const response = await fetch(`${API_BASE}/battery-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appliances: appliances.map((item) => ({
            name: item.name,
            watts: Number(item.watts) || 0,
            hours: Number(item.hours) || 0,
          })),
          battery_voltage: Number(batteryVoltage) || 12,
          autonomy_days: Number(autonomyDays) || 1,
          sun_hours: Number(sunHours) || 4,
          system_loss: Number(systemLoss) || 0.2,
        }),
      });

      if (!response.ok) throw new Error("Battery plan request failed");
      const data = await response.json();
      setResult(data);
      setStatusMessage("Battery plan completed.");
      appendMutationLog({
        type: "backend-run",
        command: "POST /battery-plan",
        details: `Received ${data.battery_ah}Ah battery and ${data.solar_watts}W solar plan.`,
      });
    } catch (error) {
      setStatusMessage(`Backend error: ${error.message}`);
      appendMutationLog({
        type: "backend-error",
        command: "POST /battery-plan",
        details: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function addApplianceRow(prefill) {
    setAppliances((prev) => [
      ...prev,
      {
        id: uid("app"),
        name: prefill?.name || "",
        watts: prefill?.watts || 0,
        hours: prefill?.hours || 0,
      },
    ]);
  }

  function updateApplianceRow(id, field, value) {
    setAppliances((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "name" ? value : Number(value),
            }
          : item,
      ),
    );
  }

  function removeApplianceRow(id) {
    setAppliances((prev) => prev.filter((item) => item.id !== id));
  }

  function saveCurrentResult() {
    if (!result) {
      setStatusMessage("Nothing to save yet.");
      return;
    }

    const payload = {
      id: uid("save"),
      time: nowLabel(),
      prompt,
      result,
      summary: computedSummary,
      layout: layoutState,
      modules: activeModules,
    };

    setSavedResults((prev) => [payload, ...prev]);
    setStatusMessage("Result saved locally.");
    appendMutationLog({
      type: "save-result",
      command: "save result",
      details: `Saved result snapshot ${payload.id}.`,
    });
  }

  function exportReport() {
    const reportNumber = Number(reportCounterRef.current || 1);
    const payload = makeReportPayload({
      prompt,
      result,
      layout: layoutState,
      activeModules,
      mutationLog,
      featureState,
    });
    const filename = `builder-report-${String(reportNumber).padStart(3, "0")}.json`;
    downloadTextFile(filename, JSON.stringify(payload, null, 2));
    reportCounterRef.current = reportNumber + 1;
    saveToStorage(STORAGE_KEYS.reportCounter, reportCounterRef.current);
    setStatusMessage(`Exported ${filename}`);
    appendMutationLog({
      type: "export-report",
      command: "export report",
      details: `Exported ${filename}.`,
    });
  }

  function resetBuilder() {
    setPrompt("");
    setLayoutState({
      ...DEFAULT_LAYOUT,
      panels: {
        sidebar: [...DEFAULT_LAYOUT.panels.sidebar],
        mainTop: [...DEFAULT_LAYOUT.panels.mainTop],
        mainBottom: [...DEFAULT_LAYOUT.panels.mainBottom],
        inspector: [...DEFAULT_LAYOUT.panels.inspector],
      },
    });
    setActiveModules([...DEFAULT_MODULES]);
    setFeatureState({ ...DEFAULT_FEATURE_STATE });
    setBlueprintState(null);
    setResult(null);
    setBuilderInsight("Builder reset to default state.");
    setStatusMessage("Workspace reset complete.");
    appendMutationLog({
      type: "reset",
      command: "reset builder",
      details: "Reset layout, modules, and feature state to defaults.",
    });
  }

  const rootClassNames = [
    "app-shell",
    resizeDrag ? "is-resizing" : "",
    layoutState.shell,
    layoutState.sidebar ? "with-sidebar" : "",
    layoutState.split ? "with-split" : "",
    layoutState.inspector ? "with-inspector" : "",
    layoutState.dense ? "dense" : "",
  ]
    .filter(Boolean)
    .join(" ");


  const zoneTitles = {
    sidebar: "Sidebar Zone",
    mainTop: "Main Top Zone",
    mainBottom: "Main Bottom Zone",
    inspector: "Inspector Zone",
  };

  function setEditorTab(tabId) {
    setLayoutState((prev) => {
      const currentOpen = prev.tabs?.open || ["builder-workspace"];
      return {
        ...prev,
        tabs: {
          active: tabId,
          open: currentOpen.includes(tabId) ? currentOpen : [...currentOpen, tabId],
        },
      };
    });
  }

  function closeEditorTab(tabId) {
    setLayoutState((prev) => {
      const currentOpen = (prev.tabs?.open || ["builder-workspace"]).filter((id) => id !== tabId);
      const safeOpen = currentOpen.length ? currentOpen : ["builder-workspace"];
      return {
        ...prev,
        tabs: {
          active: prev.tabs?.active === tabId ? safeOpen[0] : prev.tabs?.active || safeOpen[0],
          open: safeOpen,
        },
      };
    });
  }

  function updateWorkspaceWidth(field, value) {
    setLayoutState((prev) => ({
      ...prev,
      [field === "splitRatio" ? "split" : field === "sidebar" ? "sidebar" : "inspector"]:
        field === "splitRatio" ? true : true,
      widths: {
        ...(prev.widths || DEFAULT_LAYOUT.widths),
        [field]: Number(value),
      },
    }));
  }

  function startResize(type) {
    setResizeDrag({ type });
    setSelectedEntity({ type: "resize", id: type, label: `${type} handle` });
  }

  function renderBrainPanel() {
    return (
      <Panel
        title="Builder Brain"
        subtitle="Detects app type, builder mode, summary style, and recommended modules"
        actions={
          <>
            <button className="mini-btn" onClick={() => runBuilderBrain(prompt)}>Analyze prompt</button>
            <button className="mini-btn" onClick={() => handleMutationCommand(prompt)}>Apply mutation</button>
          </>
        }
      >
        <div className="brain-grid">
          <StatCard label="App Type" value={analysis.appType} hint="Detected from your current prompt" />
          <StatCard label="Builder Mode" value={analysis.builderMode} hint="Used to shape tool behavior" accent="var(--accent-2)" />
          <StatCard label="Summary Style" value={analysis.summaryStyle} hint="Controls results explanation tone" accent="var(--success)" />
        </div>
        <div style={{ height: 14 }} />
        <textarea
          className="prompt-box"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Try: "make dashboard, add sidebar, split layout, add inspector"'
        />
        <div style={{ height: 12 }} />
        <div className="command-row">
          {QUICK_COMMANDS.map((item) => (
            <button key={item} className="tab-btn" onClick={() => { setPrompt(item); handleMutationCommand(item); }}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ height: 14 }} />
        <div className="result-box">{builderInsight}</div>
      </Panel>
    );
  }

  function renderCommandPanel() {
    return (
      <Panel
        title="Command Mutations"
        subtitle="Commands now move real panels between real layout zones"
        actions={
          <>
            <button className="mini-btn" onClick={() => handleMutationCommand(prompt)}>Apply current command</button>
            <button className="mini-btn" onClick={() => setPrompt("make dashboard add sidebar split layout add inspector")}>Load example</button>
          </>
        }
      >
        <div className="status-grid">
          <StatCard label="Sidebar" value={layoutState.sidebar ? "Enabled" : "Hidden"} hint="Left navigation rail" />
          <StatCard label="Split Layout" value={layoutState.split ? "Enabled" : "Off"} hint="Dual workspace columns" accent="var(--warning)" />
          <StatCard label="Inspector" value={layoutState.inspector ? "Enabled" : "Hidden"} hint="Right-side detail panel" accent="var(--danger)" />
        </div>
        <div style={{ height: 14 }} />
        <div className="module-list">
          <div className="module-item">
            <div className="module-top">
              <strong>Latest status</strong>
              <span className="tag">Live</span>
            </div>
            <div className="muted">{statusMessage}</div>
          </div>
          <div className="module-item">
            <div className="module-top">
              <strong>Try real layout commands</strong>
              <span className="tag">zones</span>
            </div>
            <div className="muted">Examples: move results to sidebar · put notes in inspector · swap planner and preview · make crm dashboard · make analytics page · make dev workspace</div>
          </div>
        </div>
      </Panel>
    );
  }

  function renderBuilderPanel() {
    return (
      <Panel
        title="Builder Workspace Core"
        subtitle="The builder now renders real zones and hosts modules inside them"
      >
        <div className="status-grid">
          <StatCard label="Shell Engine" value={layoutState.shell} hint="Controls global workspace shape" />
          <StatCard label="Zone Panels" value={Object.values(layoutState.panels).flat().length} hint="Tracked across sidebar, main, and inspector" accent="var(--accent-2)" />
          <StatCard label="Runnable Modules" value={activeModules.filter((key) => ["calculator_engine", "results_summary", "affiliate_suggestions", "export_report", "save_results"].includes(key)).length} hint="Real functional blocks inside the builder" accent="var(--success)" />
          <StatCard label="Open Tabs" value={openEditorTabs.length} hint="Fake editor tabs with memory" accent="var(--warning)" />
        </div>
        <div style={{ height: 14 }} />
        <div className="module-list">
          <div className="module-item">
            <div className="module-top">
              <strong>Workspace role</strong>
              <span className="tag">primary</span>
            </div>
            <div className="muted">This is now a mini app studio. The shell reads prompt commands, reshuffles zones, and keeps runnable modules attached to the workspace.</div>
          </div>
          <div className="module-item">
            <div className="module-top">
              <strong>Current emphasis</strong>
              <span className="tag">{layoutState.mode}</span>
            </div>
            <div className="muted">The layout arrays are now the real source of truth for what renders in each zone.</div>
          </div>
        </div>
      </Panel>
    );
  }

  function renderQuickActionsPanel() {
    if (!activeModules.includes("quick_actions")) return null;
    return (
      <Panel title="Quick Actions" subtitle="Fast builder mutations and panel moves">
        <div className="quick-grid">
          <button className="pill" onClick={() => handleMutationCommand("make dashboard")}>Make dashboard</button>
          <button className="pill" onClick={() => handleMutationCommand("make ide layout")}>IDE layout</button>
          <button className="pill" onClick={() => handleMutationCommand("add sidebar")}>Add sidebar</button>
          <button className="pill" onClick={() => handleMutationCommand("split layout")}>Split layout</button>
          <button className="pill" onClick={() => handleMutationCommand("add inspector")}>Add inspector</button>
          <button className="pill" onClick={() => handleMutationCommand("move results to sidebar")}>Results to sidebar</button>
          <button className="pill" onClick={() => handleMutationCommand("open layout")}>Open layout tab</button>
          <button className="pill" onClick={() => handleMutationCommand("add hero section")}>Add hero block</button>
          <button className="pill" onClick={() => handleMutationCommand("add kanban board")}>Add kanban</button>
          <button className="pill" onClick={() => handleMutationCommand("wider sidebar")}>Wider sidebar</button>
          <button className="pill" onClick={() => handleMutationCommand("make preview full width")}>Preview full width</button>
          <button className="pill" onClick={() => handleMutationCommand("return to classic layout")}>Classic layout</button>
        </div>
      </Panel>
    );
  }

  function renderPlannerPanel() {
    return (
      <Panel
        title="Sample Tool Module · Battery Planner"
        subtitle="A real runnable module inside the builder workspace"
        actions={
          <>
            <button className="mini-btn" onClick={runBatteryPlan} disabled={isLoading}>
              {isLoading ? "Running..." : "Run /battery-plan"}
            </button>
            <button className="mini-btn" onClick={() => addApplianceRow()}>Add row</button>
          </>
        }
      >
        <div className="builder-form">
          <div className="appliance-table">
            {appliances.map((item) => (
              <div key={item.id} className="appliance-row">
                <input className="text-input" value={item.name} onChange={(e) => updateApplianceRow(item.id, "name", e.target.value)} placeholder="Appliance" />
                <input className="number-input" type="number" value={item.watts} onChange={(e) => updateApplianceRow(item.id, "watts", e.target.value)} placeholder="Watts" />
                <input className="number-input" type="number" value={item.hours} onChange={(e) => updateApplianceRow(item.id, "hours", e.target.value)} placeholder="Hours" />
                <button className="ghost-pill" onClick={() => removeApplianceRow(item.id)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="appliance-presets">
            {APPLIANCE_PRESETS.map((preset) => (
              <button key={preset.name} className="tab-btn" onClick={() => addApplianceRow(preset)}>
                + {preset.name}
              </button>
            ))}
          </div>
          <div className="result-grid">
            <input className="number-input" type="number" value={batteryVoltage} onChange={(e) => setBatteryVoltage(Number(e.target.value))} placeholder="Battery voltage" />
            <input className="number-input" type="number" value={autonomyDays} onChange={(e) => setAutonomyDays(Number(e.target.value))} placeholder="Autonomy days" />
            <input className="number-input" type="number" value={sunHours} onChange={(e) => setSunHours(Number(e.target.value))} placeholder="Sun hours" />
            <input className="number-input" type="number" step="0.01" value={systemLoss} onChange={(e) => setSystemLoss(Number(e.target.value))} placeholder="System loss" />
          </div>
        </div>
      </Panel>
    );
  }

  function renderResultsPanel() {
    return (
      <Panel
        title="Results Summary"
        subtitle="Saved results, export, and summary stay active while layout mutates"
        actions={
          <>
            <button className="mini-btn" onClick={saveCurrentResult}>Save result</button>
            <button className="mini-btn" onClick={exportReport}>Export report</button>
          </>
        }
      >
        <div className="result-grid">
          <StatCard label="Daily Wh" value={result ? result.daily_wh : "—"} hint="Raw consumption" />
          <StatCard label="Adjusted Wh" value={result ? result.adjusted_daily_wh : "—"} hint="With losses" accent="var(--warning)" />
          <StatCard label="Battery Ah" value={result ? result.battery_ah : "—"} hint="Recommended size" accent="var(--success)" />
          <StatCard label="Solar W" value={result ? result.solar_watts : "—"} hint="Suggested solar" accent="var(--accent-2)" />
        </div>
        <div style={{ height: 14 }} />
        <div className="result-box">{computedSummary}</div>
        <div style={{ height: 14 }} />
        <div className="saved-grid">
          {savedResults.slice(0, 4).map((item) => (
            <div key={item.id} className="saved-card">
              <strong>{item.result?.battery_ah}Ah · {item.result?.solar_watts}W</strong>
              <div className="muted">{item.time}</div>
              <div className="muted">{item.summary}</div>
              <div className="tag">{getLayoutLabel(item.layout)}</div>
            </div>
          ))}
          {!savedResults.length ? <div className="saved-card"><strong>No saved results yet</strong><div className="muted">Run the planner and save a snapshot.</div></div> : null}
        </div>
      </Panel>
    );
  }

  function renderPreviewPanel() {
    if (!activeModules.includes("live_preview")) return null;
    return (
      <Panel title="Live Layout Preview" subtitle="The UI now mutates by real zone arrays">
        <PreviewCanvas layout={layoutState} activeModules={activeModules} featureState={featureState} result={result} prompt={prompt} />
      </Panel>
    );
  }

  function renderModulesPanel() {
    return (
      <Panel title="Module Dock" subtitle="Real modules the builder can host inside the workspace">
        <div className="module-list">
          <div className="module-item">
            <div className="module-top"><strong>Builder Core</strong><span className="tag">system</span></div>
            <div className="muted">Prompt analysis, layout mutation, command history, and workspace orchestration.</div>
          </div>
          <div className="module-item">
            <div className="module-top"><strong>Battery Planner</strong><span className="tag">sample tool</span></div>
            <div className="muted">Uses your live backend endpoint to prove the builder can host a real runnable module.</div>
          </div>
          {activeModules.includes("active_features_panel") ? activeModuleMeta.map((module) => (
            <div key={module.key} className="module-item">
              <div className="module-top"><strong>{module.label}</strong><span className="tag">{module.category}</span></div>
              <div className="muted">{module.description}</div>
            </div>
          )) : null}
        </div>
      </Panel>
    );
  }

  function renderFileTreePanel() {
    return (
      <Panel
        title="File Tree"
        subtitle="Fake IDE navigation so the builder starts feeling like a real workspace"
        actions={<button className="mini-btn" onClick={() => handleMutationCommand("make ide layout")}>IDE layout</button>}
      >
        <div className="file-tree">
          {materializedTree.map((group) => (
            <div key={group.id} className="tree-group">
              <div className="tree-group-label">{group.label}</div>
              <div className="tree-items">
                {group.children.map((item) => (
                  <button
                    key={item.id}
                    className={`tree-item ${activeEditorTab === item.id ? "active" : ""}`}
                    onClick={() => setEditorTab(item.id)}
                  >
                    <span className="tree-kind">{item.kind === "folder" ? "📁" : "📄"}</span>
                    <span>{item.label}</span>
                    <small>{item.hint}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  function renderEditorPanel() {
    return (
      <Panel
        title="Editor Tabs"
        subtitle="Mini IDE surface with fake tabs and prompt-aware document focus"
        actions={
          <>
            <button className="mini-btn" onClick={() => handleMutationCommand("open layout")}>Open layout</button>
            <button className="mini-btn" onClick={() => handleMutationCommand("open battery")}>Open battery</button>
          </>
        }
      >
        <div className="editor-tabs">
          {openEditorTabs.map((tabId) => {
            const doc = EDITOR_DOCUMENTS[tabId];
            return (
              <div key={tabId} className={`editor-tab ${activeEditorTab === tabId ? "active" : ""}`}>
                <button className="editor-tab-btn" onClick={() => setEditorTab(tabId)}>
                  {doc?.title || tabId}
                </button>
                {tabId !== "builder-workspace" ? (
                  <button className="editor-close" onClick={() => closeEditorTab(tabId)}>×</button>
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ height: 14 }} />
        <div className="editor-surface">
          <div className="editor-meta">
            <div>
              <div className="eyebrow">Open document</div>
              <h4>{activeEditorDoc.title}</h4>
            </div>
            <span className="preview-chip">{activeEditorDoc.type}</span>
          </div>
          <p className="muted">{activeEditorDoc.summary}</p>
          <div className="editor-bullets">
            {activeEditorDoc.bullets.map((item) => (
              <div key={item} className="editor-line">{item}</div>
            ))}
          </div>
          {editorFiles[activeEditorTab] ? (
            <div className="stack">
              <textarea
                className="builder-textarea"
                style={{ minHeight: 260, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                value={editorFiles[activeEditorTab].content || ""}
                onChange={(e) => updateEditorFileContent(activeEditorTab, e.target.value)}
              />
              <div className="editor-actions-row">
                <button className="tab-btn" onClick={() => downloadTextFile((editorFiles[activeEditorTab].label || "generated-file").replace(/[^a-z0-9._-]/gi, "_"), editorFiles[activeEditorTab].content || "")}>Download file</button>
                <button className="tab-btn" onClick={() => handleMutationCommand("materialize files")}>Sync from blueprint</button>
                <button className="tab-btn" onClick={() => handleMutationCommand("focus app")}>Focus app</button>
              </div>
            </div>
          ) : (
            <div className="editor-actions-row">
              <button className="tab-btn" onClick={() => handleMutationCommand("open notes")}>Open notes</button>
              <button className="tab-btn" onClick={() => handleMutationCommand("open backend")}>Open backend</button>
              <button className="tab-btn" onClick={() => handleMutationCommand("materialize files")}>Materialize files</button>
              <button className="tab-btn" onClick={() => handleMutationCommand("focus app")}>Focus app</button>
            </div>
          )}
        </div>
      </Panel>
    );
  }

  function renderWorkspaceMapPanel() {
    return (
      <Panel title="Workspace Zone Map" subtitle="Resize memory + current zone occupancy">
        <div className="zone-map-grid">
          {Object.entries(layoutState.panels).map(([zoneId, zoneItems]) => (
            <div key={zoneId} className="zone-map-card">
              <div className="module-top">
                <strong>{zoneTitles[zoneId]}</strong>
                <span className="tag">{zoneItems.length} panels</span>
              </div>
              <div className="zone-chip-row">
                {zoneItems.map((item) => (
                  <span key={item} className="zone-chip">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 14 }} />
        <div className="resize-grid">
          <label className="resize-control">
            <span>Sidebar width · {layoutState.widths?.sidebar || 240}px</span>
            <input type="range" min="180" max="420" value={layoutState.widths?.sidebar || 240} onChange={(e) => updateWorkspaceWidth("sidebar", e.target.value)} />
          </label>
          <label className="resize-control">
            <span>Inspector width · {layoutState.widths?.inspector || 320}px</span>
            <input type="range" min="220" max="460" value={layoutState.widths?.inspector || 320} onChange={(e) => updateWorkspaceWidth("inspector", e.target.value)} />
          </label>
          <label className="resize-control">
            <span>Split ratio · {Math.round((layoutState.widths?.splitRatio || 0.58) * 100)} / {100 - Math.round((layoutState.widths?.splitRatio || 0.58) * 100)}</span>
            <input type="range" min="35" max="70" value={Math.round((layoutState.widths?.splitRatio || 0.58) * 100)} onChange={(e) => updateWorkspaceWidth("splitRatio", Number(e.target.value) / 100)} />
          </label>
        </div>
      </Panel>
    );
  }

  function renderMutationsPanel() {
    return (
      <Panel title="Mutation Log" subtitle="Tracks command mutations, backend runs, exports, and resets">
        <div className="mutation-list">
          {mutationLog.slice(0, 10).map((item) => (
            <div key={item.id} className="mutation-item">
              <div className="mutation-top">
                <strong>{item.type}</strong>
                <span className="tag">{item.time}</span>
              </div>
              <div>{item.command}</div>
              <div className="muted">{item.details}</div>
            </div>
          ))}
          {!mutationLog.length ? <div className="mutation-item"><strong>No mutations yet</strong><div className="muted">Apply a command to start the log.</div></div> : null}
        </div>
      </Panel>
    );
  }

  function renderHistoryPanel() {
    return (
      <Panel title="Command History" subtitle="Recent commands the builder used to mutate the shell">
        <div className="history-list">
          {commandHistory.slice(0, 6).map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-top">
                <strong>{item.prompt}</strong>
                <span className="tag">{item.time}</span>
              </div>
              <div className="muted">{item.appType} · {item.builderMode}</div>
            </div>
          ))}
          {!commandHistory.length ? <div className="history-item"><strong>No commands yet</strong><div className="muted">Command history appears here.</div></div> : null}
        </div>
      </Panel>
    );
  }

  function renderStatusPanel() {
    if (!activeModules.includes("status_panel")) return null;
    return (
      <Panel title="Builder Status Panel" subtitle="Current state of the system after feature and layout mutations">
        <div className="module-list">
          <div className="module-item">
            <div className="module-top"><strong>Status</strong><span className="tag">runtime</span></div>
            <div className="muted">{statusText}</div>
          </div>
          <div className="module-item">
            <div className="module-top"><strong>Detected Modes</strong><span className="tag">brain</span></div>
            <div className="muted">{analysis.detectedModes.length ? analysis.detectedModes.join(", ") : "No special modes detected yet."}</div>
          </div>
        </div>
      </Panel>
    );
  }

  function renderAffiliatePanel() {
    if (!activeModules.includes("affiliate_suggestions")) return null;
    return (
      <Panel title="Affiliate Suggestions" subtitle="Keeps your monetization block visible while layout mutates">
        <div className="affiliate-list">
          {affiliateSuggestions.length ? affiliateSuggestions.map((item) => (
            <div key={item.title} className="affiliate-item">
              <div className="affiliate-top">
                <strong>{item.title}</strong>
                <span className="tag">smart fit</span>
              </div>
              <div className="muted">{item.fit}</div>
            </div>
          )) : <div className="affiliate-item"><strong>No smart match yet</strong><div className="muted">Run a plan to generate contextual affiliate suggestions.</div></div>}
        </div>
      </Panel>
    );
  }

  function renderNotesPanel() {
    if (!activeModules.includes("notes_panel")) return null;
    return (
      <Panel title="Notes Panel" subtitle="Use this for builder planning and UI mutation ideas">
        <textarea
          className="notes-box"
          value={featureState.notes}
          onChange={(e) => setFeatureState((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Example: next step = let layout mutation reorder panels by prompt intent"
        />
      </Panel>
    );
  }

  function updateGeneratedBlock(blockId, updater) {
    setGeneratedBlockState((prev) => {
      const current = prev?.[blockId] || {};
      const nextValue = typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [blockId]: nextValue };
    });
  }

  function renderGeneratedBlockBody(block) {
    const state = generatedBlockState?.[block.id] || createDefaultGeneratedBlockState(block);
    const liveMetrics = [
      { label: "Panels", value: liveWorkspaceContext.panelCount },
      { label: "Modules", value: liveWorkspaceContext.activeModuleCount },
      { label: "Mutations", value: liveWorkspaceContext.mutationCount },
      { label: "Saved", value: liveWorkspaceContext.savedResultCount },
    ];
    const liveActivity = liveWorkspaceContext.activityEntries?.length
      ? liveWorkspaceContext.activityEntries
      : ["No live activity yet"];
    const liveFiles = liveWorkspaceContext.fileRows?.length
      ? liveWorkspaceContext.fileRows
      : [{ name: "App.jsx", type: "shell", status: "active" }];

    if (block.type === "hero") {
      return (
        <div className="generated-live-card">
          <div className="generated-live-hero">
            <strong>{featureState.quickIdea || "Build faster with prompt mutations"}</strong>
            <div className="muted">Latest mutation: {liveWorkspaceContext.latestMutation}</div>
            <button
              className="mini-btn"
              onClick={() => {
                updateGeneratedBlock(block.id, (prev) => ({ ...prev, ctaClicks: (prev.ctaClicks || 0) + 1 }));
                handleMutationCommand("make ide layout add sidebar add inspector");
              }}
            >
              Launch workspace shell
            </button>
          </div>
        </div>
      );
    }

    if (block.type === "metrics") {
      return (
        <div className="generated-live-card">
          <div className="generated-live-metrics">
            {liveMetrics.map((item) => (
              <div key={item.label} className="metric-pill">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 10 }}>
            {result
              ? `Live result: ${result.battery_ah}Ah battery · ${result.solar_watts}W solar`
              : `Open tabs: ${liveWorkspaceContext.openTabs.length} · Zones: ${liveWorkspaceContext.zoneCount}`}
          </div>
          <button
            className="mini-btn"
            onClick={() =>
              updateGeneratedBlock(block.id, (prev) => ({
                ...prev,
                lastRefresh: nowLabel(),
              }))
            }
          >
            Refresh from app state
          </button>
        </div>
      );
    }

    if (block.type === "kanban") {
      const cols = {
        backlog: [
          ...(state.columns?.backlog || []),
          ...(layoutState.sidebar ? [] : ["Add sidebar"]),
          ...(layoutState.inspector ? [] : ["Add inspector"]),
        ].slice(0, 5),
        building: [
          `Active tab: ${activeEditorDoc.title}`,
          `Builder mode: ${featureState.builderMode}`,
          ...(state.columns?.building || []).slice(0, 2),
        ].slice(0, 5),
        done: [
          `Modules active: ${activeModules.length}`,
          ...(result ? [`Battery plan ready: ${result.battery_ah}Ah`] : []),
          ...(state.columns?.done || []).slice(0, 2),
        ].slice(0, 5),
      };
      return (
        <div className="generated-live-card">
          <div className="generated-live-kanban">
            {Object.entries(cols).map(([column, cards]) => (
              <div key={column} className="kanban-col">
                <strong>{column}</strong>
                {(cards || []).map((card, idx) => (
                  <div key={`${column}-${idx}`} className="kanban-card">{card}</div>
                ))}
              </div>
            ))}
          </div>
          <button
            className="mini-btn"
            onClick={() =>
              updateGeneratedBlock(block.id, (prev) => ({
                ...prev,
                columns: {
                  ...(prev.columns || {}),
                  backlog: [...(prev.columns?.backlog || []), `Prompt idea ${prev.counter || 1}`],
                },
                counter: (prev.counter || 1) + 1,
              }))
            }
          >
            Add card
          </button>
        </div>
      );
    }

    if (block.type === "activity") {
      return (
        <div className="generated-live-card">
          <div className="generated-live-list">
            {liveActivity.map((entry, idx) => (
              <div key={idx} className="activity-row">• {entry}</div>
            ))}
          </div>
          <button
            className="mini-btn"
            onClick={() => handleMutationCommand("add activity feed")}
          >
            Re-sync feed
          </button>
        </div>
      );
    }

    if (block.type === "chat") {
      return (
        <div className="generated-live-card">
          <div className="generated-live-chat">
            {(state.messages || []).map((msg, idx) => (
              <div key={idx} className={`live-bubble ${msg.role}`}>{msg.text}</div>
            ))}
          </div>
          <div className="generated-inline-form">
            <input
              className="command-input"
              value={state.draft || ""}
              onChange={(e) => {
                const nextDraft = e.target.value;
                updateGeneratedBlock(block.id, (prev) => ({ ...prev, draft: nextDraft }));
                setPrompt(nextDraft);
              }}
              placeholder="Type a live builder command"
            />
            <button
              className="mini-btn"
              onClick={() => {
                const draft = state.draft || "";
                if (!draft.trim()) return;
                updateGeneratedBlock(block.id, (prev) => ({
                  ...prev,
                  messages: [
                    ...(prev.messages || []),
                    { role: "user", text: draft },
                    { role: "assistant", text: `Ran builder command: ${draft}` },
                  ].slice(-8),
                  draft: "",
                }));
                setPrompt(draft);
                handleMutationCommand(draft);
              }}
            >
              Run command
            </button>
          </div>
        </div>
      );
    }

    if (block.type === "form") {
      return (
        <div className="generated-live-card">
          <div className="generated-inline-form vertical">
            <input
              className="command-input"
              value={state.values?.projectName || featureState.quickIdea || ""}
              onChange={(e) =>
                updateGeneratedBlock(block.id, (prev) => ({
                  ...prev,
                  values: { ...(prev.values || {}), projectName: e.target.value },
                  saved: false,
                }))
              }
              placeholder="Project name"
            />
            <input
              className="command-input"
              value={state.values?.mode || featureState.builderMode || ""}
              onChange={(e) =>
                updateGeneratedBlock(block.id, (prev) => ({
                  ...prev,
                  values: { ...(prev.values || {}), mode: e.target.value },
                  saved: false,
                }))
              }
              placeholder="Mode"
            />
            <button
              className="mini-btn"
              onClick={() => {
                const nextProject = state.values?.projectName || featureState.quickIdea;
                const nextMode = state.values?.mode || featureState.builderMode;
                setFeatureState((prev) => ({
                  ...prev,
                  quickIdea: nextProject,
                  builderMode: nextMode,
                }));
                updateGeneratedBlock(block.id, (prev) => ({ ...prev, saved: true }));
              }}
            >
              {state.saved ? "Synced to builder" : "Save to builder"}
            </button>
          </div>
        </div>
      );
    }

    if (block.type === "table") {
      return (
        <div className="generated-live-card">
          <div className="generated-table-live">
            <div className="table-live-head"><span>Name</span><span>Type</span><span>Status</span></div>
            {liveFiles.map((row, idx) => (
              <div key={idx} className="table-live-row"><span>{row.name}</span><span>{row.type}</span><span>{row.status}</span></div>
            ))}
          </div>
          <button
            className="mini-btn"
            onClick={() => setEditorTab("layout-map")}
          >
            Open layout file
          </button>
        </div>
      );
    }

    if (block.type === "empty-state") {
      return (
        <div className="generated-live-card">
          <div className="generated-empty-live">
            <strong>{state.launched ? "Workspace launched" : "Nothing launched yet"}</strong>
            <div className="muted">
              {state.launched
                ? `Shell: ${layoutState.shell} · Panels: ${liveWorkspaceContext.panelCount}`
                : "Use this to launch a starter IDE shell from inside a generated block."}
            </div>
          </div>
          <button
            className="mini-btn"
            onClick={() => {
              const nextLaunched = !state.launched;
              updateGeneratedBlock(block.id, (prev) => ({ ...prev, launched: nextLaunched }));
              if (nextLaunched) {
                handleMutationCommand("make ide layout add sidebar add inspector add metrics");
              }
            }}
          >
            {state.launched ? "Reset" : "Launch starter"}
          </button>
        </div>
      );
    }

    if (block.type === "custom") {
      return (
        <div className="generated-live-card">
          <div className="generated-live-list">
            <div className="activity-row">• Latest command: {liveWorkspaceContext.latestCommand}</div>
            <div className="activity-row">• Latest mutation: {liveWorkspaceContext.latestMutation}</div>
            {(state.notes || []).map((entry, idx) => <div key={idx} className="activity-row">• {entry}</div>)}
          </div>
          <button className="mini-btn" onClick={() => updateGeneratedBlock(block.id, (prev) => ({ ...prev, notes: [...(prev.notes || []), `Custom action ${((prev.notes || []).length + 1)}`].slice(-5) }))}>Add note</button>
        </div>
      );
    }

    return null;
  }


  function renderCompositePacksPanel() {
    return (
      <Panel
        title="Composite Workspace Packs"
        subtitle="One prompt can now generate a coordinated multi-block page by intent"
      >
        <div className="module-list">
          {COMPOSITE_WORKSPACE_TEMPLATES.map((pack) => (
            <div key={pack.id} className="module-item">
              <div className="module-top">
                <strong>{pack.label}</strong>
                <span className="tag">{pack.blocks.length} blocks</span>
              </div>
              <div className="muted">{pack.description}</div>
              <div style={{ height: 10 }} />
              <div className="command-row">
                <button className="mini-btn" onClick={() => handleMutationCommand(pack.id === "crm-dashboard" ? "make crm dashboard" : pack.id === "analytics-page" ? "make analytics page" : pack.id === "saas-landing" ? "make saas landing" : pack.id === "support-cockpit" ? "make support cockpit" : pack.id === "project-planner" ? "make project planner" : "make dev workspace")}>
                  Launch pack
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }


  function renderBlueprintPanel() {
    return (
      <Panel
        title="App Blueprint Engine"
        subtitle="Turns page-intent commands into real starter config: routes, schemas, models, and file plans"
        actions={
          <>
            <button className="mini-btn" onClick={() => handleMutationCommand("generate schema generate routes starter files add auth")}>Boost blueprint</button>
            <button className="mini-btn" onClick={() => handleMutationCommand("materialize files")} disabled={!blueprintState}>Materialize files</button>
            <button className="mini-btn" onClick={() => blueprintState && downloadTextFile(`${blueprintState.key}-blueprint.json`, JSON.stringify(blueprintState, null, 2))} disabled={!blueprintState}>Export blueprint</button>
          </>
        }
      >
        {!blueprintState ? (
          <div className="empty-mini-state">
            <div className="muted">No blueprint generated yet.</div>
            <div className="muted">Try: <strong>make crm dashboard</strong>, <strong>make dev workspace</strong>, or <strong>generate schema add billing</strong>.</div>
          </div>
        ) : (
          <div className="stack">
            <div className="module-item">
              <div className="module-top">
                <strong>{blueprintState.label}</strong>
                <span className="tag">{blueprintState.key}</span>
              </div>
              <div className="muted">Source: {blueprintState.sourceCommand || "builder-generated"}</div>
              <div className="zone-chip-row">
                <span className="zone-chip">routes {blueprintState.routes?.length || 0}</span>
                <span className="zone-chip">models {blueprintState.models?.length || 0}</span>
                <span className="zone-chip">schemas {blueprintState.schemas?.length || 0}</span>
                <span className="zone-chip">files {blueprintState.files?.length || 0}</span>
              </div>
            </div>
            <div className="generated-grid blueprint-grid">
              <div className="generated-block">
                <div className="module-top"><strong>Routes</strong><span className="tag">API</span></div>
                <div className="mini-list">
                  {(blueprintState.routes || []).map((route, index) => (
                    <div key={`${route.path}-${index}`} className="mini-list-item">
                      <span className="tag">{route.method}</span>
                      <code>{route.path}</code>
                      <span className="muted">{route.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="generated-block">
                <div className="module-top"><strong>Data Models</strong><span className="tag">entities</span></div>
                <div className="mini-list">
                  {(blueprintState.models || []).map((model) => (
                    <div key={model.name} className="mini-list-item">
                      <strong>{model.name}</strong>
                      <span className="muted">{(model.fields || []).join(" • ")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="generated-block">
                <div className="module-top"><strong>Schemas</strong><span className="tag">validation</span></div>
                <div className="mini-list">
                  {(blueprintState.schemas || []).map((schema) => (
                    <div key={schema.name} className="mini-list-item">
                      <strong>{schema.name}</strong>
                      <span className="muted">{(schema.fields || []).join(" • ")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="generated-block">
                <div className="module-top"><strong>Starter Files</strong><span className="tag">scaffold</span></div>
                <div className="mini-list">
                  {(blueprintState.files || []).map((file) => (
                    <div key={file} className="mini-list-item"><code>{file}</code></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="module-item">
              <div className="module-top"><strong>Internal Config</strong><span className="tag">runtime</span></div>
              <div className="zone-chip-row">
                <span className="zone-chip">auth {blueprintState.config?.auth ? "on" : "off"}</span>
                <span className="zone-chip">billing {blueprintState.config?.billing ? "on" : "off"}</span>
                <span className="zone-chip">multi-tenant {blueprintState.config?.multiTenant ? "on" : "off"}</span>
                <span className="zone-chip">seed data {blueprintState.config?.seedData ? "on" : "off"}</span>
              </div>
              <div style={{ height: 10 }} />
              <div className="command-row">
                <button className="mini-btn" onClick={() => handleMutationCommand("add auth")}>Add auth</button>
                <button className="mini-btn" onClick={() => handleMutationCommand("add billing")}>Add billing</button>
                <button className="mini-btn" onClick={() => handleMutationCommand("multi tenant")}>Multi-tenant</button>
                <button className="mini-btn" onClick={() => handleMutationCommand("starter files generate schema generate routes")}>Scaffold more</button>
                <button className="mini-btn" onClick={() => handleMutationCommand("materialize files")}>Push into editor</button>
              </div>
            </div>
          </div>
        )}
      </Panel>
    );
  }

  function renderGeneratedBlocksPanel() {
    if (!generatedBlocks.length) return null;
    return (
      <Panel
        title="Generated UI Blocks"
        subtitle="Prompt-created structural blocks that the builder now adds automatically"
        actions={<button className="mini-btn" onClick={() => handleMutationCommand("clear generated blocks")}>Clear blocks</button>}
      >
        <div className="generated-grid">
          {generatedBlocks.map((block) => (
            <div key={block.id} className={`generated-block generated-${block.type}`}>
              <div className="module-top">
                <strong>{block.title}</strong>
                <span className="tag">{block.label}</span>
              </div>
              <div className="muted">{block.description}</div>
              <div className="zone-chip-row">
                <span className="zone-chip">{block.zone}</span>
                <span className="zone-chip">{block.type}</span>
              </div>
              {block.type === "hero" ? <div className="generated-hero-shell"><div className="generated-title-line" /><div className="generated-copy-line" /><div className="generated-copy-line short" /></div> : null}
              {block.type === "metrics" ? <div className="generated-metric-row"><div /><div /><div /></div> : null}
              {block.type === "kanban" ? <div className="generated-kanban"><div /><div /><div /></div> : null}
              {block.type === "activity" ? <div className="generated-activity"><span /><span /><span /></div> : null}
              {block.type === "chat" ? <div className="generated-chat"><div className="bubble left" /><div className="bubble right" /><div className="bubble left short" /></div> : null}
              {block.type === "form" ? <div className="generated-form"><div className="field" /><div className="field" /><div className="button-line" /></div> : null}
              {block.type === "table" ? <div className="generated-table"><div className="row header" /><div className="row" /><div className="row" /></div> : null}
              {block.type === "empty-state" ? <div className="generated-empty"><div className="icon" /><div className="generated-copy-line" /><div className="generated-copy-line short" /></div> : null}
              {block.type === "custom" ? <div className="generated-empty"><div className="icon" /><div className="generated-copy-line" /><div className="button-line" /></div> : null}
              <div className="generated-divider" />
              {renderGeneratedBlockBody(block)}
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  function getPanelLabel(panelId) {
    const labels = {
      brain: "Builder Brain",
      command: "Command Mutations",
      quickActions: "Quick Actions",
      planner: "Battery Planner",
      results: "Results Summary",
      preview: "Live Preview",
      builder: "Builder Workspace Core",
      blueprint: "Blueprint Engine",
      modules: "Active Features",
      files: "File Tree",
      editor: "Editor Tabs",
      mutations: "Mutation Log",
      history: "Command History",
      workspaceMap: "Workspace Zone Map",
      status: "Status Panel",
      affiliate: "Affiliate Suggestions",
      notes: "Notes",
      compositePacks: "Composite Packs",
      generated: "Generated Blocks",
    };
    return labels[panelId] || panelId.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
  }

  function renderPanelById(panelId) {
    const registry = {
      brain: renderBrainPanel,
      command: renderCommandPanel,
      quickActions: renderQuickActionsPanel,
      planner: renderPlannerPanel,
      results: renderResultsPanel,
      preview: renderPreviewPanel,
      builder: renderBuilderPanel,
      blueprint: renderBlueprintPanel,
      modules: renderModulesPanel,
      files: renderFileTreePanel,
      editor: renderEditorPanel,
      mutations: renderMutationsPanel,
      history: renderHistoryPanel,
      workspaceMap: renderWorkspaceMapPanel,
      status: renderStatusPanel,
      affiliate: renderAffiliatePanel,
      notes: renderNotesPanel,
      compositePacks: renderCompositePacksPanel,
      generated: renderGeneratedBlocksPanel,
    };
    const renderer = registry[panelId];
    return renderer ? renderer() : null;
  }

  function selectFocusView(viewKey) {
    setActiveFocusView(viewKey);
    setSelectedEntity({
      type: "view",
      id: viewKey,
      label: FOCUS_VIEW_CONFIG[viewKey]?.label || viewKey,
      panelId: FOCUS_VIEW_CONFIG[viewKey]?.panelId || viewKey,
    });
  }

  function selectPanelEntity(panelId, labelOverride = "") {
    setSelectedEntity({
      type: "panel",
      id: panelId,
      label: labelOverride || getPanelLabel(panelId),
      panelId,
    });
    const matchingView = Object.entries(FOCUS_VIEW_CONFIG).find(([, config]) => config.panelId === panelId && visiblePanelIds.includes(config.panelId));
    if (matchingView) {
      setActiveFocusView(matchingView[0]);
    }
  }

  function renderZone(zoneId, options = {}) {
    const baseItems = layoutState.panels?.[zoneId] || [];
    const items = options.modeFilter
      ? baseItems.filter((panelId) => visiblePanelIds.includes(panelId))
      : baseItems;
    const rendered = items
      .map((panelId) => (
        <React.Fragment key={`${zoneId}-${panelId}`}>
          {renderPanelById(panelId)}
        </React.Fragment>
      ))
      .filter(Boolean);

    if (!rendered.length) {
      return (
        <Panel title={zoneTitles[zoneId]} subtitle="This zone is quiet in the current mode. Switch modes or move a panel here." compact>
          <div className="muted">Example: move results to {zoneId === "mainTop" ? "main top" : zoneId}</div>
        </Panel>
      );
    }

    if (options.splitColumns) {
      const left = rendered.filter((_, index) => index % 2 === 0);
      const right = rendered.filter((_, index) => index % 2 === 1);
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div className="stack">{left.length ? left : <div />}</div>
          <div className="stack">{right.length ? right : <div />}</div>
        </div>
      );
    }

    return <div className="stack">{rendered}</div>;
  }

  function renderSimpleModeSurface() {
    const starterCommands = [
      "make dashboard",
      "make dev workspace",
      "make saas landing",
      "materialize files",
    ];
    const hasPrompt = Boolean((prompt || "").trim());
    const hasRunCommand = commandHistory.length > 0;
    const hasPreviewFocus = activeFocusView === "preview" || selectedEntity?.type === "preview";
    const onboardingSteps = [
      {
        id: "pick",
        title: "Pick a starter command",
        description: hasPrompt ? `Loaded: ${prompt}` : "Choose a starter so the builder has a clear first instruction.",
        done: hasPrompt,
        actionLabel: "Load dashboard starter",
        action: () => {
          setPrompt("make dashboard");
          setSelectedEntity({ type: "suggestion", id: "make dashboard", label: "make dashboard" });
        },
      },
      {
        id: "run",
        title: "Run Builder Brain once",
        description: hasRunCommand ? `Last command: ${commandHistory[0]?.prompt || prompt}` : "Press Run Builder Brain to let the workspace reshape itself.",
        done: hasRunCommand,
        actionLabel: "Run builder now",
        action: () => executeCommandFlow(runBuilderBrain),
      },
      {
        id: "preview",
        title: "Focus the preview",
        description: hasPreviewFocus ? "Preview is selected. The inspector now follows that surface." : "Click the preview area or use the button below to focus the result visually.",
        done: hasPreviewFocus,
        actionLabel: "Focus preview",
        action: () => {
          setActiveFocusView("preview");
          setSelectedEntity({ type: "preview", id: "simple-preview", label: "Preview" });
        },
      },
    ];
    const onboardingDone = onboardingSteps.filter((step) => step.done).length;
    const nextStep = onboardingSteps.find((step) => !step.done) || onboardingSteps[onboardingSteps.length - 1];

    return (
      <div className="simple-mode-shell">
        <Panel
          title="Simple Mode"
          subtitle="Start with one command. Keep the screen calm until you want the full builder cockpit."
          actions={
            <div className="panel-actions">
              <button className="mini-btn" onClick={() => setUiMode("pro")}>Open Pro Mode</button>
              <button className="mini-btn" onClick={() => setPrompt("make dashboard")}>Load sample</button>
            </div>
          }
        >
          <div className="simple-hero">
            <div className="simple-hero-copy">
              <div className="eyebrow">Command-first Builder</div>
              <h2>Describe the app. The workspace reshapes itself.</h2>
              <p className="muted">Use one sentence. The builder will interpret the intent, mutate the layout, and update the preview without flooding the screen.</p>
              <div className="simple-chip-row">
                {starterCommands.map((sample) => (
                  <button
                    key={`simple-${sample}`}
                    className="suggestion-chip"
                    onClick={() => {
                      setPrompt(sample);
                      setSelectedEntity({ type: "suggestion", id: sample, label: sample });
                    }}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
            <div className="simple-hero-steps">
              <div className="simple-onboarding-header">
                <strong>Guided first run</strong>
                <span className="status-pill neutral">{onboardingDone}/{onboardingSteps.length} done</span>
              </div>
              {onboardingSteps.map((step, index) => (
                <button
                  key={step.id}
                  className={`simple-step-card ${step.done ? "done" : nextStep.id === step.id ? "active" : ""}`}
                  onClick={step.action}
                  type="button"
                >
                  <div className="simple-step-topline">
                    <span className="simple-step-index">{index + 1}</span>
                    <strong>{step.title}</strong>
                    <span className={`status-pill ${step.done ? "success" : nextStep.id === step.id ? "info" : "neutral"}`}>{step.done ? "done" : nextStep.id === step.id ? "next" : "pending"}</span>
                  </div>
                  <span className="muted">{step.description}</span>
                  {!step.done ? <span className="simple-step-link">{step.actionLabel}</span> : null}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <div className="simple-mode-grid">
          <div className="stack">
            {renderPreviewPanel()}
          </div>
          <div className="stack">
            <Panel
              title="Next best action"
              subtitle="The app now tells you the next move instead of making you guess."
              compact
            >
              <div className="simple-next-list">
                <div className="simple-next-item highlight">
                  <strong>{nextStep.done ? "Onboarding complete" : nextStep.title}</strong>
                  <span className="muted">{nextStep.description}</span>
                  {!nextStep.done ? <button className="mini-btn" onClick={nextStep.action}>{nextStep.actionLabel}</button> : <span className="muted">You can keep typing commands or switch to Pro Mode.</span>}
                </div>
                <div className="simple-next-item">
                  <strong>Current command</strong>
                  <span className="muted">{prompt || "Nothing loaded yet. Pick a suggestion or type your own."}</span>
                </div>
                <div className="simple-next-item">
                  <strong>Builder status</strong>
                  <span className="muted">{builderInsight}</span>
                </div>
                <div className="simple-next-item">
                  <strong>API</strong>
                  <span className="muted">{apiStatus === "connected" ? "Connected to live backend" : "Backend not reachable right now"}</span>
                </div>
              </div>
            </Panel>
            {result ? renderResultsPanel() : renderPlannerPanel()}
            {commandHistory.length ? (
              <Panel title="Recent Commands" subtitle="Click to reuse a command quickly." compact>
                <div className="simple-chip-row">
                  {commandHistory.slice(0, 8).map((item) => (
                    <button
                      key={`simple-history-${item.id}`}
                      className="history-pill"
                      onClick={() => {
                        setPrompt(item.prompt);
                        setSelectedEntity({ type: "command", id: item.id, label: item.prompt });
                      }}
                    >
                      {item.prompt}
                    </button>
                  ))}
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={rootClassNames}>
      <style>{`
        :root {
          --bg: #07111f;
          --bg-soft: #0e1a2b;
          --panel: rgba(13, 25, 43, 0.86);
          --panel-border: rgba(148, 163, 184, 0.18);
          --text: #e5eefc;
          --muted: #93a4bf;
          --accent: #66d9ef;
          --accent-2: #8b5cf6;
          --success: #22c55e;
          --warning: #f59e0b;
          --danger: #fb7185;
          --shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
          color-scheme: dark;
        }
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; font-family: Inter, system-ui, Arial, sans-serif; background: radial-gradient(circle at top, #12203a, #07111f 55%); color: var(--text); }
        button, input, textarea, select { font: inherit; }
        .app-shell { min-height: 100vh; padding: 18px; }
        .app-shell.dense { padding: 12px; }
        .panel-card {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 22px;
          padding: 18px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(12px);
        }
        .dense .panel-card { padding: 14px; border-radius: 18px; }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .brand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 11px;
          color: var(--accent);
        }
        h1, h2, h3, h4, p { margin: 0; }
        .brand h1 { font-size: 30px; }
        .brand p { color: var(--muted); }
        .topbar-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
        .command-bar-shell {
          position: sticky;
          top: 14px;
          z-index: 40;
          margin: 0 auto 18px;
          max-width: 980px;
        }
        .command-bar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-radius: 26px;
          background: linear-gradient(180deg, rgba(9, 20, 36, 0.96), rgba(8, 18, 32, 0.9));
          border: 1px solid rgba(102, 217, 239, 0.26);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(102, 217, 239, 0.08) inset;
          backdrop-filter: blur(18px);
        }
        .command-bar-main { display: grid; gap: 8px; }
        .command-bar-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--muted); font-size: 13px; }
        .command-input-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 10px;
          align-items: center;
        }
        .command-input-main {
          width: 100%;
          min-height: 54px;
          padding: 0 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(148, 163, 184, 0.18);
          color: var(--text);
          outline: none;
        }
        .command-bar-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
        .command-suggestions { display: flex; flex-wrap: wrap; gap: 8px; }
        .suggestion-chip {
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(255,255,255,0.03);
          color: var(--muted);
          padding: 7px 10px;
          border-radius: 999px;
          cursor: pointer;
        }
        .suggestion-chip:hover { color: var(--text); border-color: rgba(102, 217, 239, 0.35); }
        .pill, .ghost-pill, .tab-btn, .sidebar-btn, .mini-btn {
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(255,255,255,0.04);
          color: var(--text);
          padding: 10px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: transform .15s ease, border-color .15s ease, background .15s ease;
        }
        .mini-btn { padding: 7px 10px; font-size: 13px; }
        .pill:hover, .ghost-pill:hover, .tab-btn:hover, .sidebar-btn:hover, .mini-btn:hover { transform: translateY(-1px); border-color: rgba(102, 217, 239, .55); }
        .pill.primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #08111f; font-weight: 700; border: none; }
        .ghost-pill.active, .tab-btn.active, .sidebar-btn.active { background: rgba(102, 217, 239, 0.14); border-color: rgba(102, 217, 239, .6); }
        .shell-grid {
          display: grid;
          grid-template-columns: ${layoutState.sidebar ? `${sidebarCompact ? 210 : (layoutState.widths?.sidebar || 240)}px minmax(0,1fr)` : "minmax(0,1fr)"}${layoutState.inspector ? ` ${(layoutState.widths?.inspector || 320)}px` : ""};
          gap: 18px;
          align-items: start;
        }
        .with-split .main-workspace {
          display: grid;
          grid-template-columns: minmax(0, ${Math.round((layoutState.widths?.splitRatio || 0.58) * 100)}fr) minmax(0, ${Math.round((1 - (layoutState.widths?.splitRatio || 0.58)) * 100)}fr);
          gap: 18px;
        }
        .focus .main-workspace,
        .dashboard .main-workspace,
        .classic .main-workspace {
          display: grid;
          grid-template-columns: ${layoutState.split ? `minmax(0, ${Math.round((layoutState.widths?.splitRatio || 0.58) * 100)}fr) minmax(0, ${Math.round((1 - (layoutState.widths?.splitRatio || 0.58)) * 100)}fr)` : "1fr"};
          gap: 18px;
        }
        .stack { display: grid; gap: 18px; }
        .canvas-stage {
          position: relative;
          min-height: 860px;
          display: grid;
          gap: 18px;
          align-content: start;
        }
        .canvas-surface {
          position: relative;
          min-height: 760px;
          padding: 18px;
          border-radius: 28px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: radial-gradient(circle at top, rgba(19, 42, 74, 0.66), rgba(8, 16, 29, 0.9) 58%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 30px 80px rgba(0,0,0,0.28);
          overflow: hidden;
        }
        .canvas-grid {
          display: grid;
          grid-template-columns: minmax(0, ${Math.round((layoutState.widths?.splitRatio || 0.58) * 100)}fr) 14px minmax(280px, ${Math.round((1 - (layoutState.widths?.splitRatio || 0.58)) * 100)}fr);
          gap: 16px;
          align-items: start;
        }
        .canvas-primary { display: grid; gap: 16px; }
        .canvas-overlay-stack { display: grid; gap: 16px; }
        .canvas-shell-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          display: inline-flex;
          gap: 8px;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(102, 217, 239, 0.2);
          background: rgba(9, 20, 36, 0.84);
          color: var(--muted);
          font-size: 12px;
        }

        .layout-handle {
          border: 1px solid rgba(102, 217, 239, 0.22);
          background: linear-gradient(180deg, rgba(12, 22, 37, 0.96), rgba(20, 39, 64, 0.92));
          color: rgba(160, 224, 255, 0.92);
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: col-resize;
          box-shadow: 0 12px 26px rgba(2, 8, 23, 0.22);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease, background .16s ease;
          user-select: none;
        }
        .layout-handle:hover, .layout-handle.dragging {
          transform: scale(1.04);
          border-color: rgba(102, 217, 239, 0.55);
          box-shadow: 0 14px 34px rgba(8, 15, 28, 0.32);
          background: linear-gradient(180deg, rgba(18, 33, 52, 0.98), rgba(27, 58, 94, 0.96));
        }
        .layout-handle.sidebar, .layout-handle.inspector {
          position: absolute;
          top: 50%;
          width: 16px;
          height: 92px;
          margin-top: -46px;
          z-index: 8;
        }
        .layout-handle.sidebar { right: -10px; }
        .layout-handle.inspector { left: -10px; }
        .layout-handle.split {
          width: 14px;
          min-height: 220px;
          align-self: stretch;
        }
        .command-palette-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(2, 8, 23, 0.56);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: start center;
          padding: 88px 18px 24px;
        }
        .command-palette-card {
          width: min(920px, 100%);
          border-radius: 24px;
          border: 1px solid rgba(102, 217, 239, 0.18);
          background: linear-gradient(180deg, rgba(7, 16, 28, 0.98), rgba(10, 22, 39, 0.96));
          box-shadow: 0 30px 80px rgba(0,0,0,0.35);
          padding: 18px;
          display: grid;
          gap: 16px;
        }
        .command-palette-input {
          width: 100%;
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255,255,255,0.04);
          color: var(--text);
          padding: 16px 18px;
          outline: none;
          font-size: 16px;
        }
        .palette-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 16px;
        }
        .palette-section {
          display: grid;
          gap: 12px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 18px;
          padding: 14px;
          background: rgba(255,255,255,0.025);
        }
        .palette-chip-grid, .palette-list {
          display: grid;
          gap: 10px;
        }
        .palette-chip-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .palette-list-item {
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(255,255,255,0.03);
          color: inherit;
          padding: 12px 14px;
          display: grid;
          gap: 6px;
          cursor: pointer;
        }
        .is-resizing * { cursor: col-resize !important; }
        .selection-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .selection-chip {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(255,255,255,0.03);
          color: var(--muted);
        }
        .selection-chip.active {
          border-color: rgba(102, 217, 239, 0.5);
          background: rgba(102, 217, 239, 0.12);
          color: var(--text);
        }
        .context-card {
          display: grid;
          gap: 12px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 18px;
          padding: 14px;
          background: rgba(255,255,255,0.03);
        }
        .simple-mode-shell { display: grid; gap: 18px; }
        .simple-hero { display: grid; grid-template-columns: 1.2fr .8fr; gap: 18px; align-items: start; }
        .simple-hero-copy { display: grid; gap: 12px; }
        .simple-hero-copy h2 { font-size: 30px; line-height: 1.1; }
        .simple-chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .simple-hero-steps { display: grid; gap: 12px; }
        .simple-onboarding-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .simple-step-card, .simple-next-item {
          display: grid; gap: 6px; padding: 14px; border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.14); background: rgba(255,255,255,0.03);
        }
        .simple-mode-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr); gap: 18px; align-items: start; }
        .simple-next-list { display: grid; gap: 10px; }
        .mode-toggle { display: inline-flex; gap: 8px; padding: 6px; border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.16); background: rgba(255,255,255,0.04); }
        .dense .stack { gap: 12px; }
        .sidebar {
          position: sticky;
          top: 18px;
          display: grid;
          gap: 12px;
        }
        .sidebar.compact { gap: 10px; }
        .sidebar.compact .panel-card { padding: 12px; border-radius: 18px; }
        .sidebar.compact .panel-head p { display: none; }
        .sidebar.compact .module-item, .sidebar.compact .affiliate-item, .sidebar.compact .history-item, .sidebar.compact .mutation-item { padding: 10px; }
        .sidebar-toolbar { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
        .sidebar-toolbar .mini-btn { padding: 6px 10px; }
        .sidebar-nav { display: grid; gap: 10px; }
        .inspector-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .inspector-shell { display: grid; gap: 12px; }
        .hidden-panel-note.compact { padding: 10px 12px; }
        .panel-card.collapsed { padding-bottom: 14px; }
        .panel-toggle { min-width: 84px; }
        .sidebar-btn { width: 100%; text-align: left; }
        .panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .panel-head p { color: var(--muted); font-size: 14px; margin-top: 6px; }
        .panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .muted { color: var(--muted); }
        .brain-grid, .status-grid, .stats-grid, .quick-grid, .preview-grid, .saved-grid { display: grid; gap: 12px; }
        .brain-grid, .status-grid, .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .quick-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
        .saved-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .stat-card { display: grid; gap: 8px; }
        .stat-top { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; }
        .dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; }
        .stat-value { font-size: 28px; font-weight: 800; }
        .stat-hint { color: var(--muted); font-size: 14px; }
        .prompt-box, .notes-box, .text-input, .number-input, .result-box {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(148, 163, 184, 0.16);
          color: var(--text);
          border-radius: 16px;
          padding: 14px;
          outline: none;
        }
        .prompt-box, .notes-box { min-height: 110px; resize: vertical; }
        .result-box { min-height: 120px; }
        .command-row, .button-row, .kpi-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .builder-form { display: grid; gap: 14px; }
        .appliance-table { display: grid; gap: 10px; }
        .appliance-row {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(100px, .6fr)) auto;
          gap: 10px;
        }
        .appliance-presets { display: flex; flex-wrap: wrap; gap: 10px; }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(148, 163, 184, 0.16);
          color: var(--muted);
          font-size: 13px;
        }
        .badge.ok { color: #b8f7c8; border-color: rgba(34, 197, 94, .35); }
        .badge.warn { color: #fde68a; border-color: rgba(245, 158, 11, .35); }
        .badge.off { color: #fda4af; border-color: rgba(251, 113, 133, .35); }
        .module-list, .mutation-list, .history-list, .affiliate-list { display: grid; gap: 10px; }
        .module-item, .mutation-item, .history-item, .affiliate-item {
          border: 1px solid rgba(148, 163, 184, .14);
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 12px;
          display: grid;
          gap: 6px;
        }
        .module-top, .mutation-top, .history-top, .affiliate-top {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
        }
        .tag {
          font-size: 12px;
          color: var(--accent);
          background: rgba(102, 217, 239, .1);
          border: 1px solid rgba(102, 217, 239, .18);
          border-radius: 999px;
          padding: 5px 9px;
        }
        .preview-dashboard, .preview-spotlight, .preview-wireframe { display: grid; gap: 14px; }

        .file-tree, .tree-items, .zone-chip-row, .editor-bullets, .resize-grid, .zone-map-grid { display: grid; gap: 10px; }
        .tree-group { display: grid; gap: 8px; }
        .tree-group-label { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--muted); }
        .tree-item {
          width: 100%;
          text-align: left;
          border: 1px solid rgba(148, 163, 184, .14);
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 10px 12px;
          color: var(--text);
          display: grid;
          gap: 4px;
          cursor: pointer;
        }
        .tree-item.active { border-color: rgba(102, 217, 239, .45); background: rgba(102, 217, 239, .08); }
        .tree-item small { color: var(--muted); }
        .tree-kind { margin-right: 6px; }
        .editor-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .editor-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, .16);
          background: rgba(255,255,255,0.03);
        }
        .editor-tab.active { border-color: rgba(102, 217, 239, .45); background: rgba(102, 217, 239, .08); }
        .editor-tab-btn, .editor-close {
          border: none;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 999px;
        }
        .editor-close { color: var(--muted); }
        .editor-surface {
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, .16);
          background: rgba(255,255,255,0.03);
          padding: 16px;
          display: grid;
          gap: 12px;
        }
        .editor-meta, .editor-actions-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .editor-line, .zone-map-card {
          border: 1px solid rgba(148, 163, 184, .14);
          background: rgba(255,255,255,0.02);
          border-radius: 14px;
          padding: 10px 12px;
          color: var(--muted);
        }
        .zone-map-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .zone-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .zone-chip {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(139, 92, 246, .1);
          border: 1px solid rgba(139, 92, 246, .2);
          color: #d8c4ff;
          font-size: 12px;
        }
        .resize-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .resize-control { display: grid; gap: 8px; color: var(--muted); font-size: 14px; }
        .preview-banner, .spotlight-header {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }
        .preview-chip {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(139, 92, 246, .12);
          border: 1px solid rgba(139, 92, 246, .28);
          color: #d8c4ff;
          font-size: 13px;
        }
        .preview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .mini-card, .spot-card {
          border-radius: 20px;
          border: 1px solid rgba(148,163,184,.15);
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
          padding: 18px;
          min-height: 110px;
          display: grid;
          gap: 8px;
        }
        .mini-card strong { font-size: 24px; }
        .mini-card span, .mini-card small { color: var(--muted); }
        .mini-card.tall { grid-row: span 2; }
        .mini-card.wide { grid-column: span 2; }
        .spotlight-stage { display: flex; justify-content: center; }
        .spot-card.large { width: min(100%, 740px); min-height: 360px; }
        .fake-window-bar { display: flex; gap: 6px; }
        .fake-window-bar span { width: 10px; height: 10px; border-radius: 999px; background: rgba(255,255,255,.18); }
        .spot-body { display: grid; grid-template-columns: 110px 1fr; gap: 14px; flex: 1; min-height: 250px; }
        .spot-sidebar, .spot-box, .spot-line, .wire-topbar, .wire-sidebar, .wire-inspector, .wire-row, .wire-split > div {
          border-radius: 14px;
          background: rgba(255,255,255,.06);
          border: 1px dashed rgba(148, 163, 184, .2);
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .spot-sidebar { min-height: 100%; }
        .spot-main { display: grid; gap: 12px; }
        .spot-line { height: 16px; justify-content: flex-start; }
        .spot-line.long { width: 78%; }
        .spot-line.medium { width: 54%; }
        .spot-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
        .spot-box { min-height: 120px; }
        .wireframe-shell { display: grid; gap: 10px; }
        .wire-body { display: grid; grid-template-columns: ${layoutState.sidebar ? "150px 1fr" : "1fr"}${layoutState.inspector ? " 150px" : ""}; gap: 10px; }
        .wire-main { display: grid; gap: 10px; }
        .wire-topbar { min-height: 54px; }
        .wire-sidebar, .wire-inspector { min-height: 220px; }
        .wire-row { min-height: 70px; }
        .wire-row.large { min-height: 180px; }
        .wire-split { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .result-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .saved-card {
          border-radius: 18px;
          padding: 14px;
          border: 1px solid rgba(148,163,184,.12);
          background: rgba(255,255,255,.035);
          display: grid;
          gap: 8px;
        }
        
        .generated-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
        .generated-block {
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, .16);
          background: rgba(255,255,255,.035);
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .generated-hero-shell, .generated-empty, .generated-form, .generated-table, .generated-chat, .generated-activity, .generated-kanban, .generated-metric-row {
          display: grid;
          gap: 10px;
        }
        .generated-title-line, .generated-copy-line, .generated-metric-row > div, .generated-kanban > div, .generated-activity span, .generated-chat .bubble, .generated-form .field, .generated-form .button-line, .generated-table .row, .generated-empty .icon {
          border-radius: 12px;
          background: rgba(255,255,255,.07);
          border: 1px dashed rgba(148, 163, 184, .18);
        }
        .generated-title-line { height: 18px; width: 72%; }
        .generated-copy-line { height: 12px; width: 100%; }
        .generated-copy-line.short { width: 64%; }
        .generated-metric-row { grid-template-columns: repeat(3, 1fr); }
        .generated-metric-row > div { height: 76px; }
        .generated-kanban { grid-template-columns: repeat(3, 1fr); }
        .generated-kanban > div { min-height: 120px; }
        .generated-activity span { height: 18px; }
        .generated-chat .bubble { height: 34px; width: 72%; }
        .generated-chat .bubble.right { width: 56%; justify-self: end; }
        .generated-chat .bubble.short { width: 40%; }
        .generated-form .field { height: 42px; }
        .generated-form .button-line { height: 36px; width: 44%; }
        .generated-table .row { height: 28px; }
        .generated-table .row.header { height: 36px; }
        .generated-empty .icon { width: 52px; height: 52px; }
        .generated-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 12px 0; }
        .generated-live-card { display: grid; gap: 10px; }
        .generated-live-hero, .generated-empty-live { display: grid; gap: 8px; }
        .generated-live-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .metric-pill, .kanban-col, .table-live-head, .table-live-row, .activity-row, .live-bubble { border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); border-radius: 12px; padding: 8px 10px; }
        .metric-pill { display: grid; gap: 6px; }
        .generated-live-kanban { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .kanban-col { display: grid; gap: 8px; align-content: start; min-height: 120px; }
        .kanban-card { padding: 8px; border-radius: 10px; background: rgba(255,255,255,0.05); font-size: 12px; }
        .generated-live-list, .generated-live-chat, .generated-inline-form.vertical { display: grid; gap: 8px; }
        .generated-inline-form { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; }
        .live-bubble.user { justify-self: end; }
        .table-live-head, .table-live-row { display: grid; grid-template-columns: 1.4fr 1fr .8fr; gap: 8px; font-size: 12px; }

        .view-switcher, .workspace-command-loop, .workspace-focus-grid, .panel-group {
          display: grid;
          gap: 12px;
        }
        .view-switcher { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .view-card {
          border: 1px solid rgba(148, 163, 184, .16);
          background: rgba(255,255,255,0.03);
          border-radius: 18px;
          padding: 14px;
          display: grid;
          gap: 8px;
          cursor: pointer;
          transition: transform .15s ease, border-color .15s ease, background .15s ease;
        }
        .view-card.active { border-color: rgba(102, 217, 239, .55); background: rgba(102, 217, 239, .09); }
        .view-card:hover { transform: translateY(-1px); }
        .workspace-command-loop {
          grid-template-columns: 1.35fr .9fr .9fr .9fr;
          align-items: stretch;
        }
        .loop-step {
          border: 1px solid rgba(148, 163, 184, .14);
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 12px;
          display: grid;
          gap: 8px;
        }
        .loop-index {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 217, 239, .12);
          color: var(--accent);
          font-size: 12px;
          font-weight: 700;
        }
        .workspace-focus-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .focus-stat {
          border: 1px solid rgba(148, 163, 184, .14);
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 12px;
          display: grid;
          gap: 6px;
        }
        .focus-stat strong { font-size: 20px; }
        .hidden-panel-note {
          border: 1px dashed rgba(148, 163, 184, .18);
          border-radius: 16px;
          padding: 12px;
          color: var(--muted);
          background: rgba(255,255,255,0.02);
          display: grid;
          gap: 8px;
        }
        .zone-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .footer-note { margin-top: 18px; color: var(--muted); font-size: 13px; text-align: center; }
        .pro-shell-grid {
          align-items: start;
        }
        .pro-sidebar {
          position: sticky;
          top: 18px;
        }
        .dock-list {
          display: grid;
          gap: 10px;
        }
        .dock-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255,255,255,0.02);
          color: inherit;
          padding: 12px;
          cursor: pointer;
          transition: 160ms ease;
        }
        .dock-item:hover,
        .dock-item.active {
          border-color: rgba(56, 189, 248, 0.45);
          background: rgba(56, 189, 248, 0.08);
          transform: translateY(-1px);
        }
        .dock-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.18);
          font-size: 18px;
          flex: 0 0 auto;
        }
        .dock-copy {
          display: grid;
          gap: 4px;
          min-width: 0;
        }
        .dock-copy small {
          color: var(--muted);
        }
        .focus-hero {
          border: 1px solid rgba(56, 189, 248, 0.22);
          border-radius: 22px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.78));
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          box-shadow: 0 16px 50px rgba(2, 8, 23, 0.35);
        }
        .focus-hero h2 {
          margin: 6px 0 4px;
          font-size: 24px;
        }
        .focus-hero p {
          margin: 0;
          color: var(--muted);
        }
        .focus-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .focus-switcher {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .focus-pill {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255,255,255,0.03);
          color: inherit;
          padding: 10px 14px;
          display: inline-flex;
          gap: 8px;
          align-items: center;
          cursor: pointer;
        }
        .focus-pill.active {
          border-color: rgba(96, 165, 250, 0.45);
          background: rgba(96, 165, 250, 0.12);
        }
        .focus-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.95fr);
          gap: 16px;
          align-items: start;
        }
        .focus-secondary-stack {
          display: grid;
          gap: 16px;
        }
        .pro-main-workspace {
          min-width: 0;
        }
        .pro-inspector-shell {
          position: sticky;
          top: 18px;
        }

        .premium-command-shell {
          animation: shellFloatIn .45s ease;
        }
        .premium-command-bar {
          position: relative;
          overflow: hidden;
        }
        .premium-command-bar::before {
          content: "";
          position: absolute;
          inset: -1px;
          background: linear-gradient(120deg, rgba(102,217,239,0.0), rgba(102,217,239,0.12), rgba(139,92,246,0.0));
          transform: translateX(-55%);
          animation: sheenSweep 5s linear infinite;
          pointer-events: none;
        }
        .command-input-main {
          transition: box-shadow .18s ease, border-color .18s ease, transform .18s ease, background .18s ease;
        }
        .command-input-main:focus {
          border-color: rgba(102, 217, 239, 0.55);
          box-shadow: 0 0 0 4px rgba(102, 217, 239, 0.12), 0 18px 45px rgba(2, 8, 23, 0.28);
          transform: translateY(-1px);
          background: rgba(255,255,255,0.06);
        }
        .premium-execution-strip {
          padding: 2px 0;
        }
        .execution-step {
          transition: transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
        }
        .execution-step.active {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(8, 15, 28, 0.22);
        }
        .premium-history-pill-row {
          gap: 12px;
        }
        .history-pill {
          transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
        }
        .history-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(2, 8, 23, 0.2);
        }
        .premium-canvas-stage {
          animation: stageFadeIn .35s ease;
        }
        .premium-focus-hero {
          position: relative;
          overflow: hidden;
        }
        .premium-focus-hero::after {
          content: "";
          position: absolute;
          inset: auto -40% -40% auto;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12), rgba(56, 189, 248, 0));
          pointer-events: none;
        }
        .premium-canvas-surface {
          background:
            radial-gradient(circle at top, rgba(19, 42, 74, 0.7), rgba(8, 16, 29, 0.9) 58%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
        }
        .premium-canvas-surface::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: linear-gradient(180deg, rgba(255,255,255,.18), transparent 70%);
          pointer-events: none;
        }
        .interactive-surface {
          position: relative;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease;
          border-radius: 22px;
        }
        .interactive-surface:hover {
          transform: translateY(-2px);
        }
        .interactive-surface.selected {
          box-shadow: 0 22px 50px rgba(2, 8, 23, 0.28), 0 0 0 1px rgba(102, 217, 239, 0.24) inset;
        }
        .interactive-surface.selected::after {
          content: "Selected";
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: .04em;
          color: #dff9ff;
          border: 1px solid rgba(102, 217, 239, 0.35);
          background: rgba(7, 16, 29, 0.82);
          pointer-events: none;
        }
        .dock-list-premium {
          gap: 12px;
        }
        .dock-item {
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }
        .dock-item:hover,
        .dock-item.active {
          box-shadow: 0 12px 26px rgba(2, 8, 23, 0.18);
        }
        .premium-inspector-shell {
          gap: 10px;
        }
        .premium-inspector-shell .context-card {
          padding: 12px;
          gap: 10px;
          background: rgba(255,255,255,0.025);
        }
        .inspector-tabs-dense {
          gap: 6px;
          margin-bottom: 6px;
        }
        .inspector-tabs-dense .tab-btn {
          padding: 8px 11px;
          font-size: 12px;
        }
        .panel-card {
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }
        .panel-card:hover {
          border-color: rgba(102, 217, 239, 0.18);
          box-shadow: 0 10px 24px rgba(2, 8, 23, 0.16);
        }
        @keyframes shellFloatIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stageFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sheenSweep {
          0% { transform: translateX(-55%); }
          100% { transform: translateX(160%); }
        }

        @media (max-width: 1180px) {
          .shell-grid { grid-template-columns: 1fr; }
          .view-switcher, .workspace-command-loop, .workspace-focus-grid { grid-template-columns: 1fr; }
          .with-split .main-workspace,
          .focus .main-workspace,
          .dashboard .main-workspace,
          .classic .main-workspace { grid-template-columns: 1fr; }
          .brain-grid, .status-grid, .stats-grid, .result-grid, .preview-grid { grid-template-columns: 1fr 1fr; }
          .focus-layout-grid { grid-template-columns: 1fr; }
          .focus-hero { flex-direction: column; align-items: flex-start; }
          .simple-mode-grid, .simple-hero { grid-template-columns: 1fr; }
          .wire-body { grid-template-columns: 1fr; }
          .appliance-row { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 760px) {
          .topbar, .preview-banner, .spotlight-header, .panel-head { flex-direction: column; }
          .brain-grid, .status-grid, .stats-grid, .result-grid, .preview-grid, .saved-grid { grid-template-columns: 1fr; }
          .appliance-row { grid-template-columns: 1fr; }
          .spot-body { grid-template-columns: 1fr; }
          .spot-grid, .wire-split { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="topbar">
        <div className="brand">
          <span className="eyebrow">Personal AI Builder</span>
          <h1>Builder Command OS</h1>
          <p>Now with a calmer canvas, premium motion cues, and a denser contextual inspector.</p>
        </div>
        <div className="topbar-actions">
          <div className="mode-toggle">
            <button className={`ghost-pill ${uiMode === "simple" ? "active" : ""}`} onClick={() => setUiMode("simple")}>Simple</button>
            <button className={`ghost-pill ${uiMode === "pro" ? "active" : ""}`} onClick={() => setUiMode("pro")}>Pro</button>
          </div>
          <span className={`badge ${apiStatus === "connected" ? "ok" : apiStatus === "offline" ? "off" : "warn"}`}>
            API: {apiStatus}
          </span>
          <span className="badge">Layout: {getLayoutLabel(layoutState)}</span>
          <span className="badge">Modules: {activeModules.length}</span>
          <button className="pill primary" onClick={() => runBuilderBrain()}>
            Run Builder Brain
          </button>
          <button className="ghost-pill" onClick={resetBuilder}>
            Reset Workspace
          </button>
        </div>
      </div>

      {uiMode === "simple" ? (
        <>
          <div className="command-bar-shell premium-command-shell">
            <div className="command-bar premium-command-bar">
              <div className="command-bar-main">
                <div className="command-bar-label">
                  <span>Simple Mode · one command, one preview, less noise</span>
                  <span>{selectedEntity?.label || "Builder"} selected</span>
                </div>
                <div className="command-input-shell">
                  <input
                    ref={commandInputRef}
                    className={`command-input-main ${commandPulse ? "pulse" : ""}`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") executeCommandFlow(runBuilderBrain); }}
                    placeholder="make dashboard"
                  />
                  <button className="pill primary" onClick={() => executeCommandFlow(runBuilderBrain)}>Run Builder Brain</button>
                  <button className="ghost-pill" onClick={() => setUiMode("pro")}>Open Pro</button>
                </div>
              </div>
            </div>
            <div className="command-suggestions" style={{ marginTop: 10 }}>
              {["make dashboard", "make dev workspace", "make crm dashboard", "materialize files", "regenerate routes"].map((sample) => (
                <button key={sample} className="suggestion-chip" onClick={() => setPrompt(sample)}>{sample}</button>
              ))}
            </div>
            <div className="execution-strip premium-execution-strip">
              <div className={`execution-step ${["parsing","mutating","updating","complete"].includes(commandPhase) ? "active" : ""}`}>
                <span>1</span>
                <div><strong>Parsing</strong><small>Read the command.</small></div>
              </div>
              <div className={`execution-step ${["mutating","updating","complete"].includes(commandPhase) ? "active" : ""}`}>
                <span>2</span>
                <div><strong>Mutating</strong><small>Apply layout and builder changes.</small></div>
              </div>
              <div className={`execution-step ${["updating","complete"].includes(commandPhase) ? "active" : ""}`}>
                <span>3</span>
                <div><strong>Updating</strong><small>Refresh preview and files.</small></div>
              </div>
              <div className={`execution-step ${commandPhase === "complete" ? "active" : ""}`}>
                <span>4</span>
                <div><strong>Ready</strong><small>{commandFlowLabel}</small></div>
              </div>
            </div>
          </div>
          {renderSimpleModeSurface()}
        </>
      ) : (
        <>
      <Panel
        title="Workspace Modes"
        subtitle="Switch the surface without losing features. This is the big experience redesign: build, test, and blueprint now have their own focus."
      >
        <div className="view-switcher">
          {Object.entries(WORKSPACE_VIEWS).map(([key, view]) => (
            <button
              key={key}
              className={`view-card ${workspaceView === key ? "active" : ""}`}
              onClick={() => { setWorkspaceView(key); setSelectedEntity({ type: "mode", id: key, label: view.label }); }}
            >
              <div className="module-top">
                <strong>{view.label}</strong>
                <span className="tag">{key}</span>
              </div>
              <div className="muted">{view.subtitle}</div>
              <div className="zone-chip-row">
                <span className="zone-chip">{view.visiblePanels.length} focus panels</span>
                <span className="zone-chip">{workspaceView === key ? "active" : "ready"}</span>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        title="Primary Action Loop"
        subtitle="The builder should feel like a system that reshapes itself. Keep the command flow in the center."
        compact
      >
        <div className="workspace-command-loop">
          <div className="loop-step">
            <span className="loop-index">1</span>
            <strong>Type command</strong>
            <div className="muted">{prompt || "Try: make ide layout add sidebar add inspector"}</div>
          </div>
          <div className="loop-step">
            <span className="loop-index">2</span>
            <strong>Builder mutates</strong>
            <div className="muted">{builderInsight}</div>
          </div>
          <div className="loop-step">
            <span className="loop-index">3</span>
            <strong>Layout updates</strong>
            <div className="muted">{getLayoutLabel(layoutState)}</div>
          </div>
          <div className="loop-step">
            <span className="loop-index">4</span>
            <strong>Preview reflects it</strong>
            <div className="muted">{activeWorkspaceView.label}</div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Workspace Focus"
        subtitle="A quick summary of what matters in the current mode."
        compact
      >
        <div className="workspace-focus-grid">
          <div className="focus-stat">
            <span className="muted">Current mode</span>
            <strong>{activeWorkspaceView.label}</strong>
            <span className="muted">{activeWorkspaceView.subtitle}</span>
          </div>
          <div className="focus-stat">
            <span className="muted">Visible panels</span>
            <strong>{visiblePanelIds.length}</strong>
            <span className="muted">Hidden items stay available in other modes.</span>
          </div>
          <div className="focus-stat">
            <span className="muted">Latest command</span>
            <strong>{commandHistory?.[0]?.prompt ? "Applied" : "Waiting"}</strong>
            <span className="muted">{commandHistory?.[0]?.prompt || "No command yet in this session."}</span>
          </div>
        </div>
      </Panel>

      <div className="command-bar-shell premium-command-shell">
        <div className="command-bar premium-command-bar">
          <div className="command-bar-main">
            <div className="command-bar-label">
              <span>Command OS · keep the mutation loop in the center</span>
              <span>{selectedEntity?.label || activeFocusConfig.label} selected</span>
            </div>
            <div className="command-input-shell">
              <input
                ref={commandInputRef}
                className={`command-input-main ${commandPulse ? "pulse" : ""}`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") executeCommandFlow(runBuilderBrain); }}
                placeholder="make dev workspace add auth generate routes starter files materialize files"
              />
              <button className="pill primary" onClick={() => executeCommandFlow(runBuilderBrain)}>Run Builder Brain</button>
              <button className="ghost-pill" onClick={() => executeCommandFlow(handleMutationCommand, prompt || "make ide layout")}>Apply current command</button>
            </div>
          </div>
          <div className="command-bar-actions">
            <button className="mini-btn" onClick={() => setPrompt("make ide layout")}>IDE layout</button>
            <button className="mini-btn" onClick={() => setPrompt("materialize files")}>Materialize</button>
            <button className="mini-btn" onClick={() => setPrompt("regenerate routes")}>Routes</button>
          </div>
        </div>
        <div className="command-suggestions" style={{ marginTop: 10 }}>
          {["make crm dashboard", "make dev workspace", "move results to inspector", "materialize files", "regenerate all"].map((sample) => (
            <button key={sample} className="suggestion-chip" onClick={() => setPrompt(sample)}>{sample}</button>
          ))}
        </div>
        {showSuggestionDeck && !commandHistory.length ? (
          <div className="welcome-deck">
            <div className="welcome-card">
              <div className="eyebrow">Welcome to Builder AI</div>
              <h3>Describe what you want. The workspace should reshape itself.</h3>
              <p className="muted">Start with a page intent, a layout command, or a scaffold command. The builder will mutate the UI, blueprint, and file tabs from one command line.</p>
              <div className="suggestion-grid">
                {[
                  "make dev workspace",
                  "make crm dashboard",
                  "make saas landing",
                  "add chat panel",
                  "materialize files",
                  "regenerate routes"
                ].map((sample) => (
                  <button
                    key={`welcome-${sample}`}
                    className="suggestion-card"
                    onClick={() => {
                      setPrompt(sample);
                      setSelectedEntity({ type: "suggestion", id: sample, label: sample });
                    }}
                  >
                    <strong>{sample}</strong>
                    <span className="muted">Click to load this command</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <div className="execution-strip premium-execution-strip">
          <div className={`execution-step ${["parsing","mutating","updating","complete"].includes(commandPhase) ? "active" : ""}`}>
            <span>1</span>
            <div>
              <strong>Parsing intent</strong>
              <small>Understand the app type and command scope.</small>
            </div>
          </div>
          <div className={`execution-step ${["mutating","updating","complete"].includes(commandPhase) ? "active" : ""}`}>
            <span>2</span>
            <div>
              <strong>Applying mutations</strong>
              <small>Layout, modules, and generated blocks change here.</small>
            </div>
          </div>
          <div className={`execution-step ${["updating","complete"].includes(commandPhase) ? "active" : ""}`}>
            <span>3</span>
            <div>
              <strong>Updating workspace</strong>
              <small>Files, tabs, blueprint, and inspector catch up.</small>
            </div>
          </div>
          <div className={`execution-step ${commandPhase === "complete" ? "active" : ""}`}>
            <span>4</span>
            <div>
              <strong>Ready</strong>
              <small>{commandFlowLabel}</small>
            </div>
          </div>
        </div>
        {commandHistory.length ? (
          <div className="history-pill-row premium-history-pill-row">
            {commandHistory.slice(0, 6).map((item) => (
              <button
                key={item.id}
                className="history-pill"
                onClick={() => {
                  setPrompt(item.prompt);
                  setSelectedEntity({ type: "command", id: item.id, label: item.prompt });
                }}
              >
                {item.prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isCommandPaletteOpen ? (
        <div className="command-palette-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
          <div className="command-palette-card" onClick={(event) => event.stopPropagation()}>
            <div className="module-top">
              <strong>Command Palette</strong>
              <span className="tag">Ctrl/Cmd + K</span>
            </div>
            <input
              ref={commandInputRef}
              className="command-palette-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a builder command and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter" && prompt.trim()) {
                  handleMutationCommand(prompt);
                  setIsCommandPaletteOpen(false);
                }
              }}
            />
            <div className="palette-grid">
              <div className="palette-section">
                <div className="muted">Suggested commands</div>
                <div className="palette-chip-grid">
                  {SUGGESTED_COMMANDS.slice(0, 8).map((sample) => (
                    <button
                      key={`palette-${sample}`}
                      className="suggestion-chip"
                      onClick={() => setPrompt(sample)}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
              <div className="palette-section">
                <div className="muted">Recent commands</div>
                <div className="palette-list">
                  {(commandHistory.slice(0, 6).length ? commandHistory.slice(0, 6) : [{ id: "empty", prompt: "No history yet. Run your first command." }]).map((item) => (
                    <button
                      key={`recent-${item.id}`}
                      className="palette-list-item"
                      onClick={() => {
                        if (item.prompt) setPrompt(item.prompt);
                      }}
                    >
                      <strong>{item.prompt}</strong>
                      <span className="muted">Load into command bar</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="command-row">
              <button className="pill primary" onClick={() => { handleMutationCommand(prompt); setIsCommandPaletteOpen(false); }} disabled={!prompt.trim()}>Execute command</button>
              <button className="ghost-pill" onClick={() => setIsCommandPaletteOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="shell-grid pro-shell-grid">
        {layoutState.sidebar ? (
          <aside className={`sidebar pro-sidebar ${sidebarCompact ? "compact" : ""}`}>
            <div className="zone-title">
              <strong>Launcher</strong>
              <span className="tag">{availableFocusViews.length} views</span>
            </div>
            <div className="sidebar-toolbar">
              <span className="muted">{sidebarCompact ? "icon dock" : "launcher dock"}</span>
              <button className="mini-btn" onClick={() => setSidebarCompact((prev) => !prev)}>
                {sidebarCompact ? "Expand" : "Compact"}
              </button>
            </div>
            <div className="dock-list dock-list-premium">
              {availableFocusViews.map(([key, config]) => (
                <button
                  key={key}
                  className={`dock-item ${activeFocusView === key ? "active" : ""}`}
                  onClick={() => selectFocusView(key)}
                  title={config.description}
                >
                  <span className="dock-icon">{config.icon}</span>
                  {!sidebarCompact ? (
                    <span className="dock-copy">
                      <strong>{config.label}</strong>
                      <small>{config.description}</small>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {!sidebarCompact ? (
              <div className="context-card">
                <div className="module-top">
                  <strong>Selection</strong>
                  <span className="tag">live</span>
                </div>
                <div className="muted">Main canvas follows the selected view. Inspector follows the selected entity.</div>
                <div className="selection-strip">
                  <span className="selection-chip active">{selectedEntity?.label || activeFocusConfig.label}</span>
                  <span className="selection-chip">{activeWorkspaceView.label}</span>
                </div>
              </div>
            ) : null}
            <button className={`layout-handle sidebar ${resizeDrag?.type === "sidebar" ? "dragging" : ""}`} onMouseDown={() => startResize("sidebar")} title="Drag to resize sidebar">⋮⋮</button>
          </aside>
        ) : null}

        <main className="main-workspace pro-main-workspace">
          <div className="canvas-stage premium-canvas-stage">
            <div className="focus-hero premium-focus-hero">
              <div>
                <div className="eyebrow">Canvas mode</div>
                <h2>{activeFocusConfig.icon} {activeFocusConfig.label}</h2>
                <p>{activeFocusConfig.description}</p>
              </div>
              <div className="focus-hero-meta">
                <span className="badge">mode {activeWorkspaceView.label}</span>
                <span className="badge">selected {selectedEntity?.label || activeFocusConfig.label}</span>
              </div>
            </div>

            <div className="focus-switcher selection-strip">
              {availableFocusViews.map(([key, config]) => (
                <button
                  key={key}
                  className={`focus-pill ${activeFocusView === key ? "active" : ""}`}
                  onClick={() => selectFocusView(key)}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </div>

            <div className="canvas-surface premium-canvas-surface">
              <div className="canvas-shell-badge">
                <span>Canvas</span>
                <span>{getPanelLabel(activeFocusConfig.panelId)}</span>
              </div>
              <div className="canvas-grid">
                <div className={`canvas-primary interactive-surface ${selectedEntity?.id === activeFocusConfig.panelId ? "selected" : ""}`} onClick={() => selectPanelEntity(activeFocusConfig.panelId, activeFocusConfig.label)}>
                  {renderPanelById(activeFocusConfig.panelId)}
                </div>
                <button className={`layout-handle split ${resizeDrag?.type === "split" ? "dragging" : ""}`} onMouseDown={() => startResize("split")} title="Drag to resize canvas split">⋮⋮</button>
                <div className="canvas-overlay-stack">
                  {companionPanels.length ? companionPanels.map((panelId) => (
                    <div key={`companion-${panelId}`} className={`interactive-surface ${selectedEntity?.id === panelId ? "selected" : ""}`} onClick={() => selectPanelEntity(panelId)}>
                      {renderPanelById(panelId)}
                    </div>
                  )) : (
                    <Panel title="Floating tools" subtitle="Secondary surfaces appear here when the selected view has companions." compact>
                      <div className="muted">Switch from Builder to Preview, Files, Blocks, or Results to change the overlay stack.</div>
                    </Panel>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {layoutState.inspector ? (
          <aside className="stack inspector-shell pro-inspector-shell premium-inspector-shell">
            <div className="zone-title">
              <strong>Context Inspector</strong>
              <span className="tag">{inspectorContextPanels.length} tabs</span>
            </div>
            <div className="context-card">
              <div className="module-top">
                <strong>{selectedEntity?.label || activeFocusConfig.label}</strong>
                <span className="tag">{selectedEntity?.type || "view"}</span>
              </div>
              <div className="muted">Inspector follows your current selection, not just the layout. Use the launcher or click a canvas panel to change context.</div>
            </div>
            <div className="inspector-tabs inspector-tabs-dense">
              {inspectorContextPanels.map((panelId) => (
                <button
                  key={panelId}
                  className={`tab-btn ${inspectorTab === panelId ? "active" : ""}`}
                  onClick={() => { setInspectorTab(panelId); selectPanelEntity(panelId); }}
                >
                  {getPanelLabel(panelId)}
                </button>
              ))}
            </div>
            <div onClick={() => selectPanelEntity(inspectorTab)}>{renderPanelById(inspectorTab)}</div>
            <button className={`layout-handle inspector ${resizeDrag?.type === "inspector" ? "dragging" : ""}`} onMouseDown={() => startResize("inspector")} title="Drag to resize inspector">⋮⋮</button>
          </aside>
        ) : null}
      </div>

      <div className="footer-note">
        Builder brain, mutation log, export flow, local saves, affiliate block, blueprint engine, and backend battery planner are still here. The difference now is experience: the workspace is organized by mode, the command loop is visible, and non-focus panels stop flooding the screen.
      </div>

        </>
      )}    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";

const API_BASE = "https://builder-backend-092s.onrender.com";
const STORAGE_KEYS = {
  results: "builder_saved_results_v4",
  commandHistory: "builder_command_history_v4",
  mutationLog: "builder_mutation_log_v4",
  layout: "builder_layout_state_v4",
  modules: "builder_active_modules_v4",
  featureState: "builder_feature_state_v4",
  prompt: "builder_last_prompt_v4",
  reportCounter: "builder_report_counter_v4",
  uiMode: "builder_ui_mode_v1",
  simpleFlowStep: "builder_simple_flow_step_v1",
  simpleDraft: "builder_simple_draft_v1",
  mutationVersions: "builder_mutation_versions_v1",
  systemPlanner: "builder_system_planner_v1",
  projectId: "builder_project_id_v1",
  orchestrationHistory: "builder_orchestration_history_v1",
  builderChatHistory: "builder_chat_history_v1",
  builderChatDraft: "builder_chat_draft_v1",
  builderProjectMemory: "builder_project_memory_v1",
  builderAssistantPrefs: "builder_assistant_prefs_v1",
  fullStackScope: "builder_full_stack_scope_v1",
  chatReplyPreference: "builder_chat_reply_preference_v1",
  rvTemplate: "builder_rv_template_v1",
  rvCampingProfile: "builder_rv_camping_profile_v1",
  generatedAppMonetization: "builder_generated_app_monetization_v1",
  generatedFileTree: "builder_generated_file_tree_v1",
  generatedRoutes: "builder_generated_routes_v1",
  generatedComponents: "builder_generated_components_v1",
  generatedCodeFiles: "builder_generated_code_files_v1",
  selectedGeneratedFilePath: "builder_selected_generated_file_path_v1",
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
];

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
  panels: {
    sidebar: ["builder", "results", "modules", "mutations"],
    mainTop: ["brain", "command", "quickActions"],
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
  "make it dense",
  "return to classic layout",
  "focus preview",
];
const SIMPLE_STARTERS = [
  {
    key: "assistant",
    label: "AI Assistant",
    badge: "Guided",
    description: "Chat, tools, and a cleaner assistant workspace.",
    seed: "assistant app with split layout and live preview",
    goalPlaceholder: "Answer questions, call tools, and guide the user",
  },
  {
    key: "dashboard",
    label: "Admin Dashboard",
    badge: "Popular",
    description: "Data-first shell with navigation, cards, and inspector.",
    seed: "admin dashboard with sidebar and inspector",
    goalPlaceholder: "Show metrics, alerts, and actions in one place",
  },
  {
    key: "tool",
    label: "Tool / Calculator",
    badge: "Fast",
    description: "Focused tool flow with inputs, results, and export path.",
    seed: "tool app with split layout and calculator",
    goalPlaceholder: "Calculate, estimate, or transform something useful",
  },
  {
    key: "content",
    label: "Content App",
    badge: "Studio",
    description: "Writing or editing flow with notes and preview.",
    seed: "content app with notes panel and split layout",
    goalPlaceholder: "Write, edit, organize, and preview content",
  },
  {
    key: "custom",
    label: "Custom Idea",
    badge: "Open",
    description: "Start from your idea but still get guided onboarding.",
    seed: "custom builder workspace",
    goalPlaceholder: "Describe the app you want to create",
  },
];
const RV_SMART_TEMPLATES = [
  {
    key: "rv_diagnostics",
    label: "RV Diagnostics",
    badge: "Flagship",
    description: "Scan-driven diagnostics app with login, saved scan history, dashboard, and AI help.",
    starterKey: "assistant",
    style: "Builder Pro",
    systems: ["auth", "dashboard", "storage", "ai_tools", "tools"],
    prompt: "build an RV diagnostics app with login, saved scan history, dashboard, AI scan assistant, and technician-friendly results",
    goal: "Help RV owners scan labels, save diagnostic reports, and review problems from one dashboard",
  },
  {
    key: "rv_power",
    label: "Battery & Solar Planner",
    badge: "Affiliate",
    description: "Battery planner with appliance inputs, saved plans, solar sizing, and affiliate-ready recommendations.",
    starterKey: "tool",
    style: "Dark glass",
    systems: ["dashboard", "storage", "tools", "content"],
    prompt: "build an RV battery and solar planner with saved plans, appliance inputs, dashboard cards, affiliate suggestions, and export report",
    goal: "Calculate battery and solar setups for RV trips and recommend the right gear",
  },
  {
    key: "rv_maintenance",
    label: "Maintenance Tracker",
    badge: "Retention",
    description: "Service reminders, maintenance history, dashboard, and protected account pages for RV owners.",
    starterKey: "dashboard",
    style: "Clean SaaS",
    systems: ["auth", "dashboard", "storage", "settings"],
    prompt: "build an RV maintenance tracker with login, service reminders, maintenance history, profile settings, and dashboard overview",
    goal: "Keep RV owners coming back with reminders, history, and organized service records",
  },
  {
    key: "rv_trip",
    label: "Campground & Trip Planner",
    badge: "Lifestyle",
    description: "Trip planning workspace with campground flow, saved itineraries, and member dashboard.",
    starterKey: "dashboard",
    style: "Minimal",
    systems: ["auth", "dashboard", "storage", "tools", "content"],
    prompt: "build an RV trip planner with login, saved itineraries, campground tools, route dashboard, and trip notes",
    goal: "Plan RV trips, save campground ideas, and keep trip notes in one place",
  },
];

function getRvTemplateByKey(key) {
  return RV_SMART_TEMPLATES.find((item) => item.key === key) || RV_SMART_TEMPLATES[0];
}

const RV_CAMPING_PROFILES = [
  {
    key: "weekend",
    label: "Weekend",
    demandMultiplier: 1,
    solarMultiplier: 1,
    affiliateFocus: "starter",
    note: "Balanced weekend load with moderate off-grid demand.",
  },
  {
    key: "boondock",
    label: "Boondock",
    demandMultiplier: 1.2,
    solarMultiplier: 1.15,
    affiliateFocus: "off-grid",
    note: "Extra reserve for longer boondocking and saved energy margin.",
  },
  {
    key: "summer",
    label: "Hot Weather",
    demandMultiplier: 1.35,
    solarMultiplier: 1.1,
    affiliateFocus: "cooling",
    note: "Higher fan and cooling demand for hotter campground days.",
  },
  {
    key: "shoulder",
    label: "Shoulder Season",
    demandMultiplier: 0.92,
    solarMultiplier: 0.95,
    affiliateFocus: "efficient",
    note: "Lower overall demand with milder temperatures.",
  },
];

const RV_AFFILIATE_ENGINE = [
  {
    key: "lifepo4_100",
    title: "100Ah LiFePO4 Battery",
    category: "battery",
    fit: "Great first upgrade for lighter weekend loads and maintenance-free use.",
    triggers: { minBatteryAh: 90, maxBatteryAh: 170 },
  },
  {
    key: "lifepo4_200",
    title: "200Ah LiFePO4 Battery Bank",
    category: "battery",
    fit: "Better when your planner starts pushing beyond a basic overnight setup.",
    triggers: { minBatteryAh: 170 },
  },
  {
    key: "solar_200",
    title: "200W Solar Starter Kit",
    category: "solar",
    fit: "Good entry kit for moderate RV charging needs and lighter appliance mixes.",
    triggers: { minSolarWatts: 180, maxSolarWatts: 360 },
  },
  {
    key: "solar_400",
    title: "400W Solar Expansion Kit",
    category: "solar",
    fit: "Makes more sense for boondocking, hot weather, and higher daily loads.",
    triggers: { minSolarWatts: 360 },
  },
  {
    key: "inverter_2000",
    title: "2000W Pure Sine Inverter",
    category: "inverter",
    fit: "Good when laptops, TVs, and medium AC appliances need clean power.",
    triggers: { minInverterWatts: 1500, maxInverterWatts: 2400 },
  },
  {
    key: "inverter_3000",
    title: "3000W Pure Sine Inverter",
    category: "inverter",
    fit: "Best for microwave-heavy or high-surge RV setups.",
    triggers: { minInverterWatts: 2400 },
  },
  {
    key: "monitor",
    title: "Battery Monitor + Shunt",
    category: "monitor",
    fit: "Helps RV owners actually understand battery usage and stop guessing.",
    triggers: { always: true },
  },
  {
    key: "charger",
    title: "Smart Converter / Charger",
    category: "charger",
    fit: "Useful when upgrading chemistry or tightening charging performance.",
    triggers: { templateKeys: ["rv_power", "rv_maintenance"], focus: ["off-grid", "starter"] },
  },
];

function getRvCampingProfileByKey(key) {
  return RV_CAMPING_PROFILES.find((item) => item.key === key) || RV_CAMPING_PROFILES[0];
}

function estimateRvIntelligence({ appliances = [], batteryVoltage = 12, autonomyDays = 1, sunHours = 4, systemLoss = 0.2, templateKey = "rv_power", campingProfileKey = "weekend" }) {
  const profile = getRvCampingProfileByKey(campingProfileKey);
  const dailyWh = appliances.reduce((sum, item) => sum + (Number(item?.watts || 0) * Number(item?.hours || 0)), 0);
  const adjustedDailyWh = dailyWh * (1 + Number(systemLoss || 0)) * profile.demandMultiplier;
  const batteryAh = Number((((adjustedDailyWh * Math.max(Number(autonomyDays || 1), 1)) / Math.max(Number(batteryVoltage || 12), 1))).toFixed(1));
  const solarWatts = Number(((adjustedDailyWh / Math.max(Number(sunHours || 4), 1)) * profile.solarMultiplier).toFixed(1));
  const peakWatts = appliances.reduce((maxValue, item) => Math.max(maxValue, Number(item?.watts || 0)), 0);
  const inverterWatts = Math.max(1000, Math.ceil((peakWatts * 1.35) / 250) * 250);
  const batteryTier = batteryAh >= 280 ? "Heavy off-grid" : batteryAh >= 170 ? "Strong weekend/boondock" : batteryAh >= 100 ? "Solid starter" : "Light starter";
  const solarTier = solarWatts >= 550 ? "Roof-ready array" : solarWatts >= 300 ? "Mid-size solar" : "Starter solar";
  const estimatedCostLow = Math.round((batteryAh * 2.1) + (solarWatts * 1.05) + (inverterWatts * 0.18));
  const estimatedCostHigh = Math.round((batteryAh * 3.5) + (solarWatts * 1.9) + (inverterWatts * 0.32));
  const batteryRecommendation = batteryAh >= 180 ? "LiFePO4 battery bank recommended" : "AGM can work, but LiFePO4 still gives the best long-term RV value";
  const solarRecommendation = solarWatts >= 360 ? "Plan for a larger array plus MPPT charging" : "A starter kit can cover this setup if roof space is available";
  const urgency = templateKey === "rv_diagnostics" ? "Use diagnostics + saved scans to tie recommendations to real coach issues." : "Use this as a sizing guide before selecting gear.";
  return {
    profile,
    dailyWh: Number(dailyWh.toFixed(1)),
    adjustedDailyWh: Number(adjustedDailyWh.toFixed(1)),
    batteryAh,
    solarWatts,
    inverterWatts,
    batteryTier,
    solarTier,
    batteryRecommendation,
    solarRecommendation,
    estimatedCostLow,
    estimatedCostHigh,
    urgency,
  };
}

function getRvAffiliateRecommendations(intel, templateKey = "rv_power") {
  if (!intel) return [];
  return RV_AFFILIATE_ENGINE.filter((item) => {
    const t = item.triggers || {};
    if (t.templateKeys && !t.templateKeys.includes(templateKey)) return false;
    if (t.focus && !t.focus.includes(intel.profile?.affiliateFocus)) return false;
    if (typeof t.minBatteryAh === "number" && intel.batteryAh < t.minBatteryAh) return false;
    if (typeof t.maxBatteryAh === "number" && intel.batteryAh > t.maxBatteryAh) return false;
    if (typeof t.minSolarWatts === "number" && intel.solarWatts < t.minSolarWatts) return false;
    if (typeof t.maxSolarWatts === "number" && intel.solarWatts > t.maxSolarWatts) return false;
    if (typeof t.minInverterWatts === "number" && intel.inverterWatts < t.minInverterWatts) return false;
    if (typeof t.maxInverterWatts === "number" && intel.inverterWatts > t.maxInverterWatts) return false;
    if (t.always) return true;
    return true;
  }).slice(0, 5).map((item, index) => ({
    ...item,
    slug: `rv-${item.key}`,
    cta: index === 0 ? "Featured RV fit" : "Suggested add-on",
  }));
}

const SIMPLE_STYLE_OPTIONS = ["Dark glass", "Clean SaaS", "Builder Pro", "Minimal"];
const SIMPLE_GENERATION_STAGES = [
  "Understanding what you want to build",
  "Planning the workspace shell",
  "Generating the first builder version",
];
const MUTATION_LOOP_SUGGESTIONS = ["Add dark mode", "Add auth", "Make it mobile friendly", "Add sidebar navigation"];
const DEFAULT_SIMPLE_DRAFT = {
  starterKey: "assistant",
  appName: "My Assistant",
  mainGoal: "Answer questions, call tools, and guide the user",
  style: "Dark glass",
};

const SYSTEM_LIBRARY = {
  auth: {
    label: "Auth System",
    description: "Users, login state, protected routes, and role handling.",
    tags: ["login", "sign in", "account", "profile", "portal", "private"],
  },
  dashboard: {
    label: "Dashboard System",
    description: "Main overview, stats, recent activity, and navigation hub.",
    tags: ["dashboard", "analytics", "overview", "metrics", "admin"],
  },
  storage: {
    label: "Storage System",
    description: "Saved data, history, persistence, and sync strategy.",
    tags: ["save", "history", "database", "storage", "sync", "records"],
  },
  settings: {
    label: "Settings System",
    description: "Profile, preferences, environment values, and app configuration.",
    tags: ["settings", "preferences", "config", "profile"],
  },
  billing: {
    label: "Billing System",
    description: "Paywalls, subscriptions, plans, and checkout flows.",
    tags: ["billing", "stripe", "subscription", "paywall", "plan", "pro"],
  },
  ai_tools: {
    label: "AI Tools System",
    description: "Prompts, model actions, scan flows, chat, and AI endpoints.",
    tags: ["ai", "assistant", "scan", "chat", "diagnostic", "openai"],
  },
  admin: {
    label: "Admin / Portal System",
    description: "Back office workflows, operator views, and team roles.",
    tags: ["admin", "portal", "dealer", "technician", "staff"],
  },
  tools: {
    label: "Tool Engine",
    description: "Calculators, workflows, utility pages, and structured outputs.",
    tags: ["tool", "calculator", "utility", "planner", "estimator"],
  },
  content: {
    label: "Content System",
    description: "Articles, guides, editors, and document-style content flows.",
    tags: ["content", "editor", "blog", "article", "knowledge"],
  },
};

const SYSTEM_COMPLEXITY_OPTIONS = [
  {
    key: "starter",
    label: "Starter",
    description: "Fast scaffold with the minimum connected systems.",
  },
  {
    key: "mvp",
    label: "MVP",
    description: "Balanced product package with persistence and polished flows.",
  },
  {
    key: "product",
    label: "Product",
    description: "Deeper app architecture closer to a real shipped product.",
  },
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

function getSimpleStarterByKey(key) {
  return SIMPLE_STARTERS.find((item) => item.key === key) || SIMPLE_STARTERS[0];
}

function buildSimpleStarterPrompt(draft) {
  const starter = getSimpleStarterByKey(draft?.starterKey);
  const appName = String(draft?.appName || starter.label).trim();
  const goal = String(draft?.mainGoal || starter.goalPlaceholder).trim();
  const style = String(draft?.style || "Dark glass").trim();
  const customLead =
    starter.key === "custom"
      ? goal || appName || "custom builder workspace"
      : `${starter.seed}, named ${appName}`;
  return `${customLead}, style ${style}, focused on ${goal || starter.goalPlaceholder}`.trim();
}

function getActionIdentity(action) {
  if (!action) return "";
  return [action.key || "", action.cmd || "", action.label || ""].join("::");
}

function getNextBestActions({ featureState, layoutState, commandHistory, result }) {
  const actionPool = [];

  if (!layoutState.sidebar) {
    actionPool.push({
      key: "sidebar",
      label: "Add sidebar",
      cmd: "add sidebar",
      reason: "Give the builder a clearer navigation rail.",
    });
  }

  if (!layoutState.split) {
    actionPool.push({
      key: "split",
      label: "Split layout",
      cmd: "split layout",
      reason: "Separate controls and preview like a real builder.",
    });
  }

  if (!layoutState.inspector) {
    actionPool.push({
      key: "inspector",
      label: "Add inspector",
      cmd: "add inspector",
      reason: "Expose context and controls on the right.",
    });
  }

  if (featureState.appType === "assistant app") {
    actionPool.push(
      {
        key: "voice",
        label: "Add voice path",
        cmd: "assistant app with voice tools and live preview",
        reason: "Push the assistant toward a richer product flow.",
      },
      {
        key: "memory",
        label: "Improve memory UX",
        cmd: "assistant app with memory panel and notes panel",
        reason: "Make it feel more like a real copilot.",
      },
    );
  }

  if (featureState.appType === "admin panel") {
    actionPool.push(
      {
        key: "cards",
        label: "Sharper dashboard",
        cmd: "make dashboard cards",
        reason: "Strengthen the dashboard visual hierarchy.",
      },
      {
        key: "dense",
        label: "Dense mode",
        cmd: "make it dense",
        reason: "Fit more data into the same space.",
      },
    );
  }

  if (featureState.appType === "content app") {
    actionPool.push(
      {
        key: "notes",
        label: "Add notes panel",
        cmd: "add notes panel",
        reason: "Keep drafts and planning visible while editing.",
      },
      {
        key: "preview",
        label: "Focus preview",
        cmd: "focus preview",
        reason: "Let content preview lead the workspace.",
      },
    );
  }

  if (featureState.appType === "tool app") {
    actionPool.push(
      {
        key: "calc",
        label: "Tool workspace",
        cmd: "tool app with split layout and export report",
        reason: "Push the app toward a stronger usable tool flow.",
      },
      {
        key: "export",
        label: "Add export flow",
        cmd: "export report",
        reason: "Give the generated app a finishable action.",
      },
    );
  }

  if (!result && featureState.builderMode === "battery-planner") {
    actionPool.push({
      key: "planner",
      label: "Run planner",
      cmd: "run-planner",
      reason: "Test your backend-connected module right away.",
    });
  }

  if (!commandHistory.length) {
    actionPool.push({
      key: "dashboard-start",
      label: "Start with dashboard",
      cmd: "make dashboard",
      reason: "Good first mutation when you want visible progress.",
    });
  }

  const seen = new Set();
  return actionPool.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  }).slice(0, 4);
}

function simplifyStatusMessage(message, hasProject) {
  const text = String(message || "").trim();
  if (!text) return hasProject ? "Your project is ready for the next change." : "Ready to build your app.";
  if (/mutation engine v2 applied layout, files, routes, and components/i.test(text)) return "Your app was updated successfully.";
  if (/running mutation engine/i.test(text)) return "Updating your app...";
  if (/project .* synced with orchestration flow/i.test(text)) return "Your project was refreshed successfully.";
  if (/builder needs one or two details/i.test(text)) return "I need one or two details before I continue.";
  if (/builder shared suggestions/i.test(text)) return "I have a suggestion ready for you.";
  if (/fallback code generation used/i.test(text)) return "I used a backup build path to keep your project moving.";
  return text;
}

function simplifyInsightMessage(message, hasProject) {
  const text = String(message || "").trim();
  if (!text) return hasProject ? "Tell me the next change you want." : "Describe the app you want to build.";
  if (/waiting for your next mutation command/i.test(text)) return hasProject ? "Tell me what to change next." : "Describe the app you want to build.";
  if (/type a command so the builder can mutate the workspace/i.test(text)) return "Describe what you want to build or improve.";
  return text;
}

function isBuilderWorkspaceRequest(message) {
  const text = String(message || "").trim().toLowerCase();
  if (!text) return false;
  if (/(this builder|my builder|builder itself|builder ui|builder screen|builder workspace|chat ui|chat screen|personal ai for my builder|this ai|the ai itself|improve this ai)/.test(text)) return true;
  return /(make the preview larger|move the preview|preview on the side|preview to the side|simplify the builder|simplify this ui|shrink the header|hide project details|improve this builder ui)/.test(text);
}

function isFullStackRequest(message) {
  const text = String(message || "").trim().toLowerCase();
  if (!text) return false;
  if (/(frontend and backend|front end and back end|full[- ]stack|full stack)/.test(text)) return true;
  const hasFrontend = /(frontend|ui|screen|page|dashboard|layout|component)/.test(text);
  const hasBackend = /(backend|api|server|database|db|endpoint|auth|saved data)/.test(text);
  return hasFrontend && hasBackend;
}

function inferBuilderPreferenceTags(message) {
  const text = String(message || "").trim().toLowerCase();
  const tags = [];
  if (/(preview|side|center|bigger|larger|iframe|canvas)/.test(text)) tags.push("preview");
  if (/(chat|composer|input|conversation)/.test(text)) tags.push("chat");
  if (/(header|topbar|hero|title)/.test(text)) tags.push("header");
  if (/(simple|clean|less|reduce|clutter|details)/.test(text)) tags.push("clarity");
  if (/(mobile|phone|responsive)/.test(text)) tags.push("mobile");
  if (/(layout|sidebar|split|panel)/.test(text)) tags.push("layout");
  return [...new Set(tags)];
}

function updateBuilderAssistantPrefs(previousPrefs, message) {
  const prev = previousPrefs || {};
  const nextTags = inferBuilderPreferenceTags(message);
  return {
    name: prev.name || "Builder Copilot",
    favoriteFocuses: [...new Set([...(Array.isArray(prev.favoriteFocuses) ? prev.favoriteFocuses : []), ...nextTags])].slice(0, 6),
    recentRequests: [String(message || "").trim(), ...(Array.isArray(prev.recentRequests) ? prev.recentRequests : [])].filter(Boolean).slice(0, 4),
    lastRequest: String(message || "").trim(),
    preferredRules: Array.isArray(prev.preferredRules) ? prev.preferredRules : ["Keep preview large", "Keep chat simple"],
    pinnedGoals: Array.isArray(prev.pinnedGoals) ? prev.pinnedGoals : [],
  };
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

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 250);
}

function downloadTextFile(filename, content, mimeType = "application/json;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  triggerBrowserDownload(blob, filename);
}

function sanitizeProjectName(value, fallback = "builder-project") {
  const cleaned = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned || fallback;
}

function normalizeGeneratedFiles(files) {
  if (!Array.isArray(files)) return [];
  return files
    .map((file, index) => ({
      path: String(file?.path || `file-${index + 1}.txt`).replace(/^\/+/, ""),
      content: typeof file?.content === "string" ? file.content : String(file?.content || ""),
      language: file?.language || "code",
    }))
    .filter((file) => file.path);
}

function inferLanguageFromPath(path) {
  const lower = String(path || "").toLowerCase();
  if (lower.endsWith(".jsx") || lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".txt")) return "text";
  if (lower.endsWith(".env") || lower.includes(".env")) return "env";
  return "code";
}

function detectProjectStructure(files) {
  const paths = files.map((file) => String(file.path || ""));
  const lowered = paths.map((path) => path.toLowerCase());
  const hasFrontendRoot = lowered.some((path) => path.startsWith("frontend/"));
  const hasBackendRoot = lowered.some((path) => path.startsWith("backend/"));
  const hasSrcRoot = lowered.some((path) => path.startsWith("src/"));
  const hasReactEntry = lowered.some((path) => /(frontend\/)?src\/main\.(jsx|js|tsx|ts)$/.test(path));
  const hasReactApp = lowered.some((path) => /(frontend\/)?src\/app\.(jsx|js|tsx|ts)$/.test(path));
  const hasFastApiFile = lowered.some((path) => path.endsWith("main.py") || path.endsWith("app.py") || path.includes("fastapi"));
  const frontendRoot = hasFrontendRoot ? "frontend" : hasSrcRoot || hasReactEntry || hasReactApp ? "" : "";
  const backendRoot = hasBackendRoot ? "backend" : hasFastApiFile && !hasReactEntry ? "" : hasFastApiFile ? "backend" : "";
  return {
    hasFrontend: hasReactEntry || hasReactApp || hasFrontendRoot || hasSrcRoot,
    hasBackend: hasFastApiFile || hasBackendRoot,
    frontendRoot,
    backendRoot,
    isMonorepo: hasFrontendRoot || hasBackendRoot,
    usesReact: hasReactEntry || hasReactApp || hasSrcRoot,
    usesFastAPI: hasFastApiFile || hasBackendRoot,
  };
}

function joinProjectPath(root, file) {
  return root ? `${root}/${file}` : file;
}

function buildFrontendPackageJson() {
  return JSON.stringify(
    {
      name: "builder-generated-frontend",
      private: true,
      version: "0.1.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
      },
      devDependencies: {
        vite: "^5.4.10",
        "@vitejs/plugin-react": "^4.3.1",
      },
    },
    null,
    2,
  );
}

function buildBackendRequirements() {
  return [
    "fastapi>=0.115.0,<1.0.0",
    "uvicorn[standard]>=0.30.0,<1.0.0",
    "python-multipart>=0.0.9,<1.0.0",
    "pydantic>=2.8.0,<3.0.0",
  ].join("\n");
}

function buildFrontendEnvExample() {
  return [
    "VITE_API_URL=http://127.0.0.1:8000",
    "VITE_APP_TITLE=Builder Generated App",
  ].join("\n");
}

function buildBackendEnvExample() {
  return [
    "OPENAI_API_KEY=your_key_here",
    "ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173",
    "APP_ENV=development",
  ].join("\n");
}

function buildRootEnvExample(structure) {
  const lines = ["PROJECT_NAME=builder-generated-project"];
  if (structure.hasFrontend) {
    lines.push("VITE_API_URL=http://127.0.0.1:8000");
  }
  if (structure.hasBackend) {
    lines.push("OPENAI_API_KEY=your_key_here");
  }
  return lines.join("\n");
}

function buildIndexHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Builder Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function buildGitIgnore(structure) {
  const lines = [
    "node_modules/",
    "dist/",
    ".DS_Store",
    ".env",
    ".env.local",
    ".env.*.local",
    "__pycache__/",
    "*.pyc",
    ".venv/",
    "venv/",
    ".idea/",
    ".vscode/",
  ];
  if (structure.isMonorepo) {
    lines.push("frontend/node_modules/", "frontend/dist/");
  }
  return [...new Set(lines)].join("\n");
}

function buildSmartSupportFiles({ files, prompt, appType, builderMode, routes, components, folderName }) {
  const structure = detectProjectStructure(files);
  const lowerPaths = new Set(files.map((file) => String(file.path || "").toLowerCase()));
  const supportFiles = [];
  const pushIfMissing = (path, content, language) => {
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    if (!normalizedPath || lowerPaths.has(normalizedPath.toLowerCase())) return;
    supportFiles.push({
      path: normalizedPath,
      content,
      language: language || inferLanguageFromPath(normalizedPath),
      generatedBy: "smart-package",
    });
    lowerPaths.add(normalizedPath.toLowerCase());
  };

  if (structure.hasFrontend) {
    pushIfMissing(joinProjectPath(structure.frontendRoot, "package.json"), buildFrontendPackageJson(), "json");
    pushIfMissing(joinProjectPath(structure.frontendRoot, ".env.example"), buildFrontendEnvExample(), "env");
    const mainEntryVariants = [
      joinProjectPath(structure.frontendRoot, "src/main.jsx"),
      joinProjectPath(structure.frontendRoot, "src/main.js"),
      joinProjectPath(structure.frontendRoot, "src/main.tsx"),
      joinProjectPath(structure.frontendRoot, "src/main.ts"),
    ].map((item) => item.toLowerCase());
    const hasMainEntry = files.some((file) => mainEntryVariants.includes(String(file.path || "").toLowerCase()));
    if (hasMainEntry) {
      pushIfMissing(joinProjectPath(structure.frontendRoot, "index.html"), buildIndexHtml(), "html");
    }
  }

  if (structure.hasBackend) {
    pushIfMissing(joinProjectPath(structure.backendRoot, "requirements.txt"), buildBackendRequirements(), "text");
    pushIfMissing(joinProjectPath(structure.backendRoot, ".env.example"), buildBackendEnvExample(), "env");
  }

  pushIfMissing(".env.example", buildRootEnvExample(structure), "env");
  pushIfMissing(
    ".gitignore",
    buildGitIgnore(structure),
    "text",
  );

  pushIfMissing(
    "README.md",
    buildProjectReadme({
      appType,
      builderMode,
      prompt,
      routes,
      components,
      files: [...files, ...supportFiles],
      folderName,
    }),
    "markdown",
  );

  return supportFiles;
}

function augmentGeneratedFilesWithSmartPackage(files, context) {
  const normalized = normalizeGeneratedFiles(files);
  const projectSeed = context?.prompt || context?.folderName || context?.appType || "builder-project";
  const folderName = sanitizeProjectName(projectSeed);
  const supportFiles = buildSmartSupportFiles({
    files: normalized,
    prompt: context?.prompt,
    appType: context?.appType,
    builderMode: context?.builderMode,
    routes: context?.routes,
    components: context?.components,
    folderName,
  });
  return [...normalized, ...supportFiles].map((file) => ({
    ...file,
    language: file.language || inferLanguageFromPath(file.path),
  }));
}

function buildProjectReadme({ appType, builderMode, prompt, routes, components, files, folderName }) {
  const routeLines = Array.isArray(routes) && routes.length
    ? routes.map((route) => `- ${route.path} → ${route.component}`).join("\n")
    : "- No routes were returned by the mutation engine yet.";

  const componentLines = Array.isArray(components) && components.length
    ? components.map((component) => `- ${component.name}: ${component.purpose}`).join("\n")
    : "- No component summary was returned yet.";

  const structure = detectProjectStructure(normalizeGeneratedFiles(files));
  const frontendFolder = structure.frontendRoot || ".";
  const backendFolder = structure.backendRoot || ".";
  const installSteps = [];

  if (structure.hasFrontend) {
    installSteps.push(
      `### Frontend (${frontendFolder})`,
      `1. Open a terminal in \`${frontendFolder}\`.`,
      "2. Run `npm install`.",
      "3. Run `npm run dev`.",
      "",
    );
  }

  if (structure.hasBackend) {
    installSteps.push(
      `### Backend (${backendFolder})`,
      `1. Open a terminal in \`${backendFolder}\`.`,
      "2. Create a virtual environment.",
      "3. Run `pip install -r requirements.txt`.",
      "4. Run `uvicorn main:app --reload`.",
      "",
    );
  }

  if (!installSteps.length) {
    installSteps.push("1. Download and extract this zip.", "2. Open the extracted folder in VS Code.");
  }

  return `# ${folderName}

Generated by Builder AI on ${nowLabel()}.

## Builder context

- App type: ${appType || "unknown"}
- Builder mode: ${builderMode || "unknown"}
- Prompt: ${prompt || "No prompt provided"}
- Files in this zip: ${files.length}

## Routes

${routeLines}

## Components

${componentLines}

## Smart package system

This bundle was prepared to be easier to open in VS Code.
It can include package files such as \`package.json\`, \`requirements.txt\`, \`.env.example\`, \`.gitignore\`, and a starter \`index.html\` when needed.

## Open in VS Code

1. Download and extract this zip.
2. Open the extracted folder in VS Code.
3. Use the instructions below based on the folders included in the project.

${installSteps.join("\n")}
`;
}



function buildRenderYaml(structure, folderName) {
  const serviceName = sanitizeProjectName(folderName || "builder-project");
  const lines = ["services:"];
  if (structure.hasBackend) {
    lines.push("  - type: web");
    lines.push(`    name: ${serviceName}-backend`);
    lines.push("    env: python");
    if (structure.backendRoot) lines.push(`    rootDir: ${structure.backendRoot}`);
    lines.push("    buildCommand: pip install -r requirements.txt");
    lines.push("    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT");
    lines.push("    envVars:");
    lines.push("      - key: OPENAI_API_KEY");
    lines.push("        sync: false");
    if (structure.hasFrontend) {
      lines.push("      - key: ALLOWED_ORIGINS");
      lines.push("        value: https://your-frontend-url.onrender.com");
    }
  }
  if (structure.hasFrontend) {
    lines.push("  - type: static");
    lines.push(`    name: ${serviceName}-frontend`);
    if (structure.frontendRoot) lines.push(`    rootDir: ${structure.frontendRoot}`);
    lines.push("    buildCommand: npm install && npm run build");
    lines.push("    publishDir: dist");
    lines.push("    envVars:");
    lines.push("      - key: VITE_API_URL");
    lines.push("        value: https://your-backend-url.onrender.com");
    lines.push("    routes:");
    lines.push("      - type: rewrite");
    lines.push("        source: /*");
    lines.push("        destination: /index.html");
  }
  return lines.join("\n");
}

function buildVercelJson(structure) {
  const payload = {
    cleanUrls: true,
    trailingSlash: false,
    rewrites: structure.hasFrontend
      ? [{ source: "/(.*)", destination: "/index.html" }]
      : [],
  };
  return JSON.stringify(payload, null, 2);
}

function buildDeployNotes(target, structure, folderName) {
  const title = target === "render" ? "Render deployment" : "Vercel deployment";
  const lines = [
    `# ${title}`,
    "",
    `Prepared on ${nowLabel()} for ${folderName}.`,
    "",
  ];

  if (target === "render") {
    lines.push("## What is included");
    lines.push("- render.yaml");
    if (structure.hasBackend) lines.push("- Backend service settings for FastAPI");
    if (structure.hasFrontend) lines.push("- Static site settings for the frontend");
    lines.push("");
    lines.push("## How to use");
    lines.push("1. Extract this bundle.");
    lines.push("2. Push the files to GitHub.");
    lines.push("3. In Render, create a Blueprint or new services from the repo.");
    lines.push("4. Set the environment variables shown in the generated .env.example files.");
  } else {
    lines.push("## What is included");
    lines.push("- vercel.json");
    if (structure.hasFrontend) lines.push("- SPA rewrite for the frontend");
    lines.push("");
    lines.push("## How to use");
    lines.push("1. Extract this bundle.");
    lines.push("2. Push the files to GitHub.");
    lines.push("3. Import the repo into Vercel.");
    lines.push("4. Add VITE_API_URL in the Vercel project settings.");
    if (structure.hasBackend) {
      lines.push("");
      lines.push("## Backend note");
      lines.push("This project contains a backend. Deploy the backend separately to Render or another API host, then point VITE_API_URL to that backend URL.");
    }
  }

  return lines.join("\n");
}

function buildDeployExportFiles(target, files, context) {
  const normalized = augmentGeneratedFilesWithSmartPackage(files, context);
  const folderName = sanitizeProjectName(context?.prompt || context?.folderName || context?.appType || "builder-project");
  const structure = detectProjectStructure(normalized);
  const extraFiles = [];

  if (target === "render") {
    extraFiles.push({
      path: "render.yaml",
      content: buildRenderYaml(structure, folderName),
      language: "yaml",
      generatedBy: "deploy-export",
    });
  }

  if (target === "vercel") {
    extraFiles.push({
      path: "vercel.json",
      content: buildVercelJson(structure),
      language: "json",
      generatedBy: "deploy-export",
    });
  }

  extraFiles.push({
    path: `DEPLOY_${target.toUpperCase()}.md`,
    content: buildDeployNotes(target, structure, folderName),
    language: "markdown",
    generatedBy: "deploy-export",
  });

  return {
    folderName,
    target,
    files: [...normalized, ...extraFiles],
  };
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
    panels: {
      sidebar: [...prevLayout.panels.sidebar],
      mainTop: [...prevLayout.panels.mainTop],
      mainBottom: [...prevLayout.panels.mainBottom],
      inspector: [...prevLayout.panels.inspector],
    },
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

  if (/(split layout|split workspace|two column|2 column|2-column)/.test(lower)) {
    nextLayout.split = true;
    nextLayout.mode = nextLayout.mode === "focus" ? "workspace" : nextLayout.mode;
    moduleAdds.push("split_workspace");
    notes.push("Split workspace into control and preview columns.");
  }

  if (/(single column|stack layout|stacked layout)/.test(lower)) {
    nextLayout.split = false;
    notes.push("Returned to single column workspace.");
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

  if (/(focus preview|preview mode|canvas focus)/.test(lower)) {
    nextLayout.mode = "focus";
    nextLayout.shell = "focus";
    nextLayout.split = true;
    nextLayout.sidebar = false;
    nextLayout.inspector = false;
    nextLayout.previewStyle = "spotlight";
    notes.push("Focused the workspace on preview-first mode.");
  }

  if (/(return to classic layout|classic layout|reset layout|default layout)/.test(lower)) {
    return {
      layout: {
        ...DEFAULT_LAYOUT,
        panels: {
          sidebar: [...DEFAULT_LAYOUT.panels.sidebar],
          mainTop: [...DEFAULT_LAYOUT.panels.mainTop],
          mainBottom: [...DEFAULT_LAYOUT.panels.mainBottom],
          inspector: [...DEFAULT_LAYOUT.panels.inspector],
        },
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

function Panel({ title, subtitle, actions, children, compact = false }) {
  return (
    <section className={`panel-card ${compact ? "compact" : ""}`}>
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

function inferSystemPlanner({ prompt, appType, builderMode, routes = [], components = [], featureState, previousPlanner }) {
  const lower = `${prompt || ""} ${(appType || "")} ${(builderMode || "")} ${routes.map((route) => route.path || "").join(" ")} ${components.map((component) => `${component.name || ""} ${component.purpose || ""}`).join(" ")} ${(featureState?.quickIdea || "")}`.toLowerCase();

  const detected = Object.entries(SYSTEM_LIBRARY)
    .filter(([, value]) => value.tags.some((tag) => lower.includes(tag)))
    .map(([key]) => key);

  if (appType === "assistant app") detected.push("ai_tools", "dashboard");
  if (appType === "admin panel") detected.push("dashboard", "admin", "auth");
  if (appType === "content app") detected.push("content", "dashboard", "storage");
  if (appType === "tool app") detected.push("tools", "dashboard");
  if (builderMode?.includes("planner")) detected.push("tools", "storage");

  if (routes.length > 2 || components.length > 4) detected.push("storage");
  if (routes.some((route) => /settings|profile/i.test(route.path || ""))) detected.push("settings", "auth");
  if (routes.some((route) => /admin|portal|dealer|tech/i.test(route.path || ""))) detected.push("admin", "auth");
  if (routes.some((route) => /billing|plans|pricing/i.test(route.path || ""))) detected.push("billing");

  const systems = [...new Set([...(previousPlanner?.systems || []), ...detected])];
  const finalSystems = systems.length ? systems : ["dashboard", "tools", "storage"];

  const frontend = appType === "content app" ? "React + Vite content shell" : "React + Vite app shell";
  const backend = (finalSystems.includes("ai_tools") || finalSystems.includes("billing") || finalSystems.includes("auth"))
    ? "FastAPI or Node API with dedicated service endpoints"
    : "Light API layer for actions and persistence";
  const auth = finalSystems.includes("auth") ? "Protected routes + session tokens" : "Public app with optional guest mode";
  const data = finalSystems.includes("storage") ? "Local persistence first, ready to upgrade to DB/API" : "Ephemeral runtime state";

  const bundles = finalSystems.map((system) => {
    switch (system) {
      case "auth":
        return "Auth bundle → login view, route guards, account state";
      case "dashboard":
        return "Dashboard bundle → home summary, stats, recent activity";
      case "storage":
        return "Storage bundle → saved items, history, local/API persistence";
      case "settings":
        return "Settings bundle → preferences, profile, environment values";
      case "billing":
        return "Billing bundle → plan cards, paywall, subscription actions";
      case "ai_tools":
        return "AI tools bundle → prompts, chat/scan flow, AI endpoint wiring";
      case "admin":
        return "Admin bundle → operator pages, roles, team workflows";
      case "tools":
        return "Tools bundle → calculators, workflows, result pages";
      case "content":
        return "Content bundle → editor, article detail, document flows";
      default:
        return `${system} bundle`;
    }
  });

  const complexity = previousPlanner?.complexity || (finalSystems.length >= 5 ? "product" : finalSystems.length >= 3 ? "mvp" : "starter");

  return {
    systems: finalSystems,
    architecture: {
      frontend,
      backend,
      auth,
      data,
    },
    bundles,
    complexity,
    summary: `${finalSystems.length} systems planned for a ${appType || "custom"} using ${builderMode || "builder mode"}.`,
  };
}

function buildSystemPlannerPromptBlock(planner) {
  if (!planner) return "";
  return `

SYSTEM PLANNER
- Complexity: ${planner.complexity}
- Systems: ${(planner.systems || []).join(", ")}
- Frontend: ${planner.architecture?.frontend || ""}
- Backend: ${planner.architecture?.backend || ""}
- Auth: ${planner.architecture?.auth || ""}
- Data: ${planner.architecture?.data || ""}
- Feature bundles: ${(planner.bundles || []).join(" | ")}`;
}

function formatSystemLabel(key) {
  return SYSTEM_LIBRARY[key]?.label || key;
}


function escapePreviewHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inferPreviewRoutes(routes = [], files = [], appType = "") {
  if (Array.isArray(routes) && routes.length) {
    return routes.map((route, index) => ({
      path: route.path || `/route-${index + 1}`,
      component: route.component || "Page",
      reason: route.reason || "",
    }));
  }

  const inferred = files
    .filter((file) => /src\/pages\/.+\.(jsx|js|tsx|ts)$/i.test(file.path || ""))
    .map((file) => {
      const name = String(file.path || "").split("/").pop().replace(/\.(jsx|js|tsx|ts)$/i, "");
      const slug = name
        .replace(/Page$/i, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
      return {
        path: slug === "app" ? "/" : `/${slug || "page"}`,
        component: name,
        reason: "Inferred from generated page file",
      };
    });

  if (inferred.length) return inferred;

  return [{
    path:
      appType === "admin panel" ? "/dashboard"
        : appType === "assistant app" ? "/assistant"
          : appType === "content app" ? "/studio"
            : "/tool",
    component: "App",
    reason: "Default preview route",
  }];
}

function detectPreviewAuthState({ files = [], routes = [], components = [], systemPlanner, featureState }) {
  const allText = [
    ...(files || []).map((file) => `${file.path || ""} ${file.content || ""}`),
    ...(routes || []).map((route) => `${route.path || ""} ${route.component || ""}`),
    ...(components || []).map((component) => `${component.name || ""} ${component.purpose || ""}`),
    ...(systemPlanner?.systems || []),
    featureState?.appType || "",
    featureState?.builderMode || "",
  ].join(" ").toLowerCase();

  const enabled = /(auth|login|register|signin|sign in|protected|token|jwt|session|profile)/.test(allText);
  const hasAdmin = /(admin|portal|dealer|technician|staff|role)/.test(allText);

  return {
    enabled,
    hasAdmin,
    label: enabled ? (hasAdmin ? "Auth + roles" : "Auth enabled") : "Guest preview",
  };
}

function buildPreviewPageSummary(currentRoute, authState, featureState, prompt) {
  if (!currentRoute) return "Generated app preview ready.";
  const routePath = currentRoute.path || "/";
  const pageName = currentRoute.component || "Page";
  const authLine = !authState?.enabled
    ? "This page is currently visible in guest preview mode."
    : routePath.includes("login") || routePath.includes("register")
      ? "This route is part of the auth flow and previews the signed-out experience."
      : "This page is being previewed inside an authenticated shell simulation.";
  return `${pageName} · ${routePath}. ${authLine} ${prompt ? `Idea: ${prompt}.` : ""}`;
}

function getPreviewProductTheme(featureState, authState, currentRoute) {
  const appType = featureState?.appType || "tool app";
  const routePath = currentRoute?.path || "/";

  if (appType === "admin panel") {
    return {
      tone: "admin",
      eyebrow: "Premium admin workspace",
      heroTitle: "Operations dashboard preview",
      heroCopy: "A sharper admin shell with metrics, navigation, and an operator-first layout.",
      primaryLabel: authState?.enabled ? "Review dashboard flow" : "Open dashboard preview",
      accentA: "#7dd3fc",
      accentB: "#8b5cf6",
      surface: "linear-gradient(180deg, rgba(15,23,42,.96), rgba(17,24,39,.92))",
      navLabel: "Workspace",
      highlights: ["KPI cards", "Navigation rail", "Recent activity", "Operator tools"],
    };
  }

  if (appType === "assistant app") {
    return {
      tone: "assistant",
      eyebrow: "Premium assistant shell",
      heroTitle: routePath.includes("login") ? "Assistant access flow" : "AI workspace preview",
      heroCopy: "A conversation-first app shell with actions, memory, and a cleaner copilot feel.",
      primaryLabel: authState?.enabled ? "Open assistant flow" : "Preview assistant",
      accentA: "#22d3ee",
      accentB: "#6366f1",
      surface: "linear-gradient(180deg, rgba(8,47,73,.92), rgba(15,23,42,.92))",
      navLabel: "Tools",
      highlights: ["Conversation pane", "Action rail", "Saved context", "Prompt shortcuts"],
    };
  }

  if (appType === "content app") {
    return {
      tone: "content",
      eyebrow: "Premium content studio",
      heroTitle: "Editorial flow preview",
      heroCopy: "A more polished studio feel with editor, preview, and structured document surfaces.",
      primaryLabel: "Open studio preview",
      accentA: "#f59e0b",
      accentB: "#ef4444",
      surface: "linear-gradient(180deg, rgba(69,26,3,.92), rgba(28,25,23,.92))",
      navLabel: "Sections",
      highlights: ["Editor shell", "Live preview", "Notes lane", "Publishing flow"],
    };
  }

  return {
    tone: "tool",
    eyebrow: "Premium utility workflow",
    heroTitle: "Tool app preview",
    heroCopy: "A cleaner utility layout focused on conversion, clarity, and a more product-like result surface.",
    primaryLabel: authState?.enabled ? "Open current flow" : "Explore generated app",
    accentA: "#34d399",
    accentB: "#14b8a6",
    surface: "linear-gradient(180deg, rgba(6,78,59,.92), rgba(15,23,42,.92))",
    navLabel: "Flow",
    highlights: ["Input step", "Result card", "Export path", "Saved history"],
  };
}

function extractOrchestratedFiles(payload) {
  const candidates = [
    ...(Array.isArray(payload?.files) ? payload.files : []),
    ...(Array.isArray(payload?.generated_files) ? payload.generated_files : []),
    ...(Array.isArray(payload?.project_state?.files) ? payload.project_state.files : []),
  ];
  return normalizeGeneratedFiles(candidates);
}

function extractOrchestratedRoutes(payload, fallback = []) {
  if (Array.isArray(payload?.routes) && payload.routes.length) return payload.routes;
  if (Array.isArray(payload?.project_state?.routes) && payload.project_state.routes.length) return payload.project_state.routes;
  return fallback;
}

function extractOrchestratedComponents(payload, fallback = []) {
  if (Array.isArray(payload?.components) && payload.components.length) return payload.components;
  if (Array.isArray(payload?.project_state?.components) && payload.project_state.components.length) return payload.project_state.components;
  return fallback;
}

function extractOrchestratedFileTree(payload, fallback = []) {
  if (Array.isArray(payload?.file_tree) && payload.file_tree.length) return payload.file_tree;
  if (Array.isArray(payload?.project_state?.file_tree) && payload.project_state.file_tree.length) return payload.project_state.file_tree;
  return fallback;
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
  const [statusMessage, setStatusMessage] = useState("Ready to build your app.");
  const [builderInsight, setBuilderInsight] = useState("Describe the app you want to build.");
  const [selectedSidebarView, setSelectedSidebarView] = useState("builder");
  const [uiMode, setUiMode] = useState(() => loadFromStorage(STORAGE_KEYS.uiMode, "simple"));
  const [simpleFlowStep, setSimpleFlowStep] = useState(() =>
    loadFromStorage(STORAGE_KEYS.simpleFlowStep, loadFromStorage(STORAGE_KEYS.commandHistory, []).length ? "builder" : "welcome")
  );
  const [simpleDraft, setSimpleDraft] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.simpleDraft, DEFAULT_SIMPLE_DRAFT);
    return { ...DEFAULT_SIMPLE_DRAFT, ...stored };
  });
  const [selectedRvTemplateKey, setSelectedRvTemplateKey] = useState(() => loadFromStorage(STORAGE_KEYS.rvTemplate, RV_SMART_TEMPLATES[0].key));
  const [rvCampingProfileKey, setRvCampingProfileKey] = useState(() => loadFromStorage(STORAGE_KEYS.rvCampingProfile, RV_CAMPING_PROFILES[0].key));
  const [generatedAppMonetization, setGeneratedAppMonetization] = useState(() => loadFromStorage(STORAGE_KEYS.generatedAppMonetization, null));
  const [simplePendingPrompt, setSimplePendingPrompt] = useState("");
  const [simpleGenerationStage, setSimpleGenerationStage] = useState(0);
  const [generatedFileTree, setGeneratedFileTree] = useState(() => loadFromStorage(STORAGE_KEYS.generatedFileTree, []));
  const [generatedRoutes, setGeneratedRoutes] = useState(() => loadFromStorage(STORAGE_KEYS.generatedRoutes, []));
  const [generatedComponents, setGeneratedComponents] = useState(() => loadFromStorage(STORAGE_KEYS.generatedComponents, []));
  const [backendNextActions, setBackendNextActions] = useState([]);
  const [backendMutationSummary, setBackendMutationSummary] = useState([]);
  const [generatedCodeFiles, setGeneratedCodeFiles] = useState(() => loadFromStorage(STORAGE_KEYS.generatedCodeFiles, []));
  const [selectedGeneratedFilePath, setSelectedGeneratedFilePath] = useState(() => loadFromStorage(STORAGE_KEYS.selectedGeneratedFilePath, ""));
  const [livePreviewDoc, setLivePreviewDoc] = useState("");
  const [selectedPreviewRoute, setSelectedPreviewRoute] = useState("/");
  const [previewAuthMode, setPreviewAuthMode] = useState("guest");
  const [mutationLoopInput, setMutationLoopInput] = useState("");
  const [isMutatingGeneratedApp, setIsMutatingGeneratedApp] = useState(false);
  const [mutationVersions, setMutationVersions] = useState(() => loadFromStorage(STORAGE_KEYS.mutationVersions, []));
  const [systemPlanner, setSystemPlanner] = useState(() =>
    loadFromStorage(
      STORAGE_KEYS.systemPlanner,
      inferSystemPlanner({
        prompt: loadFromStorage(STORAGE_KEYS.prompt, ""),
        appType: DEFAULT_FEATURE_STATE.appType,
        builderMode: DEFAULT_FEATURE_STATE.builderMode,
        routes: [],
        components: [],
        featureState: DEFAULT_FEATURE_STATE,
      }),
    ),
  );
  const [projectId, setProjectId] = useState(() => loadFromStorage(STORAGE_KEYS.projectId, ""));
  const [orchestrationHistory, setOrchestrationHistory] = useState(() => loadFromStorage(STORAGE_KEYS.orchestrationHistory, []));
  const [builderChatHistory, setBuilderChatHistory] = useState(() => loadFromStorage(STORAGE_KEYS.builderChatHistory, []));
  const [builderChatDraft, setBuilderChatDraft] = useState(() => loadFromStorage(STORAGE_KEYS.builderChatDraft, ""));
  const [builderProjectMemory, setBuilderProjectMemory] = useState(() => loadFromStorage(STORAGE_KEYS.builderProjectMemory, {}));
  const [globalKnowledgeItems, setGlobalKnowledgeItems] = useState([]);
  const [globalKnowledgeTopics, setGlobalKnowledgeTopics] = useState([]);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const [chatScrollTick, setChatScrollTick] = useState(0);
  const [chatAssistantMode, setChatAssistantMode] = useState("app");
  const [fullStackScope, setFullStackScope] = useState(() => loadFromStorage(STORAGE_KEYS.fullStackScope, "fullstack"));
  const [chatReplyPreference, setChatReplyPreference] = useState(() => loadFromStorage(STORAGE_KEYS.chatReplyPreference, "balanced"));
  const [builderAssistantPrefs, setBuilderAssistantPrefs] = useState(() => loadFromStorage(STORAGE_KEYS.builderAssistantPrefs, {
    name: "Builder Copilot",
    favoriteFocuses: ["preview", "clarity"],
    recentRequests: [],
    preferredRules: ["Keep preview large", "Keep chat simple"],
    pinnedGoals: [],
  }));
  const [showChatDetails, setShowChatDetails] = useState(false);
  const [showStarterExamples, setShowStarterExamples] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [deployExportTarget, setDeployExportTarget] = useState("");
  const reportCounterRef = useRef(loadFromStorage(STORAGE_KEYS.reportCounter, 1));

  useEffect(() => saveToStorage(STORAGE_KEYS.prompt, prompt), [prompt]);
  useEffect(() => saveToStorage(STORAGE_KEYS.modules, activeModules), [activeModules]);
  useEffect(() => saveToStorage(STORAGE_KEYS.layout, layoutState), [layoutState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.featureState, featureState), [featureState]);
  useEffect(() => saveToStorage(STORAGE_KEYS.mutationLog, mutationLog), [mutationLog]);
  useEffect(() => saveToStorage(STORAGE_KEYS.commandHistory, commandHistory), [commandHistory]);
  useEffect(() => saveToStorage(STORAGE_KEYS.results, savedResults), [savedResults]);
  useEffect(() => saveToStorage(STORAGE_KEYS.uiMode, uiMode), [uiMode]);
  useEffect(() => saveToStorage(STORAGE_KEYS.simpleFlowStep, simpleFlowStep), [simpleFlowStep]);
  useEffect(() => saveToStorage(STORAGE_KEYS.simpleDraft, simpleDraft), [simpleDraft]);
  useEffect(() => saveToStorage(STORAGE_KEYS.mutationVersions, mutationVersions), [mutationVersions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.systemPlanner, systemPlanner), [systemPlanner]);
  useEffect(() => saveToStorage(STORAGE_KEYS.rvTemplate, selectedRvTemplateKey), [selectedRvTemplateKey]);
  useEffect(() => saveToStorage(STORAGE_KEYS.rvCampingProfile, rvCampingProfileKey), [rvCampingProfileKey]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedAppMonetization, generatedAppMonetization), [generatedAppMonetization]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedFileTree, generatedFileTree), [generatedFileTree]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedRoutes, generatedRoutes), [generatedRoutes]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedComponents, generatedComponents), [generatedComponents]);
  useEffect(() => saveToStorage(STORAGE_KEYS.generatedCodeFiles, generatedCodeFiles), [generatedCodeFiles]);
  useEffect(() => saveToStorage(STORAGE_KEYS.selectedGeneratedFilePath, selectedGeneratedFilePath), [selectedGeneratedFilePath]);
  useEffect(() => saveToStorage(STORAGE_KEYS.projectId, projectId), [projectId]);
  useEffect(() => saveToStorage(STORAGE_KEYS.orchestrationHistory, orchestrationHistory), [orchestrationHistory]);
  useEffect(() => saveToStorage(STORAGE_KEYS.builderChatHistory, builderChatHistory), [builderChatHistory]);
  useEffect(() => saveToStorage(STORAGE_KEYS.builderChatDraft, builderChatDraft), [builderChatDraft]);
  useEffect(() => saveToStorage(STORAGE_KEYS.builderProjectMemory, builderProjectMemory), [builderProjectMemory]);
  useEffect(() => saveToStorage(STORAGE_KEYS.builderAssistantPrefs, builderAssistantPrefs), [builderAssistantPrefs]);
  useEffect(() => saveToStorage(STORAGE_KEYS.fullStackScope, fullStackScope), [fullStackScope]);
  useEffect(() => saveToStorage(STORAGE_KEYS.chatReplyPreference, chatReplyPreference), [chatReplyPreference]);

  useEffect(() => {
    setBuilderProjectMemory((prev) => ({
      ...prev,
      project_id: projectId || prev.project_id || "",
      project_summary: prompt || prev.project_summary || "",
      app_type: featureState.appType,
      builder_mode: featureState.builderMode,
      systems: systemPlanner.systems || prev.systems || [],
      has_generated_app: Boolean(generatedCodeFiles.length || generatedRoutes.length || generatedComponents.length || projectId),
    }));
  }, [projectId, prompt, featureState.appType, featureState.builderMode, systemPlanner.systems, generatedCodeFiles.length, generatedRoutes.length, generatedComponents.length]);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error("health check failed");
        const data = await response.json();
        setApiStatus("connected");
        setBuilderProjectMemory((prev) => ({
          ...prev,
          workspace_edit_enabled: Boolean(data?.workspace_edit),
        }));
      } catch {
        setApiStatus("offline");
        setBuilderProjectMemory((prev) => ({
          ...prev,
          workspace_edit_enabled: false,
        }));
      }
    }
    checkHealth();
  }, []);

  useEffect(() => {
    let active = true;

    async function syncGlobalKnowledge() {
      setIsKnowledgeLoading(true);
      try {
        const response = await fetch(`${API_BASE}/knowledge-store?limit=8`);
        if (!response.ok) throw new Error("knowledge store request failed");
        const data = await response.json();
        if (!active) return;
        setGlobalKnowledgeItems(Array.isArray(data?.items) ? data.items : []);
        setGlobalKnowledgeTopics(Array.isArray(data?.top_topics) ? data.top_topics : []);
      } catch {
        if (!active) return;
        setGlobalKnowledgeItems([]);
        setGlobalKnowledgeTopics([]);
      } finally {
        if (active) setIsKnowledgeLoading(false);
      }
    }

    syncGlobalKnowledge();
    return () => {
      active = false;
    };
  }, [builderProjectMemory.global_knowledge_count]);

  useEffect(() => {
    if (simpleFlowStep !== "generating" || !simplePendingPrompt) return undefined;

    setSimpleGenerationStage(0);

    const timers = [
      window.setTimeout(() => setSimpleGenerationStage(1), 450),
      window.setTimeout(() => setSimpleGenerationStage(2), 900),
      window.setTimeout(() => {
        runBuilderBrain(simplePendingPrompt);
        setSimpleFlowStep("builder");
        setSimplePendingPrompt("");
        setStatusMessage("First builder version generated.");
      }, 1350),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [simpleFlowStep, simplePendingPrompt]);

  useEffect(() => {
    setSystemPlanner((previous) => inferSystemPlanner({
      prompt,
      appType: featureState.appType,
      builderMode: featureState.builderMode,
      routes: generatedRoutes,
      components: generatedComponents,
      featureState,
      previousPlanner: previous,
    }));
  }, [prompt, featureState.appType, featureState.builderMode, featureState.quickIdea, generatedRoutes, generatedComponents]);

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

  const selectedSimpleStarter = useMemo(
    () => getSimpleStarterByKey(simpleDraft.starterKey),
    [simpleDraft.starterKey],
  );
  const selectedRvTemplate = useMemo(
    () => getRvTemplateByKey(selectedRvTemplateKey),
    [selectedRvTemplateKey],
  );
  const rvCampingProfile = useMemo(
    () => getRvCampingProfileByKey(rvCampingProfileKey),
    [rvCampingProfileKey],
  );
  const rvIntelligence = useMemo(
    () => estimateRvIntelligence({
      appliances,
      batteryVoltage,
      autonomyDays,
      sunHours,
      systemLoss,
      templateKey: selectedRvTemplateKey,
      campingProfileKey: rvCampingProfileKey,
    }),
    [appliances, batteryVoltage, autonomyDays, sunHours, systemLoss, selectedRvTemplateKey, rvCampingProfileKey],
  );
  const rvAffiliateRecommendations = useMemo(
    () => getRvAffiliateRecommendations(rvIntelligence, selectedRvTemplateKey),
    [rvIntelligence, selectedRvTemplateKey],
  );
  const rawNextBestActions = useMemo(
    () => getNextBestActions({ featureState, layoutState, commandHistory, result }),
    [featureState, layoutState, commandHistory, result],
  );
  const nextBestActions = useMemo(() => {
    const dismissedActionId = String(builderProjectMemory.dismissed_next_action_id || "").trim();
    if (!dismissedActionId) return rawNextBestActions;
    return rawNextBestActions.filter((action) => getActionIdentity(action) !== dismissedActionId);
  }, [rawNextBestActions, builderProjectMemory.dismissed_next_action_id]);
  const showLocalNextActions = uiMode !== "chat" || Boolean(projectId || generatedCodeFiles.length || generatedRoutes.length || generatedComponents.length);
  const primaryNextAction = showLocalNextActions ? nextBestActions[0] || null : null;
  const secondaryNextActions = showLocalNextActions ? nextBestActions.slice(1, 3) : [];
  const latestAssistantLeadAction = useMemo(() => {
    const dismissedAssistantActionId = String(builderProjectMemory.dismissed_assistant_action_id || "").trim();
    const latestAssistantMessage = builderChatHistory.find((item) => item.role === "assistant") || null;
    if (!latestAssistantMessage || !Array.isArray(latestAssistantMessage.actions) || !latestAssistantMessage.actions.length) {
      return { lead: null, extras: [] };
    }
    const visibleActions = latestAssistantMessage.actions.filter((action) => getActionIdentity(action) !== dismissedAssistantActionId);
    if (!visibleActions.length) {
      return { lead: null, extras: [] };
    }
    return {
      lead: visibleActions[0],
      extras: visibleActions.slice(1, 3),
    };
  }, [builderChatHistory, builderProjectMemory.dismissed_assistant_action_id]);
  const statusCardPrimaryAction = uiMode === "chat" ? latestAssistantLeadAction.lead : primaryNextAction;
  const statusCardSecondaryActions = uiMode === "chat" ? latestAssistantLeadAction.extras : secondaryNextActions;
  const currentChatFocusLabel = useMemo(() => {
    const lastBuilderRequest = String(builderProjectMemory.last_builder_workspace_request || "").trim();
    if (lastBuilderRequest) {
      return "builder ui";
    }
    if (/(this ai|the ai|builder ai|my builder|this builder|builder ui|chat ui)/i.test(String(builderProjectMemory.last_user_request || ""))) {
      return "builder ai";
    }
    return builderProjectMemory.app_type || featureState.appType || "New app";
  }, [builderProjectMemory.last_builder_workspace_request, builderProjectMemory.last_user_request, builderProjectMemory.app_type, featureState.appType]);
  const simpleStatusMessage = useMemo(() => simplifyStatusMessage(statusMessage, Boolean(projectId)), [statusMessage, projectId]);
  const simpleBuilderInsight = useMemo(() => simplifyInsightMessage(builderInsight, Boolean(projectId)), [builderInsight, projectId]);
  const selectedGeneratedCodeFile = useMemo(
    () => generatedCodeFiles.find((file) => file.path === selectedGeneratedFilePath) || generatedCodeFiles[0] || null,
    [generatedCodeFiles, selectedGeneratedFilePath],
  );
  const latestMutationVersion = useMemo(() => mutationVersions[0] || null, [mutationVersions]);

  const previewRoutes = useMemo(
    () => inferPreviewRoutes(generatedRoutes, generatedCodeFiles, featureState.appType),
    [generatedRoutes, generatedCodeFiles, featureState.appType],
  );
  const previewAuthState = useMemo(
    () => detectPreviewAuthState({
      files: generatedCodeFiles,
      routes: generatedRoutes,
      components: generatedComponents,
      systemPlanner,
      featureState,
    }),
    [generatedCodeFiles, generatedRoutes, generatedComponents, systemPlanner, featureState],
  );
  const activePreviewRoute = useMemo(
    () => previewRoutes.find((route) => route.path === selectedPreviewRoute) || previewRoutes[0] || null,
    [previewRoutes, selectedPreviewRoute],
  );

  useEffect(() => {
    if (!previewRoutes.length) return;
    if (!previewRoutes.some((route) => route.path === selectedPreviewRoute)) {
      setSelectedPreviewRoute(previewRoutes[0].path);
    }
  }, [previewRoutes, selectedPreviewRoute]);

  useEffect(() => {
    if (!previewAuthState.enabled && previewAuthMode !== "guest") {
      setPreviewAuthMode("guest");
      return;
    }
    if (previewAuthState.enabled && previewAuthMode === "guest") {
      setPreviewAuthMode("member");
    }
  }, [previewAuthState.enabled, previewAuthState.hasAdmin, previewAuthMode]);
  const latestOrchestrationEntry = useMemo(() => orchestrationHistory[0] || null, [orchestrationHistory]);
  const builderChatQuickIdeas = useMemo(() => [
    projectId ? "Keep improving this app" : "Build the first version",
    "Improve this builder UI",
    "Add backend auth API and frontend login flow",
    "Build a booking app for a small business",
    "Create a client portal with login and invoices",
    "Make a mobile-friendly dashboard for team tasks",
    "Add login and saved data",
    "Export this app for Render",
  ], [projectId]);
  const visibleChatQuickIdeas = useMemo(
    () => builderChatQuickIdeas.slice(0, projectId ? 3 : 4),
    [builderChatQuickIdeas, projectId],
  );
  const fullStackQuickActions = useMemo(() => [
    { label: "Auth + API", prompt: "add backend auth api and frontend login flow with protected dashboard routes" },
    { label: "Saved data", prompt: "add backend endpoints and frontend saved data flow for reports and history" },
    { label: "Billing", prompt: "add frontend pricing page and backend billing endpoints for subscriptions" },
    { label: "Admin tools", prompt: "add admin dashboard ui and backend management endpoints" },
  ], []);
  const generalStarterExamples = useMemo(() => [
    { label: "Improve this builder", prompt: "improve this builder ui and make the preview larger on the side" },
    { label: "Full-stack app", prompt: "build a full-stack app with frontend dashboard, backend API, login, and saved data" },
    { label: "Client portal", prompt: "build a client portal with login, invoices, messages, and a simple dashboard" },
    { label: "Booking app", prompt: "build a booking app for a local business with calendar, reminders, and admin view" },
    { label: "Team dashboard", prompt: "build a team dashboard with tasks, activity feed, and saved reports" },
    { label: "Content workspace", prompt: "build a content workspace with drafts, approval flow, and publishing calendar" },
  ], []);
  const builderAssistantQuickActions = useMemo(() => {
    const actionMap = {
      preview: { label: "Make preview bigger", prompt: "improve this builder ui and make the preview larger on the side" },
      clarity: { label: "Simplify builder", prompt: "simplify this builder ui and hide extra details" },
      chat: { label: "Improve chat flow", prompt: "improve this builder chat flow and make the composer easier to use" },
      header: { label: "Shrink header", prompt: "shrink the header and give more space to chat and preview" },
      mobile: { label: "Improve mobile", prompt: "improve this builder mobile layout and keep preview readable" },
      layout: { label: "Tune layout", prompt: "improve this builder layout and make panels cleaner" },
    };
    const orderedKeys = [...new Set([...(builderAssistantPrefs.favoriteFocuses || []), "preview", "clarity", "chat", "layout"])]
      .filter((key) => actionMap[key]);
    return orderedKeys.slice(0, 4).map((key) => actionMap[key]);
  }, [builderAssistantPrefs]);

  function buildScopedChatMessage(message) {
    const text = String(message || "").trim();
    if (!text) return text;
    if (isFullStackRequest(text)) {
      return `Full-stack request covering frontend and backend: ${text}`;
    }
    return text;
  }
  const builderAssistantRuleOptions = useMemo(() => [
    "Keep preview large",
    "Keep chat simple",
    "Hide extra details by default",
    "Prefer mobile-friendly layout",
  ], []);

  function toggleBuilderAssistantRule(rule) {
    setBuilderAssistantPrefs((prev) => {
      const existing = Array.isArray(prev?.preferredRules) ? prev.preferredRules : [];
      const preferredRules = existing.includes(rule)
        ? existing.filter((item) => item !== rule)
        : [...existing, rule];
      return { ...prev, preferredRules };
    });
  }

  function pinBuilderAssistantGoal(goalText) {
    const goal = String(goalText || builderChatDraft).trim();
    if (!goal) return;
    setBuilderAssistantPrefs((prev) => ({
      ...prev,
      pinnedGoals: [goal, ...(Array.isArray(prev?.pinnedGoals) ? prev.pinnedGoals : [])].filter((item, index, list) => item && list.indexOf(item) === index).slice(0, 4),
    }));
  }

  function removeBuilderAssistantGoal(goalText) {
    setBuilderAssistantPrefs((prev) => ({
      ...prev,
      pinnedGoals: (Array.isArray(prev?.pinnedGoals) ? prev.pinnedGoals : []).filter((item) => item !== goalText),
    }));
  }

  useEffect(() => {
    if (!generatedCodeFiles.length) {
      setLivePreviewDoc("");
      return;
    }

    const cssFile = generatedCodeFiles.find((file) => file.path === "src/styles/app.css");
    const appFile = generatedCodeFiles.find((file) => file.path === "src/App.jsx");
    const routeItems = previewRoutes.length ? previewRoutes : inferPreviewRoutes(generatedRoutes, generatedCodeFiles, featureState.appType);
    const currentRoute = routeItems.find((route) => route.path === selectedPreviewRoute) || routeItems[0] || null;
    const previewTitle =
      featureState.appType === "admin panel"
        ? "Generated Admin Dashboard"
        : featureState.appType === "assistant app"
          ? "Generated Assistant"
          : featureState.appType === "content app"
            ? "Generated Content Studio"
            : "Generated Tool App";

    const appSnippet = appFile?.content
      ? escapePreviewHtml(appFile.content.slice(0, 900))
      : "Generated app source preview unavailable.";

    const componentCards = generatedComponents.length
      ? generatedComponents.map((component) => `
          <div class="runner-chip">
            <strong>${escapePreviewHtml(component.name)}</strong>
            <span>${escapePreviewHtml(component.purpose)}</span>
          </div>
        `).join("\n")
      : `<div class="runner-empty">No generated components yet.</div>`;

    const fileCards = generatedCodeFiles.slice(0, 8).map((file) => `
      <div class="runner-file">
        <strong>${escapePreviewHtml(file.path)}</strong>
        <span>${escapePreviewHtml(file.language || "code")}</span>
      </div>
    `).join("\n");

    const routeTabs = routeItems.map((route) => `
      <button class="runner-route ${route.path === (currentRoute?.path || "") ? "active" : ""}">
        <span>${escapePreviewHtml(route.path)}</span>
        <small>${escapePreviewHtml(route.component || "Page")}</small>
      </button>
    `).join("\n");

    const authPills = previewAuthState.enabled
      ? [
        `<div class="runner-auth-pill ${previewAuthMode === "member" ? "active" : ""}">Member preview</div>`,
        previewAuthState.hasAdmin ? `<div class="runner-auth-pill ${previewAuthMode === "admin" ? "active" : ""}">Admin preview</div>` : "",
        `<div class="runner-auth-pill ${previewAuthMode === "guest" ? "active" : ""}">Signed-out preview</div>`,
      ].join("")
      : `<div class="runner-auth-pill active">Guest preview</div>`;

    const pageSummary = escapePreviewHtml(buildPreviewPageSummary(currentRoute, previewAuthState, featureState, prompt));
    const authBanner = previewAuthState.enabled
      ? previewAuthMode === "guest"
        ? "Signed-out preview shell"
        : previewAuthMode === "admin"
          ? "Authenticated admin shell"
          : "Authenticated member shell"
      : "Guest preview shell";
    const productTheme = getPreviewProductTheme(featureState, previewAuthState, currentRoute);
    const highlightCards = productTheme.highlights.map((item) => `
      <div class="runner-highlight">${escapePreviewHtml(item)}</div>
    `).join("");

    const previewDoc = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapePreviewHtml(previewTitle)}</title>
    <style>
      ${cssFile?.content || ""}
      :root {
        --runner-accent-a: ${productTheme.accentA};
        --runner-accent-b: ${productTheme.accentB};
        --runner-surface: ${productTheme.surface};
      }
      body {
        min-height: 100vh;
      }
      .runner-shell {
        min-height: 100vh;
        padding: 24px;
        display: grid;
        gap: 18px;
      }
      .runner-hero,
      .runner-panel {
        border: 1px solid rgba(148,163,184,.16);
        background: var(--runner-surface, rgba(13, 25, 43, 0.88));
        border-radius: 20px;
        padding: 18px;
        color: #e5eefc;
      }
      .runner-grid {
        display: grid;
        grid-template-columns: 1.1fr .9fr;
        gap: 18px;
      }
      .runner-chip-grid,
      .runner-file-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      .runner-chip,
      .runner-file,
      .runner-route,
      .runner-auth-pill {
        border: 1px solid rgba(148,163,184,.14);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255,255,255,.03);
        display: grid;
        gap: 6px;
      }
      .runner-route small,
      .runner-chip span,
      .runner-file span,
      .runner-muted {
        color: #93a4bf;
      }
      .runner-routes,
      .runner-auth {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }
      .runner-route.active,
      .runner-auth-pill.active {
        border-color: color-mix(in srgb, var(--runner-accent-a, #66d9ef) 55%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--runner-accent-a, #66d9ef) 25%, transparent) inset;
      }
      .runner-sim-shell {
        border: 1px solid rgba(148,163,184,.14);
        border-radius: 18px;
        background: rgba(255,255,255,.025);
        overflow: hidden;
      }
      .runner-sim-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        border-bottom: 1px solid rgba(148,163,184,.12);
      }
      .runner-sim-body {
        display: grid;
        grid-template-columns: ${previewAuthState.enabled || featureState.appType === "admin panel" ? "220px 1fr" : "1fr"};
        min-height: 320px;
      }
      .runner-sim-nav {
        border-right: 1px solid rgba(148,163,184,.12);
        padding: 16px;
        display: ${previewAuthState.enabled || featureState.appType === "admin panel" ? "grid" : "none"};
        gap: 10px;
        align-content: start;
      }
      .runner-nav-item {
        border: 1px solid rgba(148,163,184,.12);
        border-radius: 12px;
        padding: 10px 12px;
        background: rgba(255,255,255,.03);
      }
      .runner-sim-content {
        padding: 18px;
        display: grid;
        gap: 14px;
      }
      .runner-summary {
        border: 1px solid rgba(148,163,184,.14);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255,255,255,.03);
      }
      .runner-kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
      }
      .runner-kpi {
        border: 1px solid rgba(148,163,184,.12);
        border-radius: 16px;
        padding: 14px;
        background: rgba(255,255,255,.025);
      }
      .runner-code {
        margin-top: 12px;
        padding: 14px;
        border-radius: 16px;
        border: 1px solid rgba(148,163,184,.14);
        background: rgba(0,0,0,.22);
        color: #d9e7ff;
        white-space: pre-wrap;
        overflow: auto;
        max-height: 320px;
        font-size: 12px;
        line-height: 1.5;
      }
      .runner-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 999px;
        padding: 12px 18px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--runner-accent-a, #66d9ef), var(--runner-accent-b, #8b5cf6));
        color: #07111f;
        margin-top: 12px;
      }

      .runner-hero-copy {
        max-width: 760px;
        color: #c9d7ee;
      }
      .runner-hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }
      .runner-meta-pill,
      .runner-highlight {
        border: 1px solid rgba(148,163,184,.14);
        border-radius: 999px;
        padding: 9px 12px;
        background: rgba(255,255,255,.04);
        color: #dbe7fb;
      }
      .runner-highlight-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }
      .runner-summary-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 10px;
      }
      .runner-section-label {
        color: #93a4bf;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: .08em;
      }
      @media (max-width: 900px) {
        .runner-grid,
        .runner-sim-body {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="runner-shell">
      <section class="runner-hero">
        <div class="pill">${escapePreviewHtml(productTheme.eyebrow)}</div>
        <h1 style="margin:12px 0 6px;">${escapePreviewHtml(productTheme.heroTitle)}</h1>
        <p class="runner-hero-copy">${escapePreviewHtml(productTheme.heroCopy)}</p>
        <div class="runner-hero-meta">
          <div class="runner-meta-pill">${escapePreviewHtml(previewTitle)}</div>
          <div class="runner-meta-pill">${escapePreviewHtml(currentRoute?.path || "/")}</div>
          <div class="runner-meta-pill">${escapePreviewHtml(authBanner)}</div>
        </div>
        <div class="runner-routes">${routeTabs}</div>
        <div class="runner-auth">${authPills}</div>
        <div class="runner-highlight-grid">${highlightCards}</div>
        <button class="runner-button">${escapePreviewHtml(productTheme.primaryLabel)}</button>
      </section>

      <section class="runner-panel">
        <div class="runner-sim-shell">
          <div class="runner-sim-topbar">
            <strong>${escapePreviewHtml(currentRoute?.component || "Page")}</strong>
            <span class="runner-muted">${escapePreviewHtml(currentRoute?.path || "/")} · ${escapePreviewHtml(authBanner)}</span>
          </div>
          <div class="runner-sim-body">
            <aside class="runner-sim-nav">
              ${routeItems.slice(0, 6).map((route) => `<div class="runner-nav-item">${escapePreviewHtml(route.path)}</div>`).join("")}
            </aside>
            <div class="runner-sim-content">
              <div class="runner-summary">
                <div class="runner-summary-head">
                  <strong>Current page summary</strong>
                  <span class="runner-section-label">${escapePreviewHtml(productTheme.navLabel)}</span>
                </div>
                <p class="runner-muted" style="margin:8px 0 0;">${pageSummary}</p>
              </div>
              <div class="runner-kpis">
                <div class="runner-kpi"><strong>${escapePreviewHtml(featureState.appType)}</strong><div class="runner-muted">App type</div></div>
                <div class="runner-kpi"><strong>${escapePreviewHtml(featureState.builderMode)}</strong><div class="runner-muted">Builder mode</div></div>
                <div class="runner-kpi"><strong>${generatedCodeFiles.length}</strong><div class="runner-muted">Generated files</div></div>
                <div class="runner-kpi"><strong>${routeItems.length}</strong><div class="runner-muted">Routes</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="runner-grid">
        <section class="runner-panel">
          <h2 style="margin:0 0 10px;">Generated components</h2>
          <div class="runner-chip-grid">${componentCards}</div>
        </section>

        <section class="runner-panel">
          <h2 style="margin:0 0 10px;">Generated files</h2>
          <div class="runner-file-grid">${fileCards}</div>
        </section>
      </div>

      <section class="runner-panel">
        <h2 style="margin:0 0 10px;">Generated App.jsx preview</h2>
        <div class="runner-code"><code>${appSnippet}</code></div>
      </section>
    </div>
  </body>
</html>`;
    setLivePreviewDoc(previewDoc);
  }, [generatedCodeFiles, generatedComponents, generatedRoutes, featureState.appType, featureState.builderMode, previewRoutes, selectedPreviewRoute, previewAuthState, previewAuthMode, prompt]);

  function appendBuilderChatMessage(message) {
    setBuilderChatHistory((prev) => [{
      id: uid("chat"),
      time: nowLabel(),
      ...message,
    }, ...prev].slice(0, 40));
    setChatScrollTick((prev) => prev + 1);
  }

  function dismissPrimaryNextAction() {
    if (!primaryNextAction) return;
    const actionId = getActionIdentity(primaryNextAction);
    setBuilderProjectMemory((prev) => ({
      ...prev,
      dismissed_next_action_id: actionId,
      dismissed_next_action_label: primaryNextAction.label || "",
    }));
    setBuilderInsight(`Hidden suggestion: ${primaryNextAction.label || "Next improvement"}.`);
    setStatusMessage("Builder hid that suggestion. Another next step will show instead.");
  }

  function applyPrimaryNextAction(action) {
    if (!action) return;
    const actionId = getActionIdentity(action);
    setBuilderProjectMemory((prev) => ({
      ...prev,
      dismissed_next_action_id: "",
      accepted_next_action_id: actionId,
      accepted_next_action_label: action.label || "",
    }));
    submitBuilderChatMessage(action.cmd, action.cmd === "run-planner" ? "mutate" : "evolve");
  }

  function dismissAssistantSuggestedAction(action) {
    if (!action) return;
    const actionId = getActionIdentity(action);
    setBuilderProjectMemory((prev) => ({
      ...prev,
      dismissed_assistant_action_id: actionId,
      dismissed_assistant_action_label: action.label || "",
    }));
    setBuilderInsight(`Hidden chat suggestion: ${action.label || "Next improvement"}.`);
  }

  function applyAssistantSuggestedAction(action) {
    if (!action) return;
    const actionId = getActionIdentity(action);
    setBuilderProjectMemory((prev) => ({
      ...prev,
      dismissed_assistant_action_id: "",
      accepted_assistant_action_id: actionId,
      accepted_assistant_action_label: action.label || "",
    }));
    submitBuilderChatMessage(action.prompt, action.mode || "evolve");
  }

  function applyRvSmartTemplate(templateKey, submitNow = false) {
    const template = getRvTemplateByKey(templateKey);
    setSelectedRvTemplateKey(template.key);
    setSimpleDraft({
      starterKey: template.starterKey,
      appName: template.label,
      mainGoal: template.goal,
      style: template.style,
    });
    setPrompt(template.prompt);
    setBuilderChatDraft(template.prompt);
    setUiMode("chat");
    setSimpleFlowStep("builder");
    setFeatureState((prev) => ({
      ...prev,
      quickIdea: template.prompt,
      notes: prev.notes || `RV smart template selected: ${template.label}`,
      themeTone: template.style,
    }));
    setSystemPlanner((previous) => inferSystemPlanner({
      prompt: template.prompt,
      appType: inferAppType(template.prompt),
      builderMode: inferBuilderMode(template.prompt),
      routes: generatedRoutes,
      components: generatedComponents,
      featureState: {
        ...featureState,
        quickIdea: template.prompt,
      },
      previousPlanner: {
        ...(previous || {}),
        systems: [...new Set([...(previous?.systems || []), ...(template.systems || [])])],
        complexity: previous?.complexity || "product",
      },
    }));
    setStatusMessage(`RV smart template ready: ${template.label}.`);
    setBuilderInsight(`${template.label} template loaded with ${template.systems.length} connected systems.`);
    if (submitNow) {
      submitBuilderChatMessage(template.prompt, "evolve");
    }
  }

  async function requestBuilderChatAgent(message, chatMode) {
    const recentMessages = builderChatHistory
      .slice(0, 6)
      .reverse()
      .map((item) => ({
        role: item.role,
        text: item.text,
      }));
    const response = await fetch(`${API_BASE}/chat-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        project_id: projectId,
        current_prompt: prompt,
        project_memory: builderProjectMemory,
        feature_state: featureState,
        generated_files: generatedCodeFiles,
        routes: generatedRoutes,
        components: generatedComponents,
        system_planner: systemPlanner,
        chat_mode: chatMode,
        reply_preference: chatReplyPreference,
        recent_messages: recentMessages,
      }),
    });

    if (!response.ok) throw new Error("Chat agent request failed");
    return response.json();
  }

  async function requestRepoEdit(message, targetScope = fullStackScope) {
    const response = await fetch(`${API_BASE}/repo-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: message,
        current_files: generatedCodeFiles,
        app_type: featureState.appType,
        builder_mode: featureState.builderMode,
        style: simpleDraft.style || "Dark glass",
        target_scope: targetScope,
        project_memory: builderProjectMemory,
        feature_state: featureState,
        system_planner: systemPlanner,
      }),
    });

    if (!response.ok) throw new Error("Repo edit request failed");
    return response.json();
  }

  async function requestWorkspaceEdit(message, targetScope = fullStackScope) {
    const response = await fetch(`${API_BASE}/workspace-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: message,
        current_files: generatedCodeFiles,
        app_type: featureState.appType,
        builder_mode: featureState.builderMode,
        style: simpleDraft.style || "Dark glass",
        target_scope: targetScope,
        project_memory: builderProjectMemory,
        feature_state: featureState,
        system_planner: systemPlanner,
      }),
    });

    if (!response.ok) throw new Error("Workspace edit request failed");
    return response.json();
  }

  async function submitBuilderChatMessage(rawMessage, modeOverride) {
    const message = String(rawMessage || builderChatDraft).trim();
    if (!message || isChatSubmitting) return;
    const scopedMessage = buildScopedChatMessage(message);

    const resolvedMode = modeOverride || (projectId ? "mutate" : "evolve");
    appendBuilderChatMessage({
      role: "user",
      text: message,
      meta: projectId ? `Project ${projectId}` : "New project idea",
    });
    setBuilderChatDraft("");
    setPrompt(scopedMessage);
    setUiMode("chat");
    setSimpleFlowStep("builder");

    try {
      setIsChatSubmitting(true);
      if (isBuilderWorkspaceRequest(message)) {
        const workspaceSummary = applyBuilderWorkspaceCommand(message);
        setBuilderAssistantPrefs((prev) => updateBuilderAssistantPrefs(prev, message));
        appendBuilderChatMessage({
          role: "assistant",
          text: workspaceSummary?.notes?.length
            ? `I updated this builder for you. ${workspaceSummary.notes.join(" ")}`
            : "I updated this builder workspace for you.",
          meta: [
            workspaceSummary?.layout ? `Layout: ${getLayoutLabel(workspaceSummary.layout)}` : null,
            workspaceSummary?.add?.length ? `Added: ${workspaceSummary.add.join(", ")}` : null,
            workspaceSummary?.remove?.length ? `Removed: ${workspaceSummary.remove.join(", ")}` : null,
          ].filter(Boolean).join(" • "),
        });
        setBuilderProjectMemory((prev) => ({
          ...prev,
          builder_summary: "This chat can help improve the builder UI as well as generated apps.",
          last_builder_workspace_request: message,
          dismissed_assistant_action_id: "",
          accepted_assistant_action_id: "",
          accepted_assistant_action_label: "",
        }));
        setStatusMessage("Builder UI updated.");
        setBuilderInsight(workspaceSummary?.notes?.length
          ? workspaceSummary.notes.join(" ")
          : "The builder layout was updated for your request.");
        return;
      }

      if (isFullStackRequest(message) && generatedCodeFiles.length) {
        const targetScope = fullStackScope || "fullstack";
        setBuilderProjectMemory((prev) => ({
          ...prev,
          preferred_scope: targetScope === "fullstack" ? "frontend-and-backend" : targetScope,
          full_stack_preferred: true,
        }));
        if (generatedCodeFiles.length) {
          let repoEditData = null;
          let workspaceWriteUsed = false;
          try {
            const workspaceEditData = await requestWorkspaceEdit(scopedMessage, targetScope);
            if (workspaceEditData?.ok) {
              repoEditData = workspaceEditData;
              workspaceWriteUsed = Boolean(workspaceEditData.workspace_edit_enabled);
            }
          } catch {
            workspaceWriteUsed = false;
          }
          if (!repoEditData) {
            repoEditData = await requestRepoEdit(scopedMessage, targetScope);
          }
          applyGeneratedProjectPayload(repoEditData, {
            prompt: scopedMessage,
            appType: repoEditData.app_type || featureState.appType,
            builderMode: repoEditData.builder_mode || featureState.builderMode,
            routes: repoEditData.routes || generatedRoutes,
            components: repoEditData.components || generatedComponents,
          });
          appendBuilderChatMessage({
            role: "assistant",
            text: repoEditData.summary || "I prepared frontend and backend updates for this project.",
            meta: [
              repoEditData.changed_file_count ? `${repoEditData.changed_file_count} files updated` : null,
              workspaceWriteUsed ? `${repoEditData.written_file_count || 0} files written to workspace` : "Bundle update only",
              `Scope: ${repoEditData.target_scope || targetScope}`,
              repoEditData.backup_count ? `${repoEditData.backup_count} backups saved` : null,
            ].filter(Boolean).join(" • "),
          });
          setBuilderProjectMemory((prev) => ({
            ...prev,
            workspace_edit_enabled: Boolean(repoEditData.workspace_edit_enabled),
            workspace_last_scope: repoEditData.target_scope || targetScope,
            workspace_last_backup_manifest: repoEditData.backup_manifest || "",
          }));
          return;
        }
      }

      const agentData = await requestBuilderChatAgent(scopedMessage, resolvedMode);
      if (agentData?.project_memory) {
        setBuilderProjectMemory(agentData.project_memory);
      }
      const agentMeta = [
        agentData?.status_summary || null,
        !agentData?.status_summary ? agentData?.memory_summary || null : null,
        agentData?.ready_to_apply && !agentData?.status_summary ? `Ready to apply with ${agentData.apply_mode || resolvedMode}` : null,
      ].filter(Boolean).join(". ");

      appendBuilderChatMessage({
        role: "assistant",
        text: agentData?.assistant_message || "I reviewed that request.",
        meta: agentMeta,
        questions: Array.isArray(agentData?.questions) ? agentData.questions : [],
        actions: Array.isArray(agentData?.suggested_actions) ? agentData.suggested_actions : [],
        advice: agentData?.advice || null,
        researchFindings: Array.isArray(agentData?.research_findings) ? agentData.research_findings : [],
        knowledgeHits: Array.isArray(agentData?.knowledge_hits) ? agentData.knowledge_hits : [],
        researchRecommendation: agentData?.research_recommendation || null,
      });

      if (!agentData?.ready_to_apply) {
        setBuilderInsight(
          agentData?.suggested_actions?.[0]?.reason
          || agentData?.assistant_message
          || "Builder is waiting for your next instruction."
        );
        setStatusMessage(
          agentData?.response_type === "clarify"
            ? "Builder needs one or two details before applying changes."
            : agentData?.response_type === "answer"
              ? "Builder answered your question and is ready for the next one."
              : "Builder shared suggestions and is waiting for your next choice."
        );
        return;
      }

      const applyMode = agentData?.apply_mode || resolvedMode;
      const applyPrompt = String(agentData?.apply_prompt || scopedMessage).trim();
      const summary = applyMode === "mutate"
        ? await handleGeneratedAppMutation(applyPrompt)
        : await runBuilderBrain(applyPrompt);

      const systemLine = (summary?.systems || systemPlanner.systems || []).slice(0, 4).map((key) => formatSystemLabel(key)).join(", ");
      const fileCount = summary?.generatedFileCount ?? generatedCodeFiles.length;
      const routeCount = summary?.routeCount ?? generatedRoutes.length;
      const projectLabel = summary?.projectId || projectId || "local";
      const assistantParts = [
        summary?.projectId ? `Project ${projectLabel} updated.` : (projectId ? `Continued project ${projectLabel}.` : "Builder updated the workspace."),
        summary?.appType ? `App type: ${summary.appType}.` : null,
        summary?.builderMode ? `Mode: ${summary.builderMode}.` : null,
        fileCount ? `${fileCount} generated files ready.` : null,
        routeCount ? `${routeCount} routes planned.` : null,
        systemLine ? `Systems: ${systemLine}.` : null,
        summary?.statusMessage || statusMessage || null,
      ].filter(Boolean);

      appendBuilderChatMessage({
        role: "assistant",
        text: assistantParts.join(" "),
        meta: summary?.mutationSummary?.length
          ? summary.mutationSummary.slice(0, 3).join(" • ")
          : (summary?.builderInsight || builderInsight),
      });
    } catch (error) {
      appendBuilderChatMessage({
        role: "assistant",
        text: `The builder hit an error while applying that idea: ${error.message}`,
        meta: "You can retry the same prompt or switch to Pro mode to inspect details.",
      });
    } finally {
      setIsChatSubmitting(false);
    }
  }


  function updateSimpleDraft(field, value) {
    setSimpleDraft((prev) => ({ ...prev, [field]: value }));
  }

  function selectSimpleStarter(starterKey) {
    const starter = getSimpleStarterByKey(starterKey);
    setSimpleDraft((prev) => ({
      ...prev,
      starterKey,
      appName:
        prev.appName && prev.appName !== DEFAULT_SIMPLE_DRAFT.appName
          ? prev.appName
          : starter.label,
      mainGoal:
        prev.mainGoal && prev.mainGoal !== DEFAULT_SIMPLE_DRAFT.mainGoal
          ? prev.mainGoal
          : starter.goalPlaceholder,
    }));
    setSimpleFlowStep("config");
    setStatusMessage(`Simple onboarding set to ${starter.label}.`);
  }

  function launchSimpleBuilder() {
    const starterPrompt = buildSimpleStarterPrompt(simpleDraft);
    setPrompt(starterPrompt);
    setSimplePendingPrompt(starterPrompt);
    setSimpleGenerationStage(0);
    setSimpleFlowStep("generating");
    setStatusMessage("Preparing your first builder version...");
  }

  function runNextBestAction(action) {
    if (!action) return;
    if (action.cmd === "run-planner") {
      runBatteryPlan();
      return;
    }
    setPrompt(action.cmd);
    runBuilderBrain(action.cmd);
    setSimpleFlowStep("builder");
  }

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

  function applyGeneratedProjectPayload(payload, fallbackContext = {}) {
    const nextRoutes = extractOrchestratedRoutes(payload, fallbackContext.routes || generatedRoutes || []);
    const nextComponents = extractOrchestratedComponents(payload, fallbackContext.components || generatedComponents || []);
    const nextFileTree = extractOrchestratedFileTree(payload, fallbackContext.fileTree || generatedFileTree || []);
    const rawFiles = extractOrchestratedFiles(payload);
    const resolvedAppType = payload?.app_type || fallbackContext.appType || featureState.appType;
    const resolvedBuilderMode = payload?.builder_mode || fallbackContext.builderMode || featureState.builderMode;
    const nextLayout = payload?.layout_changes || payload?.project_state?.layout || layoutState;
    const nextModules = Array.isArray(payload?.module_changes?.enable) && payload.module_changes.enable.length
      ? payload.module_changes.enable
      : Array.isArray(payload?.project_state?.modules) && payload.project_state.modules.length
        ? payload.project_state.modules
        : activeModules;
    const files = augmentGeneratedFilesWithSmartPackage(rawFiles, {
      prompt: fallbackContext.prompt || payload?.prompt || prompt,
      appType: resolvedAppType,
      builderMode: resolvedBuilderMode,
      routes: nextRoutes,
      components: nextComponents,
    });

    if (payload?.project_id) {
      setProjectId(payload.project_id);
      setOrchestrationHistory((prev) => [
        {
          id: uid("orch"),
          projectId: payload.project_id,
          prompt: fallbackContext.prompt || payload?.prompt || prompt,
          time: nowLabel(),
        },
        ...prev.filter((item) => item.projectId !== payload.project_id),
      ].slice(0, 12));
    }

    setLayoutState(nextLayout);
    setActiveModules((prev) => [...new Set([...(Array.isArray(prev) ? prev : []), ...(Array.isArray(nextModules) ? nextModules : [])])]);
    setFeatureState((prev) => ({
      ...prev,
      appType: resolvedAppType,
      builderMode: resolvedBuilderMode,
      quickIdea: fallbackContext.prompt || payload?.prompt || prev.quickIdea,
    }));
    setGeneratedFileTree(nextFileTree);
    setGeneratedRoutes(nextRoutes);
    setGeneratedComponents(nextComponents);
    setGeneratedCodeFiles(files);
    setSelectedGeneratedFilePath(files[0]?.path || "");
    setGeneratedAppMonetization(payload?.monetization || null);
    setSystemPlanner((previous) => inferSystemPlanner({
      prompt: fallbackContext.prompt || payload?.prompt || prompt,
      appType: resolvedAppType,
      builderMode: resolvedBuilderMode,
      routes: nextRoutes,
      components: nextComponents,
      featureState: {
        ...featureState,
        appType: resolvedAppType,
        builderMode: resolvedBuilderMode,
        quickIdea: fallbackContext.prompt || payload?.prompt || featureState.quickIdea,
      },
      previousPlanner: {
        ...(previous || {}),
        systems: payload?.project_memory?.systems || previous?.systems || [],
        complexity: payload?.complexity || previous?.complexity,
      },
    }));
    if (payload?.project_memory) {
      setBuilderProjectMemory(payload.project_memory);
    }
    return { files, nextRoutes, nextComponents, nextFileTree };
  }

  async function runOrchestrationFlow(sourcePrompt, options = {}) {
    const payload = {
      prompt: `${sourcePrompt}${buildSystemPlannerPromptBlock(systemPlanner)}`,
      project_id: options.projectId ?? projectId ?? undefined,
      app_type: options.appType || featureState.appType,
      builder_mode: options.builderMode || featureState.builderMode,
      style: simpleDraft.style || "Dark glass",
      routes: options.routes || generatedRoutes,
      components: options.components || generatedComponents,
      current_files: options.currentFiles || generatedCodeFiles,
      system_planner: systemPlanner,
      system_prompt: buildSystemPlannerPromptBlock(systemPlanner),
      project_memory: builderProjectMemory,
      feature_state: featureState,
      current_layout: layoutState,
      active_modules: activeModules,
      rv_template_key: selectedRvTemplateKey,
      rv_camping_profile: rvCampingProfileKey,
    };

    const response = await fetch(`${API_BASE}/orchestrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Orchestration request failed");
    const data = await response.json();
    const applied = applyGeneratedProjectPayload(data, {
      prompt: sourcePrompt,
      appType: options.appType || featureState.appType,
      builderMode: options.builderMode || featureState.builderMode,
      routes: options.routes || generatedRoutes,
      components: options.components || generatedComponents,
      fileTree: options.fileTree || generatedFileTree,
    });

    if (Array.isArray(data.next_best_actions)) setBackendNextActions(data.next_best_actions);
    if (Array.isArray(data.mutation_summary)) setBackendMutationSummary(data.mutation_summary);

    return { ...data, ...applied };
  }

  function buildMutationLoopPrompt(instruction) {
    const basePrompt = prompt || featureState.quickIdea || `${featureState.appType} ${featureState.builderMode}`;
    return [
      `Base app: ${basePrompt}`,
      `Current app type: ${featureState.appType}`,
      `Current builder mode: ${featureState.builderMode}`,
      `Mutation request: ${instruction}`,
    ].join("\n");
  }

  function saveMutationVersionSnapshot(label) {
    if (!generatedCodeFiles.length) return;
    const snapshot = {
      id: uid("ver"),
      label,
      time: nowLabel(),
      files: generatedCodeFiles.map((file) => ({ ...file })),
      routes: generatedRoutes.map((route) => ({ ...route })),
      components: generatedComponents.map((component) => ({ ...component })),
      fileTree: generatedFileTree.map((item) => ({ ...item })),
      livePreviewDoc,
      selectedPath: selectedGeneratedFilePath || generatedCodeFiles[0]?.path || "",
      prompt,
      appType: featureState.appType,
      builderMode: featureState.builderMode,
    };

    setMutationVersions((prev) => [snapshot, ...prev].slice(0, 12));
  }

  function restoreMutationVersion(snapshot) {
    if (!snapshot) return;
    setGeneratedCodeFiles(snapshot.files || []);
    setGeneratedRoutes(snapshot.routes || []);
    setGeneratedComponents(snapshot.components || []);
    setGeneratedFileTree(snapshot.fileTree || []);
    setSelectedGeneratedFilePath(snapshot.selectedPath || snapshot.files?.[0]?.path || "");
    setPrompt(snapshot.prompt || prompt);
    setFeatureState((prev) => ({
      ...prev,
      appType: snapshot.appType || prev.appType,
      builderMode: snapshot.builderMode || prev.builderMode,
      quickIdea: snapshot.prompt || prev.quickIdea,
    }));
    setLivePreviewDoc(snapshot.livePreviewDoc || "");
    appendMutationLog({
      type: "restore-version",
      command: snapshot.label || "restore version",
      details: `Restored ${snapshot.label || "saved version"} from ${snapshot.time}.`,
    });
    setStatusMessage(`Restored ${snapshot.label || "saved version"}.`);
  }

  function ensureModules(modulesToAdd) {
    if (!modulesToAdd?.length) return;
    setActiveModules((prev) => [...new Set([...prev, ...modulesToAdd])]);
  }

  function removeModules(modulesToRemove) {
    if (!modulesToRemove?.length) return;
    setActiveModules((prev) => prev.filter((item) => !modulesToRemove.includes(item)));
  }

  async function downloadSelectedGeneratedFile(file) {
    if (!file?.path) {
      setStatusMessage("Pick a generated file before downloading it.");
      return;
    }
    downloadTextFile(file.path.split("/").pop() || "generated-file.txt", file.content || "", "text/plain;charset=utf-8");
    setStatusMessage(`Downloaded ${file.path}.`);
  }

  async function downloadProjectZipBundle() {
    const files = augmentGeneratedFilesWithSmartPackage(generatedCodeFiles, {
      prompt,
      appType: featureState.appType,
      builderMode: featureState.builderMode,
      routes: generatedRoutes,
      components: generatedComponents,
    });
    if (!files.length) {
      setStatusMessage("Generate code first so the zip can be created.");
      return;
    }

    const projectSeed = prompt || featureState.quickIdea || `${featureState.appType || "builder"}-${featureState.builderMode || "project"}`;
    const folderName = sanitizeProjectName(projectSeed);
    const zipFilename = `${folderName}.zip`;

    try {
      setIsDownloadingZip(true);
      setStatusMessage("Building project zip...");

      const zip = new JSZip();
      const root = zip.folder(folderName);

      files.forEach((file) => {
        root.file(file.path, file.content);
      });

      const hasReadme = files.some((file) => file.path.toLowerCase() === "readme.md");
      if (!hasReadme) {
        root.file(
          "README.md",
          buildProjectReadme({
            appType: featureState.appType,
            builderMode: featureState.builderMode,
            prompt,
            routes: generatedRoutes,
            components: generatedComponents,
            files,
            folderName,
          }),
        );
      }

      root.file(
        ".builder-meta.json",
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            prompt,
            appType: featureState.appType,
            builderMode: featureState.builderMode,
            fileCount: files.length,
            routes: generatedRoutes,
            components: generatedComponents,
          },
          null,
          2,
        ),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      triggerBrowserDownload(blob, zipFilename);
      appendMutationLog({
        type: "project-zip",
        command: prompt,
        details: `Downloaded ${zipFilename} with ${files.length} generated files.`,
      });
      setStatusMessage(`Project zip ready: ${zipFilename}`);
    } catch (error) {
      setStatusMessage(`Zip download failed: ${error.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  }


  async function downloadDeploymentBundle(target) {
    if (!generatedCodeFiles.length) {
      setStatusMessage("Generate code first so the deployment export can be created.");
      return;
    }

    const exportTarget = target === "vercel" ? "vercel" : "render";
    const context = {
      prompt,
      appType: featureState.appType,
      builderMode: featureState.builderMode,
      routes: generatedRoutes,
      components: generatedComponents,
      folderName: sanitizeProjectName(prompt || featureState.quickIdea || "builder-project"),
    };

    try {
      setDeployExportTarget(exportTarget);
      setStatusMessage(`Preparing ${exportTarget} export...`);

      const bundle = buildDeployExportFiles(exportTarget, generatedCodeFiles, context);
      const zip = new JSZip();
      const root = zip.folder(`${bundle.folderName}-${exportTarget}`);

      bundle.files.forEach((file) => {
        root.file(file.path, file.content || "");
      });

      root.file(
        ".builder-deploy-meta.json",
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            target: exportTarget,
            prompt,
            projectId: projectId || "",
            appType: featureState.appType,
            builderMode: featureState.builderMode,
            fileCount: bundle.files.length,
          },
          null,
          2,
        ),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      triggerBrowserDownload(blob, `${bundle.folderName}-${exportTarget}.zip`);
      appendMutationLog({
        type: "deploy-export",
        command: exportTarget,
        details: `Exported ${exportTarget} bundle with ${bundle.files.length} files.`,
      });
      setStatusMessage(`${exportTarget === "render" ? "Render" : "Vercel"} export ready.`);
    } catch (error) {
      setStatusMessage(`${exportTarget} export failed: ${error.message}`);
    } finally {
      setDeployExportTarget("");
    }
  }

  async function handleGeneratedAppMutation(customInstruction) {
    const instruction = (customInstruction ?? mutationLoopInput).trim();
    if (!instruction) {
      setStatusMessage("Write a mutation request first.");
      return;
    }

    if (!generatedCodeFiles.length) {
      setStatusMessage("Generate the app first before running a mutation loop.");
      return;
    }

    const mutationPrompt = buildMutationLoopPrompt(instruction);

    try {
      setIsMutatingGeneratedApp(true);
      setStatusMessage("Applying mutation loop...");
      saveMutationVersionSnapshot(`Before: ${instruction}`);

      const response = await fetch(`${API_BASE}/mutate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: mutationPrompt,
          instruction,
          project_memory: builderProjectMemory,
          current_layout: layoutState,
          active_modules: activeModules,
          feature_state: featureState,
          system_planner: systemPlanner,
          current_files: generatedCodeFiles,
          current_routes: generatedRoutes,
          current_components: generatedComponents,
        }),
      });

      if (!response.ok) throw new Error("Mutation loop request failed");
      const data = await response.json();

      const nextLayout = data.layout_changes || applyLayoutCommand(instruction, layoutState, activeModules).layout;
      const nextRoutes = Array.isArray(data.routes) ? data.routes : generatedRoutes;
      const nextComponents = Array.isArray(data.components) ? data.components : generatedComponents;
      const nextFileTree = Array.isArray(data.file_tree) ? data.file_tree : generatedFileTree;
      const nextModules = data.module_changes?.enable?.length
        ? [...new Set([...activeModules, ...data.module_changes.enable])]
        : activeModules;

      setLayoutState(nextLayout);
      setActiveModules(nextModules);
      setGeneratedFileTree(nextFileTree);
      setGeneratedRoutes(nextRoutes);
      setGeneratedComponents(nextComponents);
      setBackendNextActions(Array.isArray(data.next_best_actions) ? data.next_best_actions : backendNextActions);
      setBackendMutationSummary(Array.isArray(data.mutation_summary) ? data.mutation_summary : []);
      if (data?.project_memory) {
        setBuilderProjectMemory(data.project_memory);
      }

      const combinedPrompt = `${prompt || featureState.quickIdea} → ${instruction}`;
      setPrompt(combinedPrompt);
      setFeatureState((prev) => ({
        ...prev,
        appType: data.app_type || prev.appType,
        builderMode: data.builder_mode || prev.builderMode,
        quickIdea: combinedPrompt,
      }));

      await runGenerateCodeBundle(
        combinedPrompt,
        data.app_type || featureState.appType,
        data.builder_mode || featureState.builderMode,
        nextRoutes,
        nextComponents,
      );

      appendMutationLog({
        type: "mutation-loop",
        command: instruction,
        details: data.mutation_summary?.length
          ? data.mutation_summary.join(" • ")
          : `Applied mutation loop update for ${instruction}.`,
      });

      setCommandHistory((prev) => [
        {
          id: uid("cmd"),
          prompt: combinedPrompt,
          time: nowLabel(),
          appType: data.app_type || featureState.appType,
          builderMode: data.builder_mode || featureState.builderMode,
        },
        ...prev,
      ]);

      const mutationBuilderInsight = data.mutation_summary?.length
        ? data.mutation_summary.join(" • ")
        : `Builder improved the generated app with: ${instruction}.`;
      const mutationStatusMessage = `Mutation loop applied: ${instruction}`;
      setBuilderInsight(mutationBuilderInsight);
      setMutationLoopInput("");
      setStatusMessage(mutationStatusMessage);
      return {
        ok: true,
        projectId: projectId || "",
        generatedFileCount: generatedCodeFiles.length,
        routeCount: nextRoutes.length,
        componentCount: nextComponents.length,
        mutationSummary: Array.isArray(data.mutation_summary) ? data.mutation_summary : [instruction],
        builderInsight: mutationBuilderInsight,
        statusMessage: mutationStatusMessage,
        systems: systemPlanner.systems || [],
      };
    } catch (error) {
      const mutationErrorMessage = `Mutation loop failed: ${error.message}`;
      setStatusMessage(mutationErrorMessage);
      return {
        ok: false,
        projectId: projectId || "",
        generatedFileCount: generatedCodeFiles.length,
        routeCount: generatedRoutes.length,
        componentCount: generatedComponents.length,
        mutationSummary: [error.message],
        builderInsight: builderInsight,
        statusMessage: mutationErrorMessage,
        systems: systemPlanner.systems || [],
      };
    } finally {
      setIsMutatingGeneratedApp(false);
    }
  }

  function togglePlannedSystem(systemKey) {
    setSystemPlanner((previous) => {
      const exists = previous.systems.includes(systemKey);
      const systems = exists
        ? previous.systems.filter((item) => item !== systemKey)
        : [...previous.systems, systemKey];
      return inferSystemPlanner({
        prompt,
        appType: featureState.appType,
        builderMode: featureState.builderMode,
        routes: generatedRoutes,
        components: generatedComponents,
        featureState,
        previousPlanner: { ...previous, systems },
      });
    });
  }

  function setPlannerComplexity(complexity) {
    setSystemPlanner((previous) => ({ ...previous, complexity }));
  }

  function refreshSystemPlanner() {
    setSystemPlanner((previous) => inferSystemPlanner({
      prompt,
      appType: featureState.appType,
      builderMode: featureState.builderMode,
      routes: generatedRoutes,
      components: generatedComponents,
      featureState,
      previousPlanner: previous,
    }));
    setStatusMessage("System planner refreshed.");
  }

  async function runGenerateCodeBundle(sourcePrompt, appType, builderMode, routes, components) {
    try {
      const orchestrationData = await runOrchestrationFlow(sourcePrompt, {
        appType,
        builderMode,
        routes,
        components,
        currentFiles: generatedCodeFiles,
        fileTree: generatedFileTree,
      });

      appendMutationLog({
        type: projectId ? "orchestration-update" : "orchestration-create",
        command: sourcePrompt,
        details: `Orchestrated project ${orchestrationData.project_id || projectId || "local"} with ${orchestrationData.files?.length || 0} files.`,
      });
      setStatusMessage(`Project ${orchestrationData.project_id || projectId || "local"} synced with orchestration flow.`);
      return orchestrationData;
    } catch (orchestrationError) {
      const response = await fetch(`${API_BASE}/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${sourcePrompt}${buildSystemPlannerPromptBlock(systemPlanner)}`,
          app_type: appType,
          builder_mode: builderMode,
          style: simpleDraft.style || "Dark glass",
          routes,
          components,
          project_memory: builderProjectMemory,
          system_planner: systemPlanner,
          system_prompt: buildSystemPlannerPromptBlock(systemPlanner),
          rv_template_key: selectedRvTemplateKey,
          rv_camping_profile: rvCampingProfileKey,
        }),
      });

      if (!response.ok) throw new Error("Code generation request failed");
      const data = await response.json();
      if (data?.project_memory) {
        setBuilderProjectMemory(data.project_memory);
      }
      const rawFiles = Array.isArray(data.generated_files) ? data.generated_files : [];
      const files = augmentGeneratedFilesWithSmartPackage(rawFiles, {
        prompt: sourcePrompt,
        appType,
        builderMode,
        routes,
        components,
      });
      setGeneratedCodeFiles(files);
      setSelectedGeneratedFilePath(files[0]?.path || "");
      setGeneratedAppMonetization(data?.monetization || null);
      appendMutationLog({
        type: "code-generation-fallback",
        command: sourcePrompt,
        details: `Fallback generated ${files.length} code files including smart package support files.`,
      });
      setStatusMessage(`Fallback code generation used: ${orchestrationError.message}`);
      return data;
    }
  }

  async function runBuilderBrain(customPrompt) {
    const sourcePrompt = (customPrompt ?? prompt).trim();
    if (!sourcePrompt) {
      setBuilderInsight("Type a command so the builder can mutate the workspace.");
      return;
    }

    const nextAnalysis = analyzePrompt(sourcePrompt);
    const localLayoutMutation = applyLayoutCommand(sourcePrompt, layoutState, activeModules);
    const localRecommendedModules = [...new Set([...nextAnalysis.recommendedModules, ...localLayoutMutation.moduleAdds])];

    setFeatureState((prev) => ({
      ...prev,
      builderMode: nextAnalysis.builderMode,
      appType: nextAnalysis.appType,
      summaryStyle: nextAnalysis.summaryStyle,
      quickIdea: sourcePrompt,
    }));

    try {
      setIsLoading(true);
      setStatusMessage("Running mutation engine v2...");
      const response = await fetch(`${API_BASE}/mutate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${sourcePrompt}${buildSystemPlannerPromptBlock(systemPlanner)}`,
          current_layout: layoutState,
          active_modules: activeModules,
          feature_state: featureState,
          project_memory: builderProjectMemory,
          system_planner: systemPlanner,
        }),
      });

      if (!response.ok) throw new Error("Mutation request failed");
      const data = await response.json();

      const nextLayout = data.layout_changes || localLayoutMutation.layout;
      const nextModules = data.module_changes?.enable?.length
        ? data.module_changes.enable
        : [...new Set([...activeModules, ...localRecommendedModules])];

      setLayoutState(nextLayout);
      setActiveModules((prev) => [...new Set([...prev, ...nextModules])]);
      const nextFileTree = Array.isArray(data.file_tree) ? data.file_tree : [];
      const nextRoutes = Array.isArray(data.routes) ? data.routes : [];
      const nextComponents = Array.isArray(data.components) ? data.components : [];
      if (data?.project_memory) {
        setBuilderProjectMemory(data.project_memory);
      }
      setGeneratedFileTree(nextFileTree);
      setGeneratedRoutes(nextRoutes);
      setGeneratedComponents(nextComponents);
      setBackendNextActions(Array.isArray(data.next_best_actions) ? data.next_best_actions : []);
      setBackendMutationSummary(Array.isArray(data.mutation_summary) ? data.mutation_summary : []);
      await runGenerateCodeBundle(
        sourcePrompt,
        data.app_type || nextAnalysis.appType,
        data.builder_mode || nextAnalysis.builderMode,
        nextRoutes,
        nextComponents,
      );

      setCommandHistory((prev) => [
        {
          id: uid("cmd"),
          prompt: `${sourcePrompt}${buildSystemPlannerPromptBlock(systemPlanner)}`,
          time: nowLabel(),
          appType: data.app_type || nextAnalysis.appType,
          builderMode: data.builder_mode || nextAnalysis.builderMode,
        },
        ...prev,
      ]);

      appendMutationLog({
        type: "backend-mutate",
        command: sourcePrompt,
        details: [
          `App type → ${data.app_type || nextAnalysis.appType}`,
          `Builder mode → ${data.builder_mode || nextAnalysis.builderMode}`,
          `Files → ${Array.isArray(data.file_tree) ? data.file_tree.length : 0}`,
          `Routes → ${Array.isArray(data.routes) ? data.routes.length : 0}`,
          `Components → ${Array.isArray(data.components) ? data.components.length : 0}`,
        ].join(" | "),
      });

      const successStatusMessage = "Mutation engine v2 applied layout, files, routes, and components.";
      const successBuilderInsight = data.mutation_summary?.length
        ? data.mutation_summary.join(" • ")
        : `Builder brain applied real workspace mutations: ${getLayoutLabel(nextLayout)}.`;
      setBuilderInsight(successBuilderInsight);
      setStatusMessage(successStatusMessage);
      return {
        ok: true,
        projectId: data.project_id || projectId || "",
        appType: data.app_type || nextAnalysis.appType,
        builderMode: data.builder_mode || nextAnalysis.builderMode,
        generatedFileCount: Array.isArray(data.files) ? data.files.length : generatedCodeFiles.length,
        routeCount: nextRoutes.length,
        componentCount: nextComponents.length,
        mutationSummary: Array.isArray(data.mutation_summary) ? data.mutation_summary : [],
        builderInsight: successBuilderInsight,
        statusMessage: successStatusMessage,
        systems: systemPlanner.systems || [],
      };
    } catch (error) {
      setLayoutState(localLayoutMutation.layout);
      ensureModules(localRecommendedModules);
      setGeneratedFileTree([]);
      setGeneratedRoutes([]);
      setGeneratedComponents([]);
      setBackendNextActions([]);
      setBackendMutationSummary([]);
      setGeneratedCodeFiles([]);
      setSelectedGeneratedFilePath("");

      setCommandHistory((prev) => [
        {
          id: uid("cmd"),
          prompt: `${sourcePrompt}${buildSystemPlannerPromptBlock(systemPlanner)}`,
          time: nowLabel(),
          appType: nextAnalysis.appType,
          builderMode: nextAnalysis.builderMode,
        },
        ...prev,
      ]);

      appendMutationLog({
        type: "brain-sync-fallback",
        command: sourcePrompt,
        details: [
          `Fallback app type → ${nextAnalysis.appType}`,
          `Fallback builder mode → ${nextAnalysis.builderMode}`,
          ...localLayoutMutation.notes,
          `Error → ${error.message}`,
        ].join(" | "),
      });

      const fallbackBuilderInsight = `Mutation engine fallback applied local workspace changes: ${getLayoutLabel(localLayoutMutation.layout)}.`;
      const fallbackStatusMessage = `Backend mutate fallback: ${error.message}`;
      setBuilderInsight(fallbackBuilderInsight);
      setStatusMessage(fallbackStatusMessage);
      return {
        ok: false,
        projectId: projectId || "",
        appType: nextAnalysis.appType,
        builderMode: nextAnalysis.builderMode,
        generatedFileCount: 0,
        routeCount: 0,
        componentCount: 0,
        mutationSummary: localLayoutMutation.notes,
        builderInsight: fallbackBuilderInsight,
        statusMessage: fallbackStatusMessage,
        systems: systemPlanner.systems || [],
      };
    } finally {
      setIsLoading(false);
    }
  }

  function handleMutationCommand(rawCommand) {
    applyBuilderWorkspaceCommand(rawCommand);
  }

  function applyBuilderWorkspaceCommand(rawCommand) {
    const command = String(rawCommand || prompt).trim();
    if (!command) return null;

    const { add, remove } = extractModuleMutations(command);
    const layoutMutation = applyLayoutCommand(command, layoutState, activeModules);

    ensureModules(add);
    ensureModules(layoutMutation.moduleAdds);
    removeModules(remove);
    setLayoutState(layoutMutation.layout);

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
      ]
        .filter(Boolean)
        .join(" | ") || "No direct mutations matched, but command was logged.",
    });

    setBuilderInsight(
      layoutMutation.notes.length
        ? layoutMutation.notes.join("\n")
        : "Command logged. No major layout mutation matched yet."
    );
    setStatusMessage("Command mutation applied.");
    return {
      command,
      add,
      remove,
      layout: layoutMutation.layout,
      notes: layoutMutation.notes,
    };
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
    setResult(null);
    setGeneratedFileTree([]);
    setGeneratedRoutes([]);
    setGeneratedComponents([]);
    setBackendNextActions([]);
    setBackendMutationSummary([]);
    setBuilderInsight("Builder reset to default state.");
    setStatusMessage("Workspace reset complete.");
    appendMutationLog({
      type: "reset",
      command: "reset builder",
      details: "Reset layout, modules, and feature state to defaults.",
    });
  }

  const sidebarItems = [
    { key: "builder", label: "Builder" },
    { key: "results", label: "Results" },
    { key: "modules", label: "Modules" },
    { key: "mutations", label: "Mutations" },
  ];

  const rootClassNames = [
    "app-shell",
    layoutState.shell,
    layoutState.sidebar ? "with-sidebar" : "",
    layoutState.split ? "with-split" : "",
    layoutState.inspector ? "with-inspector" : "",
    layoutState.dense ? "dense" : "",
  ]
    .filter(Boolean)
    .join("\n");

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
          position: relative;
          overflow: hidden;
          isolation: isolate;
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
        .topbar.compact {
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 4px;
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
        .topbar.compact .brand { gap: 2px; }
        .topbar.compact .eyebrow { font-size: 10px; letter-spacing: 0.1em; }
        .topbar.compact .brand h1 { font-size: 20px; }
        .topbar.compact .brand p { display: none; }
        .topbar.compact .topbar-actions { gap: 8px; align-items: center; }
        .topbar.compact .badge { padding: 6px 10px; font-size: 11px; }
        .topbar.compact .pill,
        .topbar.compact .ghost-pill { padding: 8px 12px; }
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
          grid-template-columns: ${layoutState.sidebar ? "240px minmax(0,1fr)" : "minmax(0,1fr)"}${layoutState.inspector ? " 320px" : ""};
          gap: 18px;
          align-items: start;
        }
        .with-split .main-workspace {
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 18px;
        }
        .focus .main-workspace,
        .dashboard .main-workspace,
        .classic .main-workspace {
          display: grid;
          grid-template-columns: ${layoutState.split ? "1.08fr .92fr" : "1fr"};
          gap: 18px;
        }
        .stack { display: grid; gap: 18px; }
        .dense .stack { gap: 12px; }
        .sidebar {
          position: relative;
          display: grid;
          gap: 12px;
          align-self: start;
        }
        .sidebar-nav { display: grid; gap: 10px; }
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
        .simple-hero, .simple-builder-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 16px;
          align-items: start;
        }
        .simple-hero-copy { display: grid; gap: 12px; }
        .simple-progress, .simple-chip-grid, .zone-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .simple-step, .zone-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(148,163,184,.14);
          color: var(--muted);
          font-size: 13px;
        }
        .simple-step.active {
          color: var(--text);
          border-color: rgba(102, 217, 239, .45);
          background: rgba(102, 217, 239, .12);
        }
        .simple-hero-card, .simple-starter-card, .simple-action-chip, .simple-generation-step {
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(255,255,255,.035);
          padding: 14px;
        }
        .simple-hero-card { display: grid; gap: 10px; }
        .simple-starter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 18px;
        }
        .simple-starter-card, .simple-action-chip {
          display: grid;
          gap: 10px;
          text-align: left;
          cursor: pointer;
          transition: transform .15s ease, border-color .15s ease, background .15s ease;
        }
        .simple-starter-card:hover, .simple-action-chip:hover {
          transform: translateY(-1px);
          border-color: rgba(102, 217, 239, .45);
          background: rgba(255,255,255,.05);
        }
        .simple-form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .simple-field {
          display: grid;
          gap: 8px;
          color: var(--muted);
          font-size: 13px;
        }
        .simple-action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .simple-action-chip strong, .simple-generation-step strong { display: block; margin-bottom: 4px; }
        .simple-action-chip span { color: var(--muted); font-size: 13px; }
        .simple-generation-box { display: grid; gap: 12px; }
        .simple-generation-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          opacity: .6;
        }
        .simple-generation-step.active {
          opacity: 1;
          border-color: rgba(102, 217, 239, .4);
          background: rgba(102, 217, 239, .08);
        }
        .simple-generation-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          margin-top: 4px;
          background: rgba(148,163,184,.45);
          flex: 0 0 auto;
        }
        .simple-generation-step.active .simple-generation-dot { background: var(--accent); }
        .code-preview {
          margin: 12px 0 0;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(0,0,0,.22);
          color: #d9e7ff;
          overflow: auto;
          max-height: 420px;
          white-space: pre-wrap;
          font-size: 12px;
          line-height: 1.5;
        }
        .live-preview-frame {
          width: 100%;
          min-height: 640px;
          margin-top: 12px;
          border: 1px solid rgba(148,163,184,.16);
          border-radius: 18px;
          background: rgba(255,255,255,.02);
        }
        .saved-card {
          border-radius: 18px;
          padding: 14px;
          border: 1px solid rgba(148,163,184,.12);
          background: rgba(255,255,255,.035);
          display: grid;
          gap: 8px;
        }
        .simple-mode-grid, .simple-builder-grid, .spot-grid, .result-box, .preview-dashboard, .preview-spotlight, .wireframe-shell {
          position: relative;
          isolation: isolate;
          z-index: 0;
        }
        .simple-starter-card, .simple-action-chip, .simple-generation-step, .result-box, .mini-card, .module-item, .saved-card {
          position: relative;
          z-index: 1;
        }
        .preview-dashboard, .preview-spotlight, .wireframe-shell {
          overflow: hidden;
        }

        .chat-advice-stack { display: grid; gap: 10px; margin-top: 10px; }
        .chat-advice-card {
          border-radius: 16px;
          padding: 12px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(255,255,255,.03);
          display: grid;
          gap: 6px;
        }
        .chat-advice-card strong { font-size: 13px; }
        .footer-note { margin-top: 18px; color: var(--muted); font-size: 13px; text-align: center; }
        @media (max-width: 1180px) {
          .shell-grid { grid-template-columns: 1fr; }
          .with-split .main-workspace,
          .focus .main-workspace,
          .dashboard .main-workspace,
          .classic .main-workspace { grid-template-columns: 1fr; }
          .brain-grid, .status-grid, .stats-grid, .result-grid, .preview-grid { grid-template-columns: 1fr 1fr; }
          .wire-body { grid-template-columns: 1fr; }
          .appliance-row { grid-template-columns: 1fr 1fr; }
          .simple-hero, .simple-builder-grid, .simple-action-grid, .simple-form-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 760px) {
          .topbar, .preview-banner, .spotlight-header, .panel-head { flex-direction: column; }
          .brain-grid, .status-grid, .stats-grid, .result-grid, .preview-grid, .saved-grid { grid-template-columns: 1fr; }
          .appliance-row { grid-template-columns: 1fr; }
          .spot-body { grid-template-columns: 1fr; }
          .spot-grid, .wire-split { grid-template-columns: 1fr; }
          .simple-starter-grid { grid-template-columns: 1fr; }
        }

        .chat-builder-shell { display: grid; grid-template-columns: .9fr 1.1fr; gap: 20px; margin-bottom: 18px; align-items: start; }
        .chat-builder-shell.with-preview { grid-template-columns: minmax(320px, .78fr) minmax(560px, 1.22fr); }
        .chat-builder-shell.compact { grid-template-columns: minmax(0, 1fr); }
        .chat-thread { display: grid; gap: 12px; max-height: 860px; overflow: auto; padding-right: 6px; }
        .chat-message { border: 1px solid rgba(148,163,184,.14); border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,.03); display: grid; gap: 8px; }
        .chat-message.user { background: rgba(102,217,239,.08); }
        .chat-message.assistant { background: rgba(139,92,246,.08); }
        .chat-meta-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
        .chat-role { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; }
        .chat-role .dot { width: 10px; height: 10px; border-radius: 999px; }
        .chat-body { white-space: pre-wrap; line-height: 1.6; }
        .chat-assist-meta { color: var(--muted); font-size: 13px; }
        .chat-question-list, .chat-action-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .chat-question-pill {
          border-radius: 14px;
          padding: 9px 12px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(148,163,184,.14);
          color: var(--muted);
          font-size: 13px;
        }
        .chat-composer { display: grid; gap: 12px; }
        .chat-composer-shell {
          display: grid;
          gap: 16px;
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(102,217,239,.18);
          background: linear-gradient(160deg, rgba(102,217,239,.14), rgba(15,23,42,.82) 56%, rgba(255,255,255,.03));
          box-shadow: 0 20px 50px rgba(2,6,23,.22);
        }
        .chat-composer-shell.builder-ai {
          border-color: rgba(16,185,129,.28);
          background: linear-gradient(160deg, rgba(16,185,129,.18), rgba(15,23,42,.86) 56%, rgba(255,255,255,.03));
        }
        .chat-composer-header { display: grid; gap: 8px; }
        .chat-composer-header h3 { margin: 0; font-size: 24px; line-height: 1.15; }
        .chat-composer-header p { margin: 0; color: var(--muted); max-width: 64ch; }
        .chat-mode-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .chat-mode-toggle {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 6px;
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,.18);
          background: rgba(15,23,42,.36);
        }
        .chat-mode-button {
          border: 0;
          border-radius: 999px;
          padding: 10px 16px;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          font-weight: 600;
        }
        .chat-mode-button.active {
          background: rgba(102,217,239,.18);
          color: var(--text);
        }
        .chat-project-state {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(148,163,184,.16);
          color: var(--muted);
        }
        .chat-project-state.builder-ai {
          background: rgba(16,185,129,.12);
          border-color: rgba(16,185,129,.28);
          color: #d1fae5;
        }
        .chat-guidance-strip {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        }
        .chat-guidance-tile {
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(15,23,42,.44);
          border: 1px solid rgba(148,163,184,.14);
        }
        .chat-guidance-tile strong { display: block; margin-bottom: 6px; font-size: 13px; color: var(--muted); }
        .chat-composer textarea {
          min-height: 170px;
          resize: vertical;
          font-size: 16px;
          line-height: 1.6;
          border-radius: 20px;
          background: rgba(15,23,42,.74);
        }
        .chat-chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .chat-chip { border: 1px solid rgba(148,163,184,.16); background: rgba(255,255,255,.04); color: var(--text); border-radius: 999px; padding: 9px 14px; cursor: pointer; }
        .chat-chip.active { background: rgba(102,217,239,.14); border-color: rgba(102,217,239,.35); }
        .chat-chip.builder-ai-active { background: rgba(16,185,129,.16); border-color: rgba(16,185,129,.35); }
        .chat-chip.builder-pref-active { background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.3); }
        .chat-chip-row.compact { gap: 8px; }
        .chat-quick-ideas { display: grid; gap: 8px; }
        .chat-quick-ideas .muted { font-size: 13px; }
        .chat-builder-memory {
          display: grid;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid rgba(16,185,129,.2);
          background: rgba(16,185,129,.08);
        }
        .chat-builder-memory strong { font-size: 13px; }
        .chat-composer-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .chat-secondary-link {
          border: 0;
          background: transparent;
          color: var(--muted);
          padding: 0;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .chat-side-stack { display: grid; gap: 16px; }
        .chat-preview-rail { display: grid; gap: 18px; position: sticky; top: 18px; }
        .chat-preview-frame {
          width: 100%;
          min-height: 680px;
          border: 1px solid rgba(148,163,184,.14);
          border-radius: 18px;
          background: #07111f;
        }
        .chat-preview-meta { display: grid; gap: 12px; }
        .chat-preview-meta .card-grid { grid-template-columns: 1fr 1fr; }
        .chat-empty-state { border: 1px dashed rgba(148,163,184,.18); border-radius: 18px; padding: 18px; color: var(--muted); }
        .chat-project-pill { display: inline-flex; align-items: center; gap: 8px; }
        .chat-guidance-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .chat-status-card {
          display: grid;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(255,255,255,.03);
        }
        .chat-status-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }
        .chat-status-copy { display: grid; gap: 6px; }
        .chat-status-copy strong { font-size: 15px; }
        .chat-primary-next {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .chat-primary-next strong { font-size: 15px; }
        .chat-next-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        @media (max-width: 1120px) {
          .chat-builder-shell, .chat-builder-shell.with-preview { grid-template-columns: 1fr; }
          .chat-preview-rail { position: static; }
          .chat-preview-frame { min-height: 420px; }
        }
      `}</style>

      <div className={`topbar ${uiMode === "chat" ? "compact" : ""}`}>
        <div className="brand">
          <span className="eyebrow">Personal AI Builder</span>
          <h1>{uiMode === "chat" ? "Build with Chat" : "Real Builder Workspace"}</h1>
          <p>Describe your app, then keep improving it with simple follow-up requests.</p>
        </div>
        <div className="topbar-actions">
          <div className="mode-toggle">
            <button className={`ghost-pill ${uiMode === "simple" ? "active" : ""}`} onClick={() => setUiMode("simple")}>Simple</button>
            <button className={`ghost-pill ${uiMode === "chat" ? "active" : ""}`} onClick={() => setUiMode("chat")}>Chat</button>
            <button className={`ghost-pill ${uiMode === "pro" ? "active" : ""}`} onClick={() => setUiMode("pro")}>Pro</button>
          </div>
          <span className={`badge ${apiStatus === "connected" ? "ok" : apiStatus === "offline" ? "off" : "warn"}`}>
            API: {apiStatus}
          </span>
          {uiMode !== "chat" ? <span className="badge">Layout: {getLayoutLabel(layoutState)}</span> : null}
          {uiMode !== "chat" ? <span className="badge">Modules: {activeModules.length}</span> : null}
          {uiMode !== "chat" ? (
            <button className="pill primary" onClick={() => runBuilderBrain()}>
              Build App
            </button>
          ) : null}
          <button className="ghost-pill" onClick={resetBuilder}>
            New App
          </button>
        </div>
      </div>


      {uiMode === "simple" ? (
        <div className="simple-mode-grid" style={{ display: "grid", gap: 18, marginBottom: 18 }}>
          {simpleFlowStep === "welcome" ? (
            <Panel
              title="Simple Mode Onboarding"
              subtitle="Choose what to build first. The builder will guide the rest."
              collapsible={false}
            >
              <div className="simple-hero">
                <div className="simple-hero-copy">
                  <span className="tag">Guided flow</span>
                  <h2>What do you want to build today?</h2>
                  <p className="muted">
                    Start with one clear direction, generate the first version, then keep evolving it without opening the full IDE unless you want to.
                  </p>
                  <div className="simple-progress">
                    <span className="simple-step active">1. Choose</span>
                    <span className="simple-step">2. Configure</span>
                    <span className="simple-step">3. Generate</span>
                  </div>
                </div>

                <div className="simple-hero-card">
                  <div className="module-top">
                    <strong>Current workspace</strong>
                    <span className="tag">{featureState.appType}</span>
                  </div>
                  <div className="muted">
                    {commandHistory?.[0]?.prompt
                      ? `Last command: ${commandHistory[0].prompt}`
                      : "No command yet. Pick a starter to get your first real builder version."}
                  </div>
                  <div className="zone-chip-row" style={{ marginTop: 12 }}>
                    <span className="zone-chip">Layout · {getLayoutLabel(layoutState)}</span>
                    <span className="zone-chip">Modules · {activeModules.length}</span>
                  </div>
                </div>
              </div>

              <Panel title="RV Smart Templates" subtitle="Use your niche advantage. Start from polished RV product patterns instead of generic app ideas." compact>
                <div className="simple-starter-grid">
                  {RV_SMART_TEMPLATES.map((template) => (
                    <button
                      key={template.key}
                      className={`simple-starter-card ${selectedRvTemplateKey === template.key ? "active" : ""}`}
                      onClick={() => applyRvSmartTemplate(template.key)}
                      type="button"
                    >
                      <div className="module-top">
                        <strong>{template.label}</strong>
                        <span className="tag">{template.badge}</span>
                      </div>
                      <div className="muted">{template.description}</div>
                      <div className="zone-chip-row">
                        {(template.systems || []).slice(0, 3).map((systemKey) => (
                          <span key={systemKey} className="zone-chip">{formatSystemLabel(systemKey)}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="chat-chip-row" style={{ marginTop: 12 }}>
                  <button className="pill primary" type="button" onClick={() => applyRvSmartTemplate(selectedRvTemplateKey, true)}>
                    Build selected RV template
                  </button>
                  <span className="muted">Selected: {selectedRvTemplate.label}</span>
                </div>

                <Panel title="RV Intelligence + Affiliate Engine" subtitle="Turn RV ideas into real sizing guidance and monetizable product recommendations." compact>
                  <div className="simple-builder-grid">
                    <div className="panel-card compact" style={{ display: "grid", gap: 12 }}>
                      <div className="module-top">
                        <strong>{selectedRvTemplate.label}</strong>
                        <span className="tag">{rvCampingProfile.label}</span>
                      </div>
                      <div className="muted">{rvCampingProfile.note}</div>
                      <label className="simple-field">
                        <span>Camping profile</span>
                        <select className="text-input" value={rvCampingProfileKey} onChange={(e) => setRvCampingProfileKey(e.target.value)}>
                          {RV_CAMPING_PROFILES.map((profile) => (
                            <option key={profile.key} value={profile.key}>{profile.label}</option>
                          ))}
                        </select>
                      </label>
                      <div className="card-grid">
                        <div className="card">
                          <span className="muted">Battery target</span>
                          <strong>{rvIntelligence.batteryAh}Ah</strong>
                        </div>
                        <div className="card">
                          <span className="muted">Solar target</span>
                          <strong>{rvIntelligence.solarWatts}W</strong>
                        </div>
                        <div className="card">
                          <span className="muted">Inverter guide</span>
                          <strong>{rvIntelligence.inverterWatts}W</strong>
                        </div>
                      </div>
                    </div>
                    <div className="panel-card compact" style={{ display: "grid", gap: 12 }}>
                      <div className="module-top">
                        <strong>Affiliate-ready suggestions</strong>
                        <span className="tag">{rvAffiliateRecommendations.length} picks</span>
                      </div>
                      <div className="muted">{rvIntelligence.batteryRecommendation}. {rvIntelligence.solarRecommendation}</div>
                      <div className="module-list">
                        {rvAffiliateRecommendations.map((item) => (
                          <div key={item.key} className="module-item">
                            <div className="module-top">
                              <strong>{item.title}</strong>
                              <span className="tag">{item.cta}</span>
                            </div>
                            <div className="muted">{item.fit}</div>
                          </div>
                        ))}
                      </div>
                      <div className="zone-chip-row">
                        <span className="zone-chip">Cost guide · ${rvIntelligence.estimatedCostLow}–${rvIntelligence.estimatedCostHigh}</span>
                        <span className="zone-chip">{rvIntelligence.batteryTier}</span>
                        <span className="zone-chip">{rvIntelligence.solarTier}</span>
                      </div>
                    </div>
                  </div>
                </Panel>

              </Panel>

              <div className="simple-starter-grid">
                {SIMPLE_STARTERS.map((starter) => (
                  <button
                    key={starter.key}
                    className="simple-starter-card"
                    onClick={() => selectSimpleStarter(starter.key)}
                  >
                    <div className="module-top">
                      <strong>{starter.label}</strong>
                      <span className="tag">{starter.badge}</span>
                    </div>
                    <div className="muted">{starter.description}</div>
                    <div className="zone-chip-row">
                      <span className="zone-chip">{starter.seed}</span>
                      <span className="zone-chip">Choose</span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          ) : null}

          {simpleFlowStep === "config" ? (
            <div className="simple-builder-grid">
              <Panel
                title="Quick Configuration"
                subtitle="Keep this lightweight. We only need a few signals to generate the first version."
                collapsible={false}
              >
                <div className="builder-form">
                  <div className="module-top">
                    <strong>{selectedSimpleStarter.label}</strong>
                    <span className="tag">{selectedSimpleStarter.badge}</span>
                  </div>

                  <div className="simple-form-grid">
                    <label className="simple-field">
                      <span>App name</span>
                      <input
                        className="text-input"
                        value={simpleDraft.appName}
                        onChange={(e) => updateSimpleDraft("appName", e.target.value)}
                        placeholder="My Builder App"
                      />
                    </label>

                    <label className="simple-field">
                      <span>Main goal</span>
                      <input
                        className="text-input"
                        value={simpleDraft.mainGoal}
                        onChange={(e) => updateSimpleDraft("mainGoal", e.target.value)}
                        placeholder={selectedSimpleStarter.goalPlaceholder}
                      />
                    </label>

                    <label className="simple-field">
                      <span>Visual style</span>
                      <select
                        className="text-input"
                        value={simpleDraft.style}
                        onChange={(e) => updateSimpleDraft("style", e.target.value)}
                      >
                        {SIMPLE_STYLE_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="result-box">
                    <strong>Generated prompt preview</strong>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {buildSimpleStarterPrompt(simpleDraft)}
                    </div>
                  </div>

                  <div className="command-row">
                    <button className="ghost-pill" onClick={() => setSimpleFlowStep("welcome")}>
                      Back
                    </button>
                    <button className="pill primary" onClick={launchSimpleBuilder}>
                      Generate first version
                    </button>
                    <button className="ghost-pill" onClick={() => setUiMode("pro")}>
                      Open Pro instead
                    </button>
                  </div>
                </div>
              </Panel>

              <Panel
                title="Starter Preview"
                subtitle="The builder will still use your real mutation engine."
                compact
                defaultCollapsed={false}
              >
                <PreviewCanvas
                  layout={layoutState}
                  activeModules={activeModules}
                  featureState={{
                    ...featureState,
                    appType:
                      selectedSimpleStarter.key === "dashboard"
                        ? "admin panel"
                        : selectedSimpleStarter.key === "assistant"
                          ? "assistant app"
                          : selectedSimpleStarter.key === "content"
                            ? "content app"
                            : "tool app",
                  }}
                  result={result}
                  prompt={buildSimpleStarterPrompt(simpleDraft)}
                />
              </Panel>
            </div>
          ) : null}

          {simpleFlowStep === "generating" ? (
            <div className="simple-builder-grid">
              <Panel
                title="Generating your first builder version"
                subtitle="This is the guided handoff from onboarding into the real workspace."
                collapsible={false}
              >
                <div className="simple-generation-box">
                  {SIMPLE_GENERATION_STAGES.map((stage, index) => (
                    <div
                      key={stage}
                      className={`simple-generation-step ${index <= simpleGenerationStage ? "active" : ""}`}
                    >
                      <span className="simple-generation-dot" />
                      <div>
                        <strong>{stage}</strong>
                        <div className="muted">
                          {index === 0
                            ? selectedSimpleStarter.label
                            : index === 1
                              ? getLayoutLabel(layoutState)
                              : "Simple mode is preparing the first real builder view."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="result-box">
                  <strong>Prompt being used</strong>
                  <div className="muted" style={{ marginTop: 8 }}>{simplePendingPrompt}</div>
                </div>
              </Panel>

              <Panel title="Preview Spotlight" subtitle="The preview keeps the app feeling real while loading." compact>
                <PreviewCanvas
                  layout={layoutState}
                  activeModules={activeModules}
                  featureState={featureState}
                  result={result}
                  prompt={simplePendingPrompt}
                />
              </Panel>
            </div>
          ) : null}

          {simpleFlowStep === "builder" ? (
            <>
              <div className="simple-builder-grid">
                <Panel
                  title="Simple Builder"
                  subtitle="Now you are inside the real builder experience, but still guided."
                  collapsible={false}
                >
                  <div className="builder-form" style={{ gap: 14 }}>
                    <div className="module-top">
                      <strong>Guided command bar</strong>
                      <span className="tag">Simple</span>
                    </div>
                    <div className="command-row">
                      <input
                        className="text-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="make dashboard"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            runBuilderBrain();
                          }
                        }}
                      />
                      <button className="pill primary" onClick={() => runBuilderBrain()}>
                        Run Builder Brain
                      </button>
                      <button className="ghost-pill" onClick={() => setUiMode("pro")}>
                        Open Pro
                      </button>
                      <button className="ghost-pill" onClick={() => setSimpleFlowStep("welcome")}>
                        Start over
                      </button>
                    </div>

                    <div className="simple-action-grid">
                      <div className="result-box">
                        <strong>Next best action</strong>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {builderInsight}
                        </div>
                        <div className="simple-chip-grid" style={{ marginTop: 12 }}>
                          {nextBestActions.map((action) => (
                            <button
                              key={action.key}
                              className="simple-action-chip"
                              onClick={() => runNextBestAction(action)}
                            >
                              <strong>{action.label}</strong>
                              <span>{action.reason}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="result-box">
                        <strong>Quick starters</strong>
                        <div className="simple-chip-grid" style={{ marginTop: 12 }}>
                          {[
                            {
                              label: "Build Dashboard",
                              hint: "Start with a cleaner dashboard shell.",
                              cmd: "make dashboard",
                            },
                            {
                              label: "Create Dev Workspace",
                              hint: "Open a mini IDE-style builder workspace.",
                              cmd: "make dev workspace",
                            },
                            {
                              label: "Make SaaS Landing",
                              hint: "Create a landing-style workspace with stronger preview focus.",
                              cmd: "make saas landing",
                            },
                          ].map((card) => (
                            <button
                              key={card.cmd}
                              className="simple-action-chip"
                              onClick={() => {
                                setPrompt(card.cmd);
                                runBuilderBrain(card.cmd);
                              }}
                            >
                              <strong>{card.label}</strong>
                              <span>{card.hint}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Panel>


                <Panel
                  title="Generated Structure"
                  subtitle="Mutation engine v2 now returns files, routes, and components."
                  collapsible={false}
                >
                  <div className="simple-builder-grid">
                    <div className="result-box">
                      <strong>Files</strong>
                      <div className="module-list" style={{ marginTop: 12 }}>
                        {generatedFileTree.length ? generatedFileTree.slice(0, 8).map((item) => (
                          <div key={item.path} className="module-item">
                            <div className="module-top">
                              <strong>{item.path}</strong>
                              <span className="tag">{item.kind}</span>
                            </div>
                            <div className="muted">{item.role}</div>
                          </div>
                        )) : <div className="muted">Run Builder Brain to generate file structure.</div>}
                      </div>
                    </div>

                    <div className="result-box">
                      <strong>Routes</strong>
                      <div className="module-list" style={{ marginTop: 12 }}>
                        {generatedRoutes.length ? generatedRoutes.map((route) => (
                          <div key={route.path} className="module-item">
                            <div className="module-top">
                              <strong>{route.path}</strong>
                              <span className="tag">{route.component}</span>
                            </div>
                            <div className="muted">{route.reason}</div>
                          </div>
                        )) : <div className="muted">Routes will appear here after mutation.</div>}
                      </div>
                    </div>
                  </div>

                  <div className="simple-action-grid" style={{ marginTop: 12 }}>
                    <div className="result-box">
                      <strong>Components</strong>
                      <div className="module-list" style={{ marginTop: 12 }}>
                        {generatedComponents.length ? generatedComponents.map((component) => (
                          <div key={component.name} className="module-item">
                            <div className="module-top">
                              <strong>{component.name}</strong>
                              <span className="tag">component</span>
                            </div>
                            <div className="muted">{component.purpose}</div>
                          </div>
                        )) : <div className="muted">Components will appear here after mutation.</div>}
                      </div>
                    </div>

                    <div className="result-box">
                      <strong>Backend next actions</strong>
                      <div className="simple-chip-grid" style={{ marginTop: 12 }}>
                        {backendNextActions.length ? backendNextActions.map((action) => (
                          <button
                            key={action}
                            className="simple-action-chip"
                            onClick={() => {
                              if (action === "generate code") {
                                runGenerateCodeBundle(
                                  prompt,
                                  featureState.appType,
                                  featureState.builderMode,
                                  generatedRoutes,
                                  generatedComponents,
                                );
                                return;
                              }
                              setPrompt(action);
                              runBuilderBrain(action);
                            }}
                          >
                            <strong>{action}</strong>
                            <span>Suggested by mutation engine v2</span>
                          </button>
                        )) : <div className="muted">Backend suggestions will appear here after mutation.</div>}
                      </div>
                      {backendMutationSummary.length ? (
                        <div className="module-list" style={{ marginTop: 12 }}>
                          {backendMutationSummary.map((item) => (
                            <div key={item} className="module-item">
                              <div className="muted">{item}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="simple-builder-grid" style={{ marginTop: 12 }}>
                    <div className="result-box">
                      <div className="module-top">
                        <div style={{ display: "grid", gap: 4 }}>
                          <strong>Generated code files</strong>
                          <span className="muted" style={{ fontSize: 12 }}>Deploy exports prepare Render and Vercel-ready bundles without removing your existing zip flow.</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button
                            className="mini-btn"
                            onClick={() => runGenerateCodeBundle(prompt, featureState.appType, featureState.builderMode, generatedRoutes, generatedComponents)}
                          >
                            Generate code
                          </button>
                          <button
                            className="mini-btn"
                            onClick={downloadProjectZipBundle}
                            disabled={!generatedCodeFiles.length || isDownloadingZip}
                          >
                            {isDownloadingZip ? "Building zip..." : "Download project zip"}
                          </button>
                          <button
                            className="mini-btn"
                            onClick={() => downloadDeploymentBundle("render")}
                            disabled={!generatedCodeFiles.length || Boolean(deployExportTarget)}
                            title="Prepare a deploy-ready export for Render"
                          >
                            {deployExportTarget === "render" ? "Preparing Render..." : "Export Render bundle"}
                          </button>
                          <button
                            className="mini-btn"
                            onClick={() => downloadDeploymentBundle("vercel")}
                            disabled={!generatedCodeFiles.length || Boolean(deployExportTarget)}
                            title="Prepare a deploy-ready export for Vercel"
                          >
                            {deployExportTarget === "vercel" ? "Preparing Vercel..." : "Export Vercel bundle"}
                          </button>
                        </div>
                      </div>
                      <div className="module-list" style={{ marginTop: 12 }}>
                        {generatedCodeFiles.length ? generatedCodeFiles.map((file) => (
                          <button
                            key={file.path}
                            className={`simple-action-chip ${selectedGeneratedCodeFile?.path === file.path ? "active" : ""}`}
                            onClick={() => setSelectedGeneratedFilePath(file.path)}
                          >
                            <strong>{file.path}</strong>
                            <span>{file.generatedBy === "smart-package" ? `smart package · ${file.language || "code"}` : file.language || "code"}</span>
                          </button>
                        )) : <div className="muted">Generate code to inspect real file contents.</div>}
                      </div>
                    </div>

                    {generatedAppMonetization ? (
                      <div className="result-box">
                        <div className="module-top">
                          <div style={{ display: "grid", gap: 4 }}>
                            <strong>Generated app monetization</strong>
                            <span className="muted" style={{ fontSize: 12 }}>These upgrade hooks and affiliate blocks are now part of the generated app output.</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="tag">{generatedAppMonetization.subscription?.monthlyPrice ? `$${generatedAppMonetization.subscription.monthlyPrice}/mo` : "Monthly ready"}</span>
                            <span className="tag">{generatedAppMonetization.subscription?.yearlyPrice ? `$${generatedAppMonetization.subscription.yearlyPrice}/yr` : "Yearly ready"}</span>
                            <span className="tag">{generatedAppMonetization.subscription?.trialDays || 7}-day trial</span>
                          </div>
                        </div>
                        <div className="module-list" style={{ marginTop: 12 }}>
                          {(generatedAppMonetization.paywallHooks || []).map((hook) => (
                            <div key={hook} className="module-item">
                              <strong>{hook}</strong>
                              <span className="muted">Hook will be rendered inside the generated app screens.</span>
                            </div>
                          ))}
                          {(generatedAppMonetization.featuredProducts || []).slice(0, 3).map((item) => (
                            <div key={item.slug || item.title} className="module-item">
                              <strong>{item.title}</strong>
                              <span className="muted">{item.fit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="result-box">
                      <strong>Selected file preview</strong>
                      {selectedGeneratedCodeFile ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="module-top">
                            <strong>{selectedGeneratedCodeFile.path}</strong>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <span className="tag">{selectedGeneratedCodeFile.generatedBy === "smart-package" ? `smart package · ${selectedGeneratedCodeFile.language || "code"}` : selectedGeneratedCodeFile.language || "code"}</span>
                              <button
                                className="mini-btn"
                                onClick={() => downloadSelectedGeneratedFile(selectedGeneratedCodeFile)}
                              >
                                Download file
                              </button>
                            </div>
                          </div>
                          <pre className="code-preview">{selectedGeneratedCodeFile.content}</pre>
                        </div>
                      ) : <div className="muted" style={{ marginTop: 12 }}>Pick a generated file to preview its contents.</div>}
                    </div>
                  </div>

                  <div className="result-box" style={{ marginTop: 12 }}>
                    <div className="module-top">
                      <strong>Live preview runner</strong>
                      <button
                        className="mini-btn"
                        onClick={() => runGenerateCodeBundle(prompt, featureState.appType, featureState.builderMode, generatedRoutes, generatedComponents)}
                      >
                        Refresh preview
                      </button>
                    </div>
                    {generatedCodeFiles.length ? (
                      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {previewRoutes.map((route) => (
                            <button
                              key={route.path}
                              className={`mini-btn ${selectedPreviewRoute === route.path ? "active" : ""}`}
                              onClick={() => setSelectedPreviewRoute(route.path)}
                            >
                              {route.path}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span className="tag">{previewAuthState.label}</span>
                          <button
                            className={`mini-btn ${previewAuthMode === "guest" ? "active" : ""}`}
                            onClick={() => setPreviewAuthMode("guest")}
                          >
                            Guest
                          </button>
                          {previewAuthState.enabled ? (
                            <button
                              className={`mini-btn ${previewAuthMode === "member" ? "active" : ""}`}
                              onClick={() => setPreviewAuthMode("member")}
                            >
                              Member
                            </button>
                          ) : null}
                          {previewAuthState.enabled && previewAuthState.hasAdmin ? (
                            <button
                              className={`mini-btn ${previewAuthMode === "admin" ? "active" : ""}`}
                              onClick={() => setPreviewAuthMode("admin")}
                            >
                              Admin
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    {livePreviewDoc ? (
                      <iframe
                        title="Generated app live preview"
                        className="live-preview-frame"
                        srcDoc={livePreviewDoc}
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="muted" style={{ marginTop: 12 }}>
                        Generate code to render a live preview shell here.
                      </div>
                    )}

                    <div className="result-box" style={{ marginTop: 14 }}>
                      <div className="module-top">
                        <strong>Improve this app</strong>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <span className="tag">Mutation loop</span>
                          <button
                            className="mini-btn"
                            onClick={() => latestMutationVersion && restoreMutationVersion(latestMutationVersion)}
                            disabled={!latestMutationVersion || isMutatingGeneratedApp}
                          >
                            Undo last version
                          </button>
                        </div>
                      </div>
                      <p className="muted" style={{ marginTop: 8 }}>
                        Type an improvement request, apply the mutation, then refresh the live preview automatically.
                        {projectId ? ` Continuing project ${projectId.slice(0, 8)}.` : " The first generation will create a tracked project automatically."}
                      </p>
                      <textarea
                        value={mutationLoopInput}
                        onChange={(event) => setMutationLoopInput(event.target.value)}
                        placeholder="Add dark mode, add auth, improve mobile layout, add a sidebar..."
                        rows={3}
                        style={{ marginTop: 12, width: "100%", resize: "vertical" }}
                      />
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        {MUTATION_LOOP_SUGGESTIONS.map((item) => (
                          <button
                            key={item}
                            className="pill"
                            onClick={() => setMutationLoopInput(item)}
                            type="button"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="module-top" style={{ marginTop: 12 }}>
                        <div className="muted">
                          Saved versions: {mutationVersions.length}
                          {latestMutationVersion ? ` · Last snapshot ${latestMutationVersion.time}` : ""}
                        </div>
                        <button
                          className="primary-btn"
                          onClick={() => handleGeneratedAppMutation()}
                          disabled={!generatedCodeFiles.length || isMutatingGeneratedApp}
                        >
                          {isMutatingGeneratedApp ? "Applying mutation..." : "Mutate app"}
                        </button>
                      </div>
                      {mutationVersions.length ? (
                        <div className="module-list" style={{ marginTop: 12 }}>
                          {mutationVersions.slice(0, 4).map((version) => (
                            <button
                              key={version.id}
                              className="simple-action-chip"
                              onClick={() => restoreMutationVersion(version)}
                              type="button"
                            >
                              <strong>{version.label || "Saved version"}</strong>
                              <span>{version.time}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Panel>

                <Panel
                  title="Live Preview"
                  subtitle="The builder should feel like an app, not just loose blocks."
                  collapsible={false}
                >
                  <PreviewCanvas
                    layout={layoutState}
                    activeModules={activeModules}
                    featureState={featureState}
                    result={result}
                    prompt={prompt}
                  />
                </Panel>
              </div>

              <div className="spot-grid">
                <Panel title="Status" subtitle="Keep only the essentials visible." compact>
                  <div className="result-box">{builderInsight}</div>
                  <div className="status-grid" style={{ marginTop: 14 }}>
                    <StatCard label="API" value={apiStatus} hint={statusMessage} />
                    <StatCard label="Layout" value={getLayoutLabel(layoutState)} hint="Current workspace shell" accent="var(--warning)" />
                    <StatCard label="Modules" value={activeModules.length} hint={featureState.appType} accent="var(--accent-2)" />
                  </div>
                </Panel>

                <Panel
                  title="Battery Planner"
                  subtitle="Your real backend-connected module stays available here."
                  compact
                  defaultCollapsed={false}
                >
                  <div className="command-row">
                    <button className="mini-btn" onClick={runBatteryPlan} disabled={isLoading}>
                      {isLoading ? "Running..." : "Run planner"}
                    </button>
                    <button className="mini-btn" onClick={() => addAppliancePreset()}>
                      Add preset
                    </button>
                    <button className="mini-btn" onClick={() => addApplianceRow()}>
                      Add row
                    </button>
                  </div>
                  {result ? (
                    <div className="result-box" style={{ marginTop: 12 }}>
                      <strong>{result.summary}</strong>
                      <div className="muted" style={{ marginTop: 8 }}>
                        Daily: {result.daily_wh}Wh · Battery: {result.battery_ah}Ah · Solar: {result.solar_watts}W
                      </div>
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 12 }}>
                      Run the planner any time without opening the full workspace.
                    </div>
                  )}
                </Panel>

                <Panel title="Session Snapshot" subtitle="Keep simple mode focused on momentum." compact>
                  <div className="module-list">
                    <div className="module-item">
                      <div className="module-top">
                        <strong>Starter</strong>
                        <span className="tag">{selectedSimpleStarter.label}</span>
                      </div>
                      <div className="muted">{simpleDraft.mainGoal}</div>
                    </div>
                    <div className="module-item">
                      <div className="module-top">
                        <strong>Style</strong>
                        <span className="tag">{simpleDraft.style}</span>
                      </div>
                      <div className="muted">{simpleDraft.appName}</div>
                    </div>
                  </div>
                </Panel>

                <Panel title="System Planner" subtitle="Plan connected product systems before code generation." compact>
                  <div className="module-top">
                    <strong>{systemPlanner.summary}</strong>
                    <button className="mini-btn" onClick={refreshSystemPlanner}>Refresh</button>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {SYSTEM_COMPLEXITY_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        className={`pill ${systemPlanner.complexity === option.key ? "active" : ""}`}
                        onClick={() => setPlannerComplexity(option.key)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {Object.keys(SYSTEM_LIBRARY).map((systemKey) => (
                      <button
                        key={systemKey}
                        className={`simple-action-chip ${systemPlanner.systems.includes(systemKey) ? "active" : ""}`}
                        onClick={() => togglePlannedSystem(systemKey)}
                        type="button"
                      >
                        <strong>{formatSystemLabel(systemKey)}</strong>
                        <span>{systemPlanner.systems.includes(systemKey) ? "planned" : "optional"}</span>
                      </button>
                    ))}
                  </div>
                </Panel>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {uiMode === "pro" ? (
        <>
          <div className="shell-grid">

            {layoutState.sidebar ? (
              <aside className="sidebar">
                <Panel title="Workspace Rail" subtitle="Dynamic navigation unlocked by sidebar mutation" compact>
                  <div className="sidebar-nav">
                    {sidebarItems.map((item) => (
                      <button
                        key={item.key}
                        className={`sidebar-btn ${selectedSidebarView === item.key ? "active" : ""}`}
                        onClick={() => setSelectedSidebarView(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Panel>
                <Panel title="Layout DNA" subtitle="The builder now changes shell structure, not just features" compact>
                  <div className="module-list">
                    <div className="module-item">
                      <div className="module-top">
                        <strong>Shell</strong>
                        <span className="tag">{layoutState.shell}</span>
                      </div>
                      <div className="muted">Mode: {layoutState.mode}</div>
                    </div>
                    <div className="module-item">
                      <div className="module-top">
                        <strong>Split</strong>
                        <span className="tag">{layoutState.split ? "On" : "Off"}</span>
                      </div>
                      <div className="muted">Preview style: {layoutState.previewStyle}</div>
                    </div>
                  </div>
                </Panel>
              </aside>
            ) : null}

            <main className="main-workspace">
              <div className="stack">
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

                <Panel
                  title="Command Mutations"
                  subtitle="This now mutates modules and the workspace shell"
                  actions={
                    <>
                      <button className="mini-btn" onClick={() => handleMutationCommand(prompt)}>Apply current command</button>
                      <button className="mini-btn" onClick={() => setPrompt("make dashboard add sidebar split layout")}>Load example</button>
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
                        <strong>Workspace shape</strong>
                        <span className="tag">{getLayoutLabel(layoutState)}</span>
                      </div>
                      <div className="muted">Use natural commands to reshape the app shell.</div>
                    </div>
                  </div>
                </Panel>

                {activeModules.includes("quick_actions") ? (
                  <Panel title="Quick Actions" subtitle="Fast builder mutations and planner actions">
                    <div className="quick-grid">
                      <button className="pill" onClick={() => handleMutationCommand("make dashboard")}>Make dashboard</button>
                      <button className="pill" onClick={() => handleMutationCommand("add sidebar")}>Add sidebar</button>
                      <button className="pill" onClick={() => handleMutationCommand("split layout")}>Split layout</button>
                      <button className="pill" onClick={() => handleMutationCommand("add inspector")}>Add inspector</button>
                      <button className="pill" onClick={() => handleMutationCommand("focus preview")}>Focus preview</button>
                      <button className="pill" onClick={() => handleMutationCommand("return to classic layout")}>Classic layout</button>
                    </div>
                  </Panel>
                ) : null}

                <Panel
                  title="Battery Planner Builder"
                  subtitle="Your backend is still connected. This stays as a real functional module."
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
                          <input
                            className="text-input"
                            value={item.name}
                            onChange={(e) => updateApplianceRow(item.id, "name", e.target.value)}
                            placeholder="Appliance"
                          />
                          <input
                            className="number-input"
                            type="number"
                            value={item.watts}
                            onChange={(e) => updateApplianceRow(item.id, "watts", e.target.value)}
                            placeholder="Watts"
                          />
                          <input
                            className="number-input"
                            type="number"
                            value={item.hours}
                            onChange={(e) => updateApplianceRow(item.id, "hours", e.target.value)}
                            placeholder="Hours"
                          />
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
              </div>

              <div className="stack">

                <Panel title="System Planner" subtitle="The builder now plans connected systems, not only files.">
                  <div className="module-top">
                    <strong>{systemPlanner.summary}</strong>
                    <button className="mini-btn" onClick={refreshSystemPlanner}>Refresh planner</button>
                  </div>
                  <div className="brain-grid" style={{ marginTop: 14 }}>
                    <StatCard label="Complexity" value={systemPlanner.complexity} hint="Generation depth" />
                    <StatCard label="Systems" value={systemPlanner.systems.length} hint="Connected bundles planned" accent="var(--accent-2)" />
                    <StatCard label="Data" value={systemPlanner.architecture?.data || "—"} hint="Persistence strategy" accent="var(--success)" />
                  </div>
                  <div className="module-list" style={{ marginTop: 14 }}>
                    {systemPlanner.systems.map((systemKey) => (
                      <div key={systemKey} className="module-item">
                        <div className="module-top">
                          <strong>{formatSystemLabel(systemKey)}</strong>
                          <span className="tag">planned</span>
                        </div>
                        <div className="muted">{SYSTEM_LIBRARY[systemKey]?.description}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                    {SYSTEM_COMPLEXITY_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        className={`pill ${systemPlanner.complexity === option.key ? "active" : ""}`}
                        onClick={() => setPlannerComplexity(option.key)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="result-box" style={{ marginTop: 14 }}>
                    <strong>Architecture</strong>
                    <div className="muted" style={{ marginTop: 8 }}>Frontend: {systemPlanner.architecture?.frontend}</div>
                    <div className="muted">Backend: {systemPlanner.architecture?.backend}</div>
                    <div className="muted">Auth: {systemPlanner.architecture?.auth}</div>
                    <div className="muted">Data: {systemPlanner.architecture?.data}</div>
                  </div>
                </Panel>

                <Panel
                  title="Builder Structure"
                  subtitle="Files, routes, and components returned by mutation engine v2"
                >
                  <div className="simple-builder-grid">
                    <div className="module-list">
                      {generatedFileTree.length ? generatedFileTree.slice(0, 10).map((item) => (
                        <div key={item.path} className="module-item">
                          <div className="module-top">
                            <strong>{item.path}</strong>
                            <span className="tag">{item.kind}</span>
                          </div>
                          <div className="muted">{item.role}</div>
                        </div>
                      )) : <div className="saved-card"><strong>No generated files yet</strong><div className="muted">Run Builder Brain to materialize a structure.</div></div>}
                    </div>
                    <div className="module-list">
                      {generatedRoutes.length ? generatedRoutes.map((route) => (
                        <div key={route.path} className="module-item">
                          <div className="module-top">
                            <strong>{route.path}</strong>
                            <span className="tag">{route.component}</span>
                          </div>
                          <div className="muted">{route.reason}</div>
                        </div>
                      )) : <div className="saved-card"><strong>No routes yet</strong><div className="muted">Routes from /mutate will appear here.</div></div>}
                      {generatedComponents.length ? generatedComponents.slice(0, 6).map((component) => (
                        <div key={component.name} className="module-item">
                          <div className="module-top">
                            <strong>{component.name}</strong>
                            <span className="tag">component</span>
                          </div>
                          <div className="muted">{component.purpose}</div>
                        </div>
                      )) : null}
                    </div>
                  </div>
                </Panel>

                {activeModules.includes("live_preview") ? (
                  <Panel title="Live Layout Preview" subtitle="The UI now mutates as commands change the builder shell">
                    <PreviewCanvas
                      layout={layoutState}
                      activeModules={activeModules}
                      featureState={featureState}
                      result={result}
                      prompt={prompt}
                    />
                  </Panel>
                ) : null}

                {activeModules.includes("active_features_panel") ? (
                  <Panel title="Active Features Panel" subtitle="Behavior modules that are currently enabled">
                    <div className="module-list">
                      {activeModuleMeta.map((module) => (
                        <div key={module.key} className="module-item">
                          <div className="module-top">
                            <strong>{module.label}</strong>
                            <span className="tag">{module.category}</span>
                          </div>
                          <div className="muted">{module.description}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {activeModules.includes("status_panel") ? (
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
                ) : null}

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
              </div>
            </main>

            {layoutState.inspector ? (
              <aside className="stack">
                <Panel title="Inspector" subtitle="Extra detail panel unlocked by layout mutation">
                  <div className="history-list">
                    {commandHistory.slice(0, 5).map((item) => (
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

                {activeModules.includes("affiliate_suggestions") ? (
                  <Panel title="Affiliate Suggestions" subtitle="Keeps your monetization block visible even while layout mutates">
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
                ) : null}

                {activeModules.includes("notes_panel") ? (
                  <Panel title="Notes Panel" subtitle="Use this for builder planning and UI mutation ideas">
                    <textarea
                      className="notes-box"
                      value={featureState.notes}
                      onChange={(e) => setFeatureState((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Example: next step = let layout mutation reorder panels by prompt intent"
                    />
                  </Panel>
                ) : null}
              </aside>
            ) : null}
          </div>

          <div className="footer-note">
            Builder brain, mutation log, export flow, local saves, affiliate block, backend battery planner, system planner, and the new RV smart template system are preserved. New step: the builder now plans connected RV product systems before code generation.
          </div>
        </>
      ) : uiMode === "chat" ? (
        <div className={`chat-builder-shell ${livePreviewDoc ? "with-preview" : "compact"}`}>
          <div className="chat-side-stack">
            <Panel
              title="Build With Chat"
              subtitle="Type what you want, press Go, and use one chat to build the app, change frontend and backend, or improve this builder itself."
              actions={
                <button className="ghost-pill" type="button" onClick={() => setShowChatDetails((prev) => !prev)}>
                  {showChatDetails ? "Hide project details" : "Project details"}
                </button>
              }
            >
              <div className="chat-composer">
                <div className="chat-composer-shell">
                  <div className="chat-composer-header">
                    <h3>{projectId ? "Tell me the next change" : "Describe the app you want"}</h3>
                    <p>{projectId ? "Keep the same project moving with one clear request at a time, then press Go." : "Start with one plain-language sentence, then press Go. The builder will ask follow-up questions if anything is missing."}</p>
                  </div>
                  <div className="chat-mode-row">
                    <span className="chat-project-state">
                      {projectId
                        ? "One chat is active. Ask for app changes, frontend + backend work, or builder improvements."
                        : "One chat is active. Describe the app, ask for full-stack work, or say if you want to improve this builder."}
                    </span>
                  </div>
                  <div className="chat-guidance-strip">
                    <div className="chat-guidance-tile">
                      <strong>Current focus</strong>
                      <div>{currentChatFocusLabel}</div>
                    </div>
                    <div className="chat-guidance-tile">
                      <strong>Best prompt</strong>
                      <div>
                        {projectId
                          ? "Ask for one useful change. You can include app changes, frontend + backend work, or builder improvements in the same chat."
                          : "Say what you want to build. You can also mention frontend + backend together if you need both."}
                      </div>
                    </div>
                    <div className="chat-guidance-tile">
                      <strong>How it works</strong>
                      <div>The chat decides whether your message is about the app, full-stack changes, or this builder.</div>
                    </div>
                  </div>
                  <textarea
                    className="input"
                    value={builderChatDraft}
                    onChange={(e) => setBuilderChatDraft(e.target.value)}
                    placeholder={projectId
                      ? "Example: add saved reports and backend endpoints, or improve this builder UI"
                      : "Example: build a client portal with frontend dashboard and backend API"}
                  />
                  {builderAssistantPrefs?.pinnedGoals?.length ? (
                    <div className="chat-builder-memory">
                      <div>
                        <strong>Saved builder goals</strong>
                        <div className="muted">You can still ask this same chat to improve the builder itself.</div>
                      </div>
                      <div>
                        <div className="chat-chip-row compact">
                          {(builderAssistantPrefs.pinnedGoals || []).map((goal) => (
                            <button key={goal} className="chat-chip builder-pref-active" type="button" onClick={() => setBuilderChatDraft(goal)}>
                              {goal}
                            </button>
                          ))}
                          <button className="chat-chip" type="button" onClick={() => pinBuilderAssistantGoal()}>
                            Pin current goal
                          </button>
                        </div>
                        {(builderAssistantPrefs.pinnedGoals || []).length ? (
                          <div className="chat-chip-row compact" style={{ marginTop: 8 }}>
                            {(builderAssistantPrefs.pinnedGoals || []).slice(0, 2).map((goal) => (
                              <button key={`remove_${goal}`} className="chat-secondary-link" type="button" onClick={() => removeBuilderAssistantGoal(goal)}>
                                Remove: {goal}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {(builderAssistantPrefs.recentRequests || []).length ? (
                        <div className="chat-chip-row compact">
                          {builderAssistantPrefs.recentRequests.slice(0, 2).map((item) => (
                            <button key={item} className="chat-chip" type="button" onClick={() => setBuilderChatDraft(item)}>{item}</button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="chat-quick-ideas">
                    <div className="muted">Quick starts</div>
                    <div className="chat-chip-row compact">
                      {visibleChatQuickIdeas.map((idea) => (
                        <button key={idea} className="chat-chip" type="button" onClick={() => setBuilderChatDraft(idea)}>{idea}</button>
                      ))}
                      {fullStackQuickActions.slice(0, 2).map((idea) => (
                        <button key={idea.label} className="chat-chip" type="button" onClick={() => setBuilderChatDraft(idea.prompt)}>{idea.label}</button>
                      ))}
                      {builderAssistantQuickActions.slice(0, 1).map((idea) => (
                        <button key={idea.label} className="chat-chip" type="button" onClick={() => setBuilderChatDraft(idea.prompt)}>{idea.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="chat-quick-ideas">
                    <div className="muted">Conversation style</div>
                    <div className="chat-chip-row compact">
                      {[
                        ["balanced", "Balanced"],
                        ["answer", "Answer only"],
                        ["clarify", "Ask questions"],
                        ["apply", "Apply now"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className={`chat-chip ${chatReplyPreference === value ? "active" : ""}`}
                          type="button"
                          onClick={() => setChatReplyPreference(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="chat-composer-actions">
                    <button className="pill primary" type="button" onClick={() => submitBuilderChatMessage()} disabled={isChatSubmitting}>
                      {isChatSubmitting ? "Working..." : "Go"}
                    </button>
                    <button className="chat-secondary-link" type="button" onClick={() => setShowStarterExamples((prev) => !prev)}>
                      {showStarterExamples ? "Hide examples" : "More examples"}
                    </button>
                    <button className="chat-secondary-link" type="button" onClick={() => { setBuilderChatHistory([]); setBuilderChatDraft(""); setBuilderProjectMemory({}); }}>
                      Clear chat
                    </button>
                  </div>
                </div>
                {showStarterExamples ? (
                  <div className="module-list" style={{ marginTop: 12 }}>
                    <div className="module-item">
                      <div className="module-top">
                        <strong>Starter examples</strong>
                        <span className="tag">Optional</span>
                      </div>
                      <div className="chat-chip-row">
                        {generalStarterExamples.map((example) => (
                          <button
                            key={example.label}
                            className="chat-chip"
                            type="button"
                            onClick={() => setBuilderChatDraft(example.prompt)}
                          >
                            {example.label}
                          </button>
                        ))}
                      </div>
                      <div className="muted" style={{ marginTop: 10 }}>
                        Pick one example to fill the chat box, then press Go.
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </Panel>

            <Panel
              title="Conversation"
              subtitle="Keep building in the same chat."
            >
              <div className="chat-thread" key={chatScrollTick}>
                {builderChatHistory.length ? builderChatHistory.map((message) => (
                  <div key={message.id} className={`chat-message ${message.role}`}>
                    <div className="chat-meta-row">
                      <div className="chat-role">
                        <span className="dot" style={{ background: message.role === "user" ? "#66d9ef" : "#8b5cf6" }} />
                        {message.role === "user" ? "You" : "Builder"}
                      </div>
                      <span className="muted">{message.time}</span>
                    </div>
                    <div className="chat-body">{message.text}</div>
                    {message.meta ? <div className="chat-assist-meta">{message.meta}</div> : null}
                    {Array.isArray(message.questions) && message.questions.length ? (
                      <div className="chat-question-list">
                        {message.questions.map((question) => (
                          <div key={question} className="chat-question-pill">{question}</div>
                        ))}
                      </div>
                    ) : null}
                    {message.role === "assistant" && message.advice ? (
                      <div className="chat-advice-stack">
                        {Array.isArray(message.advice.upgrades) && !(Array.isArray(message.actions) && message.actions[0]?.reason) ? message.advice.upgrades.map((item) => (
                          <div key={`upgrade_${item.label}`} className="chat-advice-card">
                            <strong>Good idea: {item.label}</strong>
                            <div className="muted">{item.reason}</div>
                          </div>
                        )) : null}
                        {Array.isArray(message.advice.cautions) ? message.advice.cautions.map((item) => (
                          <div key={`caution_${item.label}`} className="chat-advice-card">
                            <strong>Possible problem: {item.label}</strong>
                            <div className="muted">{item.reason}</div>
                          </div>
                        )) : null}
                        {Array.isArray(message.advice.better_options) ? message.advice.better_options.map((item) => (
                          <div key={`better_${item.label}`} className="chat-advice-card">
                            <strong>Better idea: {item.label}</strong>
                            <div className="muted">{item.reason}</div>
                          </div>
                        )) : null}
                      </div>
                    ) : null}
                    {message.role === "assistant" && Array.isArray(message.researchFindings) && message.researchFindings.length ? (
                      <div className="chat-advice-stack">
                        {message.researchFindings.slice(0, 4).map((item) => (
                          <a
                            key={`research_${item.url || item.title}`}
                            className="chat-advice-card"
                            href={item.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <strong>Helpful source: {item.title}</strong>
                            <div className="muted">{item.snippet || "Source found for this topic."}</div>
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {message.role === "assistant" && message.researchRecommendation?.prompt ? (
                      <div className="chat-advice-stack">
                        <div className="chat-advice-card">
                          <strong>Why this fits: {message.researchRecommendation.label || "Recommended next move"}</strong>
                          <div className="muted">{message.researchRecommendation.explanation || message.researchRecommendation.reason || "Chosen from saved research."}</div>
                        </div>
                      </div>
                    ) : null}
                    {message.role === "assistant" && Array.isArray(message.knowledgeHits) && message.knowledgeHits.length ? (
                      <div className="chat-advice-stack">
                        {message.knowledgeHits.map((item) => (
                          <a
                            key={`knowledge_${item.url || item.title}`}
                            className="chat-advice-card"
                            href={item.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <strong>Saved note: {item.title}</strong>
                            <div className="muted">{item.summary || item.topic || "Saved from earlier research."}</div>
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {message.role === "assistant" && Array.isArray(message.actions) && message.actions.length ? (() => {
                      const dismissedAssistantActionId = String(builderProjectMemory.dismissed_assistant_action_id || "").trim();
                      const visibleActions = message.actions.filter((action) => getActionIdentity(action) !== dismissedAssistantActionId);
                      if (!visibleActions.length) return null;
                      const leadAction = visibleActions[0];
                      const extraActions = visibleActions.slice(1);
                      return (
                        <div className="chat-action-row">
                          {leadAction?.reason ? (
                            <div className="chat-advice-card" style={{ width: "100%" }}>
                              <strong>{leadAction.label}</strong>
                              <div className="muted">{leadAction.reason}</div>
                              <div className="chat-action-row" style={{ marginTop: 10 }}>
                                <button
                                  className="pill primary"
                                  type="button"
                                  onClick={() => applyAssistantSuggestedAction(leadAction)}
                                >
                                  Do this next
                                </button>
                                <button
                                  className="chat-secondary-link"
                                  type="button"
                                  onClick={() => dismissAssistantSuggestedAction(leadAction)}
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          ) : null}
                          {extraActions.map((action) => (
                            <button
                              key={`${message.id}_${action.label}_${action.prompt}`}
                              className="chat-chip"
                              type="button"
                              onClick={() => submitBuilderChatMessage(action.prompt, action.mode || "evolve")}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      );
                    })() : null}
                  </div>
                )) : (
                  <div className="chat-empty-state">
                    Start with one idea, then ask for simple follow-up changes like “add login”, “make it mobile”, or “prepare it for Render”.
                  </div>
                )}
              </div>
            </Panel>

            <div className="chat-status-card">
              <div className="chat-status-head">
                <div className="chat-status-copy">
                  <strong>Builder update</strong>
                  <div>{simpleStatusMessage}</div>
                  <div className="muted">{simpleBuilderInsight}</div>
                </div>
                {statusCardPrimaryAction ? (
                  <div className="chat-primary-next">
                    <div>
                      <strong>{statusCardPrimaryAction.label}</strong>
                      <div className="muted" style={{ marginTop: 4 }}>{statusCardPrimaryAction.reason}</div>
                    </div>
                    <div className="chat-next-actions">
                      <button
                        className="pill primary"
                        type="button"
                        onClick={() => uiMode === "chat" ? applyAssistantSuggestedAction(statusCardPrimaryAction) : applyPrimaryNextAction(statusCardPrimaryAction)}
                      >
                        Do this next
                      </button>
                      <button
                        className="chat-secondary-link"
                        type="button"
                        onClick={() => uiMode === "chat" ? dismissAssistantSuggestedAction(statusCardPrimaryAction) : dismissPrimaryNextAction()}
                      >
                        Dismiss
                      </button>
                      {statusCardSecondaryActions.map((action) => (
                        <button
                          key={action.key || action.label}
                          className="chat-chip"
                          type="button"
                          onClick={() => uiMode === "chat" ? submitBuilderChatMessage(action.prompt, action.mode || "evolve") : submitBuilderChatMessage(action.cmd, action.cmd === "run-planner" ? "mutate" : "evolve")}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {showChatDetails ? <Panel title="Project details" subtitle="Technical project info and saved builder memory.">
              <div className="chat-side-stack">
                <Panel title="Current project" subtitle="A quick technical summary of the app you are building.">
                  <div className="card-grid">
                    <div className="card">
                      <strong>App type</strong>
                      <div className="muted">{featureState.appType}</div>
                    </div>
                    <div className="card">
                      <strong>Builder mode</strong>
                      <div className="muted">{featureState.builderMode}</div>
                    </div>
                    <div className="card">
                      <strong>Files</strong>
                      <div className="muted">{generatedCodeFiles.length}</div>
                    </div>
                    <div className="card">
                      <strong>Systems</strong>
                      <div className="muted">{(systemPlanner.systems || []).length}</div>
                    </div>
                  </div>
                  <div className="zone-chip-row" style={{ marginTop: 14 }}>
                    {(systemPlanner.systems || []).map((system) => (
                      <span key={system} className="zone-chip">{formatSystemLabel(system)}</span>
                    ))}
                  </div>
                </Panel>

                <Panel title="Saved context" subtitle="The key details the builder is carrying forward.">
                  <div className="card-grid">
                    <div className="card">
                      <strong>Summary</strong>
                      <div className="muted">{builderProjectMemory.project_summary || "No project summary yet"}</div>
                    </div>
                    <div className="card">
                      <strong>App type</strong>
                      <div className="muted">{builderProjectMemory.app_type || featureState.appType}</div>
                    </div>
                    <div className="card">
                      <strong>Mode</strong>
                      <div className="muted">{builderProjectMemory.builder_mode || featureState.builderMode}</div>
                    </div>
                    <div className="card">
                      <strong>Project state</strong>
                      <div className="muted">{builderProjectMemory.has_generated_app ? "Generated app in progress" : "Planning stage"}</div>
                    </div>
                    <div className="card">
                      <strong>Learned items</strong>
                      <div className="muted">{builderProjectMemory.global_knowledge_count || 0} saved insights</div>
                    </div>
                  </div>
                  <div className="zone-chip-row" style={{ marginTop: 14 }}>
                    {Array.isArray(builderProjectMemory.systems) && builderProjectMemory.systems.length
                      ? builderProjectMemory.systems.map((system) => (
                        <span key={system} className="zone-chip">{formatSystemLabel(system)}</span>
                      ))
                      : <span className="zone-chip">No systems locked yet</span>}
                  </div>
                  {builderProjectMemory.decisions ? (
                    <div className="zone-chip-row" style={{ marginTop: 12 }}>
                      {typeof builderProjectMemory.decisions.auth_required === "boolean" ? (
                        <span className="zone-chip">{builderProjectMemory.decisions.auth_required ? "Login required" : "Open access"}</span>
                      ) : null}
                      {typeof builderProjectMemory.decisions.billing_enabled === "boolean" ? (
                        <span className="zone-chip">{builderProjectMemory.decisions.billing_enabled ? "Billing enabled" : "No billing"}</span>
                      ) : null}
                      {builderProjectMemory.decisions.product_shape ? (
                        <span className="zone-chip">Shape · {builderProjectMemory.decisions.product_shape}</span>
                      ) : null}
                    </div>
                  ) : null}
                  {Array.isArray(builderProjectMemory.unresolved_questions) && builderProjectMemory.unresolved_questions.length ? (
                    <div className="module-list" style={{ marginTop: 12 }}>
                      {builderProjectMemory.unresolved_questions.slice(0, 2).map((question) => (
                        <div key={question} className="module-item">
                          <strong>Waiting on</strong>
                          <div className="muted">{question}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {builderProjectMemory.advice ? (
                    <div className="module-list" style={{ marginTop: 12 }}>
                      {Array.isArray(builderProjectMemory.advice.upgrades) ? builderProjectMemory.advice.upgrades.slice(0, 1).map((item) => (
                        <div key={`memory_upgrade_${item.label}`} className="module-item">
                          <strong>Good idea: {item.label}</strong>
                          <div className="muted">{item.reason}</div>
                        </div>
                      )) : null}
                      {Array.isArray(builderProjectMemory.advice.cautions) ? builderProjectMemory.advice.cautions.slice(0, 1).map((item) => (
                        <div key={`memory_caution_${item.label}`} className="module-item">
                          <strong>Possible problem: {item.label}</strong>
                          <div className="muted">{item.reason}</div>
                        </div>
                      )) : null}
                      {Array.isArray(builderProjectMemory.advice.better_options) ? builderProjectMemory.advice.better_options.slice(0, 1).map((item) => (
                        <div key={`memory_better_${item.label}`} className="module-item">
                          <strong>Better idea: {item.label}</strong>
                          <div className="muted">{item.reason}</div>
                        </div>
                      )) : null}
                    </div>
                  ) : null}
                  {builderProjectMemory.research_recommendation?.prompt ? (
                    <div className="module-list" style={{ marginTop: 12 }}>
                      <div className="module-item">
                        <strong>Recommended next move: {builderProjectMemory.research_recommendation.label || "Recommended next move"}</strong>
                        <div className="muted">{builderProjectMemory.research_recommendation.reason || "Ready to apply from saved research."}</div>
                        <div className="muted" style={{ marginTop: 8 }}>{builderProjectMemory.research_recommendation.explanation || "The builder chose this because it best fits the saved research and current project state."}</div>
                        <button
                          className="chat-chip"
                          type="button"
                          style={{ marginTop: 10 }}
                          onClick={() => submitBuilderChatMessage(builderProjectMemory.research_recommendation.prompt, builderProjectMemory.research_recommendation.mode || "evolve")}
                        >
                          Apply researched recommendation
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {isKnowledgeLoading ? (
                    <div className="chat-empty-state" style={{ marginTop: 12 }}>Refreshing learned knowledge…</div>
                  ) : null}
                  {globalKnowledgeTopics.length ? (
                    <div className="zone-chip-row" style={{ marginTop: 12 }}>
                      {globalKnowledgeTopics.slice(0, 4).map((topic) => (
                        <span key={topic} className="zone-chip">Knowledge · {topic}</span>
                      ))}
                    </div>
                  ) : null}
                </Panel>
              </div>
            </Panel> : null}
          </div>

          <div className="chat-preview-rail">
            <Panel title="Live preview" subtitle="See the app while you chat.">
              <div className="chat-preview-meta">
                <div className="card-grid">
                  <div className="card">
                    <strong>Project</strong>
                    <div className="muted">{projectId || "Not created yet"}</div>
                  </div>
                  <div className="card">
                    <strong>Last update</strong>
                    <div className="muted">{latestOrchestrationEntry?.time || "Waiting"}</div>
                  </div>
                </div>
                {previewRoutes.length ? (
                  <div className="chat-chip-row compact">
                    {previewRoutes.map((route) => (
                      <button
                        key={route.path}
                        className={`chat-chip ${selectedPreviewRoute === route.path ? "active" : ""}`}
                        type="button"
                        onClick={() => setSelectedPreviewRoute(route.path)}
                      >
                        {route.label || route.path}
                      </button>
                    ))}
                  </div>
                ) : null}
                {livePreviewDoc ? (
                  <iframe title="Chat Builder Preview" srcDoc={livePreviewDoc} className="chat-preview-frame" />
                ) : (
                  <div className="chat-empty-state">Generate the first app version to see the preview here while you chat.</div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
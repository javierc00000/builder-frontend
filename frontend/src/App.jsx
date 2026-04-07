import React, { useEffect, useMemo, useRef, useState } from "react";

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
const SIMPLE_STYLE_OPTIONS = ["Dark glass", "Clean SaaS", "Builder Pro", "Minimal"];
const SIMPLE_GENERATION_STAGES = [
  "Understanding what you want to build",
  "Planning the workspace shell",
  "Generating the first builder version",
];
const DEFAULT_SIMPLE_DRAFT = {
  starterKey: "assistant",
  appName: "My Assistant",
  mainGoal: "Answer questions, call tools, and guide the user",
  style: "Dark glass",
};

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
  const [statusMessage, setStatusMessage] = useState("Builder ready.");
  const [builderInsight, setBuilderInsight] = useState("Waiting for your next mutation command.");
  const [selectedSidebarView, setSelectedSidebarView] = useState("builder");
  const [uiMode, setUiMode] = useState(() => loadFromStorage(STORAGE_KEYS.uiMode, "simple"));
  const [simpleFlowStep, setSimpleFlowStep] = useState(() =>
    loadFromStorage(STORAGE_KEYS.simpleFlowStep, loadFromStorage(STORAGE_KEYS.commandHistory, []).length ? "builder" : "welcome")
  );
  const [simpleDraft, setSimpleDraft] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.simpleDraft, DEFAULT_SIMPLE_DRAFT);
    return { ...DEFAULT_SIMPLE_DRAFT, ...stored };
  });
  const [simplePendingPrompt, setSimplePendingPrompt] = useState("");
  const [simpleGenerationStage, setSimpleGenerationStage] = useState(0);
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

  useEffect(() => {
    return undefined;
  }, [simpleFlowStep, simplePendingPrompt]);

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
  const nextBestActions = useMemo(
    () => getNextBestActions({ featureState, layoutState, commandHistory, result }),
    [featureState, layoutState, commandHistory, result],
  );


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
    setSimplePendingPrompt("");
    setSimpleGenerationStage(0);
    runBuilderBrain(starterPrompt);
    setSimpleFlowStep("builder");
    setStatusMessage("First builder version generated.");
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

  function ensureModules(modulesToAdd) {
    if (!modulesToAdd?.length) return;
    setActiveModules((prev) => [...new Set([...prev, ...modulesToAdd])]);
  }

  function removeModules(modulesToRemove) {
    if (!modulesToRemove?.length) return;
    setActiveModules((prev) => prev.filter((item) => !modulesToRemove.includes(item)));
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
    setLayoutState(layoutMutation.layout);
    ensureModules(layoutMutation.moduleAdds);

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
      ].join(" | "),
    });

    setBuilderInsight(
      `Builder brain detected ${nextAnalysis.appType} in ${nextAnalysis.builderMode} mode and restructured the workspace to ${getLayoutLabel(layoutMutation.layout)}.`
    );
    setStatusMessage("Builder brain updated modules and layout.");
  }

  function handleMutationCommand(rawCommand) {
    const command = String(rawCommand || prompt).trim();
    if (!command) return;

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
        ? layoutMutation.notes.join(" ")
        : "Command logged. No major layout mutation matched yet."
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
    setResult(null);
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
    .join(" ");

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
      `}</style>

      <div className="topbar">
        <div className="brand">
          <span className="eyebrow">Personal AI Builder</span>
          <h1>Real Builder Workspace</h1>
          <p>Features mutate behavior. Commands now mutate the actual layout too.</p>
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
        <div className="simple-mode-grid" style={{ display: "grid", gap: 18, marginBottom: 18 }}>
          <div className="simple-builder-grid">
            <Panel
              title="Simple Builder"
              subtitle="One command, one preview, no guided overlays."
              collapsible={false}
            >
              <div className="builder-form" style={{ gap: 14 }}>
                <div className="module-top">
                  <strong>Command bar</strong>
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
              title="Live Preview"
              subtitle="A clean preview without debug steps."
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
                <button className="mini-btn" onClick={() => addApplianceRow()}>
                  Add row
                </button>
              </div>
              {result ? (
                <div className="result-box" style={{ marginTop: 12 }}>
                  <strong>{computedSummary}</strong>
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
                    <strong>Last command</strong>
                    <span className="tag">{commandHistory?.[0]?.appType || featureState.appType}</span>
                  </div>
                  <div className="muted">{commandHistory?.[0]?.prompt || "No command yet."}</div>
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
          </div>
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
        Builder brain, mutation log, export flow, local saves, affiliate block, and backend battery planner are preserved. New step: commands now mutate the actual UI shell.
      </div>
      </>
      ) : null}
    </div>
  );
}
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import re
import json
from pathlib import Path
from datetime import datetime, timezone

app = FastAPI(title="Builder Backend v6 - Data Flow Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://builder-frontend.javierc00000.workers.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"status": "ok", "service": "builder-backend-v6"}


@app.get("/health")
def health():
  return {"status": "healthy", "service": "builder-backend-v6", "data_flow": True, "workspace_edit": True}


class ApplianceItem(BaseModel):
    name: str = ""
    watts: float = 0
    hours: float = 0


class BatteryPlanRequest(BaseModel):
    appliances: List[ApplianceItem] = Field(default_factory=list)
    battery_voltage: float = 12
    autonomy_days: float = 1
    sun_hours: float = 4
    system_loss: float = 0.2


class MutateRequest(BaseModel):
    prompt: str
    current_layout: Dict[str, Any] = Field(default_factory=dict)
    active_modules: List[str] = Field(default_factory=list)
    feature_state: Dict[str, Any] = Field(default_factory=dict)
    systems: List[str] = Field(default_factory=list)
    complexity: str = ""
    architecture: Dict[str, Any] = Field(default_factory=dict)


class GenerateCodeRequest(BaseModel):
    prompt: str
    app_type: str = ""
    builder_mode: str = ""
    style: str = "dark glass"
    routes: List[Dict[str, Any]] = Field(default_factory=list)
    components: List[Dict[str, Any]] = Field(default_factory=list)
    systems: List[str] = Field(default_factory=list)
    complexity: str = "mvp"
    architecture: Dict[str, Any] = Field(default_factory=dict)
    persistence: str = ""


class ChatTurn(BaseModel):
    role: str = "user"
    text: str = ""


class ChatAgentRequest(BaseModel):
    message: str
    project_id: str = ""
    current_prompt: str = ""
    project_memory: Dict[str, Any] = Field(default_factory=dict)
    feature_state: Dict[str, Any] = Field(default_factory=dict)
    generated_files: List[Dict[str, Any]] = Field(default_factory=list)
    routes: List[Dict[str, Any]] = Field(default_factory=list)
    components: List[Dict[str, Any]] = Field(default_factory=list)
    system_planner: Dict[str, Any] = Field(default_factory=dict)
    chat_mode: str = "evolve"
    reply_preference: str = "balanced"
    recent_messages: List[ChatTurn] = Field(default_factory=list)


class RepoEditRequest(BaseModel):
    prompt: str
    current_files: List[Dict[str, Any]] = Field(default_factory=list)
    app_type: str = ""
    builder_mode: str = ""
    style: str = "dark glass"
    target_scope: str = "fullstack"
    project_memory: Dict[str, Any] = Field(default_factory=dict)
    feature_state: Dict[str, Any] = Field(default_factory=dict)
    system_planner: Dict[str, Any] = Field(default_factory=dict)


class WorkspaceEditRequest(RepoEditRequest):
    pass


class ProjectStateSaveRequest(BaseModel):
    snapshot: Dict[str, Any] = Field(default_factory=dict)


class OrchestrateRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None
    app_type: str = ""
    builder_mode: str = ""
    style: str = "dark glass"
    routes: List[Dict[str, Any]] = Field(default_factory=list)
    components: List[Dict[str, Any]] = Field(default_factory=list)
    current_files: List[Dict[str, Any]] = Field(default_factory=list)
    system_planner: Dict[str, Any] = Field(default_factory=dict)
    system_prompt: str = ""
    project_memory: Dict[str, Any] = Field(default_factory=dict)
    feature_state: Dict[str, Any] = Field(default_factory=dict)
    current_layout: Dict[str, Any] = Field(default_factory=dict)
    active_modules: List[str] = Field(default_factory=list)
    rv_template_key: str = ""
    rv_camping_profile: str = ""


@app.post("/battery-plan")
def battery_plan(payload: BatteryPlanRequest):
    daily_wh = sum(max(item.watts, 0) * max(item.hours, 0) for item in payload.appliances)
    adjusted_daily_wh = daily_wh * (1 + max(payload.system_loss, 0))
    battery_ah = round((adjusted_daily_wh * max(payload.autonomy_days, 1)) / max(payload.battery_voltage, 1), 1)
    solar_watts = round(adjusted_daily_wh / max(payload.sun_hours, 1), 1)
    return {
        "daily_wh": round(daily_wh, 1),
        "adjusted_daily_wh": round(adjusted_daily_wh, 1),
        "battery_ah": battery_ah,
        "solar_watts": solar_watts,
        "summary": f"For this setup, plan for about {battery_ah}Ah of battery and {solar_watts}W of solar.",
    }


def infer_app_type(prompt: str) -> str:
    p = prompt.lower()
    if re.search(r"(admin|dashboard|crm|analytics|panel|saas)", p):
        return "admin panel"
    if re.search(r"(assistant|chat|copilot|agent|support bot)", p):
        return "assistant app"
    if re.search(r"(content|editor|blog|cms|writer|studio)", p):
        return "content app"
    return "tool app"


def infer_builder_mode(prompt: str) -> str:
    p = prompt.lower()
    if re.search(r"(battery|solar|power|inverter|camping)", p):
        return "battery-planner"
    if re.search(r"(dashboard|crm|analytics|saas)", p):
        return "dashboard-builder"
    if re.search(r"(landing|marketing|website)", p):
        return "site-builder"
    if re.search(r"(content|editor|blog|cms)", p):
        return "content-builder"
    return "general-builder"


def infer_summary_style(prompt: str) -> str:
    p = prompt.lower()
    if re.search(r"(detail|deeper|full|complete|advanced)", p):
        return "detailed"
    if re.search(r"(simple|quick|fast|short)", p):
        return "concise"
    return "balanced"


def infer_systems(prompt: str, app_type: str) -> List[str]:
    p = prompt.lower()
    systems = set()
    if app_type == "admin panel":
        systems.update(["dashboard", "storage", "settings"])
    elif app_type == "assistant app":
        systems.update(["ai-tools", "storage", "settings"])
    elif app_type == "content app":
        systems.update(["storage", "settings"])
    else:
        systems.update(["storage"])

    if re.search(r"(login|auth|account|signin|sign in|register|user)", p):
        systems.add("auth")
    if re.search(r"(billing|subscription|stripe|paywall|pro|premium)", p):
        systems.add("billing")
    if re.search(r"(scan|diagnostic|ai|assistant|chat|analysis)", p):
        systems.add("ai-tools")
    if re.search(r"(admin|team|portal|role|dealer|tech)", p):
        systems.add("admin")
    if re.search(r"(settings|preferences|profile)", p):
        systems.add("settings")
    if re.search(r"(dashboard|stats|analytics|reports)", p):
        systems.add("dashboard")
    return sorted(systems)


def infer_persistence(prompt: str, systems: List[str], complexity: str) -> str:
    p = prompt.lower()
    if "billing" in systems or "auth" in systems or complexity == "product":
        return "supabase"
    if re.search(r"(local|offline|desktop|mvp|sqlite|history|saved)", p) or complexity == "mvp":
        return "sqlite"
    return "localstorage"


def recommend_modules(prompt: str, app_type: str) -> List[str]:
    p = prompt.lower()
    modules = {
        "results_summary",
        "save_results",
        "status_panel",
        "active_features_panel",
        "quick_actions",
        "live_preview",
    }
    if app_type == "admin panel":
        modules.update({"dashboard_shell", "sidebar_navigation", "split_workspace"})
    if app_type in {"assistant app", "content app", "tool app"}:
        modules.add("split_workspace")
    if app_type in {"assistant app", "content app"}:
        modules.add("notes_panel")
    if re.search(r"(battery|solar|power|calculator|tool)", p):
        modules.add("calculator_engine")
    if re.search(r"(affiliate|amazon|monetize|shop)", p):
        modules.add("affiliate_suggestions")
    if re.search(r"(export|report|download|pdf)", p):
        modules.add("export_report")
    if re.search(r"(sidebar|navigation|rail)", p):
        modules.add("sidebar_navigation")
    if re.search(r"(notes|brainstorm|scratch)", p):
        modules.add("notes_panel")
    if re.search(r"(dashboard|crm|saas)", p):
        modules.add("dashboard_shell")
    return sorted(modules)


def build_layout(prompt: str, current_layout: Dict[str, Any]) -> Dict[str, Any]:
    layout = {
        "mode": current_layout.get("mode", "workspace"),
        "shell": current_layout.get("shell", "classic"),
        "sidebar": current_layout.get("sidebar", False),
        "split": current_layout.get("split", False),
        "topbar": current_layout.get("topbar", True),
        "inspector": current_layout.get("inspector", False),
        "cards": current_layout.get("cards", True),
        "dense": current_layout.get("dense", False),
        "previewStyle": current_layout.get("previewStyle", "wireframe"),
        "panels": {
            "sidebar": list(current_layout.get("panels", {}).get("sidebar", ["builder", "results", "modules", "mutations"])),
            "mainTop": list(current_layout.get("panels", {}).get("mainTop", ["brain", "command", "quickActions"])),
            "mainBottom": list(current_layout.get("panels", {}).get("mainBottom", ["planner", "results", "preview"])),
            "inspector": list(current_layout.get("panels", {}).get("inspector", ["status", "affiliate", "notes"])),
        },
    }
    p = prompt.lower()
    if re.search(r"(dashboard|crm|saas)", p):
        layout.update({"mode": "dashboard", "shell": "dashboard", "sidebar": True, "split": True, "inspector": True, "previewStyle": "dashboard"})
    if re.search(r"(assistant|copilot|agent|content|editor|writer|studio)", p):
        layout.update({"mode": "workspace", "shell": "classic", "split": True, "inspector": True})
    if re.search(r"(focus preview|preview first|canvas focus)", p):
        layout.update({"mode": "focus", "shell": "focus", "split": True, "previewStyle": "spotlight"})
    if re.search(r"(dense|compact)", p):
        layout["dense"] = True
    if re.search(r"(spacious|comfortable|relaxed)", p):
        layout["dense"] = False
    if re.search(r"(add sidebar|sidebar|navigation)", p):
        layout["sidebar"] = True
    if re.search(r"(add inspector|inspector|right panel)", p):
        layout["inspector"] = True
    if re.search(r"(split|two column|2 column|2-column)", p):
        layout["split"] = True
    return layout


def build_file_tree(app_type: str, builder_mode: str, prompt: str, systems: List[str], persistence: str) -> List[Dict[str, Any]]:
    base = [
        {"path": "frontend/src/App.jsx", "kind": "file", "role": "root app"},
        {"path": "frontend/src/main.jsx", "kind": "file", "role": "entry"},
        {"path": "frontend/src/styles/app.css", "kind": "file", "role": "global styles"},
        {"path": "frontend/src/components", "kind": "folder", "role": "ui components"},
        {"path": "frontend/src/pages", "kind": "folder", "role": "pages"},
        {"path": "frontend/src/lib", "kind": "folder", "role": "helpers"},
        {"path": "backend/main.py", "kind": "file", "role": "api server"},
        {"path": "backend/requirements.txt", "kind": "file", "role": "backend deps"},
    ]
    if app_type == "admin panel":
        base += [
            {"path": "frontend/src/pages/DashboardPage.jsx", "kind": "file", "role": "dashboard page"},
            {"path": "frontend/src/components/Sidebar.jsx", "kind": "file", "role": "navigation"},
            {"path": "frontend/src/components/KpiCard.jsx", "kind": "file", "role": "metrics card"},
            {"path": "frontend/src/components/InspectorPanel.jsx", "kind": "file", "role": "details panel"},
        ]
    elif app_type == "assistant app":
        base += [
            {"path": "frontend/src/pages/AssistantPage.jsx", "kind": "file", "role": "assistant page"},
            {"path": "frontend/src/components/ChatShell.jsx", "kind": "file", "role": "chat interface"},
            {"path": "frontend/src/components/ToolRail.jsx", "kind": "file", "role": "tools rail"},
            {"path": "frontend/src/components/MemoryPanel.jsx", "kind": "file", "role": "memory / notes"},
        ]
    elif app_type == "content app":
        base += [
            {"path": "frontend/src/pages/StudioPage.jsx", "kind": "file", "role": "content studio"},
            {"path": "frontend/src/components/EditorShell.jsx", "kind": "file", "role": "editor"},
            {"path": "frontend/src/components/PreviewPanel.jsx", "kind": "file", "role": "content preview"},
            {"path": "frontend/src/components/NotesPanel.jsx", "kind": "file", "role": "notes"},
        ]
    else:
        base += [
            {"path": "frontend/src/pages/ToolPage.jsx", "kind": "file", "role": "tool page"},
            {"path": "frontend/src/components/CalculatorForm.jsx", "kind": "file", "role": "tool input"},
            {"path": "frontend/src/components/ResultsPanel.jsx", "kind": "file", "role": "tool output"},
            {"path": "frontend/src/components/ExportActions.jsx", "kind": "file", "role": "export controls"},
        ]
    if "auth" in systems:
        base += [
            {"path": "frontend/src/pages/LoginPage.jsx", "kind": "file", "role": "authentication"},
            {"path": "frontend/src/lib/auth.js", "kind": "file", "role": "auth helpers"},
        ]
    if "storage" in systems:
        base += [
            {"path": "frontend/src/lib/api.js", "kind": "file", "role": "api client"},
            {"path": "frontend/src/hooks/useItems.js", "kind": "file", "role": "data hook"},
            {"path": "backend/data_store.py", "kind": "file", "role": f"{persistence} storage layer"},
        ]
    if builder_mode == "battery-planner":
        base += [
            {"path": "frontend/src/lib/batteryMath.js", "kind": "file", "role": "calculation logic"},
            {"path": "frontend/src/components/ApplianceTable.jsx", "kind": "file", "role": "appliance rows"},
        ]
    return base


def build_routes(app_type: str, prompt: str, systems: List[str]) -> List[Dict[str, str]]:
    routes = [{"path": "/", "component": "App", "reason": "root route"}]
    if app_type == "admin panel":
        routes += [
            {"path": "/dashboard", "component": "DashboardPage", "reason": "main admin workspace"},
            {"path": "/settings", "component": "SettingsPage", "reason": "workspace settings"},
        ]
    elif app_type == "assistant app":
        routes += [
            {"path": "/assistant", "component": "AssistantPage", "reason": "assistant shell"},
            {"path": "/history", "component": "HistoryPage", "reason": "saved conversations"},
        ]
    elif app_type == "content app":
        routes += [
            {"path": "/studio", "component": "StudioPage", "reason": "content workspace"},
            {"path": "/preview", "component": "PreviewPage", "reason": "content preview"},
        ]
    else:
        routes += [
            {"path": "/tool", "component": "ToolPage", "reason": "primary tool surface"},
            {"path": "/results", "component": "ResultsPage", "reason": "output view"},
        ]
    if "auth" in systems:
        routes.append({"path": "/login", "component": "LoginPage", "reason": "auth entry"})
    return routes


def build_components(app_type: str, systems: List[str]) -> List[Dict[str, str]]:
    base = [
        {"name": "CommandBar", "purpose": "captures builder commands"},
        {"name": "LivePreview", "purpose": "renders structural preview"},
        {"name": "StatusBadge", "purpose": "shows api and workspace status"},
    ]
    if app_type == "admin panel":
        base += [
            {"name": "Sidebar", "purpose": "left navigation"},
            {"name": "KpiCard", "purpose": "metric summaries"},
            {"name": "InspectorPanel", "purpose": "details and controls"},
        ]
    elif app_type == "assistant app":
        base += [
            {"name": "ChatShell", "purpose": "conversation interface"},
            {"name": "ToolRail", "purpose": "assistant tools"},
            {"name": "MemoryPanel", "purpose": "session memory"},
        ]
    elif app_type == "content app":
        base += [
            {"name": "EditorShell", "purpose": "writing interface"},
            {"name": "PreviewPanel", "purpose": "live content preview"},
            {"name": "NotesPanel", "purpose": "draft notes"},
        ]
    else:
        base += [
            {"name": "CalculatorForm", "purpose": "tool inputs"},
            {"name": "ResultsPanel", "purpose": "tool outputs"},
            {"name": "ExportActions", "purpose": "download/export actions"},
        ]
    if "storage" in systems:
        base.append({"name": "DataList", "purpose": "renders persisted records"})
    if "auth" in systems:
        base.append({"name": "AuthGate", "purpose": "guards protected screens"})
    return base


def build_mutation_summary(layout: Dict[str, Any], modules: List[str], app_type: str, builder_mode: str, systems: List[str], persistence: str) -> List[str]:
    summary = [
        f"App type detected: {app_type}",
        f"Builder mode detected: {builder_mode}",
        f"Layout shell: {layout['shell']}",
        f"Preview style: {layout['previewStyle']}",
        f"Active modules planned: {len(modules)}",
        f"Systems planned: {', '.join(systems) if systems else 'none'}",
        f"Persistence planned: {persistence}",
    ]
    if layout.get("sidebar"):
        summary.append("Sidebar enabled")
    if layout.get("split"):
        summary.append("Split workspace enabled")
    if layout.get("inspector"):
        summary.append("Inspector enabled")
    return summary


def app_css(style_name: str) -> str:
    return """
:root {
  color-scheme: dark;
  --bg: #07111f;
  --panel: rgba(13, 25, 43, 0.88);
  --panel-border: rgba(148, 163, 184, 0.16);
  --text: #e5eefc;
  --muted: #93a4bf;
  --accent: #66d9ef;
  --accent-2: #8b5cf6;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, Arial, sans-serif;
  background: radial-gradient(circle at top, #12203a, #07111f 55%);
  color: var(--text);
}
button, input, textarea { font: inherit; }
.app-shell { min-height: 100vh; padding: 24px; display: grid; gap: 18px; }
.panel { border: 1px solid var(--panel-border); background: var(--panel); border-radius: 20px; padding: 18px; }
.row { display: grid; gap: 18px; }
.row.two { grid-template-columns: 260px 1fr; }
.row.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.pill { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 8px 12px; border: 1px solid rgba(148, 163, 184, 0.18); background: rgba(255,255,255,0.04); color: var(--muted); }
.primary-btn { border: none; border-radius: 999px; padding: 12px 18px; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #07111f; }
.muted { color: var(--muted); }
.card-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
.card { border: 1px solid rgba(148,163,184,.14); border-radius: 16px; padding: 16px; background: rgba(255,255,255,0.03); }
.input { width: 100%; border-radius: 14px; border: 1px solid rgba(148,163,184,.16); background: rgba(255,255,255,.04); color: var(--text); padding: 12px 14px; }
.list { display: grid; gap: 10px; margin-top: 12px; }
.item { display: flex; justify-content: space-between; gap: 12px; padding: 12px; border: 1px solid rgba(148,163,184,.12); border-radius: 12px; background: rgba(255,255,255,.03); }
@media (max-width: 900px) { .row.two, .row.three { grid-template-columns: 1fr; } }
""".strip()


def main_jsx() -> str:
    return """
import React from \"react\";
import ReactDOM from \"react-dom/client\";
import App from \"./App.jsx\";
import \"./styles/app.css\";

ReactDOM.createRoot(document.getElementById(\"root\")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
""".strip()


def root_app_code(app_type: str) -> str:
    page_name = {
        "admin panel": "DashboardPage",
        "assistant app": "AssistantPage",
        "content app": "StudioPage",
        "tool app": "ToolPage",
    }.get(app_type, "ToolPage")
    return f"""
import React from \"react\";
import {{ {page_name} }} from \"./pages/{page_name}.jsx\";

export default function App() {{
  return <{page_name} />;
}}
""".strip()


def dashboard_page_code(prompt: str) -> str:
    return f"""
import React, {{ useEffect, useState }} from \"react\";
import {{ Sidebar }} from \"../components/Sidebar.jsx\";
import {{ KpiCard }} from \"../components/KpiCard.jsx\";
import {{ InspectorPanel }} from \"../components/InspectorPanel.jsx\";
import {{ getItems }} from \"../lib/api.js\";

export function DashboardPage() {{
  const [items, setItems] = useState([]);
  useEffect(() => {{ getItems().then(setItems).catch(() => setItems([])); }}, []);

  return (
    <div className=\"app-shell\">
      <div className=\"panel\">
        <div className=\"pill\">Admin dashboard</div>
        <h1>CRM Dashboard</h1>
        <p className=\"muted\">{prompt}</p>
      </div>
      <div className=\"row two\">
        <Sidebar />
        <div className=\"row\">
          <div className=\"card-grid\">
            <KpiCard title=\"Records\" value={{String(items.length)}} />
            <KpiCard title=\"Status\" value=\"Connected\" />
            <KpiCard title=\"Flow\" value=\"Live API\" />
          </div>
          <div className=\"panel\">
            <h2>Recent records</h2>
            <div className=\"list\">{{items.map(item => <div className=\"item\" key={{item.id}}><span>{{item.title}}</span><span className=\"muted\">{{item.status}}</span></div>)}}</div>
          </div>
        </div>
      </div>
      <InspectorPanel />
    </div>
  );
}}
""".strip()


def assistant_page_code(prompt: str) -> str:
    return f"""
import React, {{ useEffect, useState }} from \"react\";
import {{ ChatShell }} from \"../components/ChatShell.jsx\";
import {{ ToolRail }} from \"../components/ToolRail.jsx\";
import {{ MemoryPanel }} from \"../components/MemoryPanel.jsx\";
import {{ getItems }} from \"../lib/api.js\";

export function AssistantPage() {{
  const [items, setItems] = useState([]);
  useEffect(() => {{ getItems().then(setItems).catch(() => setItems([])); }}, []);

  return (
    <div className=\"app-shell\">
      <div className=\"panel\">
        <div className=\"pill\">Assistant workspace</div>
        <h1>AI Assistant</h1>
        <p className=\"muted\">{prompt}</p>
      </div>
      <div className=\"row two\">
        <ToolRail />
        <ChatShell />
      </div>
      <MemoryPanel />
      <section className=\"panel\">
        <h3>Saved items</h3>
        <div className=\"list\">{{items.map(item => <div className=\"item\" key={{item.id}}><span>{{item.title}}</span><span className=\"muted\">{{item.status}}</span></div>)}}</div>
      </section>
    </div>
  );
}}
""".strip()


def studio_page_code(prompt: str) -> str:
    return f"""
import React, {{ useState }} from \"react\";
import {{ EditorShell }} from \"../components/EditorShell.jsx\";
import {{ PreviewPanel }} from \"../components/PreviewPanel.jsx\";
import {{ NotesPanel }} from \"../components/NotesPanel.jsx\";

export function StudioPage() {{
  const [draft, setDraft] = useState(\"Start writing here...\");

  return (
    <div className=\"app-shell\">
      <div className=\"panel\">
        <div className=\"pill\">Content studio</div>
        <h1>Content App</h1>
        <p className=\"muted\">{prompt}</p>
      </div>
      <div className=\"row two\">
        <EditorShell value={{draft}} onChange={{setDraft}} />
        <PreviewPanel value={{draft}} />
      </div>
      <NotesPanel />
    </div>
  );
}}
""".strip()


def tool_page_code(prompt: str, battery_mode: bool) -> str:
    extra = "Battery-focused starter logic can be added next." if battery_mode else "This is a clean generated tool starter."
    return f"""
import React, {{ useEffect, useState }} from \"react\";
import {{ CalculatorForm }} from \"../components/CalculatorForm.jsx\";
import {{ ResultsPanel }} from \"../components/ResultsPanel.jsx\";
import {{ ExportActions }} from \"../components/ExportActions.jsx\";
import {{ getItems, createItem }} from \"../lib/api.js\";

export function ToolPage() {{
  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {{ getItems().then(setItems).catch(() => setItems([])); }}, []);

  async function handleSave() {{
    const created = await createItem({{ title: \"Generated result\", status: \"saved\", value: result || \"pending\" }});
    setItems(prev => [created, ...prev]);
  }}

  return (
    <div className=\"app-shell\">
      <div className=\"panel\">
        <div className=\"pill\">Tool workspace</div>
        <h1>Tool / Calculator</h1>
        <p className=\"muted\">{prompt}</p>
        <p className=\"muted\">{extra}</p>
      </div>
      <div className=\"row two\">
        <CalculatorForm onCalculated={{setResult}} />
        <ResultsPanel result={{result}} onSave={{handleSave}} />
      </div>
      <ExportActions />
      <section className=\"panel\">
        <h3>Saved results</h3>
        <div className=\"list\">{{items.map(item => <div className=\"item\" key={{item.id}}><span>{{item.title}}</span><span className=\"muted\">{{item.status}}</span></div>)}}</div>
      </section>
    </div>
  );
}}
""".strip()


def sidebar_code() -> str:
    return """
import React from \"react\";

export function Sidebar() {
  return (
    <aside className=\"panel\">
      <h3>Navigation</h3>
      <div className=\"card-grid\">
        <div className=\"card\">Overview</div>
        <div className=\"card\">Customers</div>
        <div className=\"card\">Deals</div>
        <div className=\"card\">Reports</div>
      </div>
    </aside>
  );
}
""".strip()


def kpi_card_code() -> str:
    return """
import React from \"react\";

export function KpiCard({ title, value }) {
  return (
    <div className=\"card\">
      <div className=\"pill\">{title}</div>
      <h3>{value}</h3>
    </div>
  );
}
""".strip()


def inspector_code() -> str:
    return """
import React from \"react\";

export function InspectorPanel() {
  return (
    <section className=\"panel\">
      <h3>Inspector</h3>
      <p className=\"muted\">Use this space for details, selected records, and quick controls.</p>
    </section>
  );
}
""".strip()


def chat_shell_code() -> str:
    return """
import React, { useState } from \"react\";

export function ChatShell() {
  const [message, setMessage] = useState(\"\");
  return (
    <section className=\"panel\">
      <h3>Conversation</h3>
      <div className=\"card\">Assistant response area</div>
      <input className=\"input\" value={message} onChange={(e) => setMessage(e.target.value)} placeholder=\"Ask something...\" />
    </section>
  );
}
""".strip()


def tool_rail_code() -> str:
    return """
import React from \"react\";

export function ToolRail() {
  return (
    <aside className=\"panel\">
      <h3>Tools</h3>
      <div className=\"card-grid\">
        <div className=\"card\">Search</div>
        <div className=\"card\">Actions</div>
        <div className=\"card\">History</div>
      </div>
    </aside>
  );
}
""".strip()


def memory_panel_code() -> str:
    return """
import React from \"react\";

export function MemoryPanel() {
  return (
    <section className=\"panel\">
      <h3>Memory</h3>
      <p className=\"muted\">Save notes, pinned answers, and reusable context here.</p>
    </section>
  );
}
""".strip()


def editor_shell_code() -> str:
    return """
import React from \"react\";

export function EditorShell({ value, onChange }) {
  return (
    <section className=\"panel\">
      <h3>Editor</h3>
      <textarea className=\"input\" rows={12} value={value} onChange={(e) => onChange(e.target.value)} />
    </section>
  );
}
""".strip()


def preview_panel_code() -> str:
    return """
import React from \"react\";

export function PreviewPanel({ value }) {
  return (
    <section className=\"panel\">
      <h3>Preview</h3>
      <div className=\"card\">{value}</div>
    </section>
  );
}
""".strip()


def notes_panel_code() -> str:
    return """
import React from \"react\";

export function NotesPanel() {
  return (
    <section className=\"panel\">
      <h3>Notes</h3>
      <textarea className=\"input\" rows={6} defaultValue=\"Draft notes...\" />
    </section>
  );
}
""".strip()


def calculator_form_code() -> str:
    return """
import React, { useState } from \"react\";

export function CalculatorForm({ onCalculated }) {
  const [a, setA] = useState(\"\");
  const [b, setB] = useState(\"\");

  function handleCalculate() {
    const total = Number(a || 0) + Number(b || 0);
    onCalculated?.(total);
  }

  return (
    <section className=\"panel\">
      <h3>Inputs</h3>
      <div className=\"row\">
        <input className=\"input\" placeholder=\"Value 1\" value={a} onChange={(e) => setA(e.target.value)} />
        <input className=\"input\" placeholder=\"Value 2\" value={b} onChange={(e) => setB(e.target.value)} />
        <button className=\"primary-btn\" onClick={handleCalculate}>Calculate</button>
      </div>
    </section>
  );
}
""".strip()


def results_panel_code() -> str:
    return """
import React from \"react\";

export function ResultsPanel({ result, onSave }) {
  return (
    <section className=\"panel\">
      <h3>Results</h3>
      <div className=\"card\">{result === null ? \"Calculated output will appear here.\" : `Result: ${result}`}</div>
      <button className=\"primary-btn\" onClick={onSave}>Save Result</button>
    </section>
  );
}
""".strip()


def export_actions_code() -> str:
    return """
import React from \"react\";

export function ExportActions() {
  return (
    <section className=\"panel\">
      <h3>Export</h3>
      <div className=\"row\">
        <button className=\"primary-btn\">Export JSON</button>
        <button className=\"primary-btn\">Export PDF</button>
      </div>
    </section>
  );
}
""".strip()


def login_page_code() -> str:
    return """
import React, { useState } from \"react\";
import { signIn } from \"../lib/auth.js\";

export function LoginPage() {
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");

  function handleSubmit() {
    signIn(email, password);
  }

  return (
    <div className=\"app-shell\">
      <section className=\"panel\">
        <h1>Login</h1>
        <div className=\"row\">
          <input className=\"input\" placeholder=\"Email\" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className=\"input\" placeholder=\"Password\" type=\"password\" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className=\"primary-btn\" onClick={handleSubmit}>Sign in</button>
        </div>
      </section>
    </div>
  );
}
""".strip()


def auth_code() -> str:
    return """
export function signIn(email, password) {
  const token = `demo-token-${email || \"guest\"}`;
  localStorage.setItem(\"builder_token\", token);
  return { ok: true, email, token };
}

export function getToken() {
  return localStorage.getItem(\"builder_token\") || \"\";
}
""".strip()


def battery_math_code() -> str:
    return """
export function estimateBatteryPlan(items = [], voltage = 12, autonomyDays = 1, sunHours = 4, systemLoss = 0.2) {
  const dailyWh = items.reduce((sum, item) => sum + ((item.watts || 0) * (item.hours || 0)), 0);
  const adjustedDailyWh = dailyWh * (1 + systemLoss);
  const batteryAh = Number(((adjustedDailyWh * autonomyDays) / Math.max(voltage, 1)).toFixed(1));
  const solarWatts = Number((adjustedDailyWh / Math.max(sunHours, 1)).toFixed(1));
  return { dailyWh, adjustedDailyWh, batteryAh, solarWatts };
}
""".strip()


def appliance_table_code() -> str:
    return """
import React from \"react\";

export function ApplianceTable() {
  return (
    <section className=\"panel\">
      <h3>Appliances</h3>
      <div className=\"card\">RV Fridge · Lights · Fan</div>
    </section>
  );
}
""".strip()


def api_client_code() -> str:
    return """
const API_BASE = import.meta.env.VITE_API_URL || \"http://localhost:8000\";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { \"Content-Type\": \"application/json\", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function getItems() {
  return request(\"/api/items\");
}

export async function createItem(payload) {
  return request(\"/api/items\", { method: \"POST\", body: JSON.stringify(payload) });
}

export async function updateItem(id, payload) {
  return request(`/api/items/${id}`, { method: \"PUT\", body: JSON.stringify(payload) });
}

export async function deleteItem(id) {
  return request(`/api/items/${id}`, { method: \"DELETE\" });
}
""".strip()


def use_items_hook_code() -> str:
    return """
import { useEffect, useState } from \"react\";
import { getItems, createItem, updateItem, deleteItem } from \"../lib/api.js\";

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(\"\");

  async function refresh() {
    try {
      setLoading(true);
      setError(\"\");
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err.message || \"Failed to load items\");
    } finally {
      setLoading(false);
    }
  }

  async function addItem(payload) {
    const created = await createItem(payload);
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function saveItem(id, payload) {
    const updated = await updateItem(id, payload);
    setItems((prev) => prev.map((item) => item.id === id ? updated : item));
    return updated;
  }

  async function removeItem(id) {
    await deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  useEffect(() => { refresh(); }, []);

  return { items, loading, error, refresh, addItem, saveItem, removeItem };
}
""".strip()


def backend_requirements_code(persistence: str) -> str:
    base = ["fastapi", "uvicorn[standard]", "pydantic"]
    if persistence == "sqlite":
        base.append("sqlalchemy")
    if persistence == "supabase":
        base += ["supabase", "python-dotenv"]
    return "\n".join(base)


def backend_env_example_code(persistence: str) -> str:
    lines = ["PORT=8000"]
    if persistence == "supabase":
        lines += ["SUPABASE_URL=your_supabase_url", "SUPABASE_KEY=your_supabase_key"]
    return "\n".join(lines)


def backend_api_code(persistence: str) -> str:
    store_import = "from data_store import list_items, create_item, update_item, delete_item"
    return f'''from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List
{store_import}

app = FastAPI(title="Generated App Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemPayload(BaseModel):
    title: str = "Untitled"
    status: str = "draft"
    value: Any = None
    meta: Dict[str, Any] = Field(default_factory=dict)

@app.get("/health")
def health():
    return {{"status": "ok", "persistence": "{persistence}"}}

@app.get("/api/items")
def get_items():
    return list_items()

@app.post("/api/items")
def post_item(payload: ItemPayload):
    return create_item(payload.model_dump())

@app.put("/api/items/{{item_id}}")
def put_item(item_id: int, payload: ItemPayload):
    updated = update_item(item_id, payload.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@app.delete("/api/items/{{item_id}}")
def remove_item(item_id: int):
    deleted = delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return {{"ok": True, "id": item_id}}
'''.strip()


def localstorage_backend_store_code() -> str:
    return '''_ITEMS = [
    {"id": 1, "title": "Sample item", "status": "ready", "value": 42, "meta": {}},
    {"id": 2, "title": "Starter record", "status": "draft", "value": None, "meta": {}},
]


def list_items():
    return list(reversed(_ITEMS))


def create_item(payload):
    new_id = max([item["id"] for item in _ITEMS], default=0) + 1
    item = {"id": new_id, **payload}
    _ITEMS.append(item)
    return item


def update_item(item_id, payload):
    for index, item in enumerate(_ITEMS):
        if item["id"] == item_id:
            updated = {"id": item_id, **payload}
            _ITEMS[index] = updated
            return updated
    return None


def delete_item(item_id):
    for index, item in enumerate(_ITEMS):
        if item["id"] == item_id:
            _ITEMS.pop(index)
            return True
    return False
'''.strip()


def sqlite_backend_store_code() -> str:
    return '''import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("app.db")


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init():
    conn = _connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            value TEXT,
            meta TEXT
        )
        """
    )
    conn.commit()
    conn.close()


_init()


def list_items():
    conn = _connect()
    rows = conn.execute("SELECT id, title, status, value, meta FROM items ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]


def create_item(payload):
    conn = _connect()
    cursor = conn.execute(
        "INSERT INTO items (title, status, value, meta) VALUES (?, ?, ?, ?)",
        (payload.get("title", "Untitled"), payload.get("status", "draft"), str(payload.get("value")), json.dumps(payload.get("meta", {}))),
    )
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    return {"id": item_id, **payload}


def update_item(item_id, payload):
    conn = _connect()
    cursor = conn.execute(
        "UPDATE items SET title = ?, status = ?, value = ?, meta = ? WHERE id = ?",
        (payload.get("title", "Untitled"), payload.get("status", "draft"), str(payload.get("value")), json.dumps(payload.get("meta", {})), item_id),
    )
    conn.commit()
    conn.close()
    if not cursor.rowcount:
        return None
    return {"id": item_id, **payload}


def delete_item(item_id):
    conn = _connect()
    cursor = conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return bool(cursor.rowcount)
'''.strip()


def supabase_backend_store_code() -> str:
    return '''import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None


def list_items():
    if not client:
        return []
    result = client.table("items").select("*").order("id", desc=True).execute()
    return result.data or []


def create_item(payload):
    if not client:
        return {"id": 1, **payload}
    result = client.table("items").insert(payload).execute()
    return (result.data or [payload])[0]


def update_item(item_id, payload):
    if not client:
        return {"id": item_id, **payload}
    result = client.table("items").update(payload).eq("id", item_id).execute()
    data = result.data or []
    return data[0] if data else None


def delete_item(item_id):
    if not client:
        return True
    client.table("items").delete().eq("id", item_id).execute()
    return True
'''.strip()


def supabase_schema_code() -> str:
    return '''create table if not exists items (
  id bigint generated by default as identity primary key,
  title text not null,
  status text not null default 'draft',
  value text,
  meta jsonb default '{}'::jsonb
);
'''.strip()


def package_json_code() -> str:
    return json.dumps({
        "name": "generated-builder-app",
        "private": True,
        "version": "0.0.1",
        "type": "module",
        "scripts": {"dev": "vite", "build": "vite build", "preview": "vite preview"},
        "dependencies": {"react": "^18.3.1", "react-dom": "^18.3.1"},
        "devDependencies": {"vite": "^5.4.10"},
    }, indent=2)


def vite_env_example_code() -> str:
    return "VITE_API_URL=http://localhost:8000\n"


def readme_code(app_type: str, persistence: str, systems: List[str]) -> str:
    return f'''# Generated App

## App type
{app_type}

## Systems
{", ".join(systems) if systems else "base"}

## Persistence
{persistence}

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
'''.strip()


def generate_code_bundle(prompt: str, app_type: str, builder_mode: str, style: str, systems: List[str], persistence: str) -> List[Dict[str, Any]]:
    files = [
        {"path": "frontend/src/main.jsx", "language": "javascript", "content": main_jsx()},
        {"path": "frontend/src/App.jsx", "language": "javascript", "content": root_app_code(app_type)},
        {"path": "frontend/src/styles/app.css", "language": "css", "content": app_css(style)},
        {"path": "frontend/src/lib/api.js", "language": "javascript", "content": api_client_code()},
        {"path": "frontend/package.json", "language": "json", "content": package_json_code()},
        {"path": "frontend/.env.example", "language": "text", "content": vite_env_example_code()},
        {"path": "backend/main.py", "language": "python", "content": backend_api_code(persistence)},
        {"path": "backend/requirements.txt", "language": "text", "content": backend_requirements_code(persistence)},
        {"path": "backend/.env.example", "language": "text", "content": backend_env_example_code(persistence)},
        {"path": "README.md", "language": "markdown", "content": readme_code(app_type, persistence, systems)},
    ]

    if app_type == "admin panel":
        files += [
            {"path": "frontend/src/pages/DashboardPage.jsx", "language": "javascript", "content": dashboard_page_code(prompt)},
            {"path": "frontend/src/components/Sidebar.jsx", "language": "javascript", "content": sidebar_code()},
            {"path": "frontend/src/components/KpiCard.jsx", "language": "javascript", "content": kpi_card_code()},
            {"path": "frontend/src/components/InspectorPanel.jsx", "language": "javascript", "content": inspector_code()},
        ]
    elif app_type == "assistant app":
        files += [
            {"path": "frontend/src/pages/AssistantPage.jsx", "language": "javascript", "content": assistant_page_code(prompt)},
            {"path": "frontend/src/components/ChatShell.jsx", "language": "javascript", "content": chat_shell_code()},
            {"path": "frontend/src/components/ToolRail.jsx", "language": "javascript", "content": tool_rail_code()},
            {"path": "frontend/src/components/MemoryPanel.jsx", "language": "javascript", "content": memory_panel_code()},
        ]
    elif app_type == "content app":
        files += [
            {"path": "frontend/src/pages/StudioPage.jsx", "language": "javascript", "content": studio_page_code(prompt)},
            {"path": "frontend/src/components/EditorShell.jsx", "language": "javascript", "content": editor_shell_code()},
            {"path": "frontend/src/components/PreviewPanel.jsx", "language": "javascript", "content": preview_panel_code()},
            {"path": "frontend/src/components/NotesPanel.jsx", "language": "javascript", "content": notes_panel_code()},
        ]
    else:
        files += [
            {"path": "frontend/src/pages/ToolPage.jsx", "language": "javascript", "content": tool_page_code(prompt, builder_mode == "battery-planner")},
            {"path": "frontend/src/components/CalculatorForm.jsx", "language": "javascript", "content": calculator_form_code()},
            {"path": "frontend/src/components/ResultsPanel.jsx", "language": "javascript", "content": results_panel_code()},
            {"path": "frontend/src/components/ExportActions.jsx", "language": "javascript", "content": export_actions_code()},
        ]

    if "auth" in systems:
        files += [
            {"path": "frontend/src/pages/LoginPage.jsx", "language": "javascript", "content": login_page_code()},
            {"path": "frontend/src/lib/auth.js", "language": "javascript", "content": auth_code()},
        ]

    if "storage" in systems:
        files.append({"path": "frontend/src/hooks/useItems.js", "language": "javascript", "content": use_items_hook_code()})

    if builder_mode == "battery-planner":
        files += [
            {"path": "frontend/src/lib/batteryMath.js", "language": "javascript", "content": battery_math_code()},
            {"path": "frontend/src/components/ApplianceTable.jsx", "language": "javascript", "content": appliance_table_code()},
        ]

    if persistence == "sqlite":
        files.append({"path": "backend/data_store.py", "language": "python", "content": sqlite_backend_store_code()})
    elif persistence == "supabase":
        files.append({"path": "backend/data_store.py", "language": "python", "content": supabase_backend_store_code()})
        files.append({"path": "backend/supabase_schema.sql", "language": "sql", "content": supabase_schema_code()})
    else:
        files.append({"path": "backend/data_store.py", "language": "python", "content": localstorage_backend_store_code()})

    return files


@app.post("/mutate")
def mutate(payload: MutateRequest):
    prompt = payload.prompt.strip()
    app_type = infer_app_type(prompt)
    builder_mode = infer_builder_mode(prompt)
    summary_style = infer_summary_style(prompt)
    systems = payload.systems or infer_systems(prompt, app_type)
    persistence = infer_persistence(prompt, systems, payload.complexity or "mvp")
    modules = recommend_modules(prompt, app_type)
    layout = build_layout(prompt, payload.current_layout)
    file_tree = build_file_tree(app_type, builder_mode, prompt, systems, persistence)
    routes = build_routes(app_type, prompt, systems)
    components = build_components(app_type, systems)
    summary = build_mutation_summary(layout, modules, app_type, builder_mode, systems, persistence)

    return {
        "ok": True,
        "prompt": prompt,
        "app_type": app_type,
        "builder_mode": builder_mode,
        "summary_style": summary_style,
        "systems": systems,
        "persistence": persistence,
        "layout_changes": layout,
        "module_changes": {"enable": modules, "disable": []},
        "file_tree": file_tree,
        "routes": routes,
        "components": components,
        "mutation_summary": summary,
        "next_best_actions": [
            "materialize files",
            "wire api data flow",
            "regenerate routes",
            "generate code",
        ],
    }


@app.post("/generate-code")
def generate_code(payload: GenerateCodeRequest):
    prompt = payload.prompt.strip()
    app_type = payload.app_type or infer_app_type(prompt)
    builder_mode = payload.builder_mode or infer_builder_mode(prompt)
    systems = payload.systems or infer_systems(prompt, app_type)
    style = payload.style or "dark glass"
    complexity = payload.complexity or "mvp"
    persistence = payload.persistence or infer_persistence(prompt, systems, complexity)

    files = generate_code_bundle(prompt, app_type, builder_mode, style, systems, persistence)
    routes = payload.routes or build_routes(app_type, prompt, systems)
    components = payload.components or build_components(app_type, systems)

    return {
        "ok": True,
        "prompt": prompt,
        "app_type": app_type,
        "builder_mode": builder_mode,
        "style": style,
        "systems": systems,
        "complexity": complexity,
        "persistence": persistence,
        "files": files,
        "generated_files": files,
        "routes": routes,
        "components": components,
        "entry_file": "frontend/src/main.jsx",
        "app_file": "frontend/src/App.jsx",
        "backend_entry": "backend/main.py",
        "data_flow": {
            "frontend_client": "frontend/src/lib/api.js",
            "backend_routes": ["GET /api/items", "POST /api/items", "PUT /api/items/{id}", "DELETE /api/items/{id}"],
            "storage_file": "backend/data_store.py",
        },
        "summary": f"Generated {len(files)} files for a {app_type} in {builder_mode} mode with {persistence} persistence and live data flow.",
    }


PROJECT_STATE_FILE = Path(__file__).with_name("project_state_store.json")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_project_id() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"proj-{stamp}"


def load_project_store() -> Dict[str, Any]:
    if not PROJECT_STATE_FILE.exists():
        return {"items": {}}
    try:
        return json.loads(PROJECT_STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {"items": {}}


def save_project_store(store: Dict[str, Any]) -> None:
    PROJECT_STATE_FILE.write_text(json.dumps(store, indent=2), encoding="utf-8")


def infer_topic(message: str) -> str:
    text = (message or "").lower()
    if re.search(r"(builder|this ai|this ia|builder ai|builder ia|chat ui|builder ui|improve the ai|improve the ia|smarter|better|\bia\b|\bai\b)", text):
        return "builder_ai"
    if re.search(r"(chat should be live|chat feel live|live chat|reply feedback|in-thread thinking|builder logic|ai logic|ia logic|context memory|repetitive suggestions)", text):
        return "builder_ai"
    return "project_app"


def build_project_memory(base: Dict[str, Any], message: str, app_type: str, builder_mode: str, systems: List[str], topic: str) -> Dict[str, Any]:
    memory = dict(base or {})
    memory.update({
        "last_user_request": message,
        "app_type": app_type,
        "builder_mode": builder_mode,
        "systems": systems,
        "current_conversation_topic": topic,
        "global_knowledge_count": 3,
    })
    if topic == "builder_ai":
        memory.update({
            "builder_summary": "Current conversation focus is the builder AI itself.",
            "research_recommendation": None,
        })
    return memory


def builder_suggestion_actions() -> List[Dict[str, Any]]:
    return [
        {
            "label": "Make preview bigger",
            "prompt": "improve this builder ui and make the preview larger on the side",
            "mode": "evolve",
            "reason": "Shows app changes faster so each improvement is easier to judge.",
        },
        {
            "label": "Simplify builder UI",
            "prompt": "simplify this builder ui and hide extra details",
            "mode": "evolve",
            "reason": "Reduces clutter so the builder feels easier to use.",
        },
        {
            "label": "Improve chat flow",
            "prompt": "improve this builder chat flow and make actions clearer with fewer repeated cards",
            "mode": "evolve",
            "reason": "Keeps the conversation easier to follow and less repetitive.",
        },
        {
            "label": "Make chat feel live",
            "prompt": "make this builder chat feel live with in-thread thinking feedback and clearer progress",
            "mode": "evolve",
            "reason": "Makes the builder feel responsive while it is working instead of only switching button state.",
        },
        {
            "label": "Improve builder logic",
            "prompt": "improve this builder ai logic with better context memory and less repetitive suggestions",
            "mode": "evolve",
            "reason": "Reduces repeated canned replies and keeps builder context sharper across turns.",
        },
        {
            "label": "Shrink header",
            "prompt": "shrink the header and give more space to chat and preview",
            "mode": "evolve",
            "reason": "Creates more working space for the actual builder workflow.",
        },
    ]


def detect_builder_intent(message: str) -> str:
    text = (message or "").lower()
    if re.search(r"(live|real[- ]time|typing|instant|faster|responsive)", text):
        return "live"
    if re.search(r"(logic|smarter|smart|brain|context|focus|repetition|repetitive|reason)", text):
        return "logic"
    if re.search(r"(preview|canvas|larger|bigger|side)", text):
        return "preview"
    if re.search(r"(chat|conversation|composer|reply|actions|cards)", text):
        return "chat"
    if re.search(r"(layout|ui|header|panel|clean|simplify)", text):
        return "layout"
    return "general"


def recent_builder_attempt_tags(recent_messages: List[ChatTurn]) -> List[str]:
    tags: List[str] = []
    for item in recent_messages:
        text = (item.text or "").lower()
        if "preview" not in tags and re.search(r"(preview|canvas|larger|bigger|side)", text):
            tags.append("preview")
        if "chat" not in tags and re.search(r"(chat|conversation|composer|reply|actions|cards)", text):
            tags.append("chat")
        if "live" not in tags and re.search(r"(live|real[- ]time|typing|faster|responsive)", text):
            tags.append("live")
        if "logic" not in tags and re.search(r"(logic|smarter|context|focus|repetition|repetitive)", text):
            tags.append("logic")
        if "layout" not in tags and re.search(r"(layout|ui|header|panel|clean|simplify)", text):
            tags.append("layout")
    return tags


def prioritize_builder_actions(actions: List[Dict[str, Any]], message: str, recent_messages: List[ChatTurn], project_memory: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    intent = detect_builder_intent(message)
    tried_tags = recent_builder_attempt_tags(recent_messages)
    blocked_ids = set()

    def action_identity(action: Dict[str, Any]) -> str:
        return "::".join([
            str(action.get("key", "") or ""),
            str(action.get("cmd", "") or ""),
            str(action.get("prompt", "") or ""),
            str(action.get("label", "") or ""),
        ])

    for field_name in ("applied_builder_action_ids", "avoided_builder_action_ids"):
        values = project_memory.get(field_name, []) if isinstance(project_memory, dict) else []
        if isinstance(values, list):
            blocked_ids.update(str(item) for item in values if item)

    def score(action: Dict[str, Any]) -> int:
        text = f"{action.get('label', '')} {action.get('prompt', '')}".lower()
        if action_identity(action) in blocked_ids:
            return -999
        value = 0
        if intent == "live" and re.search(r"(live|thinking|reply|chat)", text):
            value += 6
        if intent == "logic" and re.search(r"(logic|context|smart|repetition|chat flow)", text):
            value += 6
        if intent == "preview" and re.search(r"(preview|larger|bigger|side)", text):
            value += 6
        if intent == "chat" and re.search(r"(chat|composer|actions|cards)", text):
            value += 6
        if intent == "layout" and re.search(r"(layout|header|simplify|preview)", text):
            value += 4
        if "preview" in tried_tags and re.search(r"(preview|larger|bigger|side)", text):
            value -= 3
        if "chat" in tried_tags and re.search(r"(chat|composer|actions|cards)", text):
            value -= 3
        if "logic" in tried_tags and re.search(r"(logic|context|smart|repetition)", text):
            value -= 3
        if "live" in tried_tags and re.search(r"(live|thinking|reply)", text):
            value -= 3
        return value

    return [action for action in sorted(actions, key=score, reverse=True) if score(action) > -999]


def build_builder_history_notes(project_memory: Optional[Dict[str, Any]]) -> List[Dict[str, str]]:
    notes: List[Dict[str, str]] = []
    if not isinstance(project_memory, dict):
        return notes

    last_applied = str(project_memory.get("last_applied_builder_action_label", "") or "").strip()
    last_avoided = str(project_memory.get("last_avoided_builder_action_label", "") or "").strip()

    if last_applied:
        notes.append({
            "label": "Already applied",
            "reason": f"{last_applied} is not being suggested again because it was already used in this builder.",
        })

    if last_avoided:
        notes.append({
            "label": "Dismissed earlier",
            "reason": f"{last_avoided} is being skipped because you already dismissed it.",
        })

    return notes


def build_builder_reply(message: str, recent_messages: List[ChatTurn], actions: List[Dict[str, Any]], project_memory: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    intent = detect_builder_intent(message)
    tried_tags = recent_builder_attempt_tags(recent_messages)
    history_notes = build_builder_history_notes(project_memory)
    tried_suffix = f" Already touched: {', '.join(tried_tags)}." if tried_tags else ""

    if intent == "live":
        return {
            "assistant_message": f"The next upgrade should make this chat feel live: show a visible in-thread thinking state, shorten the gap between your action and builder feedback, and keep the next step attached to the exact reply instead of repeating it elsewhere.{tried_suffix}",
            "status_summary": "Live builder chat plan ready.",
            "advice": {
                "cautions": [
                    {
                        "label": "Fake live feeling",
                        "reason": "If the builder only flips the button to Working, the chat still feels static while the request is running.",
                    }
                ],
                "history_notes": history_notes,
                "better_options": [{"label": item["label"], "reason": item["reason"]} for item in actions[:3]],
            },
        }

    if intent == "logic":
        return {
            "assistant_message": f"The biggest logic upgrade now is builder context discipline: keep builder requests separate from app-project mutations, vary the reply based on what you already tried, and stop recycling the same suggestion set every turn.{tried_suffix}",
            "status_summary": "Builder logic upgrade plan ready.",
            "advice": {
                "cautions": [
                    {
                        "label": "Context bleed",
                        "reason": "If builder prompts inherit app context, the AI stops improving itself and starts mutating the active project instead.",
                    }
                ],
                "history_notes": history_notes,
                "better_options": [{"label": item["label"], "reason": item["reason"]} for item in actions[:3]],
            },
        }

    if intent == "preview":
        return {
            "assistant_message": f"Preview visibility is still the highest-value improvement. The builder is easier to judge when preview gets more width, chat stays readable, and the layout spends less space on secondary chrome.{tried_suffix}",
            "status_summary": "Preview-first improvement plan ready.",
            "advice": {
                "history_notes": history_notes,
                "better_options": [{"label": item["label"], "reason": item["reason"]} for item in actions[:3]],
            },
        }

    if intent == "chat":
        return {
            "assistant_message": f"The chat flow still needs cleanup: fewer repeated cards, clearer next actions, and replies that adapt to whether you asked for a suggestion, a direct UI change, or a project mutation.{tried_suffix}",
            "status_summary": "Chat-flow improvement plan ready.",
            "advice": {
                "history_notes": history_notes,
                "better_options": [{"label": item["label"], "reason": item["reason"]} for item in actions[:3]],
            },
        }

    return {
        "assistant_message": f"Best next builder-AI improvements: keep the builder on builder context, make the chat feel live while it is working, reduce repeated suggestion cards, and rotate toward the next highest-value improvement instead of repeating the same recommendation.{tried_suffix}",
        "status_summary": "Builder improvement plan ready.",
        "advice": {
            "cautions": [
                {
                    "label": "Repeated canned replies",
                    "reason": "If suggestion prompts always return the same fixed copy, the builder sounds static even when the context changed.",
                }
            ],
            "history_notes": history_notes,
            "better_options": [{"label": item["label"], "reason": item["reason"]} for item in actions[:3]],
        },
    }


def build_chat_agent_response(payload: ChatAgentRequest) -> Dict[str, Any]:
    message = payload.message.strip()
    app_type = payload.feature_state.get("appType") or infer_app_type(payload.current_prompt or message)
    builder_mode = payload.feature_state.get("builderMode") or infer_builder_mode(payload.current_prompt or message)
    systems = payload.system_planner.get("systems") or infer_systems(payload.current_prompt or message, app_type)
    topic = infer_topic(message)
    actions = builder_suggestion_actions() if topic == "builder_ai" else [
        {
            "label": "Add login",
            "prompt": "add backend auth api and frontend login flow with protected dashboard routes",
            "mode": "evolve",
            "reason": "Authentication is a strong next step for a product-style app.",
        },
        {
            "label": "Add saved data",
            "prompt": "add backend endpoints and frontend saved data flow for reports and history",
            "mode": "evolve",
            "reason": "Saved data makes the app more useful between visits.",
        },
    ]

    if topic == "builder_ai":
        ranked_actions = prioritize_builder_actions(actions, message, payload.recent_messages, payload.project_memory)
        builder_reply = build_builder_reply(message, payload.recent_messages, ranked_actions, payload.project_memory)
        return {
            "ok": True,
            "response_type": "suggest",
            "assistant_message": builder_reply["assistant_message"],
            "status_summary": builder_reply["status_summary"],
            "memory_summary": "Builder AI focus is active.",
            "ready_to_apply": False,
            "apply_mode": payload.chat_mode or "evolve",
            "apply_prompt": message,
            "questions": [],
            "suggested_actions": ranked_actions,
            "advice": builder_reply["advice"],
            "research_findings": [],
            "knowledge_hits": [],
            "research_recommendation": None,
            "project_memory": build_project_memory(payload.project_memory, message, app_type, builder_mode, systems, topic),
        }

    ready_to_apply = bool(re.search(r"(build|create|make|add|improve|update|change|fix)", message.lower()))
    return {
        "ok": True,
        "response_type": "apply" if ready_to_apply else "answer",
        "assistant_message": "I can keep moving this project forward locally.",
        "status_summary": "Ready to apply locally." if ready_to_apply else "Project-aware answer prepared.",
        "memory_summary": f"App type: {app_type}. Mode: {builder_mode}.",
        "ready_to_apply": ready_to_apply,
        "apply_mode": payload.chat_mode or "evolve",
        "apply_prompt": message,
        "questions": [],
        "suggested_actions": actions,
        "advice": {
            "better_options": [{"label": actions[0]["label"], "reason": actions[0]["reason"]}] if actions else [],
        },
        "research_findings": [],
        "knowledge_hits": [],
        "research_recommendation": None,
        "project_memory": build_project_memory(payload.project_memory, message, app_type, builder_mode, systems, topic),
    }


def build_edit_payload(prompt: str, app_type: str, builder_mode: str, style: str, target_scope: str, project_memory: Dict[str, Any], workspace_edit: bool) -> Dict[str, Any]:
    systems = project_memory.get("systems") or infer_systems(prompt, app_type)
    persistence = infer_persistence(prompt, systems, project_memory.get("complexity", "mvp"))
    files = generate_code_bundle(prompt, app_type, builder_mode, style, systems, persistence)
    routes = build_routes(app_type, prompt, systems)
    components = build_components(app_type, systems)
    file_tree = build_file_tree(app_type, builder_mode, prompt, systems, persistence)
    return {
        "ok": True,
        "prompt": prompt,
        "summary": f"Prepared {len(files)} files for {target_scope} changes.",
        "app_type": app_type,
        "builder_mode": builder_mode,
        "target_scope": target_scope,
        "workspace_edit_enabled": workspace_edit,
        "changed_file_count": len(files),
        "written_file_count": len(files) if workspace_edit else 0,
        "backup_count": 0,
        "backup_manifest": "",
        "files": files,
        "generated_files": files,
        "routes": routes,
        "components": components,
        "file_tree": file_tree,
        "project_memory": build_project_memory(project_memory, prompt, app_type, builder_mode, systems, infer_topic(prompt)),
    }


@app.get("/knowledge-store")
def knowledge_store(limit: int = Query(default=8, ge=1, le=50)):
    items = [
        {
            "title": "Keep builder routing separate",
            "summary": "Builder-AI questions should not inherit active app context.",
            "topic": "builder ai",
        },
        {
            "title": "Prefer action-first improvements",
            "summary": "When the user asks to improve the builder, return practical actions and optionally auto-apply them.",
            "topic": "builder workflow",
        },
        {
            "title": "Avoid repeated suggestion cards",
            "summary": "Limit repeated generic advice so the chat stays useful.",
            "topic": "conversation quality",
        },
    ][:limit]
    return {"ok": True, "items": items, "top_topics": ["builder ai", "builder workflow", "conversation quality"]}


@app.post("/chat-agent")
def chat_agent(payload: ChatAgentRequest):
    return build_chat_agent_response(payload)


@app.post("/repo-edit")
def repo_edit(payload: RepoEditRequest):
    app_type = payload.app_type or infer_app_type(payload.prompt)
    builder_mode = payload.builder_mode or infer_builder_mode(payload.prompt)
    return build_edit_payload(payload.prompt, app_type, builder_mode, payload.style or "dark glass", payload.target_scope or "fullstack", payload.project_memory, False)


@app.post("/workspace-edit")
def workspace_edit(payload: WorkspaceEditRequest):
    app_type = payload.app_type or infer_app_type(payload.prompt)
    builder_mode = payload.builder_mode or infer_builder_mode(payload.prompt)
    return build_edit_payload(payload.prompt, app_type, builder_mode, payload.style or "dark glass", payload.target_scope or "fullstack", payload.project_memory, True)


@app.get("/project-state/{project_id}")
def get_project_state(project_id: str):
    store = load_project_store()
    snapshot = store.get("items", {}).get(project_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Project state not found")
    return {"ok": True, "project_id": project_id, "snapshot": snapshot}


@app.put("/project-state/{project_id}")
def put_project_state(project_id: str, payload: ProjectStateSaveRequest):
    store = load_project_store()
    store.setdefault("items", {})[project_id] = payload.snapshot
    store["items"][project_id]["project_id"] = project_id
    store["items"][project_id]["updated_at"] = now_iso()
    save_project_store(store)
    return {"ok": True, "project_id": project_id}


@app.get("/project-states")
def list_project_states(limit: int = Query(default=12, ge=1, le=100)):
    store = load_project_store()
    items = []
    for project_id, snapshot in store.get("items", {}).items():
        items.append({
            "project_id": project_id,
            "updated_at": snapshot.get("updated_at", ""),
            "summary": snapshot.get("current_prompt") or snapshot.get("project_id") or project_id,
            "app_type": snapshot.get("feature_state", {}).get("appType") or snapshot.get("builder_project_memory", {}).get("app_type") or "",
        })
    items.sort(key=lambda item: item.get("updated_at", ""), reverse=True)
    return {"ok": True, "items": items[:limit]}


@app.post("/orchestrate")
def orchestrate(payload: OrchestrateRequest):
    prompt = payload.prompt.strip()
    project_id = payload.project_id or new_project_id()
    app_type = payload.app_type or infer_app_type(prompt)
    builder_mode = payload.builder_mode or infer_builder_mode(prompt)
    systems = payload.system_planner.get("systems") or infer_systems(prompt, app_type)
    complexity = payload.system_planner.get("complexity") or "mvp"
    persistence = infer_persistence(prompt, systems, complexity)
    routes = payload.routes or build_routes(app_type, prompt, systems)
    components = payload.components or build_components(app_type, systems)
    files = generate_code_bundle(prompt, app_type, builder_mode, payload.style or "dark glass", systems, persistence)
    file_tree = build_file_tree(app_type, builder_mode, prompt, systems, persistence)
    project_memory = build_project_memory(payload.project_memory, prompt, app_type, builder_mode, systems, infer_topic(prompt))

    return {
        "ok": True,
        "project_id": project_id,
        "prompt": prompt,
        "app_type": app_type,
        "builder_mode": builder_mode,
        "systems": systems,
        "complexity": complexity,
        "persistence": persistence,
        "layout_changes": build_layout(prompt, payload.current_layout),
        "module_changes": {"enable": recommend_modules(prompt, app_type), "disable": []},
        "routes": routes,
        "components": components,
        "file_tree": file_tree,
        "files": files,
        "generated_files": files,
        "project_memory": project_memory,
        "summary": f"Prepared a local orchestration bundle for {app_type}.",
        "mutation_summary": build_mutation_summary(build_layout(prompt, payload.current_layout), recommend_modules(prompt, app_type), app_type, builder_mode, systems, persistence),
        "next_best_actions": [
            {"label": "Generate code", "prompt": prompt, "mode": "evolve", "reason": "Create the next local bundle."},
            {"label": "Add login", "prompt": f"{prompt} with login and protected routes", "mode": "evolve", "reason": "Authentication is a common next step."},
        ],
    }

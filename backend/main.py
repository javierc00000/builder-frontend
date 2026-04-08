from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import re

app = FastAPI(title="Builder Backend v2")

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
    return {"status": "ok", "service": "builder-backend-v2"}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "builder-backend-v2"}

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
        "summary": f"For this setup, plan for about {battery_ah}Ah of battery and {solar_watts}W of solar."
    }

class MutateRequest(BaseModel):
    prompt: str
    current_layout: Dict[str, Any] = Field(default_factory=dict)
    active_modules: List[str] = Field(default_factory=list)
    feature_state: Dict[str, Any] = Field(default_factory=dict)

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
    if app_type == "assistant app":
        modules.update({"split_workspace", "notes_panel"})
    if app_type == "content app":
        modules.update({"notes_panel", "split_workspace"})
    if app_type == "tool app":
        modules.update({"split_workspace"})
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
    if re.search(r"(split|two column|2 column|2-column)", p):
        modules.add("split_workspace")
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
        layout["mode"] = "dashboard"
        layout["shell"] = "dashboard"
        layout["sidebar"] = True
        layout["split"] = True
        layout["inspector"] = True
        layout["previewStyle"] = "dashboard"
    if re.search(r"(assistant|copilot|agent)", p):
        layout["mode"] = "workspace"
        layout["shell"] = "classic"
        layout["split"] = True
        layout["inspector"] = True
    if re.search(r"(content|editor|writer|studio)", p):
        layout["mode"] = "workspace"
        layout["shell"] = "classic"
        layout["split"] = True
        layout["inspector"] = True
    if re.search(r"(focus preview|preview first|canvas focus)", p):
        layout["mode"] = "focus"
        layout["shell"] = "focus"
        layout["split"] = True
        layout["previewStyle"] = "spotlight"
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
    if re.search(r"(results first|prioritize results)", p):
        panels = layout["panels"]["mainBottom"]
        layout["panels"]["mainBottom"] = ["results"] + [x for x in panels if x != "results"]
    if re.search(r"(planner first|prioritize planner)", p):
        panels = layout["panels"]["mainBottom"]
        layout["panels"]["mainBottom"] = ["planner"] + [x for x in panels if x != "planner"]
    if re.search(r"(move results to inspector|results in inspector)", p):
        layout["panels"]["mainBottom"] = [x for x in layout["panels"]["mainBottom"] if x != "results"]
        if "results" not in layout["panels"]["inspector"]:
            layout["panels"]["inspector"].append("results")
        layout["inspector"] = True
    if re.search(r"(move preview to inspector|preview in inspector)", p):
        layout["panels"]["mainBottom"] = [x for x in layout["panels"]["mainBottom"] if x != "preview"]
        if "preview" not in layout["panels"]["inspector"]:
            layout["panels"]["inspector"].append("preview")
        layout["inspector"] = True
    return layout

def build_file_tree(app_type: str, builder_mode: str, prompt: str) -> List[Dict[str, Any]]:
    base = [
        {"path": "src/App.jsx", "kind": "file", "role": "root app"},
        {"path": "src/main.jsx", "kind": "file", "role": "entry"},
        {"path": "src/styles/app.css", "kind": "file", "role": "global styles"},
        {"path": "src/components", "kind": "folder", "role": "ui components"},
        {"path": "src/pages", "kind": "folder", "role": "pages"},
        {"path": "src/lib", "kind": "folder", "role": "helpers"},
    ]
    if app_type == "admin panel":
        base += [
            {"path": "src/pages/DashboardPage.jsx", "kind": "file", "role": "dashboard page"},
            {"path": "src/components/Sidebar.jsx", "kind": "file", "role": "navigation"},
            {"path": "src/components/KpiCard.jsx", "kind": "file", "role": "metrics card"},
            {"path": "src/components/InspectorPanel.jsx", "kind": "file", "role": "details panel"},
        ]
    elif app_type == "assistant app":
        base += [
            {"path": "src/pages/AssistantPage.jsx", "kind": "file", "role": "assistant page"},
            {"path": "src/components/ChatShell.jsx", "kind": "file", "role": "chat interface"},
            {"path": "src/components/ToolRail.jsx", "kind": "file", "role": "tools rail"},
            {"path": "src/components/MemoryPanel.jsx", "kind": "file", "role": "memory / notes"},
        ]
    elif app_type == "content app":
        base += [
            {"path": "src/pages/StudioPage.jsx", "kind": "file", "role": "content studio"},
            {"path": "src/components/EditorShell.jsx", "kind": "file", "role": "editor"},
            {"path": "src/components/PreviewPanel.jsx", "kind": "file", "role": "content preview"},
            {"path": "src/components/NotesPanel.jsx", "kind": "file", "role": "notes"},
        ]
    else:
        base += [
            {"path": "src/pages/ToolPage.jsx", "kind": "file", "role": "tool page"},
            {"path": "src/components/CalculatorForm.jsx", "kind": "file", "role": "tool input"},
            {"path": "src/components/ResultsPanel.jsx", "kind": "file", "role": "tool output"},
            {"path": "src/components/ExportActions.jsx", "kind": "file", "role": "export controls"},
        ]
    if builder_mode == "battery-planner":
        base += [
            {"path": "src/lib/batteryMath.js", "kind": "file", "role": "calculation logic"},
            {"path": "src/components/ApplianceTable.jsx", "kind": "file", "role": "appliance rows"},
        ]
    if re.search(r"(auth|login|signin|sign in)", prompt.lower()):
        base += [
            {"path": "src/pages/LoginPage.jsx", "kind": "file", "role": "authentication"},
            {"path": "src/lib/auth.js", "kind": "file", "role": "auth helpers"},
        ]
    if re.search(r"(database|db|postgres|sqlite)", prompt.lower()):
        base += [
            {"path": "backend/db.py", "kind": "file", "role": "database connection"},
            {"path": "backend/models.py", "kind": "file", "role": "database models"},
        ]
    return base

def build_routes(app_type: str, prompt: str) -> List[Dict[str, str]]:
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
    if re.search(r"(auth|login|signin|sign in)", prompt.lower()):
        routes.append({"path": "/login", "component": "LoginPage", "reason": "auth entry"})
    return routes

def build_components(app_type: str, prompt: str) -> List[Dict[str, str]]:
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
    if re.search(r"(kanban)", prompt.lower()):
        base.append({"name": "KanbanBoard", "purpose": "board view"})
    if re.search(r"(hero)", prompt.lower()):
        base.append({"name": "HeroSection", "purpose": "marketing entry section"})
    return base

def build_mutation_summary(layout: Dict[str, Any], modules: List[str], app_type: str, builder_mode: str) -> List[str]:
    summary = [
        f"App type detected: {app_type}",
        f"Builder mode detected: {builder_mode}",
        f"Layout shell: {layout['shell']}",
        f"Preview style: {layout['previewStyle']}",
        f"Active modules planned: {len(modules)}",
    ]
    if layout.get("sidebar"):
        summary.append("Sidebar enabled")
    if layout.get("split"):
        summary.append("Split workspace enabled")
    if layout.get("inspector"):
        summary.append("Inspector enabled")
    return summary

@app.post("/mutate")
def mutate(payload: MutateRequest):
    prompt = payload.prompt.strip()
    app_type = infer_app_type(prompt)
    builder_mode = infer_builder_mode(prompt)
    summary_style = infer_summary_style(prompt)
    modules = recommend_modules(prompt, app_type)
    layout = build_layout(prompt, payload.current_layout)
    file_tree = build_file_tree(app_type, builder_mode, prompt)
    routes = build_routes(app_type, prompt)
    components = build_components(app_type, prompt)
    summary = build_mutation_summary(layout, modules, app_type, builder_mode)
    return {
        "ok": True,
        "prompt": prompt,
        "app_type": app_type,
        "builder_mode": builder_mode,
        "summary_style": summary_style,
        "layout_changes": layout,
        "module_changes": {"enable": modules, "disable": []},
        "file_tree": file_tree,
        "routes": routes,
        "components": components,
        "mutation_summary": summary,
        "next_best_actions": [
            "materialize files",
            "regenerate routes",
            "add inspector",
            "focus preview",
        ],
    }

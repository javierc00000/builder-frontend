import React, { useEffect, useState } from "react";
import { ChatShell } from "../components/ChatShell.jsx";
import { ToolRail } from "../components/ToolRail.jsx";
import { MemoryPanel } from "../components/MemoryPanel.jsx";
import { getItems } from "../lib/api.js";

export function AssistantPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { getItems().then(setItems).catch(() => setItems([])); }, []);

  return (
    <div className="app-shell">
      <div className="panel">
        <div className="pill">Assistant workspace</div>
        <h1>AI Assistant</h1>
        <p className="muted">build a client portal with login, invoices, and saved messages</p>
      </div>
      <div className="row two">
        <ToolRail />
        <ChatShell />
      </div>
      <MemoryPanel />
      <section className="panel">
        <h3>Saved items</h3>
        <div className="list">{items.map(item => <div className="item" key={item.id}><span>{item.title}</span><span className="muted">{item.status}</span></div>)}</div>
      </section>
    </div>
  );
}
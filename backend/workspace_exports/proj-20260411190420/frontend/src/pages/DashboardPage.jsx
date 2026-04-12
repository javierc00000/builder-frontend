import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar.jsx";
import { KpiCard } from "../components/KpiCard.jsx";
import { InspectorPanel } from "../components/InspectorPanel.jsx";
import { getItems } from "../lib/api.js";

export function DashboardPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { getItems().then(setItems).catch(() => setItems([])); }, []);

  return (
    <div className="app-shell">
      <div className="panel">
        <div className="pill">Admin dashboard</div>
        <h1>CRM Dashboard</h1>
        <p className="muted">Full-stack request covering frontend and backend: add backend auth api and frontend login flow with protected dashboard routes</p>
      </div>
      <div className="row two">
        <Sidebar />
        <div className="row">
          <div className="card-grid">
            <KpiCard title="Records" value={String(items.length)} />
            <KpiCard title="Status" value="Connected" />
            <KpiCard title="Flow" value="Live API" />
          </div>
          <div className="panel">
            <h2>Recent records</h2>
            <div className="list">{items.map(item => <div className="item" key={item.id}><span>{item.title}</span><span className="muted">{item.status}</span></div>)}</div>
          </div>
        </div>
      </div>
      <InspectorPanel />
    </div>
  );
}
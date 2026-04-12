import React, { useEffect, useState } from "react";
import { CalculatorForm } from "../components/CalculatorForm.jsx";
import { ResultsPanel } from "../components/ResultsPanel.jsx";
import { ExportActions } from "../components/ExportActions.jsx";
import { getItems, createItem } from "../lib/api.js";

export function ToolPage() {
  const [items, setItems] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => { getItems().then(setItems).catch(() => setItems([])); }, []);

  async function handleSave() {
    const created = await createItem({ title: "Generated result", status: "saved", value: result || "pending" });
    setItems(prev => [created, ...prev]);
  }

  return (
    <div className="app-shell">
      <div className="panel">
        <div className="pill">Tool workspace</div>
        <h1>Tool / Calculator</h1>
        <p className="muted">rebuild frontend files</p>
        <p className="muted">This is a clean generated tool starter.</p>
      </div>
      <div className="row two">
        <CalculatorForm onCalculated={setResult} />
        <ResultsPanel result={result} onSave={handleSave} />
      </div>
      <ExportActions />
      <section className="panel">
        <h3>Saved results</h3>
        <div className="list">{items.map(item => <div className="item" key={item.id}><span>{item.title}</span><span className="muted">{item.status}</span></div>)}</div>
      </section>
    </div>
  );
}
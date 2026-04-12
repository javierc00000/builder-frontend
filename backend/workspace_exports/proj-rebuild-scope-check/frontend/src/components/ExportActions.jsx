import React from "react";

export function ExportActions() {
  return (
    <section className="panel">
      <h3>Export</h3>
      <div className="row">
        <button className="primary-btn">Export JSON</button>
        <button className="primary-btn">Export PDF</button>
      </div>
    </section>
  );
}
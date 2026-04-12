import React from "react";

export function Sidebar() {
  return (
    <aside className="panel">
      <h3>Navigation</h3>
      <div className="card-grid">
        <div className="card">Overview</div>
        <div className="card">Customers</div>
        <div className="card">Deals</div>
        <div className="card">Reports</div>
      </div>
    </aside>
  );
}
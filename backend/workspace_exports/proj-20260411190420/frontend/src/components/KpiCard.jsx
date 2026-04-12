import React from "react";

export function KpiCard({ title, value }) {
  return (
    <div className="card">
      <div className="pill">{title}</div>
      <h3>{value}</h3>
    </div>
  );
}
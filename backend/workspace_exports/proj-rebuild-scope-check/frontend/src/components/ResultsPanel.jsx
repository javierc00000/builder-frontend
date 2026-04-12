import React from "react";

export function ResultsPanel({ result, onSave }) {
  return (
    <section className="panel">
      <h3>Results</h3>
      <div className="card">{result === null ? "Calculated output will appear here." : `Result: ${result}`}</div>
      <button className="primary-btn" onClick={onSave}>Save Result</button>
    </section>
  );
}
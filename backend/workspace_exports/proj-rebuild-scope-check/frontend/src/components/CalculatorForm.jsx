import React, { useState } from "react";

export function CalculatorForm({ onCalculated }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  function handleCalculate() {
    const total = Number(a || 0) + Number(b || 0);
    onCalculated?.(total);
  }

  return (
    <section className="panel">
      <h3>Inputs</h3>
      <div className="row">
        <input className="input" placeholder="Value 1" value={a} onChange={(e) => setA(e.target.value)} />
        <input className="input" placeholder="Value 2" value={b} onChange={(e) => setB(e.target.value)} />
        <button className="primary-btn" onClick={handleCalculate}>Calculate</button>
      </div>
    </section>
  );
}
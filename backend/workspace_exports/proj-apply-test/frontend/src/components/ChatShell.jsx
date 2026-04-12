import React, { useState } from "react";

export function ChatShell() {
  const [message, setMessage] = useState("");
  return (
    <section className="panel">
      <h3>Conversation</h3>
      <div className="card">Assistant response area</div>
      <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask something..." />
    </section>
  );
}
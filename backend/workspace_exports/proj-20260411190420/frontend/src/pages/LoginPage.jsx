import React, { useState } from "react";
import { signIn } from "../lib/auth.js";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit() {
    signIn(email, password);
  }

  return (
    <div className="app-shell">
      <section className="panel">
        <h1>Login</h1>
        <div className="row">
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="primary-btn" onClick={handleSubmit}>Sign in</button>
        </div>
      </section>
    </div>
  );
}
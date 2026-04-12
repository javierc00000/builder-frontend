import React from "react";
import { AssistantPage } from "./pages/AssistantPage.jsx";
import { getToken } from "./lib/auth.js";
import { LoginPage } from "./pages/LoginPage.jsx";

export default function App() {

  const token = getToken();
  if (!token) {
    return <LoginPage />;
  }

  return <AssistantPage />;
}
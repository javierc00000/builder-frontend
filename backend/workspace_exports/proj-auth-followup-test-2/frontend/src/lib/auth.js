const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function signIn(email, password) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        throw new Error(`Auth error: ${response.status}`);
    }
    const data = await response.json();
    localStorage.setItem("builder_token", data.token || "");
    localStorage.setItem("builder_user", JSON.stringify(data.user || null));
    return data;
}

export function getToken() {
  return localStorage.getItem("builder_token") || "";
}

export function signOut() {
    localStorage.removeItem("builder_token");
    localStorage.removeItem("builder_user");
}
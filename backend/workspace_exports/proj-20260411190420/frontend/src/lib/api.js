const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function getItems() {
  return request("/api/items");
}

export async function createItem(payload) {
  return request("/api/items", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateItem(id, payload) {
  return request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteItem(id) {
  return request(`/api/items/${id}`, { method: "DELETE" });
}